import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { SatService } from '../sat/sat.service';
import { SatPdfService } from './sat-pdf.service';
import { GraphMailService } from './graph-mail.service';
import { SatEntity } from '../sat/entity/sat.entity';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CENÁRIO 1 — Reclamação Procedente / Troca / Recolhimento de Lote
// (Pelo menos um dos três booleans é TRUE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TO_PROCEDENTE = ['ti@maza.com.br'];
const CC_PROCEDENTE = ['marcos.zamarque@maza.com.br'];

function buildMsgProcedente(sat: SatEntity): string {
    const avt = sat.avt!;
    const representante = sat.representante?.usuario ?? String(sat.representante_id);

    // Montar lista de marcações ativas
    const marcacoes: string[] = [];
    if (avt.reclamacao_procedente) marcacoes.push('Reclamação Procedente');
    if (avt.troca) marcacoes.push('Troca');
    if (avt.recolhimento_lote) marcacoes.push('Recolhimento de Lote');

    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
      <p>Prezados,</p>
      <p>Segue em anexo o relatório da SAT <strong>${sat.codigo}</strong> que foi
      finalizada com as seguintes marcações: <strong>${marcacoes.join(', ')}</strong>.</p>

      <table style="border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Representante:</td><td style="padding: 4px 0;"><strong>${representante}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Cliente:</td><td style="padding: 4px 0;"><strong>${sat.cliente}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Cidade:</td><td style="padding: 4px 0;">${sat.cidade}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Produto:</td><td style="padding: 4px 0;">${sat.produtos}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Lote(s):</td><td style="padding: 4px 0;">${sat.lotes?.map(l => l.lote).join(', ') ?? '—'}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Quantidade:</td><td style="padding: 4px 0;">${sat.quantidade}</td></tr>
      </table>

      <p>Para mais detalhes, consulte o relatório em PDF anexo.</p>
      <br/>
      <p>Atenciosamente,<br/>Sistema SAT Maza</p>
    </div>
  `;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CENÁRIO 2 — Nenhuma marcação (todos os booleans FALSE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TO_IMPROCEDENTE = ['joao.carvalho@maza.com.br'];
const CC_IMPROCEDENTE = ['gabriel.moretti@maza.com.br'];

function buildMsgImprocedente(sat: SatEntity): string {
    const representante = sat.representante?.usuario ?? String(sat.representante_id);

    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
      <p>Prezados,</p>
      <p>Segue em anexo o relatório da SAT <strong>${sat.codigo}</strong>
      finalizada sem ocorrências (Reclamação Improcedente, sem Troca,
      sem Recolhimento de Lote).</p>

      <table style="border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Representante:</td><td style="padding: 4px 0;"><strong>${representante}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Cliente:</td><td style="padding: 4px 0;"><strong>${sat.cliente}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Cidade:</td><td style="padding: 4px 0;">${sat.cidade}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Produto:</td><td style="padding: 4px 0;">${sat.produtos}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Lote(s):</td><td style="padding: 4px 0;">${sat.lotes?.map(l => l.lote).join(', ') ?? '—'}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Quantidade:</td><td style="padding: 4px 0;">${sat.quantidade}</td></tr>
      </table>

      <p>Para mais detalhes, consulte o relatório em PDF anexo.</p>
      <br/>
      <p>Atenciosamente,<br/>Sistema SAT Maza</p>
    </div>
  `;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@Injectable()
export class SatNotificationService {
    private readonly logger = new Logger(SatNotificationService.name);

    constructor(
        @Inject(forwardRef(() => SatService))
        private readonly satService: SatService,
        private readonly satPdfService: SatPdfService,
        private readonly graphMailService: GraphMailService,
    ) { }

    /**
     * Retenta uma operação assíncrona com backoff exponencial.
     * Lança o erro da última tentativa se todas falharem.
     */
    private async withRetry<T>(
        fn: () => Promise<T>,
        retries: number,
        delayMs: number,
        label: string,
    ): Promise<T> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === retries) throw error;
                this.logger.warn(
                    `${label}: tentativa ${attempt}/${retries} falhou — aguardando ${delayMs}ms antes de tentar novamente`,
                );
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // backoff exponencial: 2s → 4s → 8s
            }
        }
        // Linha inalcançável, necessária para satisfazer o TypeScript
        throw new Error(`${label}: todas as tentativas esgotadas`);
    }

    /**
     * Chamado de forma fire-and-forget quando uma AVT é concluída.
     * Tenta enviar o email até 3 vezes com backoff exponencial antes de desistir.
     */
    async notifyFinalization(satId: string): Promise<void> {
        try {
            await this.withRetry(
                () => this._doNotifyFinalization(satId),
                3,
                2000,
                `notifyFinalization(${satId})`,
            );
        } catch (error) {
            this.logger.error(
                `Falha permanente ao enviar notificação para SAT ${satId} após 3 tentativas: ${error.message}`,
                error.stack,
            );
            // Não re-lança — contrato fire-and-forget mantido
        }
    }

    private async _doNotifyFinalization(satId: string): Promise<void> {
        // 1. Buscar a SAT completa (com AVT, representante, evidências)
        const sat = await this.satService.findOne(satId);
        if (!sat) {
            this.logger.warn(`SAT ${satId} não encontrada para notificação.`);
            return;
        }

        if (!sat.avt) {
            this.logger.warn(`SAT ${sat.codigo} não possui AVT para notificação.`);
            return;
        }

        const avt = sat.avt;

        // 2. Gerar o PDF em memória
        const pdfBuffer = await this.satPdfService.generatePdf(sat);
        this.logger.log(`PDF gerado para SAT ${sat.codigo} (${pdfBuffer.length} bytes)`);

        // 3. Determinar cenário
        const isProcedente =
            avt.reclamacao_procedente === true ||
            avt.troca === true ||
            avt.recolhimento_lote === true;

        const to = isProcedente ? TO_PROCEDENTE : TO_IMPROCEDENTE;
        const cc = isProcedente ? CC_PROCEDENTE : CC_IMPROCEDENTE;
        const html = isProcedente
            ? buildMsgProcedente(sat)
            : buildMsgImprocedente(sat);
        const cenario = isProcedente ? 'PROCEDENTE' : 'IMPROCEDENTE';

        this.logger.log(
            `Enviando email para cenário ${cenario} - SAT: ${sat.codigo} | TO: ${to.join(', ')} | CC: ${cc.join(', ')}`,
        );

        // 4. Enviar email com PDF (lança exceção em caso de falha para permitir retry)
        await this.graphMailService.sendWithPdfAttachment({
            to,
            cc,
            subject: `SAT ${sat.codigo} — Relatório de Análise Finalizada`,
            html,
            pdfBuffer,
            attachmentName: `${sat.codigo}_Relatorio.pdf`,
        });

        this.logger.log(`Email enviado com sucesso para SAT ${sat.codigo}`);
    }

    /**
     * Notifica o redirecionamento da SAT para outro laboratório.
     * Tenta enviar o email até 3 vezes com backoff exponencial antes de desistir.
     */
    async notifyRedirection(sat: SatEntity): Promise<void> {
        if (!sat.representante?.email) {
            return;
        }

        try {
            await this.withRetry(
                () => this._doNotifyRedirection(sat),
                3,
                2000,
                `notifyRedirection(${sat.codigo})`,
            );
        } catch (error) {
            this.logger.error(
                `Falha permanente ao enviar email de redirecionamento para SAT ${sat.codigo} após 3 tentativas: ${error.message}`,
                error.stack,
            );
            // Não re-lança — contrato fire-and-forget mantido
        }
    }

    private async _doNotifyRedirection(sat: SatEntity): Promise<void> {
        const emailNotificacao = process.env.MAIL_NOTIFICACAO_SAT || 'ti@maza.com.br';
        const destinoTexto = sat.destino;
        const origemTexto = sat.destino === 'BASE_AGUA' ? 'Base Solvente' : 'Base Água';

        const html = `
            <h3>SAT Redirecionada</h3>
            <p>A SAT <strong>${sat.codigo}</strong> foi redirecionada para o laboratório: <strong>${destinoTexto}</strong>.</p>
            <p><strong>Redirecionado por:</strong> ${origemTexto}</p>
            <br/>
            <h4>Detalhes da SAT:</h4>
            <p><strong>Cliente:</strong> ${sat.cliente}</p>
            <p><strong>Produto:</strong> ${sat.produtos}</p>
            <p><strong>Reclamação:</strong> ${sat.reclamacao}</p>
         `;

        // Gerar PDF da SAT (lança exceção em caso de falha para permitir retry)
        const pdfBuffer = await this.satPdfService.generatePdf(sat);

        await this.graphMailService.sendWithPdfAttachment({
            to: [emailNotificacao],
            cc: ['joao.carvalho@maza.com.br'],
            subject: `SAT Redirecionada: ${sat.codigo}`,
            html,
            pdfBuffer,
            attachmentName: `SAT-${sat.codigo}.pdf`,
        });

        this.logger.log(`Email de redirecionamento enviado para ${emailNotificacao} - SAT ${sat.codigo}`);
    }
}

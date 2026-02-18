import { Injectable } from '@nestjs/common';
import { SatEntity } from '../sat/entity/sat.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class SatPdfService {
    /**
     * Gera um PDF da SAT com todos os dados relevantes e retorna como Buffer.
     */
    async generatePdf(sat: SatEntity): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // ── Cabeçalho ─────────────────────────────────────────────
                doc
                    .fontSize(26)
                    .font('Helvetica-Bold')
                    .text(`Relatório SAT — ${sat.codigo}`, { align: 'center' });

                doc.moveDown(0.5);
                doc
                    .fontSize(13)
                    .font('Helvetica')
                    .text(
                        `Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
                        { align: 'center' },
                    );

                doc.moveDown(1);
                this.drawLine(doc);
                doc.moveDown(1);

                // ── Dados da SAT ──────────────────────────────────────────
                doc.fontSize(18).font('Helvetica-Bold').text('Dados da SAT');
                doc.moveDown(0.5);

                this.addField(doc, 'Código', sat.codigo);
                this.addField(doc, 'Status', sat.status);
                this.addField(doc, 'Cliente', sat.cliente);
                this.addField(doc, 'Cidade', sat.cidade);
                this.addField(doc, 'Produto', sat.produtos);
                this.addField(doc, 'Quantidade', String(sat.quantidade));
                // Formatar Lotes e Validades
                const lotesTexto = sat.lotes && sat.lotes.length > 0
                    ? sat.lotes.map(l => `${l.lote} (Val: ${l.validade})`).join(', ')
                    : '—';

                this.addField(doc, 'Lote(s) / Validade(s)', lotesTexto);
                this.addField(doc, 'Contato', sat.contato);
                this.addField(doc, 'Telefone', sat.telefone);
                this.addField(
                    doc,
                    'Representante',
                    sat.representante?.usuario ?? String(sat.representante_id),
                );
                this.addField(doc, 'Destino', sat.destino ?? '—');
                this.addField(
                    doc,
                    'Data de Criação',
                    new Date(sat.createdAt).toLocaleDateString('pt-BR'),
                );

                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica-Bold').text('Reclamação:');
                doc.fontSize(13).font('Helvetica').text(sat.reclamacao ?? '—');

                doc.moveDown(1);
                this.drawLine(doc);
                doc.moveDown(1);

                // ── Dados da AVT ──────────────────────────────────────────
                if (sat.avt) {
                    const avt = sat.avt;
                    doc.fontSize(18).font('Helvetica-Bold').text('Averiguação Técnica (AVT)');
                    doc.moveDown(0.5);

                    this.addField(doc, 'Status AVT', avt.status);
                    this.addField(
                        doc,
                        'Data da Averiguação',
                        avt.data ? new Date(avt.data).toLocaleDateString('pt-BR') : '—',
                    );
                    this.addField(doc, 'Lote Analisado', avt.lote ?? '—');

                    doc.moveDown(0.5);
                    doc.fontSize(14).font('Helvetica-Bold').text('Averiguação Técnica:');
                    doc.fontSize(13).font('Helvetica').text(avt.averigucao_tecnica ?? '—');

                    doc.moveDown(0.5);
                    doc.fontSize(14).font('Helvetica-Bold').text('Possíveis Causas:');
                    doc.fontSize(13).font('Helvetica').text(avt.possiveis_causas ?? '—');

                    doc.moveDown(0.5);
                    doc.fontSize(14).font('Helvetica-Bold').text('Solução Proposta:');
                    doc.fontSize(13).font('Helvetica').text(avt.solucao ?? '—');

                    doc.moveDown(1);
                    this.drawLine(doc);
                    doc.moveDown(1);

                    // ── Status Booleanos ──────────────────────────────────────
                    doc.fontSize(18).font('Helvetica-Bold').text('Resultado da Análise');
                    doc.moveDown(0.5);

                    this.addField(
                        doc,
                        'Reclamação Procedente',
                        avt.reclamacao_procedente ? '✔ SIM' : '✘ NÃO',
                    );
                    this.addField(doc, 'Troca', avt.troca ? '✔ SIM' : '✘ NÃO');
                    this.addField(
                        doc,
                        'Recolhimento de Lote',
                        avt.recolhimento_lote ? '✔ SIM' : '✘ NÃO',
                    );
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private addField(doc: PDFKit.PDFDocument, label: string, value: string) {
        doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .text(`${label}: `, { continued: true })
            .font('Helvetica')
            .text(value);
    }

    private drawLine(doc: PDFKit.PDFDocument) {
        doc
            .strokeColor('#cccccc')
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { SatEntity } from '../sat/entity/sat.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

export interface LaudoImage {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
}

@Injectable()
export class SatPdfService {
    private readonly logger = new Logger(SatPdfService.name);

    /**
     * Gera um PDF da SAT com todos os dados relevantes e retorna como Buffer.
     * Se laudoImage for fornecido e for uma imagem, ela é embutida no PDF.
     */
    async generatePdf(sat: SatEntity, laudoImage?: LaudoImage): Promise<Buffer> {
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
                const lotesTexto = sat.sem_lote
                    ? 'Sem lote'
                    : (sat.lotes && sat.lotes.length > 0
                        ? sat.lotes.map(l => `${l.lote} (Val: ${l.validade})`).join(', ')
                        : '—');

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

                    // ── Laudo / Relatório ─────────────────────────────────────
                    doc.moveDown(1);
                    this.drawLine(doc);
                    doc.moveDown(1);

                    doc.fontSize(18).font('Helvetica-Bold').text('Laudo / Relatório');
                    doc.moveDown(0.5);

                    if (laudoImage && laudoImage.mimeType.startsWith('image/')) {
                        this.addField(doc, 'Arquivo', laudoImage.originalName);
                        doc.moveDown(0.5);

                        try {
                            const pageWidth = doc.page.width - 100; // margins
                            const imgOptions: Record<string, unknown> = { fit: [pageWidth, 500] };

                            // Check if we need a new page for the image
                            if (doc.y > doc.page.height - 250) {
                                doc.addPage();
                            }

                            doc.image(laudoImage.buffer, imgOptions);
                        } catch (err) {
                            this.logger.warn(`Não foi possível embutir a imagem do laudo: ${err.message}`);
                            doc.fontSize(13).font('Helvetica').text('(Não foi possível embutir a imagem no PDF)');
                        }
                    } else if (avt.laudo) {
                        const fileName = avt.laudo.originalName ?? avt.laudo.blobName.split('/').pop() ?? 'laudo';
                        this.addField(doc, 'Arquivo anexado', `${fileName} (formato não incorporável no PDF)`);
                    } else {
                        doc.fontSize(13).font('Helvetica').text('Nenhum laudo anexado.');
                    }
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

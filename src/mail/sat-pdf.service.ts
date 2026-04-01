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
                const margin = 50;
                const doc = new PDFDocument({ size: 'A4', margin });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                const pageWidth = doc.page.width - margin * 2;

                // ══════════════════════════════════════════════════════════
                // CABEÇALHO
                // ══════════════════════════════════════════════════════════
                doc.fontSize(24).font('Helvetica-Bold')
                    .text(`RELATÓRIO AVT`, { align: 'center' });
                doc.moveDown(0.2);
                doc.fontSize(16).font('Helvetica')
                    .text(sat.codigo, { align: 'center' });
                doc.moveDown(0.4);
                doc.fontSize(10).font('Helvetica')
                    .text(
                        `Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
                        { align: 'center' },
                    );

                doc.moveDown(1);
                this.drawThickLine(doc);
                doc.moveDown(1.2);

                // ══════════════════════════════════════════════════════════
                // 1. DADOS DA SAT
                // ══════════════════════════════════════════════════════════
                this.drawSectionHeader(doc, 'Dados da SAT');

                this.addField(doc, 'Cliente', sat.cliente ?? '—');
                this.addField(doc, 'Cidade', sat.cidade ?? '—');
                this.addField(doc, 'Produto', sat.produtos ?? '—');

                doc.moveDown(1);
                this.drawThickLine(doc);
                doc.moveDown(1.2);

                // ══════════════════════════════════════════════════════════
                // 2. AVERIGUAÇÃO TÉCNICA (AVT)
                // ══════════════════════════════════════════════════════════
                if (sat.avt) {
                    const avt = sat.avt;

                    this.drawSectionHeader(doc, 'Averiguação Técnica (AVT)');

                    this.addField(doc, 'Status AVT', avt.status);
                    this.addField(
                        doc,
                        'Data da Averiguação',
                        avt.data ? new Date(avt.data).toLocaleDateString('pt-BR') : '—',
                    );
                    this.addField(doc, 'Lote Analisado', avt.lote ?? '—');

                    doc.moveDown(0.8);
                    this.drawThinLine(doc);
                    doc.moveDown(0.8);

                    this.drawSubsectionHeader(doc, 'Averiguação Técnica');
                    doc.fontSize(11).font('Helvetica').text(avt.averigucao_tecnica ?? '—', {
                        lineGap: 4,
                    });

                    doc.moveDown(0.8);
                    this.drawThinLine(doc);
                    doc.moveDown(0.8);

                    this.drawSubsectionHeader(doc, 'Possíveis Causas');
                    doc.fontSize(11).font('Helvetica').text(avt.possiveis_causas ?? '—', {
                        lineGap: 4,
                    });

                    doc.moveDown(0.8);
                    this.drawThinLine(doc);
                    doc.moveDown(0.8);

                    this.drawSubsectionHeader(doc, 'Solução Proposta');
                    doc.fontSize(11).font('Helvetica').text(avt.solucao ?? '—', {
                        lineGap: 4,
                    });

                    doc.moveDown(1);
                    this.drawThickLine(doc);
                    doc.moveDown(1.2);

                    // ══════════════════════════════════════════════════════
                    // 3. RESULTADO DA ANÁLISE
                    // ══════════════════════════════════════════════════════
                    this.drawSectionHeader(doc, 'Resultado da Análise');

                    this.addField(
                        doc,
                        'Reclamação Procedente',
                        avt.reclamacao_procedente ? 'SIM' : 'NÃO',
                    );
                    this.addField(doc, 'Troca', avt.troca ? 'SIM' : 'NÃO');
                    this.addField(
                        doc,
                        'Recolhimento de Lote',
                        avt.recolhimento_lote ? 'SIM' : 'NÃO',
                    );

                    doc.moveDown(1);
                    this.drawThickLine(doc);
                    doc.moveDown(1.2);

                    // ══════════════════════════════════════════════════════
                    // 4. LAUDO / RELATÓRIO
                    // ══════════════════════════════════════════════════════
                    this.drawSectionHeader(doc, 'Laudo / Relatório');

                    if (laudoImage && laudoImage.mimeType.startsWith('image/')) {
                        this.addField(doc, 'Arquivo', laudoImage.originalName);

                        try {
                            doc.addPage();

                            const imgPageWidth = doc.page.width - margin * 2;
                            const imgPageHeight = doc.page.height - margin * 2;

                            doc.image(laudoImage.buffer, margin, margin, {
                                fit: [imgPageWidth, imgPageHeight],
                                align: 'center',
                                valign: 'center',
                            });
                        } catch (err) {
                            this.logger.warn(`Não foi possível embutir a imagem do laudo: ${err.message}`);
                            doc.fontSize(11).font('Helvetica')
                                .text('(Não foi possível embutir a imagem no PDF)');
                        }
                    } else if (avt.laudo) {
                        const fileName = avt.laudo.originalName ?? avt.laudo.blobName.split('/').pop() ?? 'laudo';
                        this.addField(doc, 'Arquivo anexado', `${fileName} (formato não incorporável no PDF)`);
                    } else {
                        doc.fontSize(11).font('Helvetica').text('Nenhum laudo anexado.');
                    }
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    // ── Helpers ─────────────────────────────────────────────────────

    /** Título de seção: bold, maiúsculo, com linha grossa embaixo */
    private drawSectionHeader(doc: PDFKit.PDFDocument, title: string) {
        doc.fontSize(15).font('Helvetica-Bold').text(title.toUpperCase());
        doc.moveDown(0.3);
        this.drawThinLine(doc);
        doc.moveDown(0.6);
    }

    /** Sub-título dentro de uma seção */
    private drawSubsectionHeader(doc: PDFKit.PDFDocument, title: string) {
        doc.fontSize(12).font('Helvetica-Bold').text(title);
        doc.moveDown(0.3);
    }

    /** Campo label: valor em uma linha */
    private addField(doc: PDFKit.PDFDocument, label: string, value: string) {
        doc.fontSize(11)
            .font('Helvetica-Bold')
            .text(`${label}: `, { continued: true })
            .font('Helvetica')
            .text(value);
        doc.moveDown(0.15);
    }

    /** Linha grossa — separação entre seções */
    private drawThickLine(doc: PDFKit.PDFDocument) {
        doc.strokeColor('#000000')
            .lineWidth(1.5)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
    }

    /** Linha fina — separação dentro de seção */
    private drawThinLine(doc: PDFKit.PDFDocument) {
        doc.strokeColor('#999999')
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
    }
}

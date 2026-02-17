import { Injectable } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import * as fs from 'fs/promises';
import * as path from 'path';

type SendMailWithAttachment = {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  pdfFilePath?: string;
  pdfBuffer?: Buffer;
  attachmentName?: string;
  saveToSentItems?: boolean;
};

@Injectable()
export class GraphMailService {
  private graphClient: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!,
    );

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        },
      },
    });
  }

  async sendWithPdfAttachment(input: SendMailWithAttachment) {
    const senderUpn = process.env.MAIL_SENDER_UPN!;
    const toList = Array.isArray(input.to) ? input.to : [input.to];

    const body =
      input.html
        ? { contentType: 'HTML', content: input.html }
        : { contentType: 'Text', content: input.text ?? '' };

    // Suportar pdfBuffer OU pdfFilePath
    let contentBytes: string;
    if (input.pdfBuffer) {
      contentBytes = input.pdfBuffer.toString('base64');
    } else if (input.pdfFilePath) {
      const pdfFileBuffer = await fs.readFile(input.pdfFilePath);
      contentBytes = pdfFileBuffer.toString('base64');
    } else {
      throw new Error('É necessário informar pdfBuffer ou pdfFilePath');
    }

    const attachmentName =
      input.attachmentName ??
      (input.pdfFilePath ? path.basename(input.pdfFilePath) : 'relatorio.pdf');

    // Montar ccRecipients se CC for informado
    const ccList = input.cc
      ? (Array.isArray(input.cc) ? input.cc : [input.cc])
      : [];

    const message: Record<string, any> = {
      subject: input.subject,
      body,
      toRecipients: toList.map((address) => ({ emailAddress: { address } })),
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachmentName,
          contentType: 'application/pdf',
          contentBytes,
        },
      ],
    };

    if (ccList.length > 0) {
      message.ccRecipients = ccList.map((address) => ({
        emailAddress: { address },
      }));
    }

    await this.graphClient.api(`/users/${senderUpn}/sendMail`).post({
      message,
      saveToSentItems: input.saveToSentItems ?? true,
    });
  }
}

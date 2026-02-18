/**
 * Script para configurar CORS no Azure Blob Storage.
 * npx ts-node src/mediaAttachment/setup-cors.ts
 */
import * as dotenv from "dotenv";
dotenv.config();

import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

async function setupCors() {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!accountName || !accountKey) {
        console.error("❌ AZURE_STORAGE_ACCOUNT_NAME e AZURE_STORAGE_ACCOUNT_KEY devem estar no .env");
        process.exit(1);
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential,
    );

    console.log(`🔧 Configurando CORS para ${accountName}...`);

    await blobServiceClient.setProperties({
        cors: [
            {
                allowedOrigins: "*",
                allowedMethods: "GET,PUT,OPTIONS,HEAD",
                allowedHeaders: "Content-Type,Content-Length,x-ms-blob-type,x-ms-date,x-ms-version,Authorization",
                exposedHeaders: "ETag,Content-Length,x-ms-request-id",
                maxAgeInSeconds: 3600,
            },
        ],
    });

    console.log("✅ CORS configurado com sucesso!");
    console.log("   Origens permitidas: *");
    console.log("   Métodos: GET, PUT, OPTIONS, HEAD");
    console.log("   Max Age: 3600 segundos");
}

setupCors().catch((err) => {
    console.error("❌ Erro ao configurar CORS:", err.message);
    process.exit(1);
});

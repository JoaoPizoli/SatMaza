import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class ErpService {
    constructor(
        @InjectDataSource("erp_mysql")
        private readonly erpDataSource: DataSource,
    ) {}

    async listarClientes(repreId: string, nomcli?: string): Promise<any[]> {
        const repreIdStr = String(repreId).padStart(3, "0");

        if (nomcli && nomcli.trim()) {
            return await this.erpDataSource.query(
                "SELECT CODCLI, NOMCLI, CODREP, NOMREP FROM VW_CLIENTES_ATIVOS WHERE (NOMCLI LIKE ?) AND CODREP = ? LIMIT 50",
                [`%${nomcli}%`, repreIdStr],
            );
        }

        return await this.erpDataSource.query(
            "SELECT CODCLI, NOMCLI, CODREP, NOMREP FROM VW_CLIENTES_ATIVOS WHERE CODREP = ? LIMIT 50",
            [repreIdStr],
        );
    }

    async buscarProdutos(busca?: string): Promise<any[]> {
        if (busca && busca.trim()) {
            return await this.erpDataSource.query(
                `SELECT * FROM VW_PRODUTOS WHERE 
                    (DESCRICAO_ITEM LIKE ? OR CODIGO_ITEM LIKE ?) 
                    AND DEPARTAMENTO = 'PRODUTO ACABADO'
                    AND CODIGO_EMPRESA = 001 LIMIT 50`,
                [`%${busca}%`, `%${busca}%`],
            );
        }

        return await this.erpDataSource.query(
            "SELECT * FROM VW_PRODUTOS WHERE DEPARTAMENTO = 'PRODUTO ACABADO' AND CODIGO_EMPRESA = 001 LIMIT 50",
        );
    }

}

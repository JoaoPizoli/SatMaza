import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class ErpService {
    constructor(
        @InjectDataSource("erp_mysql")
        private readonly erpDataSource: DataSource,
    ) { }

    async listarClientes(repreId: string, busca?: string): Promise<any[]> {
        const repreIdStr = String(repreId).padStart(3, "0");

        if (busca && busca.trim()) {
            return await this.erpDataSource.query(
                "SELECT CODCLI, NOMCLI, CODREP, NOMREP, CIDADE, UF FROM VW_CLIENTES_ATIVOS WHERE (NOMCLI LIKE ? OR CODCLI LIKE ?) AND CODREP = ? LIMIT 50",
                [`%${busca}%`, `%${busca}%`, repreIdStr],
            );
        }

        return await this.erpDataSource.query(
            "SELECT CODCLI, NOMCLI, CODREP, NOMREP, CIDADE, UF FROM VW_CLIENTES_ATIVOS WHERE CODREP = ? LIMIT 50",
            [repreIdStr],
        );
    }

    async buscarRepresentante(repreId: string): Promise<{ CODREP: string; NOMREP: string } | null> {
        const repreIdStr = String(repreId).padStart(3, "0");

        const rows = await this.erpDataSource.query(
            "SELECT DISTINCT CODREP, NOMREP FROM VW_CLIENTES_ATIVOS WHERE CODREP = ? LIMIT 1",
            [repreIdStr],
        );

        return rows.length > 0 ? rows[0] : null;
    }

    async listarRepresentantes(busca?: string): Promise<any[]> {
        if (busca && busca.trim()) {
            return await this.erpDataSource.query(
                "SELECT DISTINCT CODREP, NOMREP FROM VW_CLIENTES_ATIVOS WHERE NOMREP LIKE ? OR CODREP LIKE ? LIMIT 50",
                [`%${busca}%`, `%${busca}%`],
            );
        }

        return await this.erpDataSource.query(
            "SELECT DISTINCT CODREP, NOMREP FROM VW_CLIENTES_ATIVOS LIMIT 50",
        );
    }

    async buscarProdutos(busca?: string): Promise<any[]> {
        if (busca && busca.trim()) {
            return await this.erpDataSource.query(
                `SELECT * FROM VW_PRODUTOS WHERE 
                    (DESCRICAO_ITEM LIKE ? OR CODIGO_ITEM LIKE ?) 
                    AND DEPARTAMENTO = 'PRODUTO ACABADO'
                    AND CODIGO_EMPRESA = 001
                    AND DESCRICAO_ITEM NOT LIKE '%(ÑUSAR+)%'
                    `,
                [`%${busca}%`, `%${busca}%`],
            );
        }

        return await this.erpDataSource.query(
            "SELECT * FROM VW_PRODUTOS WHERE DEPARTAMENTO = 'PRODUTO ACABADO' AND CODIGO_EMPRESA = 001 LIMIT 50",
        );
    }

}

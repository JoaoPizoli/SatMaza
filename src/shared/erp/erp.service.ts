import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";


@Injectable()
export class ErpService {
    constructor(
        @InjectDataSource('erp_mysql')
        private readonly erpDataSource: DataSource
    ){}

    async listarClientes(){
        
    }
}
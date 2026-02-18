import { Injectable } from "@nestjs/common";
import { TipoUsuarioEnum } from "./enum/tipo-usuario.enum";
import { UsuarioEntity } from "./entity/usuario.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import * as bcrypt from "bcrypt";


@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(UsuarioEntity)
        private usuarioRepository: Repository<UsuarioEntity>
    ) { }

    async create(dadosUsuario: CreateUsuarioDto): Promise<UsuarioEntity> {
        const salt = await bcrypt.genSalt(10);
        dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, salt);

        const usuario = this.usuarioRepository.create(dadosUsuario)
        return await this.usuarioRepository.save(usuario)
    }

    async update(id: number, dadosUsuario: UpdateUsuarioDto): Promise<UsuarioEntity | null> {
        if (dadosUsuario.senha) {
            const salt = await bcrypt.genSalt(10);
            dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, salt);
        }

        await this.usuarioRepository.update(id, dadosUsuario)
        return await this.findOne(id)
    }

    async delete(id: number): Promise<void> {
        await this.usuarioRepository.delete(id)
    }

    async findOne(id: number): Promise<UsuarioEntity | null> {
        return await this.usuarioRepository.findOneBy({ id: id })
    }

    async findAll(): Promise<UsuarioEntity[] | null> {
        return this.usuarioRepository.find()
    }

    async findByEmail(email: string): Promise<UsuarioEntity | null> {
        return await this.usuarioRepository.findOneBy({ email })
    }

    async findByUsuario(usuario: string): Promise<UsuarioEntity | null> {
        return await this.usuarioRepository.findOneBy({ usuario })
    }

    async findRepresentantes(): Promise<UsuarioEntity[]> {
        return await this.usuarioRepository.find({ where: { tipo: TipoUsuarioEnum.REPRESENTANTE } });
    }

    async completeRegistration(id: number, dados: { nome: string; email: string; senha?: string }): Promise<UsuarioEntity> {
        const updateData: Partial<UsuarioEntity> = {
            nome: dados.nome,
            email: dados.email,
            password_changed: true,
        };

        if (dados.senha) {
            const salt = await bcrypt.genSalt(10);
            updateData.senha = await bcrypt.hash(dados.senha, salt);
        }

        await this.usuarioRepository.update(id, updateData);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return (await this.findOne(id))!;
    }
}
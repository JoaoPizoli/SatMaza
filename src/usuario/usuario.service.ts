import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { TipoUsuarioEnum } from "./enum/tipo-usuario.enum";
import { UsuarioEntity } from "./entity/usuario.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import * as bcrypt from "bcrypt";


@Injectable()
export class UsuarioService implements OnModuleInit {
    private readonly logger = new Logger(UsuarioService.name);

    constructor(
        @InjectRepository(UsuarioEntity)
        private usuarioRepository: Repository<UsuarioEntity>
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    private async seedAdmin() {
        const adminExists = await this.usuarioRepository.findOne({
            where: { tipo: TipoUsuarioEnum.ADMIN }
        });

        if (adminExists) {
            this.logger.log('Usuário ADMIN já existente. Seed ignorado.');
            return;
        }

        const email = process.env.ADMIN_DEFAULT_EMAIL;
        const senha = process.env.ADMIN_DEFAULT_PASSWORD;
        const usuarioMatricula = process.env.ADMIN_DEFAULT_USUARIO || '001';

        if (!email || !senha) {
            this.logger.error(
                '════════════════════════════════════════════════════════\n' +
                '  ERRO: Nenhum admin encontrado e as variáveis de ambiente\n' +
                '  ADMIN_DEFAULT_EMAIL e/ou ADMIN_DEFAULT_PASSWORD não foram\n' +
                '  definidas no .env.production.\n' +
                '  A aplicação não pode iniciar sem um usuário administrador.\n' +
                '  Defina as variáveis e reinicie o container.\n' +
                '════════════════════════════════════════════════════════'
            );
            // Encerra o processo para forçar o operador a corrigir o env
            process.exit(1);
        }

        this.logger.log('Nenhum usuário ADMIN encontrado. Criando admin padrão...');
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        const novoAdmin = this.usuarioRepository.create({
            usuario: usuarioMatricula,
            senha: hashSenha,
            email,
            tipo: TipoUsuarioEnum.ADMIN,
            nome: 'Administrador Sistema',
            password_changed: true,
        });

        await this.usuarioRepository.save(novoAdmin);
        this.logger.log(`Admin criado. Matrícula: ${usuarioMatricula} | Email: ${email}`);
    }

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
        return (await this.findOne(id))!;
    }
}
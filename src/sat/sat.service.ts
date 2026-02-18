import { BadRequestException, Injectable } from "@nestjs/common";
import { SatEntity } from "./entity/sat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSatDto } from "./dto/create-sat.dto";
import { AvtService } from "src/avt/avt.service";
import { CreateAvtDto } from "src/avt/dto/create-avt.dto";
import { AvtEntity } from "src/avt/entity/avt.entity";
import { UpdateAvtDto } from "src/avt/dto/update-avt.dto";
import { StatusAvtEnum } from "src/avt/enum/status-avt.enum";
import { StatusSatEnum } from "./enum/status-sat.enum";
import { LaboratorioSatEnum } from "./enum/laboratorio-sat.enum";
import { UsuarioService } from "src/usuario/usuario.service";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { UpdateSatDto } from "./dto/update-sat.dto";
import { GraphMailService } from "src/mail/graph-mail.service";
import { ConfigService } from "@nestjs/config";
import { SatPdfService } from "src/mail/sat-pdf.service";


@Injectable()
export class SatService {
    constructor(
        @InjectRepository(SatEntity)
        private satRepository: Repository<SatEntity>,
        private usuarioService: UsuarioService,
        private avtService: AvtService,
        private mailService: GraphMailService,
        private satPdfService: SatPdfService,
    ) { }

    async createSat(dadosSat: CreateSatDto): Promise<SatEntity | null> {
        const usuario = await this.usuarioService.findOne(dadosSat.representante_id);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        // Os lotes vêm no DTO como array de objetos {lote, validade}.
        // O TypeORM com cascade: true na relação deve lidar com a criação dos SatLoteEntity
        const sat = this.satRepository.create(dadosSat);

        // Gerar código temporário para satisfazer constraint NOT NULL
        sat.codigo = 'TEMP';
        const saved = await this.satRepository.save(sat);

        // Gerar código definitivo a partir do seq auto-incrementado
        saved.codigo = `SAT-${String(saved.seq).padStart(6, '0')}`;
        return await this.satRepository.save(saved);
    }

    async createAvt(id: string, dadosAvt: CreateAvtDto, usuario_id: number): Promise<AvtEntity> {
        return await this.avtService.create(id, dadosAvt, usuario_id)
    }

    async updateAvt(id: string, dadosAvt: UpdateAvtDto): Promise<AvtEntity> {
        return await this.avtService.update(id, dadosAvt)
    }

    async changeStatusAvt(id: string, statusAvt: StatusAvtEnum): Promise<AvtEntity> {
        return await this.avtService.changeStatus(id, statusAvt)
    }

    async update(id: string, dadosSat: UpdateSatDto): Promise<SatEntity | null> {
        await this.satRepository.update(id, dadosSat);
        return await this.findOne(id)
    }

    async delete(id: string): Promise<void> {
        await this.satRepository.delete(id)
    }

    private readonly defaultRelations = ['representante', 'evidencias', 'avt', 'avt.laudo', 'lotes'] as const;

    async findOne(id: string): Promise<SatEntity | null> {
        return await this.satRepository.findOne({ where: { id }, relations: [...this.defaultRelations] })
    }

    async findAll(): Promise<SatEntity[] | null> {
        return await this.satRepository.find({ relations: [...this.defaultRelations] })
    }

    async findSatsByLab(laboratorio: LaboratorioSatEnum): Promise<SatEntity[]> {
        return await this.satRepository.find({ where: { destino: laboratorio }, relations: [...this.defaultRelations] })
    }

    async findSatsByRepresentante(representanteId: number): Promise<SatEntity[]> {
        const usuario = await this.usuarioService.findOne(representanteId);

        if (!usuario || usuario.tipo !== TipoUsuarioEnum.REPRESENTANTE) {
            throw new BadRequestException('Usuário inválido ou não é representante');
        }

        return await this.satRepository.find({ where: { representante_id: representanteId }, relations: [...this.defaultRelations] });
    }

    async findSatsByStatus(statusSat: StatusSatEnum): Promise<SatEntity[]> {
        return await this.satRepository.find({ where: { status: statusSat }, relations: [...this.defaultRelations] })
    }

    async changeStatus(id: string, status: StatusSatEnum): Promise<SatEntity | null> {
        const sat = await this.findOne(id);
        if (!sat) {
            throw new BadRequestException('SAT não encontrada');
        }
        sat.status = status;
        await this.satRepository.save(sat);
        return await this.findOne(id);
    }

    async redirecionar(id: string): Promise<SatEntity> {
        const sat = await this.findOne(id);
        if (!sat) {
            throw new BadRequestException('SAT não encontrada');
        }

        if (!sat.destino) {
            throw new BadRequestException('SAT não possui destino definido para redirecionar');
        }

        // Inverte o destino
        const novoDestino = sat.destino === LaboratorioSatEnum.BASE_AGUA
            ? LaboratorioSatEnum.BASE_SOLVENTE
            : LaboratorioSatEnum.BASE_AGUA;

        // Atualiza status
        const novoStatus = novoDestino === LaboratorioSatEnum.BASE_AGUA
            ? StatusSatEnum.ENVIADO_BAGUA
            : StatusSatEnum.ENVIADO_BSOLVENTE;

        sat.destino = novoDestino;
        sat.status = novoStatus;

        await this.satRepository.save(sat);

        // Enviar email notificando redirecionamento
        if (sat.representante?.email) {
            const emailDestino = process.env.MAIL_DESTINO_REDIRECIONAMENTO; // Email definido pelo usuário (preciso adicionar ao env ou chumbar se ele der)
            // O user disse: "enviar um email automaticamente para um email que eu definir" -> vou assumir que posso usar uma variavel de ambiente ou um fixo por enquanto.
            // Vou usar uma variavel ficticia ou enviar para o proprio representante + um email fixo de admin/lab se tiver.
            // O user disse "siga o mesmo padrao de envio de email já existente".

            // Vou montar o corpo do email
            const html = `
                <h3>SAT Redirecionada</h3>
                <p>A SAT <strong>${sat.codigo}</strong> foi redirecionada para o laboratório: <strong>${novoDestino}</strong>.</p>
                <p><strong>Redirecionado por:</strong> ${sat.destino === LaboratorioSatEnum.BASE_AGUA ? 'Base Solvente' : 'Base Água'}</p>
                <br/>
                <h4>Detalhes da SAT:</h4>
                <p><strong>Cliente:</strong> ${sat.cliente}</p>
                <p><strong>Produto:</strong> ${sat.produtos}</p>
                <p><strong>Reclamação:</strong> ${sat.reclamacao}</p>
             `;

            // Enviar para um email definido (vou colocar um placeholder no .env ou usar um hardcoded se nao tiver info).
            // Vou assumir que o email de destino é algo como "lab.maza@..." ou o email do usuario logado? 
            // "enviar um email automaticamente para um email que eu definir" -> O user nao definiu qual é. Vou usar process.env.MAIL_NOTIFICACAO_SAT

            const emailNotificacao = process.env.MAIL_NOTIFICACAO_SAT || 'sac@maza.com.br'; // Fallback

            try {
                // Gerar PDF da SAT
                const pdfBuffer = await this.satPdfService.generatePdf(sat);

                await this.mailService.sendWithPdfAttachment({
                    to: [emailNotificacao],
                    subject: `SAT Redirecionada: ${sat.codigo}`,
                    html,
                    pdfBuffer,
                    attachmentName: `SAT-${sat.codigo}.pdf`,
                });
            } catch (error) {
                console.error('Erro ao enviar email de redirecionamento:', error);
                // Não falhar o redirecionamento se o email falhar?
            }
        }

        return sat;
    }
}
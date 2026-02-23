import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { MediaAttachmentService } from "./mediaAttachment.service";
import { CreateMediaAttachmentDto } from "./dto/create-mediaAttachment.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MediaAttachmentEntity } from "./entity/mediaAttachment.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { UserFromToken } from "src/auth/decorators/current-user.decorator";
import { SatService } from "src/sat/sat.service";

@ApiTags('Mídia')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaAttachmentController {
    constructor(
        private mediaAttachmentService: MediaAttachmentService,
        private satService: SatService,
    ) { }

    /**
     * Verifica se o usuário tem acesso à SAT.
     * REPRESENTANTE só pode acessar suas próprias SATs; demais roles têm acesso livre.
     */
    private async assertSatAccess(satId: string, user: UserFromToken): Promise<void> {
        if (user.tipo !== TipoUsuarioEnum.REPRESENTANTE) return;

        const sat = await this.satService.findOne(satId);
        if (!sat || sat.representante_id !== user.id) {
            throw new ForbiddenException('Você não tem permissão para acessar esta SAT');
        }
    }

    @Post('generate-sas')
    @ApiOperation({ summary: 'Gerar URL SAS', description: 'Gera uma URL SAS para upload de arquivo no Azure Blob Storage' })
    @ApiBody({ type: CreateMediaAttachmentDto })
    @ApiResponse({ status: 201, description: 'URL SAS gerada com sucesso', schema: { type: 'object', properties: { sasUrl: { type: 'string' }, mediaId: { type: 'string' } } } })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou tipo de arquivo não permitido' })
    @ApiResponse({ status: 403, description: 'Sem permissão para esta SAT' })
    async generateSasUrl(@Body() dto: CreateMediaAttachmentDto, @CurrentUser() user: UserFromToken) {
        await this.assertSatAccess(dto.satId, user);
        return await this.mediaAttachmentService.generateSasUrl(dto);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Confirmar upload', description: 'Confirma que o upload do arquivo foi concluído' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Upload confirmado', type: MediaAttachmentEntity })
    @ApiResponse({ status: 403, description: 'Sem permissão para esta SAT' })
    async confirmUpload(@Param('id') id: string, @CurrentUser() user: UserFromToken) {
        const media = await this.mediaAttachmentService.findOne(id);
        if (media) await this.assertSatAccess(media.sat_id, user);
        return await this.mediaAttachmentService.confirmUpload(id);
    }

    @Get(':id/view')
    @ApiOperation({ summary: 'Gerar URL de visualização', description: 'Gera uma URL SAS de leitura para visualizar/baixar o arquivo' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'URL de visualização gerada', schema: { type: 'object', properties: { viewUrl: { type: 'string' } } } })
    @ApiResponse({ status: 403, description: 'Sem permissão para esta SAT' })
    async getViewUrl(@Param('id') id: string, @CurrentUser() user: UserFromToken) {
        const media = await this.mediaAttachmentService.findOne(id);
        if (media) await this.assertSatAccess(media.sat_id, user);
        return await this.mediaAttachmentService.generateReadSasUrl(id);
    }

    @Get('sat/:satId')
    @ApiOperation({ summary: 'Buscar mídias por SAT', description: 'Retorna todas as mídias associadas a uma SAT' })
    @ApiParam({ name: 'satId', description: 'UUID da SAT' })
    @ApiResponse({ status: 200, description: 'Lista de mídias da SAT', type: [MediaAttachmentEntity] })
    @ApiResponse({ status: 403, description: 'Sem permissão para esta SAT' })
    async findBySat(
        @Param('satId') satId: string,
        @Query('context') context: 'sat_evidencia' | 'avt_laudo' | undefined,
        @CurrentUser() user: UserFromToken,
    ) {
        await this.assertSatAccess(satId, user);
        return await this.mediaAttachmentService.findBySat(satId, context);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar mídia por ID', description: 'Retorna os dados de uma mídia específica' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Mídia encontrada', type: MediaAttachmentEntity })
    @ApiResponse({ status: 403, description: 'Sem permissão para esta SAT' })
    async findOne(@Param('id') id: string, @CurrentUser() user: UserFromToken) {
        const media = await this.mediaAttachmentService.findOne(id);
        if (media) await this.assertSatAccess(media.sat_id, user);
        return media;
    }

    @Delete(':id')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'Excluir mídia', description: 'Remove uma mídia do sistema e do Azure Storage' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Mídia removida com sucesso' })
    async delete(@Param('id') id: string) {
        return await this.mediaAttachmentService.delete(id);
    }
}

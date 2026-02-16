import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { MediaAttachmentService } from "./mediaAttachment.service";
import { CreateMediaAttachmentDto } from "./dto/create-mediaAttachment.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MediaAttachmentEntity } from "./entity/mediaAttachment.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";

@ApiTags('Mídia')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaAttachmentController {
    constructor(
        private mediaAttachmentService: MediaAttachmentService,
    ) {}

    @Post('generate-sas')
    @ApiOperation({ summary: 'Gerar URL SAS', description: 'Gera uma URL SAS para upload de arquivo no Azure Blob Storage' })
    @ApiBody({ type: CreateMediaAttachmentDto })
    @ApiResponse({ status: 201, description: 'URL SAS gerada com sucesso', schema: { type: 'object', properties: { sasUrl: { type: 'string', description: 'URL SAS para upload' }, mediaId: { type: 'string', description: 'ID da mídia criada' } } } })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async generateSasUrl(@Body() dto: CreateMediaAttachmentDto) {
        return await this.mediaAttachmentService.generateSasUrl(dto);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Confirmar upload', description: 'Confirma que o upload do arquivo foi concluído' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Upload confirmado', type: MediaAttachmentEntity })
    @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
    async confirmUpload(@Param('id') id: string) {
        return await this.mediaAttachmentService.confirmUpload(id);
    }

    @Get('sat/:satId')
    @ApiOperation({ summary: 'Buscar mídias por SAT', description: 'Retorna todas as mídias associadas a uma SAT' })
    @ApiParam({ name: 'satId', description: 'UUID da SAT' })
    @ApiResponse({ status: 200, description: 'Lista de mídias da SAT', type: [MediaAttachmentEntity] })
    async findBySat(@Param('satId') satId: string) {
        return await this.mediaAttachmentService.findBySat(satId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar mídia por ID', description: 'Retorna os dados de uma mídia específica' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Mídia encontrada', type: MediaAttachmentEntity })
    @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
    async findOne(@Param('id') id: string) {
        return await this.mediaAttachmentService.findOne(id);
    }

    @Delete(':id')
    @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.ORQUESTRADOR)
    @ApiOperation({ summary: 'Excluir mídia', description: 'Remove uma mídia do sistema e do Azure Storage' })
    @ApiParam({ name: 'id', description: 'UUID da mídia' })
    @ApiResponse({ status: 200, description: 'Mídia removida com sucesso' })
    @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
    async delete(@Param('id') id: string) {
        return await this.mediaAttachmentService.delete(id);
    }
}
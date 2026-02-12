import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { MediaAttachmentService } from "./mediaAttachment.service";
import { CreateMediaAttachmentDto } from "./dto/create-mediaAttachment.dto";

@Controller('media')
export class MediaAttachmentController {
    constructor(
        private mediaAttachmentService: MediaAttachmentService,
    ) {}

    @Post('generate-sas')
    async generateSasUrl(@Body() dto: CreateMediaAttachmentDto) {
        return await this.mediaAttachmentService.generateSasUrl(dto);
    }

    @Patch(':id/confirm')
    async confirmUpload(@Param('id') id: string) {
        return await this.mediaAttachmentService.confirmUpload(id);
    }

    @Get('sat/:satId')
    async findBySat(@Param('satId') satId: string) {
        return await this.mediaAttachmentService.findBySat(satId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.mediaAttachmentService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.mediaAttachmentService.delete(id);
    }
}
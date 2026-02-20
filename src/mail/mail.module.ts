import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphMailService } from './graph-mail.service';
import { SatPdfService } from './sat-pdf.service';
import { SatNotificationService } from './sat-notification.service';
import { SatModule } from '../sat/sat.module';
import { RepreAtendenteEntity } from '../usuario/entity/repre_atendente.entity';

@Module({
    imports: [
        forwardRef(() => SatModule),
        TypeOrmModule.forFeature([RepreAtendenteEntity])
    ],
    providers: [GraphMailService, SatPdfService, SatNotificationService],
    exports: [GraphMailService, SatPdfService, SatNotificationService],
})
export class MailModule { }

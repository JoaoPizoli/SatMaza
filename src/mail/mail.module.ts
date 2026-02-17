import { Module, forwardRef } from '@nestjs/common';
import { GraphMailService } from './graph-mail.service';
import { SatPdfService } from './sat-pdf.service';
import { SatNotificationService } from './sat-notification.service';
import { SatModule } from '../sat/sat.module';

@Module({
    imports: [forwardRef(() => SatModule)],
    providers: [GraphMailService, SatPdfService, SatNotificationService],
    exports: [GraphMailService, SatPdfService, SatNotificationService],
})
export class MailModule { }

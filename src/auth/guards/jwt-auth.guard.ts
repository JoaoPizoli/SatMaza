import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { TokenBlacklistService } from "../token-blacklist.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private tokenBlacklistService: TokenBlacklistService,
        private reflector: Reflector,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.replace('Bearer ', '') ?? '';

        if (await this.tokenBlacklistService.isBlacklisted(token)) {
            throw new UnauthorizedException('Token invalidado pelo logout');
        }

        return super.canActivate(context) as Promise<boolean>;
    }
}

import { SetMetadata } from "@nestjs/common";
import { TipoUsuarioEnum } from "src/usuario/enum/tipo-usuario.enum";

export const ROLES_KEY = "roles";
export const Roles = (...roles: TipoUsuarioEnum[]) => SetMetadata(ROLES_KEY, roles);

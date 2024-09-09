import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
    // Reglas de validacion
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;
}

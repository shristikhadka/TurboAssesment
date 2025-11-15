
import { IsEmail, IsString, MinLength, IsNumber } from 'class-validator';
export class RegisterDTO{
    @IsEmail()
    email:string;

    @IsString()
    @MinLength(6)
    password:string;

    @IsNumber()
    organizationId:number;
}
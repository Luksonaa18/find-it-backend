import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsString()
  @IsNotEmpty()
  @IsIn(['USER', 'ADMIN'], { message: 'Role must be either USER or ADMIN' })
  role: 'USER' | 'ADMIN';
  @IsString()
  @IsNotEmpty()
  region: string;
  @IsString()
  @IsNotEmpty()
  phone: string;
}

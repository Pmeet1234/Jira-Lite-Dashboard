import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message:
      'Password must include uppercase, lowercase, number & special char',
  })
  password!: string;
}

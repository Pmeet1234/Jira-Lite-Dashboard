import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class login {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message:
      "Password must include uppercase, lowercase, number & special char",
  })
  password!: string;
}

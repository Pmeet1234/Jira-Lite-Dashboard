import { CreateUserDto } from './dto/create-user.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('Register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('Login')
  login(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  }
}

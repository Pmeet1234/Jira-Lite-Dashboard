import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/dto/user.entities';
import { Repository } from 'typeorm/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-playload.interface';
@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  //Register Method
  async register(body: CreateUserDto) {
    //Check if Email already Exists
    const exists = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
      select: ['id'],
    });
    if (exists) {
      this.logger.warn(`Email already exists: ${body.email}`);
      throw new ConflictException('Email already register');
    }
    // Hash password before saving
    const hashed = await bcrypt.hash(body.password, 10);

    const user = this.userRepository.create({
      ...body,
      password: hashed,
    });
    await this.userRepository.save(user);
    this.logger.log(
      `User registered successfully - id: ${user.id}, email: ${user.email}`,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  //Login Method
  async login(body: LoginUserDto) {
    //find user by email
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare provided password with hashed password in DB
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      this.logger.warn(`Wrong password for: ${body.email}`);
      throw new ConflictException('Invalid credentials');
    }

    // Create JWT payload
    const payload: JwtPayload = { sub: user.id, email: user.email }; //sub is user id

    this.logger.log(`Login successful - id: ${user.id}, email: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}

import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { register } from "./dto/register.dto";
import * as bcrypt from "bcrypt";
import { Admin } from "./entity/admin.entity";
import { login } from "./dto/login.dto";

@Injectable()
export class AdminService {
  logger = new Logger("AdminService");
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  async creatAdmin(dto: register) {
    const exists = await this.adminRepo.findOne({
      where: {
        email: dto.email,
      },
    });
    if (exists) {
      this.logger.warn(`Email already exists: ${dto.email}`);
      throw new ConflictException("Email already register");
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const admin = this.adminRepo.create({ ...dto, password: hashed });
    await this.adminRepo.save(admin);
    this.logger.log(
      `Admin registered successfully - id: ${admin.id}, email: ${admin.email}`,
    );
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  }

  async loginAdmin(dto: login) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });

    if (!admin) {
      this.logger.warn(`Admin not found: ${dto.email}`);
      throw new ConflictException("Admin not found");
    }

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) {
      this.logger.warn(`Wrong password for: ${dto.email}`);
      throw new ConflictException("Invalid credentials");
    }

    this.logger.log(
      `Admin registered successfully - id: ${admin.id}, email: ${admin.email}`,
    );

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  }
}

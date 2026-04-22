import { Body, Controller, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { register } from "./dto/register.dto";
import { login } from "./dto/login.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("Register")
  async creatAdmin(@Body() dto: register) {
    return this.adminService.creatAdmin(dto);
  }

  @Post("Login")
  async loginAdmin(@Body() dto: login) {
    return this.adminService.loginAdmin(dto);
  }
}

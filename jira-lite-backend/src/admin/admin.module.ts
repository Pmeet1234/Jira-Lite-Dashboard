import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { Admin } from "./entity/admin.entity";

@Module({
  controllers: [AdminController],
  imports: [TypeOrmModule.forFeature([Admin])],
  exports: [TypeOrmModule],
  providers: [AdminService],
})
export class AdminModule {}

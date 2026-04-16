import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Comment } from './entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

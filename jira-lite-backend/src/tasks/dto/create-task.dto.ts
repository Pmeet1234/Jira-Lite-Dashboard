import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus, Priority } from '../entity/task.entity';

export class CreateTaskDto {
  @IsNotEmpty()
  summary!: string;

  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsEnum(Priority)
  priority!: Priority;

  @IsNotEmpty()
  taskOwner!: string;

  @IsNotEmpty()
  assignee!: string;

  @IsNotEmpty()
  team!: string;

  @IsNotEmpty()
  startDate!: Date;

  @IsNotEmpty()
  dueDate!: Date;
}

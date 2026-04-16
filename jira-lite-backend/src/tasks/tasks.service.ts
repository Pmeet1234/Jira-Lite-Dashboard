import { Comment } from './entity/comment.entity';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task)
    private taskrepo: Repository<Task>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async create(dto: CreateTaskDto) {
    const lastTask = await this.taskrepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;

    if (lastTask.length > 0) {
      nextNumber = lastTask[0].id + 1;
    }

    const taskId = `TASK-${nextNumber.toString().padStart(3, '0')}`;
    const task = this.taskrepo.create({
      ...dto,
      taskId,
      status: dto.status ?? TaskStatus.TODO,
    });

    await this.taskrepo.save(task);
    this.logger.log(`Task created: ${task.taskId}`);
    return task;
  }

  async findAll() {
    return await this.taskrepo.find();
  }

  async findOne(id: number) {
    const task = await this.taskrepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException({
        message: `Task with ID ${id} not found`,
      });
    }

    return task;
  }

  async update(id: number, data: Partial<Task>) {
    const exists = await this.taskrepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException('Task not found');

    await this.taskrepo.update(id, data);

    this.logger.log(`Task updated ID: ${id}`);

    return id;
  }

  async delete(id: number) {
    const task = await this.findOne(id);

    await this.taskrepo.remove(task);

    this.logger.log(`Task deleted ID: ${id}`);

    return { deleted: true };
  }

  async findData(query: any) {
    const { status, assignee, priority, search } = query;

    const qb = this.taskrepo.createQueryBuilder('task');

    // Filter by status
    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    // Filter by assignee
    if (assignee) {
      qb.andWhere('task.assignee = :assignee', { assignee });
    }

    // Filter by priority
    if (priority) {
      qb.andWhere('task.priority = :priority', { priority });
    }

    // Search (summary + description)
    if (search) {
      qb.andWhere(
        `(task.summary ILIKE :search 
        OR task.description ILIKE :search 
         OR task.taskId ILIKE :search )`,
        { search: `%${search}%` },
      );
    }

    // Filter by taskId string column

    qb.orderBy('task.id', 'ASC');
    const tasks = await qb.getMany();

    return tasks;
  }

  async FindWithComment(id: number) {
    const task = await this.taskrepo.findOne({
      where: {
        id,
      },
      relations: ['comments'],
      order: {
        comments: {
          createdAt: 'DESC',
        },
      },
    });
    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
      });
    }
    return task;
  }

  async addcomment(taskId: number, body: CreateCommentDto) {
    const task = await this.taskrepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException({
        message: `Task with ID ${taskId} not found`,
      });
    }

    const comment = this.commentRepo.create({
      content: body.content,
      author: body.author,
      task: { id: taskId },
    });
    await this.commentRepo.save(comment);
    this.logger.log(`Comment added to task ID: ${taskId}`);

    return comment;
  }

  async removeComment(commentId: number) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['task'],
    });
    if (!comment) {
      throw new NotFoundException({
        message: 'Comment not found',
      });
    }
    await this.commentRepo.remove(comment);
    this.logger.log(`Comment deleted ID:${commentId}`);
    return { delete: true, commentId };
  }
}

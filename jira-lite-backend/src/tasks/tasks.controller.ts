import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  // UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private taskservice: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.taskservice.create(dto);
  }

  @Get('search')
  // @UseGuards(JwtAuthGuard)
  findData(@Query() query: any) {
    return this.taskservice.findData(query);
  }

  @Get()
  findAll() {
    return this.taskservice.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.taskservice.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body) {
    return this.taskservice.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.taskservice.delete(Number(id));
  }

  @Get(':id/details')
  FindWithComment(@Param('id', ParseIntPipe) id: number) {
    return this.taskservice.FindWithComment(id);
  }
  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.taskservice.addcomment(taskId, body);
  }

  @Delete('removeComment/:commentId')
  removeComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.taskservice.removeComment(commentId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TaskOwnershipGuard } from '@common/guards/task-ownership.guard';
import { GetUser } from '@common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() dto: CreateTaskDto, @GetUser() user: any) {
    return this.tasksService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks (Admin: all, User: own)' })
  findAll(@GetUser() user: any) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  @UseGuards(TaskOwnershipGuard)
  @ApiOperation({ summary: 'Get task by ID (ownership check)' })
  findOne(@Param('id') id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(TaskOwnershipGuard)
  @ApiOperation({ summary: 'Update task (only owner or admin)' })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateTaskDto,
    @GetUser() user: any,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(TaskOwnershipGuard)
  @ApiOperation({ summary: 'Delete task (only owner or admin)' })
  remove(@Param('id') id: number, @GetUser() user: any) {
    return this.tasksService.remove(id, user);
  }
}

// src/tasks/entities/task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id!: number;

  @Column()
  @ApiProperty({ example: 'Deploy to production' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Final deployment', required: false })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  // Foreign key column
  @Column({ nullable: true })
  @ApiProperty({ example: 34, required: false })
  assignedToId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedToId' })
  @ApiProperty({ type: () => User, nullable: true })
  assignedTo?: User | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  @ApiProperty({ type: () => User })
  createdBy!: User;

  @Column()
  createdById!: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt!: Date;
}

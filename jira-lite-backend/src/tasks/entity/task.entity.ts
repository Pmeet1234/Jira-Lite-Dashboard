import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_HOLD = 'IN_HOLD',
  PEER_REVIEW = 'PEER_REVIEW',
  TESTING = 'TESTING',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  taskId!: string;

  @Column()
  summary!: string;

  @Column('text')
  description!: string;

  @Column({ default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority!: Priority;

  @Column()
  taskOwner!: string;

  @Column()
  assignee!: string;

  @Column()
  team!: string;

  @Column()
  startDate!: Date;

  @Column()
  dueDate!: Date;

  @Column({ nullable: true })
  finishedAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.task, {
    cascade: true,
  })
  comments?: Comment[];
}

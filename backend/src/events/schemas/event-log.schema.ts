import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventLog extends Document {
  @Prop({ required: true })
  event!: string; // e.g 'task.created', 'task.updated', 'task.assigned'

  @Prop({ required: true })
  taskId!: number;

  @Prop()
  userId?: number;

  @Prop({ type: Object })
  payload: any;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

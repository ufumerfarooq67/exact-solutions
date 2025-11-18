// src/events/events.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventLog } from './schemas/event-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(@InjectModel(EventLog.name) private eventModel: Model<EventLog>) {}

  async log(event: string, taskId: number, userId?: number, payload?: any) {
    await this.eventModel.create({
      event,
      taskId,
      userId,
      payload,
    });
  }
}
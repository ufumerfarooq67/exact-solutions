// src/events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Frontend calls this after connecting: socket.emit('joinMyRoom', userId)
  @SubscribeMessage('joinMyRoom')
  handleJoinMyRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user_${userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('joinedRoom', { room });
  }

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token?.split(' ')?.[1] ||
      client.handshake.headers['authorization']?.split(' ')?.[1];

    if (!token) {
      this.logger.warn('WebSocket connection rejected: no token');
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.data.user = payload;
      this.logger.log(
        `User ${payload.sub} (${payload.email}) connected to WebSocket`,
      );

      // Optional: auto-join room on connect (bonus)
      const autoRoom = `user_${payload.sub}`;
      client.join(autoRoom);
      client.emit('connected', {
        message: 'WebSocket connected',
        userId: payload.sub,
      });
    } catch (error) {
      console.log(error);
      this.logger.error('Invalid JWT in WebSocket handshake');
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      this.logger.log(`User ${userId} disconnected from WebSocket`);
    }
  }

  // Called from TasksService
  emitToUser(userId: number, event: string, data: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit(event, data);
  }

  // Global broadcast
  emitGlobal(event: string, data: any) {
    this.server.emit(event, data);
  }
}

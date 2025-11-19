import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from '@config/configuration';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { TasksModule } from '@tasks/tasks.module';
import { EventsModule } from '@events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.postgres.host'),
        port: configService.get('database.postgres.port'),
        username: configService.get('database.postgres.username'),
        password: configService.get('database.postgres.password'),
        database: configService.get('database.postgres.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Never use in production
        logging: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongo'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    TasksModule,
    EventsModule,
  ],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global API Prefix: /v1
  app.setGlobalPrefix('v1', {
    exclude: ['health', 'api', 'docs'], // Keep Swagger & health clean
  });

  // 2. Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  // 3. CORS
  app.enableCors({
    origin: [process.env.SOURCE_URL], // Frontend url
    credentials: true,
  });

  // 4. Swagger
  const config = new DocumentBuilder()
    .setTitle('TaskCollab API')
    .setDescription(
      'Real-Time Task Collaboration System – Senior Full-Stack Interview',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication & User Management')
    .addTag('tasks', 'Task CRUD, Assignment & Real-Time Updates')
    .addTag('events', 'WebSocket & Real-Time Events')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`Backend running at http://localhost:${port}`);
  console.log(`API Base URL → http://localhost:${port}/v1`);
  console.log(`Swagger UI → http://localhost:${port}/api`);
  console.log(`WebSocket → ws://localhost:${port}/events`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove extra fields
      forbidNonWhitelisted: true, // throw error if extra fields sent
      transform: true, // auto-transform types
    }),
  );

  // Enable CORS for your frontend
  app.enableCors({
    origin: 'https://findit-production-7c39.up.railway.app/', // must include https
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Parse JSON and URL-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Listen on Railway port
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`🚀 Backend running on port ${port}`);
  });
}

bootstrap();

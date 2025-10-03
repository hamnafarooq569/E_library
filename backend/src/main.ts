import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // allow frontend to read filename
  });

  await app.listen(Number(process.env.PORT ?? 3000));
  console.log(`API running at http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();

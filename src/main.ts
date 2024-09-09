import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // cuando desplegamos en PROD es requerido que el puerto sea el siguiente
  // al configurar nuevo ENVIROMENT es probable que tengamos algun puerto designado
  // como variable en nuestro servidor, por ende, configuramos de esta forma
  // para evitar posibles errores de puerto a futuro
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

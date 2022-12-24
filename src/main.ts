import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { toASCII } from 'punycode';
import { AppModule } from './app/app.module';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true
  }));
  await app.listen(5000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

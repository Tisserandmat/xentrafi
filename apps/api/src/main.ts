import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(), // attache req.correlationId
    new HttpLoggingInterceptor(), // consomme req.correlationId et loggue
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

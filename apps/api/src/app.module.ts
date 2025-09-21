import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR, // global pour toutes les routes
      useClass: CorrelationIdInterceptor,
    },
  ],
})
export class AppModule {}

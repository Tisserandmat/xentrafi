import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletsModule } from './wallets/wallets.module';
import { WalletsController } from './wallets/wallets.controller';
import { WalletsService } from './wallets/wallets.service';

@Module({
  imports: [WalletsModule],
  controllers: [AppController, WalletsController],
  providers: [AppService, WalletsService],
})
export class AppModule {}

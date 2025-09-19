import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// ✅ ValidationPipe permet de brancher class-validator/class-transformer partout
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Crée l'application Nest à partir du module racine
  const app = await NestFactory.create(AppModule);

  // ✅ Active la validation globale :
  // - whitelist: supprime automatiquement les champs non déclarés dans nos DTO
  // - forbidNonWhitelisted: au lieu de les supprimer, renvoie 400 si des champs inconnus arrivent
  // - transform: convertit le JSON (string/number) en types attendus des classes (grâce à class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }, // ex: "1" -> 1 si DTO attend un number
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

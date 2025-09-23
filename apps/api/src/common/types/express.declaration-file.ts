//importe express pour accéder à ses types
import 'express';

// le module de base d'Express
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * ID de corrélation de la requête
     * - posé par le CorrelationIdInterceptor
     * - lu ensuite par le HttpLoggingInterceptor
     * - permet de relier tous les logs d'une même requête
     */
    correlationId?: string;
  }
}

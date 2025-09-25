// DESCRIPTION: Interceptor HTTP qui logge chaque requête/réponse avec un niveau adapté
//              et sans exposer de PII. Conçu pour être branché globalement.
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// Import des types Express pour donner à req/res un typage fort (évite any, etc..)
import { Request, Response } from 'express';

// Injectable (pour que Nest puisse instancier la classe)
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  // - ctx: permet d'accéder au contexte d'exécution (HTTP ici)
  // - next: exécute le handler et renvoie un Observable (flux de réponse)
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // ===================== AVANT L'EXÉCUTION DU HANDLER =====================
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request & { correlationId?: string }>();
    const res = http.getResponse<Response>();
    // Point de départ de la mesure de durée
    const startedAt = Date.now();
    // Méthode HTTP utilisée pour la requête (ex: GET, POST, PUT, DELETE)
    const method = req.method;
    // permet d'identifier la route  appelée
    const url = req.url;
    const ip = req.socket?.remoteAddress;
    // Récupère le User-Agent envoyé par le client (navigateur, mobile, etc.)
    const userAgent = req.headers['user-agent'];
    // - correlationId (req.headers['x-correlation-id'])
    const correlationId: string | undefined = req.correlationId;
    // ====================== EXÉCUTION + LOGS EN SORTIE ======================

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startedAt;
          // 5xx/4xx etc .. niveau de réponse
          const status = res.statusCode;
          //  - sinon: en dev 'debug', en prod 'info'
          const isDev = process.env.NODE_ENV === 'development';
          const logLevel =
            status >= 500
              ? 'error'
              : status >= 400
                ? 'warn'
                : isDev
                  ? 'debug'
                  : 'info';

          const slow = duration > 1000 && status < 400; // option: requêtes lentes
          const base = { method, url, status, ip, userAgent, correlationId };
          // objet du LOG avec ses infos
          const log = {
            ts: new Date().toISOString(),
            msg: 'HTTP : ',
            base,
            duration_ms: duration,
            slow,
          };
          // Émettre le log avec console selon le niveau
          (logLevel === 'error'
            ? console.error
            : logLevel === 'warn'
              ? console.warn
              : isDev && logLevel === 'debug'
                ? console.debug
                : console.log)(log);
        },
        error: (err) => {
          const duration: number = Date.now() - startedAt;
          const status = res.statusCode ?? 500;

          const errorLog = {
            ts: new Date().toISOString(),
            msg: 'HTTP_ERROR',
            method,
            url,
            status,
            duration_ms: duration,
            correlationId,
            // - message + name (éviter stack en prod)
            error:
              err instanceof Error
                ? { name: err.name, message: err.message }
                : { name: 'UnknownError', message: String(err) },
          };
          console.error(errorLog);
        },
      }),
    );
  }
}

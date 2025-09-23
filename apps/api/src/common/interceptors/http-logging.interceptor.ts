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

// TODO:2 — Décorateur Injectable (pour que Nest puisse instancier la classe)
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  // TODO:3 — Signature de l'interceptor
  // - ctx: permet d'accéder au contexte d'exécution (HTTP ici)
  // - next: exécute le handler et renvoie un Observable (flux de réponse)
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // ===================== AVANT L'EXÉCUTION DU HANDLER =====================
    // TODO:4 — Récupérer le contexte HTTP, la requête et la réponse
    // Astuce: ctx.switchToHttp().getRequest() / getResponse()
    const http = ctx.switchToHttp();
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    // TODO:5 — Capturer les métadonnées utiles AVANT l'exécution
    // Timestamp en millisecondes (point de départ de la mesure de durée)
    const startedAt = Date.now();
    // Méthode HTTP utilisée pour la requête (ex: GET, POST, PUT, DELETE)
    const method = req.method;
    // permet d'identifier la route  appelée
    const url = req.url;
    const ip = req.socket?.remoteAddress;
    // Récupère le User-Agent envoyé par le client (navigateur, mobile, etc.)
    const userAgent = req.headers['user-agent'];
    // - correlationId (req.headers['x-correlation-id'])
    const correlationId = req.correlationId();
    // ====================== EXÉCUTION + LOGS EN SORTIE ======================

    // TODO:6 — Retourner le flux et brancher un tap({ next, error })
    // return next.handle().pipe(
    //   tap({
    //     next: () => {
    //       // TODO:7 — Calculer la durée + récupérer le status
    //       // const duration = Date.now() - startedAt
    //       // const status = res.statusCode

    //       // TODO:8 — Déterminer le niveau de log
    //       //   - 5xx → 'error'
    //       //   - 4xx → 'warn'
    //       //   - sinon: en dev 'debug', en prod 'info'
    //       // const isDev = process.env.NODE_ENV === 'development'
    //       // const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : (isDev ? 'debug' : 'info')

    //       // TODO:9 — Construire l'objet de log MINIMAL et SAFE (pas de PII)
    //       // const log = {
    //       //   msg: 'HTTP',
    //       //   method, url, status,
    //       //   duration_ms: duration,
    //       //   ip, userAgent, correlationId,
    //       // }

    //       // TODO:10 — Émettre le log avec console selon le niveau (temporaire)
    //       // if (level === 'error') console.error(log)
    //       // else if (level === 'warn') console.warn(log)
    //       // else console.log(log) // 'debug' en dev, 'info' en prod
    //     },
    //     error: (err) => {
    //       // TODO:11 — Log d'erreur structuré sans PII
    //       // - duration
    //       // - status (res.statusCode ?? 500)
    //       // - message + name (éviter stack en prod)
    //       // const duration = Date.now() - startedAt
    //       // const status = res.statusCode ?? 500
    //       // const errorLog = {
    //       //   msg: 'HTTP_ERROR',
    //       //   method, url, status,
    //       //   duration_ms: duration,
    //       //   correlationId,
    //       //   error: { name: err?.name, message: err? message },
    //       // }
    // console error(errorLog)
    //          ｝,
    //         })
    //        )
    // NOTE: laisse ce return temporaire pour que le compilateur soit content pe
    return next.handle();
  }
}

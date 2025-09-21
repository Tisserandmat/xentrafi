/**
 * CorrelationIdInterceptor
 * - Rôle : garantir qu'une requête HTTP a un identifiant unique (x-request-id)
 * - Si le client fournit déjà x-request-id => on le réutilise
 * - Sinon => on génère un UUID v4 via l'API Node `crypto.randomUUID()`
 * - L'ID est :
 *    1) attaché à req.correlationId (réutilisable dans autres interceptors/filters/services)
 *    2) renvoyé au client dans le header de réponse (x-request-id)
 * Pas de logs ici : cet interceptor ne fait QUE propager l'ID.
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import type { Request, Response } from 'express'; // ✅ types Express pour req/res

export const CORRELATION_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // On bascule sur le contexte HTTP et on récupère req/res typés
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { correlationId?: string }>();
    const res = http.getResponse<Response>();

    // On lit le header entrant (string | undefined)
    const incoming = req.headers[CORRELATION_ID_HEADER] as string | undefined;

    // Si le client a fourni un ID → on le garde, sinon on génère un UUID v4
    const correlationId = incoming ?? randomUUID();

    // On attache l'ID à la requête pour l'utiliser dans les logs/filters suivants
    req.correlationId = correlationId;

    // On reflète l'ID côté réponse (pas de réassignation de res)
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    // On laisse la requête poursuivre son cycle
    return next.handle();
  }
}

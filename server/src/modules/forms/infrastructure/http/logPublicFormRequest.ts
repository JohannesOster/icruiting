import {RequestHandler} from 'express';
import logger from 'shared/infrastructure/logger';

/**
 * One structured line per hit on the public form endpoints (JO-47).
 *
 * Heroku's router log already carries `host=` and `path=`, but it drops the
 * `Referer` - and that header is what tells us *which customer site* embeds
 * *which form*. `X-Forwarded-Proto` is here for the same reason: the router's
 * `protocol=` is the HTTP version, not the scheme, so it cannot answer whether
 * anyone still reaches the API over plain http (JO-51).
 */
export const logPublicFormRequest: RequestHandler = (req, res, next) => {
  try {
    logger.info(
      {
        event: 'public_form_request',
        method: req.method,
        host: req.headers.host ?? null,
        path: req.originalUrl,
        formId: req.params.formId,
        referer: req.headers.referer ?? null,
        forwardedProto: req.headers['x-forwarded-proto'] ?? null,
      },
      'public form request',
    );
  } catch {
    // Observability must never take the public form down.
  }

  next();
};

import {pino} from 'pino';
import https from 'https';
import http from 'http';
import config from 'config';

// 'debug' | 'info' | 'warn' | 'error' | 'critical'
const LEVEL = 'info';

export const pinoOptionsFor = (env: string) => {
  if (env === 'test') return {level: 'silent'};
  // pino-pretty turns one log line into several ANSI-coloured ones, which a log
  // drain then indexes as unrelated entries. Keep it for the dev terminal only;
  // production writes pino's default one-line JSON (JO-47).
  if (env === 'development') {
    return {
      level: LEVEL,
      transport: {target: 'pino-pretty', options: {colorize: true, sync: true}},
    };
  }
  return {level: LEVEL};
};

const Logger = () => {
  const ops = pinoOptionsFor(config.get('env'));
  const pino = require('pino');

  const _logger = pino(ops);

  // pino accepts either (message, ...interpolationArgs) or (mergingObject, message) -
  // the latter is what puts fields at the top level of the JSON line.
  type LogFn = (messageOrObject: string | object, ...args: unknown[]) => void;

  const debug: LogFn = (messageOrObject, ...args) => {
    _logger.debug(messageOrObject, ...args);
  };

  const info: LogFn = (messageOrObject, ...args) => {
    _logger.info(messageOrObject, ...args);
  };

  const warning: LogFn = (messageOrObject, ...args) => {
    _logger.warn(messageOrObject, ...args);
  };

  const error: LogFn = (messageOrObject, ...args) => {
    _logger.error(messageOrObject, ...args);
  };

  // Only publishes in production - dev/test have no NTFY_TOPIC configured.
  const ntfy = (
    message: string,
    options: {title?: string; priority?: string; tags?: string} = {},
  ) => {
    if (config.get('env') !== 'production') return;

    const topic = config.get('ntfy.topic');
    if (!topic) return;

    const baseUrl = config.get('ntfy.url') || 'https://ntfy.sh';
    const url = new URL(`${baseUrl}/${topic}`);
    const client = url.protocol === 'http:' ? http : https;

    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...(options.title ? {Title: options.title} : {}),
        ...(options.priority ? {Priority: options.priority} : {}),
        ...(options.tags ? {Tags: options.tags} : {}),
      },
    });

    req.write(message);
    req.on('error', error);
    req.end();
  };

  return {debug, info, warning, error, ntfy};
};

export default Logger();

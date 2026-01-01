import helmet from 'helmet';
import cors from 'cors';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';

export const helmetMw = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'"],
      "img-src": ["'self'", "data:", process.env.CSP_ALLOWED_ORIGIN || 'http://localhost:5173'],
      "media-src": ["'self'", process.env.CSP_ALLOWED_ORIGIN || 'http://localhost:5173'],
      "object-src": ["'none'"],
      "frame-ancestors": ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' }
});

export function corsMw() {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return cors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
  });
}

const loginLimiter = new RateLimiterMemory({ points: 5, duration: 60 });

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  loginLimiter.consume(req.ip).then(() => next()).catch(() => {
    res.status(429).json({ error: 'Too many requests' });
  });
}
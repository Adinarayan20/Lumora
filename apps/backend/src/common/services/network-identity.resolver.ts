import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class NetworkIdentityResolver {
  /**
   * Resolves client IP address across reverse proxies, Cloudflare, AWS ALB, and direct connections.
   * Priority:
   * 1. CF-Connecting-IP (Cloudflare)
   * 2. X-Real-IP (Nginx / Reverse Proxy)
   * 3. X-Forwarded-For (Load Balancers / Ingress)
   * 4. Socket Remote Address (Direct socket connection)
   */
  public extractClientIp(req: Request): string {
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp && typeof cfIp === 'string') {
      return cfIp.trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp && typeof realIp === 'string') {
      return realIp.trim();
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const rawIp = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor;
      const firstIp = rawIp.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    return req.socket?.remoteAddress || '127.0.0.1';
  }
}

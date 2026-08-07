import { describe, it, expect, beforeEach } from 'vitest';
import { Request } from 'express';
import { NetworkIdentityResolver } from '../../services/network-identity.resolver.js';

describe('NetworkIdentityResolver Unit Tests', () => {
  let resolver: NetworkIdentityResolver;

  beforeEach(() => {
    resolver = new NetworkIdentityResolver();
  });

  it('should extract client IP from CF-Connecting-IP header (Cloudflare priority)', () => {
    const req = {
      headers: {
        'cf-connecting-ip': '203.0.113.195',
        'x-real-ip': '198.51.100.1',
        'x-forwarded-for': '198.51.100.2',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;

    expect(resolver.extractClientIp(req)).toBe('203.0.113.195');
  });

  it('should extract client IP from X-Real-IP header (Nginx priority)', () => {
    const req = {
      headers: {
        'x-real-ip': '198.51.100.1',
        'x-forwarded-for': '198.51.100.2, 10.0.0.1',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;

    expect(resolver.extractClientIp(req)).toBe('198.51.100.1');
  });

  it('should extract first IP from X-Forwarded-For header chain', () => {
    const req = {
      headers: {
        'x-forwarded-for': '198.51.100.2, 10.0.0.1',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;

    expect(resolver.extractClientIp(req)).toBe('198.51.100.2');
  });

  it('should fallback to socket remoteAddress when proxy headers are absent', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '192.168.1.50' },
    } as unknown as Request;

    expect(resolver.extractClientIp(req)).toBe('192.168.1.50');
  });
});

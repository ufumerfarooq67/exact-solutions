// backend/src/common/cache/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from './redis-cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const role = request.user?.role;

    // Only cache GET requests for tasks
    if (request.method !== 'GET' || !request.url.includes('/tasks')) {
      return next.handle();
    }

    const cacheKey = this.redisService.generateCacheKey(userId, role);

    // Try Redis first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log("RETURN CACHE");
      return of(JSON.parse(cached));
    }

    // Cache miss → proceed with request
    return next.handle().pipe(
      tap(async (data) => {
        // Cache for 3-5 minutes depending on user type
        const ttl = role === 'admin' ? 180 : 300;
        await this.redisService.set(cacheKey, JSON.stringify(data), ttl);
      }),
    );
  }
}

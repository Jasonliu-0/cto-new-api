/**
 * 速率限制模块
 */

import { SystemSettingsDB } from "./db.ts";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * 检查是否超出速率限制
   */
  async check(key: string, limit: number): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const record = this.records.get(key);

    // 如果没有记录或已过期，创建新记录
    if (!record || now >= record.resetAt) {
      this.records.set(key, {
        count: 1,
        resetAt: now + 60000, // 1分钟后重置
      });
      return { allowed: true };
    }

    // 检查是否超出限制
    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // 增加计数
    record.count++;
    return { allowed: true };
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetAt) {
        this.records.delete(key);
      }
    }
  }
}

// 全局速率限制器实例
const systemLimiter = new RateLimiter();
const apiKeyLimiters = new Map<string, RateLimiter>();

// 定期清理过期记录
setInterval(() => {
  systemLimiter.cleanup();
  for (const limiter of apiKeyLimiters.values()) {
    limiter.cleanup();
  }
}, 60000); // 每分钟清理一次

/**
 * 检查系统级速率限制
 */
export async function checkSystemRateLimit(): Promise<{ allowed: boolean; retryAfter?: number }> {
  const settings = await SystemSettingsDB.get();
  return await systemLimiter.check("system", settings.systemRpm);
}

/**
 * 检查 API Key 级速率限制
 */
export async function checkApiKeyRateLimit(apiKey: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const settings = await SystemSettingsDB.get();
  
  if (!apiKeyLimiters.has(apiKey)) {
    apiKeyLimiters.set(apiKey, new RateLimiter());
  }
  
  const limiter = apiKeyLimiters.get(apiKey)!;
  return await limiter.check(apiKey, settings.perApiKeyRpm);
}

/**
 * 创建 OpenAI 格式的速率限制错误响应
 */
export function createRateLimitError(retryAfter: number) {
  return {
    error: {
      message: "Rate limit exceeded. Please try again later.",
      type: "rate_limit_exceeded",
      param: null,
      code: "rate_limit_exceeded",
    },
    headers: {
      "Retry-After": retryAfter.toString(),
      "X-RateLimit-Reset": Math.floor(Date.now() / 1000 + retryAfter).toString(),
    },
  };
}

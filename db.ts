/**
 * Deno KV 数据库操作模块
 */

import { Cookie, ApiKey, RequestLog, SystemSettings, ModelMapping } from "./types.ts";
import { Config } from "./config.ts";

const kv = await Deno.openKv();

/**
 * Cookie 操作
 */
export class CookieDB {
  private static PREFIX = ["cookies"];

  static async getAll(): Promise<Cookie[]> {
    const cookies: Cookie[] = [];
    const entries = kv.list<Cookie>({ prefix: this.PREFIX });
    
    for await (const entry of entries) {
      cookies.push(entry.value);
    }
    
    return cookies.sort((a, b) => a.createdAt - b.createdAt);
  }

  static async get(id: string): Promise<Cookie | null> {
    const result = await kv.get<Cookie>([...this.PREFIX, id]);
    return result.value;
  }

  static async add(cookie: Omit<Cookie, "id" | "createdAt" | "updatedAt">): Promise<Cookie> {
    const newCookie: Cookie = {
      ...cookie,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await kv.set([...this.PREFIX, newCookie.id], newCookie);
    return newCookie;
  }

  static async update(id: string, updates: Partial<Cookie>): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) return false;
    
    const updated: Cookie = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    
    await kv.set([...this.PREFIX, id], updated);
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing || existing.isDefault) return false;
    
    await kv.delete([...this.PREFIX, id]);
    return true;
  }

  static async getValidCookies(): Promise<Cookie[]> {
    const all = await this.getAll();
    return all.filter(c => c.isValid);
  }

  static async incrementFailCount(id: string): Promise<void> {
    const cookie = await this.get(id);
    if (!cookie) return;
    
    const newFailCount = cookie.failCount + 1;
    const isValid = newFailCount < Config.MAX_FAIL_NUM;
    
    await this.update(id, {
      failCount: newFailCount,
      isValid,
    });
  }

  static async resetFailCount(id: string): Promise<void> {
    await this.update(id, {
      failCount: 0,
      isValid: true,
    });
  }
}

/**
 * API Key 操作
 */
export class ApiKeyDB {
  private static PREFIX = ["apikeys"];

  static async getAll(): Promise<ApiKey[]> {
    const apiKeys: ApiKey[] = [];
    const entries = kv.list<ApiKey>({ prefix: this.PREFIX });
    
    for await (const entry of entries) {
      apiKeys.push(entry.value);
    }
    
    return apiKeys.sort((a, b) => a.createdAt - b.createdAt);
  }

  static async get(id: string): Promise<ApiKey | null> {
    const result = await kv.get<ApiKey>([...this.PREFIX, id]);
    return result.value;
  }

  static async getByKey(key: string): Promise<ApiKey | null> {
    const all = await this.getAll();
    return all.find(k => k.key === key) || null;
  }

  static async add(apiKey: Omit<ApiKey, "id" | "createdAt" | "requestCount">): Promise<ApiKey> {
    const newApiKey: ApiKey = {
      ...apiKey,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      requestCount: 0,
    };
    
    await kv.set([...this.PREFIX, newApiKey.id], newApiKey);
    return newApiKey;
  }

  static async update(id: string, updates: Partial<ApiKey>): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) return false;
    
    const updated: ApiKey = {
      ...existing,
      ...updates,
    };
    
    await kv.set([...this.PREFIX, id], updated);
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing || existing.isDefault) return false;
    
    await kv.delete([...this.PREFIX, id]);
    return true;
  }

  static async incrementRequestCount(key: string): Promise<void> {
    const apiKey = await this.getByKey(key);
    if (!apiKey) return;
    
    await this.update(apiKey.id, {
      requestCount: apiKey.requestCount + 1,
    });
  }

  static async getEnabledKeys(): Promise<ApiKey[]> {
    const all = await this.getAll();
    return all.filter(k => k.isEnabled);
  }
}

/**
 * 请求日志操作
 */
export class RequestLogDB {
  private static PREFIX = ["logs"];

  static async add(log: Omit<RequestLog, "id">): Promise<void> {
    const newLog: RequestLog = {
      ...log,
      id: crypto.randomUUID(),
    };
    
    await kv.set([...this.PREFIX, newLog.timestamp, newLog.id], newLog);
    
    // 清理旧日志
    await this.cleanup();
  }

  static async getRecent(limit: number = Config.MAX_REQUEST_RECORD_NUM): Promise<RequestLog[]> {
    const logs: RequestLog[] = [];
    const entries = kv.list<RequestLog>({ prefix: this.PREFIX }, { reverse: true, limit });
    
    for await (const entry of entries) {
      logs.push(entry.value);
    }
    
    return logs;
  }

  private static async cleanup(): Promise<void> {
    const all: RequestLog[] = [];
    const entries = kv.list<RequestLog>({ prefix: this.PREFIX }, { reverse: true });
    
    for await (const entry of entries) {
      all.push(entry.value);
    }
    
    if (all.length > Config.MAX_REQUEST_RECORD_NUM) {
      const toDelete = all.slice(Config.MAX_REQUEST_RECORD_NUM);
      for (const log of toDelete) {
        await kv.delete([...this.PREFIX, log.timestamp, log.id]);
      }
    }
  }

  static async count(): Promise<number> {
    let count = 0;
    const entries = kv.list({ prefix: this.PREFIX });
    
    for await (const _ of entries) {
      count++;
    }
    
    return count;
  }

  static async countByPath(path: string): Promise<number> {
    let count = 0;
    const entries = kv.list<RequestLog>({ prefix: this.PREFIX });
    
    for await (const entry of entries) {
      if (entry.value.path === path) {
        count++;
      }
    }
    
    return count;
  }
}

/**
 * 系统设置操作
 */
export class SystemSettingsDB {
  private static KEY = ["settings", "system"];

  static async get(): Promise<SystemSettings> {
    const result = await kv.get<SystemSettings>(this.KEY);
    return result.value || Config.getDefaultSystemSettings();
  }

  static async update(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.get();
    const updated = { ...current, ...settings };
    await kv.set(this.KEY, updated);
    return updated;
  }
}

/**
 * 模型映射操作
 */
export class ModelMappingDB {
  private static KEY = ["settings", "models"];

  static async get(): Promise<ModelMapping[]> {
    const result = await kv.get<ModelMapping[]>(this.KEY);
    return result.value || Config.DEFAULT_MODELS_MAPS;
  }

  static async update(mappings: ModelMapping[]): Promise<void> {
    await kv.set(this.KEY, mappings);
  }
}

/**
 * 初始化数据库
 */
export async function initializeDatabase(): Promise<void> {
  // 初始化默认 Cookies
  const existingCookies = await CookieDB.getAll();
  if (existingCookies.length === 0 && Config.DEFAULT_CTO_COOKIES.length > 0) {
    for (const cookieValue of Config.DEFAULT_CTO_COOKIES) {
      await CookieDB.add({
        value: cookieValue,
        isValid: true,
        failCount: 0,
        isDefault: true,
      });
    }
  }

  // 初始化默认 API Keys
  const existingKeys = await ApiKeyDB.getAll();
  if (existingKeys.length === 0) {
    for (const key of Config.DEFAULT_CHAT_APIKEYS) {
      await ApiKeyDB.add({
        key,
        isEnabled: true,
        isDefault: true,
      });
    }
  }

  console.log("✅ 数据库初始化完成");
}

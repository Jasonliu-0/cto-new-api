/**
 * 配置管理模块
 */

import { ModelMapping, SystemSettings } from "./types.ts";

export class Config {
  // 管理员凭证
  static ADMIN_USERNAME = Deno.env.get("ADMIN_USERNAME") || "admin";
  static ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "admin123";
  
  // JWT 配置
  static JWT_SECRET = Deno.env.get("JWT_SECRET") || crypto.randomUUID();
  static JWT_EXPIRY_DAYS = parseInt(Deno.env.get("JWT_EXPIRY_DAYS") || "30");
  
  // 默认 API Keys
  static DEFAULT_CHAT_APIKEYS = (Deno.env.get("DEFAULT_CHAT_APIKEYS") || "sk-default,sk-false")
    .split(",")
    .map(k => k.trim())
    .filter(k => k);
  
  // 默认 Cookies
  static DEFAULT_CTO_COOKIES = (() => {
    try {
      const envValue = Deno.env.get("DEFAULT_CTO_COOKIES");
      if (!envValue) return [];
      return JSON.parse(envValue);
    } catch {
      return [];
    }
  })();
  
  // 系统限制
  static MAX_REQUEST_RECORD_NUM = parseInt(
    Deno.env.get("MAX_REQUEST_RECORD_NUM") || "30"
  );
  static MAX_FAIL_NUM = parseInt(Deno.env.get("MAX_FAIL_NUM") || "3");
  
  // 速率限制
  static PER_APIKEY_RPM = parseInt(Deno.env.get("PER_APIKEY_RPM") || "30");
  static SYSTEM_RPM = parseInt(Deno.env.get("SYSTEM_RPM") || "100");
  
  // API 配置
  static API_BASE_URL = Deno.env.get("API_BASE_URL") || "https://api.enginelabs.ai";
  static CLERK_BASE = "https://clerk.cto.new";
  static ORIGIN = "https://cto.new";
  
  // 模型映射
  static DEFAULT_MODELS_MAPS: ModelMapping[] = (() => {
    try {
      const envValue = Deno.env.get("DEFAULT_MODELS_MAPS");
      if (!envValue) {
        return [
          { displayName: "claude-sonnet-4.5", internalName: "ClaudeSonnet4_5" },
          { displayName: "gpt-5", internalName: "GPT5" }
        ];
      }
      return JSON.parse(envValue);
    } catch {
      return [
        { displayName: "claude-sonnet-4.5", internalName: "ClaudeSonnet4_5" },
        { displayName: "gpt-5", internalName: "GPT5" }
      ];
    }
  })();

  // 获取默认系统设置
  static getDefaultSystemSettings(): SystemSettings {
    return {
      rotationStrategy: "sequential",
      apiBaseUrl: this.API_BASE_URL,
      maxFailNum: this.MAX_FAIL_NUM,
      maxRequestRecordNum: this.MAX_REQUEST_RECORD_NUM,
      perApiKeyRpm: this.PER_APIKEY_RPM,
      systemRpm: this.SYSTEM_RPM,
      jwtExpiryDays: this.JWT_EXPIRY_DAYS,
    };
  }
}

/**
 * JWT 认证模块
 */

import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { Config } from "./config.ts";

const encoder = new TextEncoder();
const keyData = encoder.encode(Config.JWT_SECRET);
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

export interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
}

/**
 * 生成 JWT Token
 */
export async function generateToken(username: string): Promise<string> {
  const payload: JWTPayload = {
    sub: username,
    exp: getNumericDate(Config.JWT_EXPIRY_DAYS * 24 * 60 * 60),
    iat: getNumericDate(0),
  };

  return await create({ alg: "HS256", typ: "JWT" }, payload, cryptoKey);
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, cryptoKey);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * 从请求头中提取 Token
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * 验证管理员登录
 */
export function validateAdminCredentials(username: string, password: string): boolean {
  return username === Config.ADMIN_USERNAME && password === Config.ADMIN_PASSWORD;
}

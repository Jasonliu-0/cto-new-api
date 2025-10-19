/**
 * Enginelabs API 转换器 - 主入口
 * 版本: 4.0.0
 * 功能: 提供完整的管理面板和API转发服务
 */

import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Config } from "./config.ts";
import { initializeDatabase } from "./db.ts";
import adminRouter from "./admin.ts";
import apiRouter from "./api.ts";

// 初始化数据库
await initializeDatabase();

// 创建应用
const app = new Application();

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("错误:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url.pathname} - ${ctx.response.status} - ${ms}ms`);
});

// CORS支持
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  
  await next();
});

// 注册路由
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// 启动服务器
const port = parseInt(Deno.env.get("PORT") || "8000");

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 Enginelabs API 转换器 v4.0.0                       ║
║                                                            ║
║     管理员用户名: ${Config.ADMIN_USERNAME}                ║
║     管理员密码: ${Config.ADMIN_PASSWORD}                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// 检测是否在 Deno Deploy 环境中
if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
  // Deno Deploy 环境 - 导出 fetch handler
  // @ts-ignore: Deno Deploy 会自动处理这个导出
  export default {
    fetch: app.fetch.bind(app)
  };
  console.log("🌐 Running on Deno Deploy");
} else {
  // 本地开发环境 - 使用传统的 listen
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`📊 管理面板: http://localhost:${port}/admin/dashboard`);
  await app.listen({ port });
}

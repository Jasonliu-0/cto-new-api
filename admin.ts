/**
 * 管理面板路由模块
 */

import { Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { generateToken, verifyToken, validateAdminCredentials, extractToken } from "./auth.ts";
import { 
  CookieDB, 
  ApiKeyDB, 
  RequestLogDB, 
  SystemSettingsDB, 
  ModelMappingDB 
} from "./db.ts";
import { getLoginPage } from "./views/login.html.ts";
import { getDashboardPage } from "./views/dashboard.html.ts";
import { testCookie } from "./enginelabs.ts";
import { SystemStats } from "./types.ts";

const adminRouter = new Router();

/**
 * 中间件：验证管理员Token
 */
async function adminAuthMiddleware(ctx: Context, next: () => Promise<unknown>) {
  const authHeader = ctx.request.headers.get("authorization");
  const token = extractToken(authHeader);

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "未授权访问" };
    return;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token无效或已过期" };
    return;
  }

  ctx.state.adminUser = payload.sub;
  await next();
}

/**
 * 登录页面
 */
adminRouter.get("/", (ctx) => {
  ctx.response.type = "text/html";
  ctx.response.body = getLoginPage();
});

/**
 * 登录接口
 */
adminRouter.post("/admin/login", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { username, password } = body;

    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "用户名和密码不能为空" };
      return;
    }

    if (!validateAdminCredentials(username, password)) {
      ctx.response.status = 401;
      ctx.response.body = { error: "用户名或密码错误" };
      return;
    }

    const token = await generateToken(username);
    ctx.response.body = { token, message: "登录成功" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "服务器错误" };
  }
});

/**
 * 控制面板页面
 */
adminRouter.get("/admin/dashboard", (ctx) => {
  ctx.response.type = "text/html";
  ctx.response.body = getDashboardPage();
});

/**
 * 获取系统统计信息
 */
adminRouter.get("/admin/api/stats", adminAuthMiddleware, async (ctx) => {
  try {
    const cookies = await CookieDB.getAll();
    const apiKeys = await ApiKeyDB.getAll();
    const totalRequests = await RequestLogDB.count();
    const modelsRequests = await RequestLogDB.countByPath("/v1/models");

    const stats: SystemStats = {
      totalCookies: cookies.length,
      validCookies: cookies.filter(c => c.isValid).length,
      invalidCookies: cookies.filter(c => !c.isValid).length,
      totalApiKeys: apiKeys.length,
      totalRequests,
      modelsRequests,
    };

    ctx.response.body = stats;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取统计信息失败" };
  }
});

/**
 * 获取请求日志
 */
adminRouter.get("/admin/api/logs", adminAuthMiddleware, async (ctx) => {
  try {
    const logs = await RequestLogDB.getRecent();
    ctx.response.body = logs;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取日志失败" };
  }
});

/**
 * 获取所有Cookies
 */
adminRouter.get("/admin/api/cookies", adminAuthMiddleware, async (ctx) => {
  try {
    const cookies = await CookieDB.getAll();
    ctx.response.body = cookies;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取Cookies失败" };
  }
});

/**
 * 添加Cookie
 */
adminRouter.post("/admin/api/cookies", adminAuthMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { value } = body;

    if (!value) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Cookie值不能为空" };
      return;
    }

    // 测试Cookie有效性
    console.log("正在测试Cookie有效性...");
    const isValid = await testCookie(value);

    if (!isValid) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Cookie无效，测试失败" };
      return;
    }

    const cookie = await CookieDB.add({
      value,
      isValid: true,
      failCount: 0,
      isDefault: false,
    });

    ctx.response.body = { success: true, cookie };
  } catch (error) {
    console.error("添加Cookie失败:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: `添加Cookie失败: ${error}` };
  }
});

/**
 * 测试Cookie
 */
adminRouter.post("/admin/api/cookies/:id/test", adminAuthMiddleware, async (ctx) => {
  try {
    const id = ctx.params.id;
    const cookie = await CookieDB.get(id);

    if (!cookie) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Cookie不存在" };
      return;
    }

    console.log(`测试Cookie: ${id}`);
    const isValid = await testCookie(cookie.value);

    if (isValid) {
      await CookieDB.resetFailCount(id);
    } else {
      await CookieDB.update(id, { isValid: false });
    }

    ctx.response.body = { valid: isValid };
  } catch (error) {
    console.error("测试Cookie失败:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "测试失败" };
  }
});

/**
 * 删除Cookie
 */
adminRouter.delete("/admin/api/cookies/:id", adminAuthMiddleware, async (ctx) => {
  try {
    const id = ctx.params.id;
    const success = await CookieDB.delete(id);

    if (!success) {
      ctx.response.status = 400;
      ctx.response.body = { error: "无法删除默认Cookie或Cookie不存在" };
      return;
    }

    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "删除失败" };
  }
});

/**
 * 获取所有API密钥
 */
adminRouter.get("/admin/api/apikeys", adminAuthMiddleware, async (ctx) => {
  try {
    const apiKeys = await ApiKeyDB.getAll();
    ctx.response.body = apiKeys;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取API密钥失败" };
  }
});

/**
 * 添加API密钥
 */
adminRouter.post("/admin/api/apikeys", adminAuthMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { key } = body;

    if (!key) {
      ctx.response.status = 400;
      ctx.response.body = { error: "API密钥不能为空" };
      return;
    }

    // 检查是否已存在
    const existing = await ApiKeyDB.getByKey(key);
    if (existing) {
      ctx.response.status = 400;
      ctx.response.body = { error: "该API密钥已存在" };
      return;
    }

    const apiKey = await ApiKeyDB.add({
      key,
      isEnabled: true,
      isDefault: false,
    });

    ctx.response.body = { success: true, apiKey };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "添加API密钥失败" };
  }
});

/**
 * 更新API密钥
 */
adminRouter.patch("/admin/api/apikeys/:id", adminAuthMiddleware, async (ctx) => {
  try {
    const id = ctx.params.id;
    const body = await ctx.request.body({ type: "json" }).value;

    const success = await ApiKeyDB.update(id, body);

    if (!success) {
      ctx.response.status = 404;
      ctx.response.body = { error: "API密钥不存在" };
      return;
    }

    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "更新失败" };
  }
});

/**
 * 删除API密钥
 */
adminRouter.delete("/admin/api/apikeys/:id", adminAuthMiddleware, async (ctx) => {
  try {
    const id = ctx.params.id;
    const success = await ApiKeyDB.delete(id);

    if (!success) {
      ctx.response.status = 400;
      ctx.response.body = { error: "无法删除默认API密钥或密钥不存在" };
      return;
    }

    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "删除失败" };
  }
});

/**
 * 获取系统设置
 */
adminRouter.get("/admin/api/settings", adminAuthMiddleware, async (ctx) => {
  try {
    const settings = await SystemSettingsDB.get();
    ctx.response.body = settings;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取设置失败" };
  }
});

/**
 * 更新系统设置
 */
adminRouter.put("/admin/api/settings", adminAuthMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const settings = await SystemSettingsDB.update(body);
    ctx.response.body = { success: true, settings };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "更新设置失败" };
  }
});

/**
 * 获取模型映射
 */
adminRouter.get("/admin/api/models", adminAuthMiddleware, async (ctx) => {
  try {
    const models = await ModelMappingDB.get();
    ctx.response.body = models;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取模型映射失败" };
  }
});

/**
 * 更新模型映射
 */
adminRouter.put("/admin/api/models", adminAuthMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    await ModelMappingDB.update(body);
    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "更新模型映射失败" };
  }
});

export default adminRouter;

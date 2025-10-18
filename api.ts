/**
 * API路由模块
 */

import { Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { decode as jwtDecode } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { ChatRequest, ChatMessage } from "./types.ts";
import { 
  ApiKeyDB, 
  CookieDB, 
  RequestLogDB, 
  SystemSettingsDB, 
  ModelMappingDB 
} from "./db.ts";
import { 
  getJwtFromCookie, 
  streamChatGenerator, 
  nonStreamChat, 
  createCompletionResponse 
} from "./enginelabs.ts";
import { 
  checkSystemRateLimit, 
  checkApiKeyRateLimit, 
  createRateLimitError 
} from "./ratelimit.ts";

const apiRouter = new Router();

/**
 * 中间件：API Key验证
 */
async function apiKeyAuthMiddleware(ctx: Context, next: () => Promise<unknown>) {
  const authHeader = ctx.request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "需要 Bearer token (API Key)" };
    return;
  }

  const apiKey = authHeader.slice(7);
  
  // 验证API Key
  const keyRecord = await ApiKeyDB.getByKey(apiKey);
  if (!keyRecord) {
    ctx.response.status = 401;
    ctx.response.body = { error: "无效的API Key" };
    return;
  }

  if (!keyRecord.isEnabled) {
    ctx.response.status = 403;
    ctx.response.body = { error: "API Key已被禁用" };
    return;
  }

  // 检查速率限制
  const systemLimit = await checkSystemRateLimit();
  if (!systemLimit.allowed) {
    const error = createRateLimitError(systemLimit.retryAfter!);
    ctx.response.status = 429;
    ctx.response.headers.set("Retry-After", error.headers["Retry-After"]);
    ctx.response.headers.set("X-RateLimit-Reset", error.headers["X-RateLimit-Reset"]);
    ctx.response.body = error.error;
    return;
  }

  const apiKeyLimit = await checkApiKeyRateLimit(apiKey);
  if (!apiKeyLimit.allowed) {
    const error = createRateLimitError(apiKeyLimit.retryAfter!);
    ctx.response.status = 429;
    ctx.response.headers.set("Retry-After", error.headers["Retry-After"]);
    ctx.response.headers.set("X-RateLimit-Reset", error.headers["X-RateLimit-Reset"]);
    ctx.response.body = error.error;
    return;
  }

  // 增加请求计数
  await ApiKeyDB.incrementRequestCount(apiKey);

  ctx.state.apiKey = apiKey;
  await next();
}

/**
 * 中间件：请求日志记录
 */
async function requestLogMiddleware(ctx: Context, next: () => Promise<unknown>) {
  const startTime = Date.now();
  
  await next();
  
  // 记录请求日志
  try {
    const ip = ctx.request.ip;
    const path = ctx.request.url.pathname;
    const method = ctx.request.method;
    const statusCode = ctx.response.status || 200;
    
    await RequestLogDB.add({
      timestamp: startTime,
      ip,
      path,
      method,
      statusCode,
      apiKey: ctx.state.apiKey,
      model: ctx.state.model,
    });
  } catch (error) {
    console.error("记录请求日志失败:", error);
  }
}

/**
 * 选择Cookie (根据轮询策略)
 */
async function selectCookie(): Promise<string | null> {
  const settings = await SystemSettingsDB.get();
  const validCookies = await CookieDB.getValidCookies();

  if (validCookies.length === 0) {
    return null;
  }

  if (settings.rotationStrategy === "random") {
    // 随机选择
    const index = Math.floor(Math.random() * validCookies.length);
    return validCookies[index].value;
  } else {
    // 顺序选择 (使用第一个有效的)
    return validCookies[0].value;
  }
}

/**
 * 处理Cookie失败
 */
async function handleCookieFailure(cookieValue: string) {
  const cookies = await CookieDB.getAll();
  const cookie = cookies.find(c => c.value === cookieValue);
  
  if (cookie) {
    await CookieDB.incrementFailCount(cookie.id);
    console.log(`Cookie ${cookie.id} 失败次数: ${cookie.failCount + 1}`);
  }
}

/**
 * 列出模型
 */
apiRouter.get("/v1/models", apiKeyAuthMiddleware, requestLogMiddleware, async (ctx) => {
  try {
    const modelMappings = await ModelMappingDB.get();
    
    const models = modelMappings.map(mapping => ({
      id: mapping.displayName,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: "enginelabs",
    }));

    ctx.response.body = { object: "list", data: models };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "获取模型列表失败" };
  }
});

/**
 * 聊天完成
 */
apiRouter.post("/v1/chat/completions", apiKeyAuthMiddleware, requestLogMiddleware, async (ctx) => {
  try {
    // 解析请求
    let requestData: ChatRequest;
    try {
      requestData = await ctx.request.body({ type: "json" }).value;
    } catch (e) {
      ctx.response.status = 400;
      ctx.response.body = { error: `无效的 JSON: ${e}` };
      return;
    }

    const requestedModel = requestData.model || "claude-sonnet-4.5";
    const messages = requestData.messages || [];
    const stream = requestData.stream || false;

    if (!messages || messages.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "messages 不能为空" };
      return;
    }

    // 查找模型映射
    const modelMappings = await ModelMappingDB.get();
    const modelMapping = modelMappings.find(m => m.displayName === requestedModel);
    
    if (!modelMapping) {
      ctx.response.status = 400;
      ctx.response.body = { error: `不支持的模型: ${requestedModel}` };
      return;
    }

    const internalModel = modelMapping.internalName;
    ctx.state.model = requestedModel;

    // 将多轮对话转换为单轮对话
    const conversationParts: string[] = [];
    for (const msg of messages) {
      const role = msg.role || "unknown";
      const content = msg.content || "";
      
      if (content) {
        let textContent = "";
        
        if (Array.isArray(content)) {
          textContent = content
            .filter(item => item.type === "text")
            .map(item => item.text)
            .join("");
        } else {
          textContent = content;
        }
        
        if (textContent) {
          conversationParts.push(`${role}:\n${textContent}\n\n`);
        }
      }
    }

    const fullPrompt = conversationParts.join("\n\n");
    console.log(`转换后的单轮 prompt 长度: ${fullPrompt.length}`);

    if (!fullPrompt.trim()) {
      ctx.response.status = 400;
      ctx.response.body = { error: "整合后的消息内容为空" };
      return;
    }

    // 选择Cookie
    const cookieValue = await selectCookie();
    if (!cookieValue) {
      ctx.response.status = 503;
      ctx.response.body = { error: "没有可用的Cookie" };
      return;
    }

    // 获取JWT token
    let jwtToken: string;
    try {
      jwtToken = await getJwtFromCookie(cookieValue);
    } catch (e) {
      console.error("获取JWT失败:", e);
      await handleCookieFailure(cookieValue);
      ctx.response.status = 500;
      ctx.response.body = { error: `认证失败: ${e}` };
      return;
    }

    // 解析JWT获取user_id
    let userId: string;
    try {
      const [, payload] = jwtDecode(jwtToken);
      if (!payload || typeof payload !== "object" || !("sub" in payload)) {
        throw new Error("JWT 中没有 sub 字段");
      }
      userId = payload.sub as string;
    } catch (e) {
      console.error("解析JWT失败:", e);
      await handleCookieFailure(cookieValue);
      ctx.response.status = 500;
      ctx.response.body = { error: `无效的 JWT: ${e}` };
      return;
    }

    // 生成新的聊天历史ID
    const chatHistoryId = crypto.randomUUID();
    console.log(`生成新的聊天历史 ID: ${chatHistoryId}`);

    const requestId = `chatcmpl-${crypto.randomUUID()}`;

    if (stream) {
      // 流式响应
      ctx.response.headers.set("Content-Type", "text/event-stream; charset=utf-8");
      ctx.response.headers.set("Cache-Control", "no-cache");
      ctx.response.headers.set("Connection", "keep-alive");
      ctx.response.headers.set("X-Accel-Buffering", "no");

      try {
        const body = streamChatGenerator(
          requestId,
          requestedModel,
          chatHistoryId,
          userId,
          jwtToken,
          fullPrompt,
        );

        ctx.response.body = body;
      } catch (e) {
        console.error("流式处理失败:", e);
        await handleCookieFailure(cookieValue);
        throw e;
      }
    } else {
      // 非流式响应
      try {
        const fullContent = await nonStreamChat(
          requestId,
          requestedModel,
          chatHistoryId,
          userId,
          jwtToken,
          fullPrompt,
        );
        ctx.response.body = createCompletionResponse(
          requestId,
          requestedModel,
          fullContent,
        );
      } catch (e) {
        console.error("非流式处理失败:", e);
        await handleCookieFailure(cookieValue);
        ctx.response.status = 500;
        ctx.response.body = { error: `处理请求失败: ${e}` };
      }
    }
  } catch (error) {
    console.error("聊天请求处理错误:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

/**
 * 健康检查
 */
apiRouter.get("/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    service: "enginelabs-2api-v4",
    version: "4.0.0",
    timestamp: new Date().toISOString(),
  };
});

export default apiRouter;

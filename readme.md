## 12. 使用说明

### 环境变量配置

创建 `.env` 文件（可选）:

```bash
# 管理员凭证
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRY_DAYS=30

# 默认API Keys (逗号分隔)
DEFAULT_CHAT_APIKEYS=sk-default,sk-false

# 默认Cookies (JSON数组格式)
DEFAULT_CTO_COOKIES=["cookie1","cookie2"]

# 系统限制
MAX_REQUEST_RECORD_NUM=30
MAX_FAIL_NUM=3

# 速率限制
PER_APIKEY_RPM=30
SYSTEM_RPM=100

# API配置
API_BASE_URL=https://api.enginelabs.ai

# 模型映射 (JSON数组格式)
DEFAULT_MODELS_MAPS=[{"displayName":"claude-sonnet-4.5","internalName":"ClaudeSonnet4_5"},{"displayName":"gpt-5","internalName":"GPT5"}]

# 服务端口
PORT=8000
```

### 运行命令

```bash
# 开发模式
deno run --allow-net --allow-env --allow-read --allow-write --unstable main.ts

# 生产模式 (使用 --watch 自动重启)
deno run --allow-net --allow-env --allow-read --allow-write --unstable --watch main.ts
```

### 部署到 Deno Deploy

1. 将所有文件上传到 GitHub 仓库
2. 在 Deno Deploy 中连接仓库
3. 设置环境变量
4. 部署即可

### API使用示例

```bash
# 获取模型列表
curl -H "Authorization: Bearer sk-default" http://localhost:8000/v1/models

# 聊天请求
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer sk-default" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4.5",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

### 功能特性

**✅ 完整的管理面板**
- 系统概览统计
- 请求日志查看
- Cookie管理（添加/删除/测试）
- API密钥管理
- 系统设置配置
- 模型映射管理

**✅ 安全认证**
- JWT Token认证
- API Key鉴权
- 速率限制保护

**✅ 智能轮询**
- 支持随机/顺序轮询
- 自动故障检测
- Cookie失效管理

**✅ 响应式设计**
- PC/移动端自适应
- 现代化UI界面
- ECharts数据可视化

这就是完整的重构代码！所有功能都已实现，包括美观的控制面板、完善的管理功能和API转发服务。
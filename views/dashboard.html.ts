/**
 * 控制面板页面
 */

export function getDashboardPage(): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>控制面板 - Enginelabs API</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/layui@2.8.0/dist/css/layui.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --sidebar-width: 250px;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
        }
        
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: var(--sidebar-width);
            background: linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            overflow-y: auto;
            transition: transform 0.3s;
            z-index: 1000;
        }
        
        .sidebar-header {
            padding: 25px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar-header h4 {
            margin: 10px 0 5px 0;
            font-weight: 700;
        }
        
        .sidebar-header small {
            opacity: 0.8;
        }
        
        .sidebar-menu {
            padding: 20px 0;
        }
        
        .sidebar-menu-item {
            padding: 15px 25px;
            cursor: pointer;
            transition: all 0.3s;
            border-left: 4px solid transparent;
            display: flex;
            align-items: center;
        }
        
        .sidebar-menu-item:hover {
            background: rgba(255,255,255,0.1);
            border-left-color: white;
        }
        
        .sidebar-menu-item.active {
            background: rgba(255,255,255,0.2);
            border-left-color: white;
        }
        
        .sidebar-menu-item i {
            margin-right: 12px;
            font-size: 18px;
        }
        
        .main-content {
            margin-left: var(--sidebar-width);
            padding: 20px;
            min-height: 100vh;
        }
        
        .top-bar {
            background: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .content-section {
            display: none;
        }
        
        .content-section.active {
            display: block;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
            margin-bottom: 20px;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 25px rgba(0,0,0,0.12);
        }
        
        .stat-card-icon {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 15px;
        }
        
        .stat-card-title {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .stat-card-value {
            font-size: 32px;
            font-weight: 700;
            color: #333;
        }
        
        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        
        .table-container {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            overflow-x: auto;
        }
        
        .btn-gradient {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            border: none;
            color: white;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        .badge-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .mobile-toggle {
            display: none;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            border: none;
            font-size: 24px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 999;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .sidebar.show {
                transform: translateX(0);
            }
            
            .main-content {
                margin-left: 0;
            }
            
            .mobile-toggle {
                display: block;
            }
            
            .stat-card-value {
                font-size: 24px;
            }
        }
        
        .form-section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
        }
        
        .section-title i {
            margin-right: 10px;
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <!-- 侧边栏 -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <i class="bi bi-gear-fill" style="font-size: 48px;"></i>
            <h4>控制面板</h4>
            <small>Enginelabs API</small>
        </div>
        <div class="sidebar-menu">
            <div class="sidebar-menu-item active" data-section="overview">
                <i class="bi bi-speedometer2"></i>
                <span>系统概览</span>
            </div>
            <div class="sidebar-menu-item" data-section="logs">
                <i class="bi bi-file-text"></i>
                <span>请求日志</span>
            </div>
            <div class="sidebar-menu-item" data-section="cookies">
                <i class="bi bi-cookie"></i>
                <span>账户管理</span>
            </div>
            <div class="sidebar-menu-item" data-section="apikeys">
                <i class="bi bi-key"></i>
                <span>API密钥</span>
            </div>
            <div class="sidebar-menu-item" data-section="settings">
                <i class="bi bi-sliders"></i>
                <span>系统设置</span>
            </div>
        </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
        <!-- 顶部栏 -->
        <div class="top-bar">
            <div>
                <h5 class="mb-0">欢迎回来，管理员</h5>
                <small class="text-muted">上次登录: <span id="lastLogin"></span></small>
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="logout()">
                <i class="bi bi-box-arrow-right"></i> 退出登录
            </button>
        </div>

        <!-- 系统概览 -->
        <div class="content-section active" id="overview">
            <div class="row">
                <div class="col-md-3 col-sm-6">
                    <div class="stat-card">
                        <div class="stat-card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <i class="bi bi-cookie"></i>
                        </div>
                        <div class="stat-card-title">Cookie总数</div>
                        <div class="stat-card-value" id="totalCookies">0</div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="stat-card">
                        <div class="stat-card-icon" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="stat-card-title">有效Cookie</div>
                        <div class="stat-card-value" id="validCookies">0</div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="stat-card">
                        <div class="stat-card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                            <i class="bi bi-x-circle"></i>
                        </div>
                        <div class="stat-card-title">无效Cookie</div>
                        <div class="stat-card-value" id="invalidCookies">0</div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="stat-card">
                        <div class="stat-card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                            <i class="bi bi-key"></i>
                        </div>
                        <div class="stat-card-title">API密钥数</div>
                        <div class="stat-card-value" id="totalApiKeys">0</div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5 class="mb-3">请求统计</h5>
                        <div id="requestChart" style="height: 300px;"></div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5 class="mb-3">Cookie状态分布</h5>
                        <div id="cookieChart" style="height: 300px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 请求日志 -->
        <div class="content-section" id="logs">
            <div class="table-container">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="bi bi-file-text text-primary"></i> 请求日志</h5>
                    <button class="btn btn-gradient btn-sm" onclick="refreshLogs()">
                        <i class="bi bi-arrow-clockwise"></i> 刷新
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>IP地址</th>
                                <th>请求路径</th>
                                <th>方法</th>
                                <th>状态码</th>
                                <th>模型</th>
                            </tr>
                        </thead>
                        <tbody id="logsTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 账户管理 -->
        <div class="content-section" id="cookies">
            <div class="form-section">
                <div class="section-title">
                    <i class="bi bi-plus-circle"></i>
                    添加新Cookie
                </div>
                <form id="addCookieForm">
                    <div class="mb-3">
                        <label class="form-label">Cookie值</label>
                        <textarea class="form-control" id="cookieValue" rows="3" required placeholder="粘贴完整的Cookie字符串"></textarea>
                    </div>
                    <button type="submit" class="btn btn-gradient">
                        <i class="bi bi-check-lg"></i> 添加并测试
                    </button>
                </form>
            </div>

            <div class="table-container">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="bi bi-cookie text-primary"></i> Cookie列表</h5>
                    <button class="btn btn-gradient btn-sm" onclick="refreshCookies()">
                        <i class="bi bi-arrow-clockwise"></i> 刷新
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cookie预览</th>
                                <th>状态</th>
                                <th>失败次数</th>
                                <th>类型</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="cookiesTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- API密钥 -->
        <div class="content-section" id="apikeys">
            <div class="form-section">
                <div class="section-title">
                    <i class="bi bi-plus-circle"></i>
                    添加新API密钥
                </div>
                <form id="addApiKeyForm">
                    <div class="mb-3">
                        <label class="form-label">API Key</label>
                        <input type="text" class="form-control" id="apiKeyValue" required placeholder="sk-...">
                    </div>
                    <button type="submit" class="btn btn-gradient">
                        <i class="bi bi-check-lg"></i> 添加密钥
                    </button>
                </form>
            </div>

            <div class="table-container">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="bi bi-key text-primary"></i> API密钥列表</h5>
                    <button class="btn btn-gradient btn-sm" onclick="refreshApiKeys()">
                        <i class="bi bi-arrow-clockwise"></i> 刷新
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>密钥</th>
                                <th>状态</th>
                                <th>请求次数</th>
                                <th>类型</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="apiKeysTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 系统设置 -->
        <div class="content-section" id="settings">
            <div class="form-section">
                <div class="section-title">
                    <i class="bi bi-sliders"></i>
                    系统设置
                </div>
                <form id="settingsForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">轮询策略</label>
                            <select class="form-select" id="rotationStrategy">
                                <option value="sequential">顺序轮询</option>
                                <option value="random">随机轮询</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">API基础URL</label>
                            <input type="text" class="form-control" id="apiBaseUrl">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">最大失败次数</label>
                            <input type="number" class="form-control" id="maxFailNum" min="1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">最大日志记录数</label>
                            <input type="number" class="form-control" id="maxRequestRecordNum" min="10">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">单密钥速率限制 (RPM)</label>
                            <input type="number" class="form-control" id="perApiKeyRpm" min="1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">系统速率限制 (RPM)</label>
                            <input type="number" class="form-control" id="systemRpm" min="1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">JWT过期天数</label>
                            <input type="number" class="form-control" id="jwtExpiryDays" min="1">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-gradient">
                        <i class="bi bi-save"></i> 保存设置
                    </button>
                </form>
            </div>

            <div class="form-section mt-4">
                <div class="section-title">
                    <i class="bi bi-diagram-3"></i>
                    模型映射
                </div>
                <div id="modelMappings"></div>
                <button class="btn btn-outline-primary btn-sm mt-3" onclick="addModelMapping()">
                    <i class="bi bi-plus-lg"></i> 添加映射
                </button>
                <button class="btn btn-gradient btn-sm mt-3 ms-2" onclick="saveModelMappings()">
                    <i class="bi bi-save"></i> 保存映射
                </button>
            </div>
        </div>
    </div>

    <!-- 移动端菜单按钮 -->
    <button class="mobile-toggle" onclick="toggleSidebar()">
        <i class="bi bi-list"></i>
    </button>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/layui@2.8.0/dist/layui.js"></script>
    <script>
        // 全局变量
        let token = localStorage.getItem('admin_token');
        let requestChart, cookieChart;

        // 页面加载
        document.addEventListener('DOMContentLoaded', function() {
            if (!token) {
                window.location.href = '/';
                return;
            }

            initCharts();
            loadOverview();
            setupEventListeners();
            
            document.getElementById('lastLogin').textContent = new Date().toLocaleString('zh-CN');
        });

        // 初始化图表
        function initCharts() {
            requestChart = echarts.init(document.getElementById('requestChart'));
            cookieChart = echarts.init(document.getElementById('cookieChart'));
        }

        // 设置事件监听
        function setupEventListeners() {
            // 侧边栏菜单切换
            document.querySelectorAll('.sidebar-menu-item').forEach(item => {
                item.addEventListener('click', function() {
                    document.querySelectorAll('.sidebar-menu-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    const section = this.dataset.section;
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    document.getElementById(section).classList.add('active');
                    
                    // 加载对应数据
                    switch(section) {
                        case 'overview':
                            loadOverview();
                            break;
                        case 'logs':
                            loadLogs();
                            break;
                        case 'cookies':
                            loadCookies();
                            break;
                        case 'apikeys':
                            loadApiKeys();
                            break;
                        case 'settings':
                            loadSettings();
                            break;
                    }
                    
                    // 移动端关闭侧边栏
                    if (window.innerWidth <= 768) {
                        document.getElementById('sidebar').classList.remove('show');
                    }
                });
            });

            // 表单提交
            document.getElementById('addCookieForm').addEventListener('submit', addCookie);
            document.getElementById('addApiKeyForm').addEventListener('submit', addApiKey);
            document.getElementById('settingsForm').addEventListener('submit', saveSettings);
        }

        // API请求封装
        async function apiRequest(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                }
            };
            
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (response.status === 401) {
                localStorage.removeItem('admin_token');
                window.location.href = '/';
                return;
            }
            
            return response;
        }

        // 加载系统概览
        async function loadOverview() {
            try {
                const response = await apiRequest('/admin/api/stats');
                const stats = await response.json();
                
                document.getElementById('totalCookies').textContent = stats.totalCookies;
                document.getElementById('validCookies').textContent = stats.validCookies;
                document.getElementById('invalidCookies').textContent = stats.invalidCookies;
                document.getElementById('totalApiKeys').textContent = stats.totalApiKeys;
                
                // 更新请求统计图表
                requestChart.setOption({
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['聊天请求', '模型列表'] },
                    xAxis: { type: 'category', data: ['今日'] },
                    yAxis: { type: 'value' },
                    series: [
                        { name: '聊天请求', type: 'bar', data: [stats.totalRequests - stats.modelsRequests], itemStyle: { color: '#667eea' } },
                        { name: '模型列表', type: 'bar', data: [stats.modelsRequests], itemStyle: { color: '#764ba2' } }
                    ]
                });
                
                // 更新Cookie状态图表
                cookieChart.setOption({
                    tooltip: { trigger: 'item' },
                    legend: { orient: 'vertical', left: 'left' },
                    series: [{
                        type: 'pie',
                        radius: '50%',
                        data: [
                            { value: stats.validCookies, name: '有效', itemStyle: { color: '#38ef7d' } },
                            { value: stats.invalidCookies, name: '无效', itemStyle: { color: '#f5576c' } }
                        ]
                    }]
                });
            } catch (error) {
                console.error('加载概览失败:', error);
            }
        }

        // 加载日志
        async function loadLogs() {
            try {
                const response = await apiRequest('/admin/api/logs');
                const logs = await response.json();
                
                const tbody = document.getElementById('logsTableBody');
                tbody.innerHTML = logs.map(log => \`
                    <tr>
                        <td>\${new Date(log.timestamp).toLocaleString('zh-CN')}</td>
                        <td>\${log.ip}</td>
                        <td><code>\${log.path}</code></td>
                        <td><span class="badge bg-primary">\${log.method}</span></td>
                        <td><span class="badge \${log.statusCode < 400 ? 'bg-success' : 'bg-danger'}">\${log.statusCode}</span></td>
                        <td>\${log.model || '-'}</td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('加载日志失败:', error);
            }
        }

        // 加载Cookies
        async function loadCookies() {
            try {
                const response = await apiRequest('/admin/api/cookies');
                const cookies = await response.json();
                
                const tbody = document.getElementById('cookiesTableBody');
                tbody.innerHTML = cookies.map(cookie => \`
                    <tr>
                        <td><code>\${cookie.id.slice(0, 8)}...</code></td>
                        <td><code>\${cookie.value.slice(0, 30)}...</code></td>
                        <td>
                            <span class="badge-status \${cookie.isValid ? 'bg-success' : 'bg-danger'}">
                                \${cookie.isValid ? '有效' : '无效'}
                            </span>
                        </td>
                        <td>\${cookie.failCount}</td>
                        <td><span class="badge \${cookie.isDefault ? 'bg-info' : 'bg-secondary'}">\${cookie.isDefault ? '默认' : '自定义'}</span></td>
                        <td>\${new Date(cookie.createdAt).toLocaleString('zh-CN')}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="testCookie('\${cookie.id}')">
                                <i class="bi bi-lightning"></i> 测试
                            </button>
                            \${!cookie.isDefault ? \`
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteCookie('\${cookie.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            \` : ''}
                        </td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('加载Cookies失败:', error);
            }
        }

        // 添加Cookie
        async function addCookie(e) {
            e.preventDefault();
            
            const value = document.getElementById('cookieValue').value;
            
            try {
                const response = await apiRequest('/admin/api/cookies', {
                    method: 'POST',
                    body: JSON.stringify({ value })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    layui.use('layer', function() {
                        layer.msg('Cookie添加成功！', { icon: 1 });
                    });
                    document.getElementById('addCookieForm').reset();
                    loadCookies();
                } else {
                    layui.use('layer', function() {
                        layer.msg(result.error || 'Cookie添加失败', { icon: 2 });
                    });
                }
            } catch (error) {
                layui.use('layer', function() {
                    layer.msg('网络错误', { icon: 2 });
                });
            }
        }

        // 测试Cookie
        async function testCookie(id) {
            layui.use('layer', function() {
                layer.load(1);
            });
            
            try {
                const response = await apiRequest(\`/admin/api/cookies/\${id}/test\`, {
                    method: 'POST'
                });
                
                const result = await response.json();
                
                layui.use('layer', function() {
                    layer.closeAll('loading');
                    layer.msg(result.valid ? 'Cookie有效！' : 'Cookie无效', { 
                        icon: result.valid ? 1 : 2 
                    });
                });
                
                loadCookies();
            } catch (error) {
                layui.use('layer', function() {
                    layer.closeAll('loading');
                    layer.msg('测试失败', { icon: 2 });
                });
            }
        }

        // 删除Cookie
        async function deleteCookie(id) {
            layui.use('layer', function() {
                layer.confirm('确定删除此Cookie吗？', {
                    btn: ['确定', '取消']
                }, async function(index) {
                    try {
                        await apiRequest(\`/admin/api/cookies/\${id}\`, {
                            method: 'DELETE'
                        });
                        
                        layer.close(index);
                        layer.msg('删除成功', { icon: 1 });
                        loadCookies();
                    } catch (error) {
                        layer.msg('删除失败', { icon: 2 });
                    }
                });
            });
        }

        // 加载API密钥
        async function loadApiKeys() {
            try {
                const response = await apiRequest('/admin/api/apikeys');
                const apiKeys = await response.json();
                
                const tbody = document.getElementById('apiKeysTableBody');
                tbody.innerHTML = apiKeys.map(key => \`
                    <tr>
                        <td><code>\${key.key}</code></td>
                        <td>
                            <span class="badge-status \${key.isEnabled ? 'bg-success' : 'bg-secondary'}">
                                \${key.isEnabled ? '启用' : '禁用'}
                            </span>
                        </td>
                        <td>\${key.requestCount}</td>
                        <td><span class="badge \${key.isDefault ? 'bg-info' : 'bg-secondary'}">\${key.isDefault ? '默认' : '自定义'}</span></td>
                        <td>\${new Date(key.createdAt).toLocaleString('zh-CN')}</td>
                        <td>
                            <button class="btn btn-sm \${key.isEnabled ? 'btn-outline-warning' : 'btn-outline-success'}" 
                                    onclick="toggleApiKey('\${key.id}', \${!key.isEnabled})">
                                <i class="bi bi-\${key.isEnabled ? 'pause' : 'play'}"></i> \${key.isEnabled ? '禁用' : '启用'}
                            </button>
                            \${!key.isDefault ? \`
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteApiKey('\${key.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            \` : ''}
                        </td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('加载API密钥失败:', error);
            }
        }

        // 添加API密钥
        async function addApiKey(e) {
            e.preventDefault();
            
            const key = document.getElementById('apiKeyValue').value;
            
            try {
                const response = await apiRequest('/admin/api/apikeys', {
                    method: 'POST',
                    body: JSON.stringify({ key })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    layui.use('layer', function() {
                        layer.msg('API密钥添加成功！', { icon: 1 });
                    });
                    document.getElementById('addApiKeyForm').reset();
                    loadApiKeys();
                } else {
                    layui.use('layer', function() {
                        layer.msg(result.error || 'API密钥添加失败', { icon: 2 });
                    });
                }
            } catch (error) {
                layui.use('layer', function() {
                    layer.msg('网络错误', { icon: 2 });
                });
            }
        }

        // 切换API密钥状态
        async function toggleApiKey(id, enabled) {
            try {
                await apiRequest(\`/admin/api/apikeys/\${id}\`, {
                    method: 'PATCH',
                    body: JSON.stringify({ isEnabled: enabled })
                });
                
                layui.use('layer', function() {
                    layer.msg(\`已\${enabled ? '启用' : '禁用'}密钥\`, { icon: 1 });
                });
                loadApiKeys();
            } catch (error) {
                layui.use('layer', function() {
                    layer.msg('操作失败', { icon: 2 });
                });
            }
        }

        // 删除API密钥
        async function deleteApiKey(id) {
            layui.use('layer', function() {
                layer.confirm('确定删除此API密钥吗？', {
                    btn: ['确定', '取消']
                }, async function(index) {
                    try {
                        await apiRequest(\`/admin/api/apikeys/\${id}\`, {
                            method: 'DELETE'
                        });
                        
                        layer.close(index);
                        layer.msg('删除成功', { icon: 1 });
                        loadApiKeys();
                    } catch (error) {
                        layer.msg('删除失败', { icon: 2 });
                    }
                });
            });
        }

        // 加载设置
        async function loadSettings() {
            try {
                const response = await apiRequest('/admin/api/settings');
                const settings = await response.json();
                
                document.getElementById('rotationStrategy').value = settings.rotationStrategy;
                document.getElementById('apiBaseUrl').value = settings.apiBaseUrl;
                document.getElementById('maxFailNum').value = settings.maxFailNum;
                document.getElementById('maxRequestRecordNum').value = settings.maxRequestRecordNum;
                document.getElementById('perApiKeyRpm').value = settings.perApiKeyRpm;
                document.getElementById('systemRpm').value = settings.systemRpm;
                document.getElementById('jwtExpiryDays').value = settings.jwtExpiryDays;
                
                // 加载模型映射
                const modelsResponse = await apiRequest('/admin/api/models');
                const models = await modelsResponse.json();
                renderModelMappings(models);
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        }

        // 渲染模型映射
        function renderModelMappings(models) {
            const container = document.getElementById('modelMappings');
            container.innerHTML = models.map((model, index) => \`
                <div class="row mb-2 model-mapping" data-index="\${index}">
                    <div class="col-md-5">
                        <input type="text" class="form-control" placeholder="显示名称" value="\${model.displayName}" data-field="displayName">
                    </div>
                    <div class="col-md-5">
                        <input type="text" class="form-control" placeholder="内部名称" value="\${model.internalName}" data-field="internalName">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-danger btn-sm w-100" onclick="removeModelMapping(\${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        // 添加模型映射
        function addModelMapping() {
            const container = document.getElementById('modelMappings');
            const index = container.querySelectorAll('.model-mapping').length;
            const newMapping = document.createElement('div');
            newMapping.className = 'row mb-2 model-mapping';
            newMapping.dataset.index = index;
            newMapping.innerHTML = \`
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="显示名称" data-field="displayName">
                </div>
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="内部名称" data-field="internalName">
                </div>
                <div class="col-md-2">
                    <button class="btn btn-outline-danger btn-sm w-100" onclick="removeModelMapping(\${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            \`;
            container.appendChild(newMapping);
        }

        // 删除模型映射
        function removeModelMapping(index) {
            const mapping = document.querySelector(\`.model-mapping[data-index="\${index}"]\`);
            if (mapping) {
                mapping.remove();
            }
        }

        // 保存模型映射
        async function saveModelMappings() {
            const mappings = [];
            document.querySelectorAll('.model-mapping').forEach(row => {
                const displayName = row.querySelector('[data-field="displayName"]').value;
                const internalName = row.querySelector('[data-field="internalName"]').value;
                if (displayName && internalName) {
                    mappings.push({ displayName, internalName });
                }
            });
            
            try {
                await apiRequest('/admin/api/models', {
                    method: 'PUT',
                    body: JSON.stringify(mappings)
                });
                
                layui.use('layer', function() {
                    layer.msg('模型映射保存成功！', { icon: 1 });
                });
            } catch (error) {
                layui.use('layer', function() {
                    layer.msg('保存失败', { icon: 2 });
                });
            }
        }

        // 保存设置
        async function saveSettings(e) {
            e.preventDefault();
            
            const settings = {
                rotationStrategy: document.getElementById('rotationStrategy').value,
                apiBaseUrl: document.getElementById('apiBaseUrl').value,
                maxFailNum: parseInt(document.getElementById('maxFailNum').value),
                maxRequestRecordNum: parseInt(document.getElementById('maxRequestRecordNum').value),
                perApiKeyRpm: parseInt(document.getElementById('perApiKeyRpm').value),
                systemRpm: parseInt(document.getElementById('systemRpm').value),
                jwtExpiryDays: parseInt(document.getElementById('jwtExpiryDays').value),
            };
            
            try {
                await apiRequest('/admin/api/settings', {
                    method: 'PUT',
                    body: JSON.stringify(settings)
                });
                
                layui.use('layer', function() {
                    layer.msg('设置保存成功！', { icon: 1 });
                });
            } catch (error) {
                layui.use('layer', function() {
                    layer.msg('保存失败', { icon: 2 });
                });
            }
        }

        // 刷新函数
        function refreshLogs() { loadLogs(); }
        function refreshCookies() { loadCookies(); }
        function refreshApiKeys() { loadApiKeys(); }

        // 退出登录
        function logout() {
            layui.use('layer', function() {
                layer.confirm('确定要退出登录吗？', {
                    btn: ['确定', '取消']
                }, function(index) {
                    localStorage.removeItem('admin_token');
                    layer.close(index);
                    window.location.href = '/';
                });
            });
        }

        // 切换侧边栏
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
        }

        // 响应式处理
        window.addEventListener('resize', function() {
            if (requestChart && cookieChart) {
                requestChart.resize();
                cookieChart.resize();
            }
        });
    </script>
</body>
</html>
  `;
}

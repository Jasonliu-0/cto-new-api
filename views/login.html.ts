/**
 * 登录页面
 */

export function getLoginPage(): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员登录 - Enginelabs API</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-container {
            max-width: 450px;
            width: 100%;
            padding: 20px;
        }
        .login-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .login-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .login-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .login-header p {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
        }
        .login-body {
            padding: 40px 30px;
        }
        .form-floating {
            margin-bottom: 20px;
        }
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 12px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 10px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        .btn-login:active {
            transform: translateY(0);
        }
        .alert {
            border-radius: 10px;
            border: none;
        }
        .input-group-text {
            background: transparent;
            border-right: none;
        }
        .form-control {
            border-left: none;
        }
        .form-floating > .form-control {
            border-left: 1px solid #ced4da;
        }
        @media (max-width: 576px) {
            .login-header h1 {
                font-size: 24px;
            }
            .login-body {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <i class="bi bi-shield-lock" style="font-size: 48px;"></i>
                <h1>管理员登录</h1>
                <p>Enginelabs API 控制面板</p>
            </div>
            <div class="login-body">
                <div id="alertContainer"></div>
                <form id="loginForm">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="username" placeholder="用户名" required>
                        <label for="username"><i class="bi bi-person"></i> 用户名</label>
                    </div>
                    <div class="form-floating">
                        <input type="password" class="form-control" id="password" placeholder="密码" required>
                        <label for="password"><i class="bi bi-lock"></i> 密码</label>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-login">
                            <i class="bi bi-box-arrow-in-right"></i> 登录
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="text-center mt-3">
            <small class="text-white">© 2025 Enginelabs API. All rights reserved.</small>
        </div>
    </div>

    <script>
        const loginForm = document.getElementById('loginForm');
        const alertContainer = document.getElementById('alertContainer');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('admin_token', data.token);
                    let cachedtoken = localStorage.getItem('admin_token');
                    alert('获取的token' + data.token + '；设置的token：' + cachedtoken);
                    showAlert('登录成功！正在跳转...', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 6000);
                } else {
                    showAlert(data.error || '登录失败', 'danger');
                }
            } catch (error) {
                showAlert('网络错误，请稍后重试', 'danger');
            }
        });

        function showAlert(message, type) {
            alertContainer.innerHTML = \`
                <div class="alert alert-\${type} alert-dismissible fade show" role="alert">
                    <i class="bi bi-\${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                    \${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            \`;
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
  `;
}

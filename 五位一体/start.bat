@echo off
echo 启动五位一体游戏...
echo.

REM 检查是否安装了node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 安装依赖
echo 正在安装依赖...
npm install

echo.
echo 启动开发服务器...
echo 请在浏览器中打开 http://localhost:8080
echo.

REM 启动本地服务器
npx http-server -p 8080
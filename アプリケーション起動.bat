@echo off
echo "[JA] サーバーを起動しています..."
echo "[EN] Server is starting..."
start "Server" cmd /k "cd server && npm run dev"

echo "[JA] クライアントを起動しています..."
echo "[EN] Client is starting..."
start "Client" cmd /k "cd client && npm run dev"

echo "[JA] 無事アプリケーション起動しました! https://localhost:5173"
echo "[EN] Application started successfully! https://localhost:5173"
pause
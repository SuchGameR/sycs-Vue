@echo off
echo Installing Server Dependencies...
cd server
call npm i
cd ..

echo Installing Client Dependencies...
cd client
call npm i
cd ..

echo All dependencies installed!
pause

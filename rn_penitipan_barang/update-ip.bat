@echo off
echo 🔍 Detecting current IP address...

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "ip=%%a"
    goto :found
)

:found
set "ip=%ip: =%"
echo 📍 Current IP: %ip%

echo 🔄 Updating .env file...
echo EXPO_PUBLIC_API_URL=http://%ip%:3000/api > .env

echo ✅ Updated! New API URL: http://%ip%:3000/api
echo.
echo 🚀 Now restart Expo with: npx expo start -c
pause
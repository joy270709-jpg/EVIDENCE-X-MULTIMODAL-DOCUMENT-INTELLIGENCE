@echo off
echo ========================================================
echo Starting EVIDENCE-X Multimodal Document Intelligence
echo ========================================================

start "Evidence-X Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload"
start "Evidence-X Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev -- --port 5173"

echo Servers started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8005
pause

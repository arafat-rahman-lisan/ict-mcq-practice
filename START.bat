@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 serve.py
  goto done
)
where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py
  goto done
)
echo Python 3 is required. Install it from python.org, or use VS Code Live Server.
:done
pause

@echo off
chcp 65001 > nul

git add .

IF %ERRORLEVEL% NEQ 0 GOTO end

REM Перевіряємо, чи є зміни, готові до коміту
git diff --cached --exit-code --quiet
IF %ERRORLEVEL% NEQ 0 (
    REM Перевіряємо кількість змінених файлів
    FOR /F %%A IN ('git diff --cached --name-only ^| find /c /v ""') DO SET changes=%%A

    REM Якщо змінені файли відсутні, виходимо
    IF "!changes!"=="0" (
        echo ---- NO SIGNIFICANT CHANGES FOUND ----
        GOTO end
    )

    echo ---- Found Changes ----
    echo.
    echo          ^/^)^_^/^) 
    echo         ^( ^. ^.^)  
    echo         ^C^(^"^)^(^"^)
    echo.
) ELSE (
    echo ---- No Changes To Commit ----
    echo.
    echo              ^(^\^(^\
    echo              ^(^x^.^x^)
    echo              ^c^(^"^)^(^"^)
    echo.
    GOTO end
)

set /p commit_message="[!] Enter commit message: "
git commit -m "%commit_message%" > nul 2>&1
IF %ERRORLEVEL% NEQ 0 GOTO end

echo.
echo [!] Pushing changes...
git push -u origin main > nul 2>&1
IF %ERRORLEVEL% NEQ 0 GOTO end

echo.
echo ----- Complete -----
echo.
echo         (\(\  
echo         (-.-)  
echo        o_(")(")
echo. 

:end
pause
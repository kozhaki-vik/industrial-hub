@echo off
echo Building Industrial Hub Launcher...

set CSC_PATH="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if not exist %CSC_PATH% (
    echo C# Compiler not found at %CSC_PATH%
    echo Please make sure .NET Framework 4.0 or higher is installed.
    pause
    exit /b 1
)

%CSC_PATH% /target:winexe /out:Launcher.exe /win32icon:icon_opt.ico /win32manifest:app.manifest /optimize /reference:System.IO.Compression.FileSystem.dll /reference:System.Windows.Forms.dll /reference:System.Drawing.dll Launcher.cs

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Signing Launcher.exe...
"C:\Users\Developer\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\windows-10\x64\signtool.exe" sign /sha1 CF5FD177247FC2EEB561B69BE223EF0757218C08 /fd sha256 /tr http://timestamp.digicert.com /td sha256 Launcher.exe

if %errorlevel% neq 0 (
    echo Signing failed!
    pause
    exit /b 1
)

echo Build and Signing successful! The file Launcher.exe has been created.
pause

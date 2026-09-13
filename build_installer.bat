@echo off
echo Building Industrial Hub Installer...

set CSC_PATH="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if not exist %CSC_PATH% (
    echo C# Compiler not found at %CSC_PATH%
    echo Please make sure .NET Framework 4.0 or higher is installed.
    pause
    exit /b 1
)

%CSC_PATH% /target:winexe /out:Installer.exe /win32icon:icon_opt.ico /win32manifest:app.manifest /optimize /reference:System.IO.Compression.FileSystem.dll /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Core.dll Installer.cs

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Signing Installer.exe...
"C:\Users\Developer\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\windows-10\x64\signtool.exe" sign /sha1 F275C9D48A3325871DB04B0FDFB5701BE34802B7 /fd sha256 /tr http://timestamp.digicert.com /td sha256 Installer.exe

if %errorlevel% neq 0 (
    echo Signing failed!
    pause
    exit /b 1
)

echo Build and Signing successful! The file Installer.exe has been created.
pause

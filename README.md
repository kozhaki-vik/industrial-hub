# Industrial Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://microsoft.com/windows)

**Industrial Hub** is an open-source Windows desktop utility and community management hub designed for power users, gaming communities, and server administrators. Built on Electron, React, and native Windows APIs, the application operates strictly at the OS desktop level with zero process injection or intrusive hooks.

---

## ✨ Key Features

### 🖥️ Display Contrast & Gamma Calibration
- **System-Wide Hardware Gamma Adjustment:** Calibrate monitor gamma ramps directly through the standard Windows GDI API (`SetDeviceGammaRamp`).
- **Global Pass-Through Shortcut:** Toggle between calibrated and standard display contrast using a global hotkey via a lightweight native C# listener (`resources/native.cs`).
- **Fail-Safe Profile Restoration:** Automatically resets monitor gamma tables back to the operating system default when exiting, minimizing, or upon unexpected process termination.

### 👥 Discord Community & Clan Management
- **Administrative Command Center:** Manage Discord community servers, verify role hierarchy permissions, and streamline moderation workflows.
- **Dynamic Voice & Ticket Automation:** Create temporary voice channels on demand and organize player recruitment tickets.
- **Roster & Activity Analytics:** Track attendance, role changes, and member statistics with rich interactive visual charts.

### 📐 Industrial Conveyors & Binds Manager
- **Conveyor Pipeline Designer:** Design, simulate, and export industrial conveyor filter and piping configurations.
- **Binds & Configuration Manager:** Generate, customize, and safely export game binds and auto-detected client configs.
- **Clipboard Integration:** Export generated configuration strings and binds safely using the standard Windows Clipboard API.

---

## 🔒 Privacy & Security

Industrial Hub is designed with privacy-first architecture:
- **No Keystroke Logging:** Hotkey detection uses passive Windows APIs exclusively for toggling display contrast.
- **No Foreign Process Access:** Operates as a standalone utility without reading memory, injecting DLLs, or interfering with third-party software.
- **Transparent Telemetry:** Hardware diagnostics are completely anonymous and can be disabled during initial setup or at any time in settings. For complete details, see our [Privacy Policy](PRIVACY.md).

---

## 🛠️ Building from Source

### Prerequisites
- Windows 10 / 11 (x64)
- [Node.js](https://nodejs.org/) v20.x or higher
- [.NET Framework 4.5+](https://dotnet.microsoft.com/) (includes `csc.exe` in `C:\Windows\Microsoft.NET\Framework64\v4.0.30319`)

### Steps

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/kozhaki-vik/industrial-hub.git
   cd industrial-hub
   ```

2. **Install dependencies:**
   ```powershell
   npm ci
   ```

3. **Build the application:**
   This step compiles the native C# helper (`scripts/compile-native.js`) and builds the React frontend with Vite:
   ```powershell
   npm run build
   ```

4. **Package Windows binaries:**
   Generates both the NSIS installer and the standalone portable executable in the `release/` directory:
   ```powershell
   npx electron-builder --win --publish never
   ```

---

## 📜 Policies & Legal

* **Terms of Service:** Read our [Terms of Service](TERMS.md) governing the desktop application and the Discord bot integration (also available on [GitHub Pages](https://kozhaki-vik.github.io/industrial-hub/terms.html)).
* **Privacy Policy:** Detailed data minimization, telemetry, and Discord data processing practices are documented in our [Privacy Policy](PRIVACY.md) (also available on [GitHub Pages](https://kozhaki-vik.github.io/industrial-hub/privacy.html)).
* **Code Signing Policy:** Free code signing provided by [SignPath.io](https://signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).
* **Committers and Reviewers:** [Dmytro Kondratenko (@kozhaki-vik)](https://github.com/kozhaki-vik)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

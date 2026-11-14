# Privacy Policy

**Effective Date:** November 14, 2026  
**Application:** Industrial Hub (Desktop Application)  
**Maintainer:** Dmytro Kondratenko (@kozhaki-vik)

---

## 1. Principles of Operation

Industrial Hub is an open-source Windows desktop utility and community management tool designed to operate transparently and with minimal data collection. We respect user privacy and adhere strictly to the principle of data minimization:

- **No Personal File Inspection:** The application does not scan, read, or upload personal documents, browser history, desktop files, or user directories.
- **No Keystroke Logging:** The application does not record, log, or transmit keystrokes or input text. Shortcut listeners operate strictly as passive Windows hotkeys for display contrast toggling.
- **No Process Injection:** The application does not attach debuggers, read foreign process memory, hook DirectX/Vulkan APIs, or inject DLLs into third-party games or applications.
- **No Commercial Tracking or Profiling:** There are no advertising SDKs, behavioral analytics, or third-party marketing trackers included in the codebase.

---

## 2. Information Collected and Processed

### 2.1 Technical Device Identifier & Connection Heartbeat
- **Installation Identifier (`device-id`):** To calculate active online installations, maintain WebSocket connection state, and sync user configuration preferences (such as shared schematics or clan bookmarks), the application uses a local installation identifier (`device-id`) stored in `C:\ProgramData\IndustrialHub\device-id` (with a resilient fallback in user application storage). This identifier is generated locally without reading hardware serial numbers and without running background system scripts (such as PowerShell or WMI queries). It cannot be reversed to discover your hardware components, IP address, or user account name.
- **Connection Heartbeat:** Periodic lightweight ping/pong messages are exchanged with the gateway server (`industrial-hub.duckdns.org`) solely to detect network disconnections and keep session state alive.

### 2.2 Optional Anonymous Hardware Diagnostics
When enabled, the application collects non-identifying system environment details to ensure compatibility and troubleshoot performance:
- **Processor Model** (e.g., `AMD Ryzen 7 7800X3D`)
- **Graphics Card Model** (e.g., `NVIDIA GeForce RTX 4070`)
- **Total Physical RAM** (e.g., `32 GB`)
- **Operating System Version and Architecture** (e.g., `Windows 11 x64`)

> [!NOTE]
> Diagnostic telemetry explicitly **excludes** computer network hostnames (`hostname`), MAC addresses, drive serial numbers, local IP addresses, and user profile usernames.

### 2.3 User-Initiated Discord Integration
- If you voluntarily choose to link a Discord server via the Clan Manager module, the application processes server channel identifiers, role IDs, and public member identifiers necessary to display clan rosters and manage administrative tickets.
- No private Discord credentials, bot secrets, or user passwords are collected or stored by the client application.

### 2.4 Support Tickets
- When you submit a feedback form or support ticket, only the text message you write and basic client version metadata are transmitted to our support queue.

---

## 3. Telemetry Opt-Out & User Controls

You maintain full control over diagnostic telemetry:
1. **Initial Setup:** During the first-run onboarding wizard (`Initial Setup`), you are presented with a direct toggle to disable anonymous diagnostic telemetry before any data is sent.
2. **Settings Menu:** You can toggle anonymous telemetry on or off at any time under **Settings → System & Diagnostics → Anonymous Diagnostic Telemetry**.
3. **Local Storage:** When opted out (`hub_telemetry_enabled = "false"`), no hardware diagnostic payloads are ever transmitted to the server.

---

## 4. Data Retention and Security

- **Local Storage:** All personal configuration files, binds, custom schemes, and UI themes are stored locally on your device in your user app data directory.
- **Transport Security:** All communications with remote servers are encrypted in transit using industry-standard TLS / WSS protocols.
- **No Third-Party Sharing:** Diagnostic data is used exclusively for application stability and compatibility improvements and is never sold, leased, or shared with third parties.

---

## 5. Contact and Inquiries

For questions regarding this Privacy Policy or data handling practices, open an issue in the official GitHub repository:  
[https://github.com/kozhaki-vik/industrial-hub/issues](https://github.com/kozhaki-vik/industrial-hub/issues)

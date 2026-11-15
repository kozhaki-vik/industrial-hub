# Terms of Service

**Effective Date:** November 15, 2026  
**Application:** Industrial Hub Discord Bot (Application ID: `1545095227440631808`)  
**Maintainer:** Dmytro Kondratenko ([@kozhaki-vik](https://github.com/kozhaki-vik))  
**Repository:** [https://github.com/kozhaki-vik/industrial-hub](https://github.com/kozhaki-vik/industrial-hub)  
**Hosted Version:** [https://kozhaki-vik.github.io/industrial-hub/terms.html](https://kozhaki-vik.github.io/industrial-hub/terms.html)

---

## 1. Acceptance of Terms

By adding the **Industrial Hub Discord Bot** ("the Bot", "the Application", "we", "our") to your Discord server (guild), interacting with its slash commands, buttons, modals, or using features connected to the Industrial Hub desktop application, you ("User", "Server Administrator", "You") agree to be bound by these Terms of Service ("Terms").

If you do not agree to these Terms, do not invite, configure, or interact with the Application.

These Terms operate in strict compliance with:
- [Discord Terms of Service](https://discord.com/terms)
- [Discord Community Guidelines](https://discord.com/guidelines)
- [Discord Developer Terms of Service and Developer Policy](https://discord.com/developers/docs/policies-and-agreements/developer-policy)

---

## 2. Description of the Application

Industrial Hub Discord Bot is an open-source companion bot designed for gaming communities, competitive clan operations (specifically for the game *Rust*), and Discord server moderation. Key features include:

- **Clan & Roster Management:** Synchronizing clan rosters, tracking member roles, and displaying dynamic clan member activity cards.
- **Voice Channel Automation:** On-demand temporary voice channels ("Dynamic Voice"), automatic cleanup upon channel vacancy, and tracking active voice participation.
- **Community Polls & Wipe Voting:** Organizing clan wipe participation surveys, managing VIP role assignments, and scheduling auto-expiration of temporary wipe roles.
- **Recruitment & Support Tickets:** Multi-step modal application workflows for new clan recruits, transcript generation, and ticket routing for moderators.
- **Steam & Game Activity Linking:** Parsing public Steam profiles, verification of gameplay hours, and displaying in-game activity statistics.
- **Industrial Hub Desktop Gateway:** Secure WebSocket synchronization with the local Industrial Hub desktop client via cryptographically signed tokens (`clan_secret`).

---

## 3. Acceptable Use Policy

When interacting with the Application, you agree **not** to:

1. **Abuse or Exploit:** Attempt to exploit bugs, execute denial-of-service (DoS) attacks, flood the bot with automated requests, or bypass rate limits (`MAX_PROXY_REQ_PER_SEC`).
2. **Reverse Engineer for Malicious Purposes:** Attempt to inject unauthorized payloads, spoof administrative permissions, or forge authentication tokens (`clan_secret`).
3. **Violate Platform Rules:** Use the Application to harass, raid, dox, distribute malware, publish illegal material, or otherwise violate Discord's Community Guidelines.
4. **Circumvent Permission Safeguards:** Attempt to access, modify, or delete guild configurations or ticket logs belonging to another Discord server.

Violation of this section constitutes grounds for immediate termination of access and blacklisting of the offending user or server.

---

## 4. Server Administrator Responsibilities

Server administrators installing and configuring the Bot are responsible for:
- Granting only the Discord permissions necessary for the Bot to perform its intended clan management and moderation roles.
- Managing user access to bot administrative commands (e.g. `/setup_panels`, `/hub_link`, ticket administration).
- Ensuring that server rules and channel configurations comply with local privacy regulations and Discord's Terms of Service.

---

## 5. Privacy and Data Handling

We prioritize data minimization and user transparency:
- The Application collects only technical identifiers strictly necessary for its features: Discord User IDs, Server (Guild) IDs, Channel IDs, Role IDs, Voice Channel duration, and public Steam IDs (when linked voluntarily).
- The Application does **not** inspect or store private direct messages (DMs) or message contents outside of dedicated recruitment and support ticket channels.
- No user data collected by the Application is sold, leased, or transferred to third-party advertisers.
- For complete details on data processing, storage, and deletion rights, please consult our official [Privacy Policy](PRIVACY.md) (or [Web Version](https://kozhaki-vik.github.io/industrial-hub/privacy.html)).

---

## 6. Intellectual Property & Trademarks

- **Industrial Hub Bot:** The source code and documentation of Industrial Hub are licensed under the [MIT License](LICENSE).
- **Discord:** *Discord* is a trademark of Discord Inc. The Application is an independent integration and is not affiliated with, endorsed by, or sponsored by Discord Inc.
- **Rust & Steam:** *Rust* is a registered trademark of Facepunch Studios Ltd. *Steam* is a registered trademark of Valve Corporation. All associated trademarks belong to their respective owners.

---

## 7. Availability, Warranty Disclaimer & "AS IS" Provision

THE APPLICATION IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, UPTIME GUARANTEES, OR NON-INFRINGEMENT.

- We do not warrant that the Application will operate uninterrupted, error-free, or without latency. Service may be temporarily paused for updates, database maintenance, or due to Discord API disruptions.
- The maintainers reserve the right to modify, suspend, or discontinue any feature of the Application at any time with prior notice where practicable.

---

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DMYTRO KONDRATENKO, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR DISCORD GUILD DISRUPTIONS) ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE APPLICATION.

---

## 9. Termination & Data Deletion

- **Voluntary Removal:** You may terminate your use of the Application at any time by kicking or banning the Bot from your Discord server.
- **Data Removal:** Upon removal of the Bot, guild-specific configurations remain dormant. Server administrators may request immediate and complete deletion of their guild database records by opening an issue on GitHub.
- **Revocation:** The maintainer reserves the right to restrict or permanently terminate access to the Application for any user or server that violates these Terms or Discord's policies.

---

## 10. Modifications to Terms

We may update these Terms from time to time to reflect new features, legal requirements, or Discord platform updates. Any changes will be committed directly to the official GitHub repository with an updated "Effective Date". Continued use of the Application after changes are posted constitutes your acceptance of the revised Terms.

---

## 11. Contact & Support

If you have questions, feedback, security vulnerability reports, or data deletion requests regarding these Terms of Service:

- **GitHub Issues:** [https://github.com/kozhaki-vik/industrial-hub/issues](https://github.com/kozhaki-vik/industrial-hub/issues)
- **Maintainer:** Dmytro Kondratenko ([@kozhaki-vik](https://github.com/kozhaki-vik))

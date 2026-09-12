# Архитектурная карта Industrial Hub

## Структура проектов
```
repos/
├── Industrial Hub/          # КЛИЕНТ: Electron + React 19 + Vite + Tailwind v4
├── Industrial Hub Server/   # СЕРВЕР: Node.js + Express + WS + SQLite (Германия)
├── Discord_Hub/             # БОТ: Discord.js v14 + Prisma + PostgreSQL
```

---

## Клиент: Industrial Hub

### Electron (`electron/`)
* **main.js** — главный процесс. IPC-хэндлеры:
  - `autoDetectRustPath()` / `browseForRustPath()` — путь к Rust
  - `config:readConfig/writeConfig/copyFile/ensureDir` — работа с cfg Rust
  - `config:isRustRunning` — проверка rustclient.exe
  - `gamma:getDisplays/setDisplayGamma/registerHook/unregisterHook` — NativeHelper.exe
  - `diagnostics:*` — железо, пинг, целостность файлов
  - `network:get-hwid` — SHA256 хеш машины
  - `network:apply-exe-update` — скачивание и установка обновления с GitHub
  - `shell:openExternal/openPath/openFolder` — проводник/браузер
  - `app:relaunch/reportError`
* **preload.js** — мост `window.electronAPI` (contextIsolation)

### Сервисы (`src/services/`)
| Файл | Назначение |
|------|-----------|
| configManager.js | Чтение/запись keys.cfg, client.cfg, пресеты графики, бэкапы |
| store.js | Настройки клиента (localStorage / %APPDATA%/config.json) |
| bindAnalyzer.js | Распознавание биндов Rust по сигнатурам |
| diagnostics.js | Прослойка React → IPC диагностики |
| gamma.js / hook.js | Управление гаммой и глобальный хоткей |
| rustPath.js | Автоопределение папки Rust |
| analytics.js | Локальная статистика кликов |

### Контексты (`src/contexts/`)
| Контекст | Назначение |
|----------|-----------|
| ThemeContext | Светлая/тёмная тема |
| GammaContext | Ночное видение (100% фиксированная яркость) |
| NetworkContext | WebSocket к серверу, heartbeat 60с, статус online/offline, обновления |
| NotificationContext | Тосты уведомлений |

### Вкладки (`src/views/`)
Dashboard, Binds (клавиатура), Conveyors (промышленные фильтры), Monuments, Electricity, Gamma, Graphics (пресеты FPS), Servers, Settings, Developer, ClanManager (12 разделов: Основное, Роли, Каналы, Наборы, Голосования, Логирование, Модерация, Права Доступа, Состав, Архив, Статистика, Реклама, Динамические войсы)

### Данные (`src/data/`)
itemsDB.ts (предметы Rust), items_ru.json, defaultConveyors.js, monumentsData.js, electricityData.js, i18n.js

### Утилиты (`src/utils/`)
formValidation.js (валидация форм + автоскролл), SmartPatcher.js (проверка обновлений через GitHub API), keyboardMap.js

### Нативные C# (`resources/`, корень)
* **NativeHelper.exe** — гамма (Win32 GDI SetDeviceGammaRamp) + хоткей (WH_KEYBOARD_LL)
* **Installer.cs/.exe** — лаунчер WinForms, скачивание с GitHub Releases

---

## Сервер: Industrial Hub Server

### server.js
* `POST /api/crash` → Telegram
* `POST /api/webhook/github` → `setLatestVersion()` → WS broadcast `update_available`
* WSS с perMessageDeflate

### WebSocket (`ws/`)
| Файл | Назначение |
|------|-----------|
| connection.js | activeClients Map, heartbeat checker, auth_success, version sync |
| tickets.js | Тикеты поддержки (1/мин rate limit) → SQLite + Telegram |
| telemetry.js | Статистика использования, hardware info |
| clan.js | Мост клиент↔бот: link/unlink/get_status/proxy (rate limit 5 req/s/HWID) |

### Сервисы (`services/`)
* **telegram.js** — Telegram-бот (тикеты, краши, ответы)
* **crypto.js** — ECDSA подписи манифестов

### БД SQLite (`db/`)
Таблицы: `tickets`, `telemetry`, `user_hardware`, `clan_links`

---

## Discord-бот: Discord_Hub

### Команды (`src/commands/`)
hub_link (привязка кода), setup_panels (эмбеды набора), vote/wipe_vote (голосования), profile (карточка игрока), link_steam (Steam аккаунт)

### События (`src/events/`)
| Файл | Назначение |
|------|-----------|
| interactionCreate.js | Маршрутизация команд/кнопок/модалок, DM safety |
| guildMemberAdd.js | Anti-raid (5+/10сек), проверка возраста аккаунта, авто-роль |
| voiceStateUpdate.js | Подсчёт времени в войсе, динамические каналы |
| messageCreate.js | Статистика сообщений, фильтр слов, антиспам |
| ready.js | Синхронизация серверов, очистка осиротевших каналов |

### Сервисы (`src/services/`)
| Файл | Назначение |
|------|-----------|
| serverConnection.js | WS к серверу, heartbeat 25с, proxy (get/update_config, roster, stats, warnings, auto_setup, permissions, votes, applications...) |
| ticketService.js | Заявки (Discord Modals), авто-отклонение, HTML транскрипты |
| warnService.js | Система варнов (выдача/снятие/очистка, авто-санкции по порогу) |
| steamBattlemetricsService.js | Steam API + Battlemetrics (throttle + LRU кэш 30мин) |
| moderationService.js | Anti-mention, фильтр слов (regex word boundaries) |
| loggerService.js | 15 типов событий аудита |
| voteService.js | Голосования и опросы |
| configService.js | Кэш конфигурации гильдии |
| statsService.js | Батчинг статистики (flush каждые 30 сек) |

### Prisma (`prisma/schema.prisma`) — PostgreSQL
Модели: GuildConfig, UserWarning, TempVoiceChannel, UserStat, VoiceSession, Application, Ticket, Vote, VoteOption, UserVote

---

## Потоки данных

```
┌──────────────────────────────────────────────────┐
│           INDUSTRIAL HUB (ELECTRON)              │
│  React UI ←─IPC─→ Main Process ←→ NativeHelper   │
└────────────────────┬─────────────────────────────┘
                     │ WS (heartbeat 60s) + HTTPS
                     ▼
┌──────────────────────────────────────────────────┐
│        INDUSTRIAL HUB SERVER (GERMANY)           │
│  Nginx → Express (crash, webhook) + WS Server    │
│  SQLite · Telegram Bot · Rate Limiter            │
└──────────┬──────────────────────▲────────────────┘
           │ Telegram             │ WS Proxy (heartbeat 25s)
           ▼                     ▼
     ┌──────────┐      ┌────────────────────┐
     │ Telegram │      │    DISCORD BOT     │
     │ Козак 📱 │      │ Discord.js + Prisma│
     └──────────┘      │ PostgreSQL         │
                       └────────────────────┘
```

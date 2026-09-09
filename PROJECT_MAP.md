# Полная архитектурная карта экосистемы Industrial Hub

Данный документ — единая точка входа для разработчиков и ИИ-агентов. Он описывает структуру всей экосистемы `Industrial Hub`, все модули, экспортируемые функции, аргументы, возвращаемые типы, каналы межпроцессного взаимодействия (IPC) и сетевые протоколы (WebSocket, REST API).

---

## Оглавление
1. [Обзор экосистемы и проектов](#1-обзор-экосистемы-и-проектов)
2. [Клиентское приложение: Industrial Hub (Electron + React 19)](#2-клиентское-приложение-industrial-hub)
   - [Electron Main & Preload (IPC Каналы)](#21-electron-main--preload-ipc)
   - [Сервисы (src/services/)](#22-сервисы-srcservices)
   - [React Контексты (src/contexts/)](#23-react-контексты-srccontexts)
   - [Вкладки интерфейса (src/views/)](#24-вкладки-интерфейса-srcviews)
   - [Компоненты (src/components/)](#25-компоненты-srccomponents)
   - [Базы данных и статика (src/data/)](#26-базы-данных-и-статика-srcdata)
   - [Утилиты (src/utils/)](#27-утилиты-srcutils)
   - [Нативные компоненты C# (resources/ & Installer.cs)](#28-нативные-компоненты-c)
3. [Серверная часть: Industrial Hub Server (Node.js + Express + WS)](#3-серверная-часть-industrial-hub-server)
   - [Архитектура сервера и эндпоинты](#31-архитектура-сервера-и-эндпоинты)
   - [WebSocket обработчики (ws/)](#32-websocket-обработчики-ws)
   - [Сервисы и интеграции (services/)](#33-сервисы-и-интеграции-services)
   - [База данных SQLite (db/)](#34-база-данных-sqlite-db)
4. [Дискорд-бот: Discord_Hub (Discord.js + Prisma)](#4-дискорд-бот-discord_hub)
   - [Команды и обработчики (commands/ & events/)](#41-команды-и-обработчики)
   - [Связка с сервером (services/serverConnection.js)](#42-связка-с-сервером-serverconnectionjs)
   - [Схема данных Prisma (prisma/schema.prisma)](#43-схема-данных-prisma)
5. [Потоки данных и протоколы взаимодействия](#5-потоки-данных-и-протоколы-взаимодействия)
6. [Памятка для ИИ-агента](#6-памятка-для-ии-агента)

---

## 1. Обзор экосистемы и проектов

Корень репозиториев: `C:\Users\Developer\source\repos\`

```
repos/
├── .agents/                      # Правила для ИИ-агентов (AGENTS.md)
├── PROJECT_MAP.md                # Этот файл (полная карта архитектуры и функций)
├── Industrial Hub/               # КЛИЕНТ: Десктопное приложение (Electron + React 19 + Tailwind CSS)
├── Industrial Hub Server/        # СЕРВЕР: Бэкенд-сервер (Германия, Express, WS, Telegram, SQLite)
├── Discord_Hub/                  # БОТ: Discord-бот для кланов (Discord.js v14, Prisma, SQLite)
└── BackUp/                       # СТРОГИЙ ЗАПРЕТ НА ДОСТУП И СКАНИРОВАНИЕ!
```

---

## 2. Клиентское приложение: Industrial Hub

**Стек:** Electron 43+, React 19, Vite, Tailwind CSS v4, Lucide Icons, `@hello-pangea/dnd`, `react-i18next`.

### 2.1. Electron Main & Preload (IPC)

#### [`electron/main.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/electron/main.js)
Главный процесс NodeJS/Electron.
* **Функции жизненного цикла и хелперы:**
  * `getRealAppPath()`: Возвращает `process.env.PORTABLE_EXECUTABLE_DIR` в упакованном виде (портативный EXE) либо `cwd()` в режиме разработки. Исключает работу во временной папке `%TEMP%`.
  * `getNativeHelperPath()`: Ищет путь к `NativeHelper.exe` в ресурсах сборки или корне проекта.
  * `createWindow()`: Создает безрамочное/чистое окно `1200x800` с фоном `#0f172a`, скрытым меню, подключает `preload.js`.
  * `saveToCrashQueue(crashData)` / `flushCrashQueue()`: Очередь аварийных дампов в `%APPDATA%/industrial-hub/crash_queue.json`, отправляет с повторными попытками на `https://industrial-hub.duckdns.org/api/crash`.
  * `sendCrashReport(errorStack)`: Формирует HWID (SHA256 от hostname + username), версию приложения и стек ошибки.
* **Обработка аргументов запуска:**
  * `--cleanup-pid=<pid>` и `--cleanup-dir=<path>`: Ожидает завершения старого процесса и удаляет старую папку версии.
  * `--force-main-channel`: Принудительно устанавливает канал обновлений `main` (используется лаунчером).
* **Ротация версий:** Хранит не более 3 предыдущих папок версий, старые перемещает в `Версии/`.
* **Зарегистрированные IPC-хэндлеры (`ipcMain.handle`):**
  * `shell:openFolder(folderPath)` — открывает папку в проводнике Windows.
  * `autoDetectRustPath()` — сканирует реестр Steam (`HKCU\Software\Valve\Steam\SteamPath`) и `libraryfolders.vdf`, возвращая путь к Rust.
  * `browseForRustPath()` — вызывает диалог выбора папки Windows.
  * `diagnostics:pingUrl(urlStr)` — замеряет HTTP/HTTPS отклик до заданного URL (timeout 3000ms).
  * `diagnostics:getHardwareInfo()` — собирает имя ПК, платформу, модель CPU, имя GPU (через CIM/WMI PowerShell), RAM, Uptime приложения и ОС.
  * `diagnostics:getAppPath()` — возвращает путь к папке приложения.
  * `diagnostics:getAppDataPath()` — путь к `%APPDATA%/industrial-hub`.
  * `diagnostics:getAppVersionInfo()` — версия из `package.json` и метка последнего обновления.
  * `diagnostics:checkAppIntegrity()` — проверяет наличие 10 ключевых файлов приложения (или бинарника в сборке).
  * `diagnostics:checkRustIntegrity(rustPath)` — проверяет ровно 2 файла: `cfg/keys.cfg` и `cfg/client.cfg`.
  * `config:readConfig(rustPath, filename)` — читает файл конфига Rust.
  * `config:writeConfig(rustPath, filename, content)` — атомарно записывает файл в папку `cfg/`.
  * `config:isRustRunning()` — проверяет запущен ли `rustclient.exe` через `tasklist`.
  * `config:fileExists(fullPath)` — проверяет существование файла.
  * `config:copyFile(src, dest)` — копирует файл.
  * `config:ensureDir(dirPath)` — создает директорию рекурсивно.
  * `gamma:getDisplays()` — выполняет `NativeHelper.exe displays`, возвращает список мониторов (`\\.\DISPLAY1` и т.д.).
  * `gamma:setDisplayGamma(brightnessLevel, deviceName)` — вызывает `NativeHelper.exe gamma <level> <display>`.
  * `gamma:registerHook(vkCode)` — запускает фоновый процесс `NativeHelper.exe hook <vkCode>`, слушает вывод `HOTKEY_PRESSED` и шлет событие `gamma:hotkey_pressed` в окно React.
  * `gamma:unregisterHook()` — убивает запущенный процесс перехвата хоткея.
  * `network:get-hwid()` — генерирует уникальный SHA256 хеш машины.
  * `app:relaunch()` — перезапускает приложение.
  * `app:reportError(errorDetails)` — ручная отправка ошибки в Telegram через сервер.
  * `shell:openExternal(url)` — открывает ссылку в браузере по умолчанию.
  * `network:apply-exe-update(exeUrl, newVersion)` — скачивает новый EXE с GitHub Releases (с отслеживанием прогресса и редиректов), создает папку `app-<newVersion>`, заменяет ярлык на Рабочем столе и запускает новый бинарник с аргументами очистки старого.

#### [`electron/preload.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/electron/preload.js)
Безопасный мост, изолирующий React от Node.js:
Экспортирует в `window.electronAPI`:
* `autoDetectRustPath() -> Promise<string|null>`
* `browseForRustPath() -> Promise<string|null>`
* `app.relaunch() -> Promise<void>`
* `app.reportError(err) -> Promise<void>`
* `diagnostics.*` (pingUrl, getHardwareInfo, getAppPath, getAppDataPath, getAppVersionInfo, checkAppIntegrity, checkRustIntegrity)
* `config.*` (readConfig, writeConfig, isRustRunning, fileExists, copyFile, ensureDir)
* `gamma.*` (getDisplays, setDisplayGamma, registerHook, unregisterHook, onHotkey(callback))
* `shell.*` (openExternal, openPath)
* `ipcRenderer.*` (invoke, onUpdateProgress(callback))

---

### 2.2. Сервисы (`src/services/`)

#### 1. [`configManager.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/configManager.js)
Управление конфигами Rust (`keys.cfg` и `client.cfg`):
* `isRustRunning() -> Promise<boolean>` — блокировка изменений, если запущен `rustclient.exe`.
* `applyGraphicsPreset(presetName) -> Promise<{success: boolean, error?: string}>` — применяет пресеты графики (`Potato`, `Low`, `Medium`, `Ultra`) в `client.cfg`.
* `saveBind(key, command) -> Promise<{success: boolean, error?: string}>` — сохраняет бинд `bind <key> "<cmd>"` в `keys.cfg`.
* `getBinds() -> Promise<Record<string, string>>` — парсит `keys.cfg` в ассоциативный массив `{ [KEY]: command }`.
* `ensureOriginalBackup()` / `createBackup(name)` / `getBackups()` / `restoreBackup(filename)` — создание и откат резервных копий биндов в папке `cfg/industrial_hub_backups/`.
* `ensureOriginalGraphicsBackup()` / `createGraphicsBackup(name)` / `getGraphicsBackups()` / `restoreGraphicsBackup(filename)` — создание и откат резервных копий настроек графики.

#### 2. [`store.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/store.js)
Синхронный стор настроек клиента (в файл `%APPDATA%/industrial-hub/config.json` либо `localStorage`):
* `loadConfig()` / `saveConfig(newConfig)`: загрузка и сохранение глобального объекта конфигурации.
* `getConfigKey(key)` / `setConfigKey(key, value)`: чтение/запись параметров с авто-санитизацией путей к Rust.
* `factoryReset()`: полный сброс настроек, очистка хранилища, удаление файла конфига и перезапуск приложения.
* `addVisitedTab(path)`: фиксация посещенных вкладок (для мягкой подсветки онбординга).
* **Ключевые поля конфига:** `rustPath`, `language`, `theme`, `updateChannel` ('main' | 'test'), `gammaBoost`, `gammaBind`, `gammaSelectedDisplay`, `visitedTabs`, `setupCompleted`, `conveyorTemplates`, `conveyorCategories`.

#### 3. [`bindAnalyzer.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/bindAnalyzer.js)
* `bindSignatures`: База сигнатур готовых биндов Rust (Авто-бег, Авто-добыча, Комбат-лог, Самоубийство, Быстрый дисконнект, Смена FOV, Приглушение звука, Очистка консоли, Смена рук, Скрытие HUD, Авто-плавание, Постоянный присед).
* `analyzeBinds(binds)`: Сопоставляет текущие клавиши пользователя со списком сигнатур для подсветки на клавиатуре.

#### 4. [`diagnostics.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/diagnostics.js)
Прослойка между React и IPC диагностикой Electron:
* `pingUrl(urlStr)`
* `getHardwareInfo()`
* `getAppPath()` / `getAppDataPath()` / `getAppVersionInfo()`
* `checkAppIntegrity()` (проверка 10 файлов программы)
* `checkRustIntegrity(rustPath)` (проверка 2 файлов Rust)

#### 5. [`gamma.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/gamma.js)
* `getDisplays() -> Promise<string[]>`
* `setDisplayGamma(brightnessLevel, deviceName)`
* `resetDisplayGamma(deviceName)`

#### 6. [`hook.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/hook.js)
* `registerGlobalHook(vkCode, callback) -> Promise<boolean>` — установка глобального перехвата клавиши ночного видения.
* `unregisterGlobalHook() -> Promise<boolean>` — снятие перехвата.

#### 7. [`rustPath.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/rustPath.js)
* `autoDetectRustPath()` — автоопределение папки Rust через реестр.
* `browseForRustPath()` — ручной выбор папки.

#### 8. [`analytics.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/services/analytics.js)
* `trackButtonClick(name)` / `getButtonStats()` — сбор локальной обезличенной статистики нажатий.
* `initAnalytics()` — глобальный перехват кликов по кнопкам с контекстом маршрута.

---

### 2.3. React Контексты (`src/contexts/`)

* **`ThemeContext.jsx` (`useTheme`):**
  Управляет светлой (`#F8F9FA`) и темной темами. Переключает класс `dark` на теге `<html>`. Сохраняет выбор в сторе.
* **`GammaContext.jsx` (`useGamma`):**
  Состояние ночного видения: `isGammaEnabled`, `nightVisionLevel`, `gammaBind`, `displays`, `selectedDisplay`, методы `enableGamma()`, `disableGamma()`, `toggleGamma()`.
* **`NetworkContext.jsx` (`useNetwork`):**
  Управляет WebSocket-подключением к серверу:
  * Список эндпоинтов для отказоустойчивости (`wss://industrial-hub.duckdns.org`, `ws://...`, прямые IP).
  * Экспортирует: `ws`, `status` ('connecting'|'online'|'offline'), `onlineCount`, `serverVersion`, `updateProgress`, `updateLogs`, `triggerUpdateCheck()`, `sendTelemetry(data)`, `createTicket(message, logs)`.
  * Слушает серверные события: `auth_success`, `online_count`, `update_available`, `notification`.
* **`NotificationContext.jsx` (`useNotification`):**
  Система всплывающих уведомлений (тостов) в правом углу экрана (`addNotification(msg, type)`).

---

### 2.4. Вкладки интерфейса (`src/views/`)

* **[`Dashboard.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Dashboard.jsx) (Главная):**
  Сводка системы, быстрый переход к разделам, индикаторы онбординга с мягкой подсветкой (`glowTarget`).
* **[`Binds.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Binds.jsx) (Бинды):**
  Интерактивная виртуальная клавиатура ANSI, визуализация назначенных клавиш, каталог готовых биндов, ручное назначение команд, анализ конфликтов с клавишей гаммы, история и бэкапы `keys.cfg`.
* **[`Conveyors.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Conveyors.jsx) (Конвейеры):**
  Менеджер промышленных фильтров Rust. Пресеты (Оружие, Патроны, Ресурсы, Медикаменты), кастомные категории с Drag & Drop (`@hello-pangea/dnd`), кнопка быстрого копирования конфига для мгновенной вставки в игру.
* **[`Monuments.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Monuments.jsx) (Монументы):**
  Справочник РТ (Нефтяные вышки, Космодром, Военные туннели и др.). Необходимые карты доступа (зеленые, синие, красные), предохранители, радиация, CCTV коды (копирование в 1 клик), пошаговые решения головоломок.
* **[`Electricity.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Electricity.jsx) (Электрика):**
  Интерактивные схемы электрических цепей Rust (авто-турели, автоматическая печь, сигнализация рейда), расчет мощности (rW), интеграция с сайтом `Rustrician`.
* **[`Gamma.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Gamma.jsx) (Гамма):**
  Настройка аппаратного осветления экрана для ночи. Выбор монитора, ползунок яркости, привязка глобального хоткея.
* **[`Graphics.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Graphics.jsx) (Графика):**
  Оптимизация FPS в игре: готовые пресеты (`Potato`, `Low`, `Medium`, `Ultra`, `Custom`), бэкапы `client.cfg`, проверка `isRustRunning()`.
* **[`Servers.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Servers.jsx) (Серверы):**
  Мониторинг серверов Industrial Hub, быстрый коннект через `steam://connect` и копирование команды консоли.
* **[`Settings.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Settings.jsx) (Настройки):**
  Смена языка (`ru`, `en`, `ua`), темы оформления, изменение пути к Rust, переключение канала обновлений (Main/Test с PIN `2136`), управление бэкапами, подача заявки спонсора, сброс настроек.
* **[`Developer.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Developer.jsx) (Разработчик):**
  Диагностика железа (CPU, GPU, RAM, Uptime), сетевой тест (Ping 6 сервисов), целостность файлов (10 файлов программы, 2 файла Rust), краш-тест, автообновление, кредиты команды (`Kozak`, `Кактус`, `RS6`).
* **[`ClanManager.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/ClanManager.jsx) (Клан / Состав):**
  Панель управления кланом Rust через Discord: привязка по коду из `/hub_link`, состав участников (ростер), роли, статистика голосового онлайна, опросы по вайпам, визард авто-настройки Discord-сервера.

---

### 2.5. Компоненты (`src/components/`)

* `Header.jsx`: верхняя панель, статус подключения к серверу, онлайн игроков, навигация.
* `Card.jsx`: базовая карточка инженерного стиля с подсветкой.
* `FullKeyboard.jsx`: полноразмерная интерактивная клавиатура с поддержкой цветовых меток типов команд.
* `ConveyorEditorModal.jsx`: модальное окно создания и редактирования фильтра конвейера с поиском по базе предметов.
* `RustPathModal.jsx`: диалог привязки папки игры при первом запуске.
* `SetupWizard.jsx`: пошаговый мастер первой настройки (язык, тема, папка Rust).
* `SplashScreen.jsx`: вступительная анимация при запуске программы.
* `SuggestBindModal.jsx`: предложение бинда в общую базу.
* `SupportTicketModal.jsx`: создание тикета поддержки (отправляется на сервер и в Telegram разработчику).
* `FeedbackButton.jsx`: плавающая кнопка обратной связи.
* `ToastContainer.jsx`: контейнер нотификаций.
* `ErrorBoundary.jsx`: ловушка React-ошибок с автоматической отправкой стека на сервер.
* `RoleSelect.jsx` / `ChannelSelect.jsx`: дропдауны ролей и каналов Discord для Клан-Менеджера.

---

### 2.6. Базы данных и статика (`src/data/`)

* `itemsDB.ts`: База предметов Rust (shortname, категории, динамический импорт иконок).
* `items_ru.json`: Локализованные русские названия всех внутриигровых предметов.
* `defaultConveyors.js`: Готовые шаблоны конвейеров и категории по умолчанию.
* `monumentsData.js`: Данные монументов Rust (радиация, карты, шаги, CCTV).
* `electricityData.js`: Данные электросхем Rust.
* `i18n.js`: Централизованные словари локализации (`ru`, `en`, `ua`).

---

### 2.7. Утилиты (`src/utils/`)

* **[`SmartPatcher.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/utils/SmartPatcher.js):**
  * Функция `checkUpdates(addLog)`:
    * Запрашивает GitHub Releases API (`kozhaki-vik/industrial-hub-releases`) с Cache-Buster (`?t=${Date.now()}`).
    * Канал `main`: `/releases/latest`. Канал `test`: `/releases` (берется первый релиз, включая Prerelease).
    * Сравнивает трехзначную версию (Major.Main.Test).
    * Вызывает `network:apply-exe-update` с прямой ссылкой на скачивание `.exe`.
* **[`keyboardMap.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/utils/keyboardMap.js):**
  Физическая раскладка ANSI клавиатуры (5 рядов, спецклавиши, скан-коды и VK-коды).

---

### 2.8. Нативные компоненты C#

* **[`resources/native.cs`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/resources/native.cs) / `NativeHelper.exe`:**
  * `GammaController`: Вызовы Win32 GDI API `SetDeviceGammaRamp` / `CreateDC` (алгоритм цветокоррекции из Electric Guide). Осветление ночи без искажения баланса чёрного и цветов.
  * `KeyboardHook`: Низкоуровневый хук клавиатуры Windows `SetWindowsHookEx(WH_KEYBOARD_LL)`. Перехватывает хоткей (по умолчанию `END`) даже когда игра находится в полноэкранном режиме, и сигнализирует в stdout `HOTKEY_PRESSED`.
* **[`Installer.cs`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/Installer.cs) / `Installer.exe`:**
  * Автономный установщик и лаунчер на C# WinForms (.NET 4.5+).
  * Скачивает последний `.exe` из GitHub Releases.
  * Распаковывает/устанавливает в `%APPDATA%\IndustrialHubClient\client\app-<version>\Industrial Hub.exe`.
  * Создает ярлыки на Рабочем столе и в меню Пуск.
  * Завершает зависшие старые процессы приложения перед установкой.
* **[`build_installer.bat`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/build_installer.bat):**
  Компилирует `Installer.cs` через `csc.exe` и подписывает цифровым сертификатом (`signtool.exe`, отпечаток `CF5FD177247FC2EEB561B69BE223EF0757218C08`).

---

## 3. Серверная часть: Industrial Hub Server

**Расположение:** `C:\Users\Developer\source\repos\Industrial Hub Server`  
**Хостинг:** Выделенный сервер в Германии (`industrial-hub.duckdns.org`, порты 80, 443, 8080).  
**Стек:** Node.js, Express, WebSocket (`ws`), SQLite3 (`sqlite3`), `node-telegram-bot-api`, `express-rate-limit`.  
*(ВАЖНО: При любых изменениях уведомить пользователя для ручной загрузки на продакшен-сервер!)*

### 3.1. Архитектура сервера и эндпоинты

* **[`server.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/server.js):**
  * HTTP Rate Limiting (`express-rate-limit`).
  * `POST /api/crash`: Прием аварийных дампов от клиентов. Немедленно уведомляет разработчика в Telegram через `telegramService.sendCrashReport(hwid, version, errorStack)`.
  * `POST /api/webhook/github`: Прием вебхуков от GitHub репозитория `kozhaki-vik/industrial-hub-releases`. При публикации нового релиза рассылает сигнал `update_available` всем активным WebSocket клиентам в реальном времени.
  * `GET /version.json`: Редирект на `/updates/version.json`.
  * `WSS /`: WebSocket сервер с компрессией `perMessageDeflate`.

### 3.2. WebSocket обработчики (`ws/`)

* **[`ws/connection.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/ws/connection.js):**
  * Ведет учет активных клиентов (`activeClients` Map).
  * `handleConnection(ws, req)`: парсит IP, инициирует heartbeat.
  * Обрабатывает типы пакетов:
    * `auth`: регистрация клиента по HWID и версии. Отправляет ответ `auth_success` и текущий счетчик онлайна.
    * `heartbeat`: обновление активности соединения.
  * `startHeartbeatChecker(wss)`: пингует сокеты каждые 30 секунд, отсекает мертвые соединения.
* **[`ws/tickets.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/ws/tickets.js):**
  * `handleTicket(ws, data)`: защита от спама (1 тикет в минуту на HWID). Записывает тикет в базу данных `tickets`, возвращает клиенту `ticket_success` и пересылает в Telegram бот с inline-кнопками управления.
* **[`ws/telemetry.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/ws/telemetry.js):**
  * Сохраняет статистику открытых разделов и время использования приложения.
  * `telemetry_hardware`: сохраняет конфигурацию ПК (CPU, GPU, RAM, OS) в таблицу `user_hardware`.
* **[`ws/clan.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/ws/clan.js):**
  * Мост между клиентом и Discord-ботом:
    * `link`: связывает HWID клиента с Discord Guild ID по 6-значному коду.
    * `get_status`: проверяет привязку текущего HWID к серверу Discord.
    * `unlink`: отвязывает аккаунт.
    * `proxy`: пересылает запросы от десктопного клиента напрямую в Discord-бот и возвращает результат с таймаутом 10 секунд.
    * `setBotConnection(ws)` / `handleBotMessage(ws, data)`: обслуживание сокета бота.

### 3.3. Сервисы (`services/`)

* **[`services/telegram.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/services/telegram.js):**
  * Интеграция с Telegram-ботом разработчика.
  * Отправка тикетов с интерактивными кнопками («Ответить», «В процессе», «Решено»).
  * Отправка crash-репортов с форматированным стеком ошибок.
  * При ответе администратора в Telegram бот находит клиента по WebSocket и отправляет ему нотификацию `notification`.
* **[`services/crypto.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/services/crypto.js):**
  * Генерация и проверка криптографических подписей манифестов (ECDSA).

### 3.4. База данных SQLite (`db/`)

* **[`db/schema.sql`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/db/schema.sql) / `database.sqlite`:**
  * Таблица `tickets` (id, hwid, message, logs, status, created_at).
  * Таблица `telemetry` (id, hwid, sections_opened, time_spent, created_at).
  * Таблица `user_hardware` (hwid PRIMARY KEY, cpu, gpu, ram, os, updated_at).
  * Таблица `clan_links` (hwid PRIMARY KEY, guild_id, linked_at).

---

## 4. Дискорд-бот: Discord_Hub

**Расположение:** `C:\Users\Developer\source\repos\Discord_Hub`  
**Стек:** Node.js, Discord.js v14, Prisma ORM, SQLite (`prisma/dev.db`).

### 4.1. Команды и обработчики

* **[`src/commands/hub_link.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/hub_link.js):**
  Слеш-команда `/hub_link` (для администраторов). Запрашивает у сервера генерацию 6-значного кода привязки (срок действия 15 минут) и выдает его в приватном сообщении.
* **[`src/commands/setup_panels.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/setup_panels.js):**
  Отправка интерактивных эмбедов с кнопками для подачи заявок в клан (`CLAN_APP`) и рекламы (`ADVERTISEMENT`).
* **[`src/commands/vote.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/vote.js) & [`wipe_vote.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/wipe_vote.js):**
  Запуск опросов и голосований за сервер на следующий вайп Rust.
* **[`src/commands/profile.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/profile.js):**
  Отображение карточки игрока: время в голосовых каналах, сообщения, сыгранные вайпы.
* **[`src/events/voiceStateUpdate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/voiceStateUpdate.js):**
  Автоматический подсчет и логирование времени участников в голосовых каналах Discord (сохранение длительности сессий в Prisma).
* **[`src/events/messageCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/messageCreate.js):**
  Инкремент счетчика текстовых сообщений пользователя для аналитики клана.
* **[`src/events/interactionCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/interactionCreate.js):**
  Маршрутизация слеш-команд, кликов по кнопкам и модальных окон тикетов/заявок.

### 4.2. Связка с сервером (`serverConnection.js`)

* **[`src/services/serverConnection.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/serverConnection.js):**
  Подключается к `wss://industrial-hub.duckdns.org` как авторизованный бот.
  Обрабатывает прокси-запросы от десктопного клиента Industrial Hub:
  * `get_config` / `update_config`: получение и сохранение ролей, каналов, баннеров и шаблонов.
  * `get_roster`: собирает список всех участников гильдии, у которых есть клановые роли (Лидер, Зам, Коллер, Основной состав, Тестер, Фермер, Электрик, Строитель, Пилот).
  * `get_stats`: возвращает аналитику голосовой и текстовой активности мемберов.
  * `auto_setup`: автоматическое создание категорий, каналов и ролей на Discord сервере в один клик из программы.
  * `sync_permissions`: настройка прав доступа ко всем клановым комнатам.

### 4.3. Схема данных Prisma (`prisma/schema.prisma`)

* `GuildConfig`: Настройки сервера Discord (ID ролей, JSON названий ролей, JSON конфигов набора, рекламы, шаблонов вайпов, каналов).
* `UserStat`: Время в войсе (сек), кол-во сообщений, сыгранные вайпы, участие в голосованиях.
* `VoiceSession`: Сессии нахождения в войс-каналах (joinedAt, leftAt).
* `Application`: Заявки на вступление в клан.
* `Ticket`: Открытые тикеты поддержки или рекламы.
* `Vote`: Опросы и результаты голосований.

---

## 5. Потоки данных и протоколы взаимодействия

```
┌────────────────────────────────────────────────────────┐
│               INDUSTRIAL HUB (ELECTRON APP)            │
│  React UI <──IPC Bridge (preload.js)──> Electron Main  │
│                                                │       │
│                                    NativeHelper.exe    │
│                             (Gamma Ramp & Global Hook) │
└──────────────────────────┬─────────────────────────────┘
                           │
                 WebSocket │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────┐
│               INDUSTRIAL HUB SERVER (GERMANY)          │
│   • Express HTTP (Crash dumps, GitHub Webhooks)        │
│   • WebSocket Server (Auth, Telemetry, Tickets, Proxy) │
│   • SQLite Database                                    │
│   • Telegram Bot Service                               │
└──────────────┬──────────────────────────▲──────────────┘
               │                          │
      Telegram │                 WS Proxy │ 
      Bot API  │                          │
               ▼                          ▼
      ┌─────────────────┐       ┌────────────────────────┐
      │  Разработчик    │       │       DISCORD BOT      │
      │   в Telegram    │       │  Discord.js + Prisma   │
      └─────────────────┘       │  Voice/Chat Analytics  │
                                └────────────────────────┘
```

---

## 6. Памятка для ИИ-агента

1. **Запретные зоны:** НИКОГДА не сканировать и не менять `C:\Users\Developer\source\repos\BackUp`.
2. **Версионирование:** При любых изменениях кода клиента инкрементировать третью цифру версии (тестовую) в `package.json` (`2.x.+1`).
3. **Локализация:** Все видимые строки интерфейса добавлять через `react-i18next` в `src/i18n.js` для `ru`, `en`, `ua` (украинский ВСЕГДА `ua`).
4. **Стили:** Строгий светлый инженерный стиль (`#F8F9FA`, карточки `bg-white`, текст `slate-900/500`) и глубокий темный (`dark:bg-slate-900`), акцент `orange-500`.
5. **Пути Electron:** Всегда использовать `getRealAppPath()` через `process.env.PORTABLE_EXECUTABLE_DIR`, избегая временных папок `%TEMP%`.
6. **Безопасность Rust:** Все изменения `keys.cfg` и `client.cfg` предварять проверкой `isRustRunning()` и автосозданием резервной копии.
7. **Изменения сервера:** При правках в `Industrial Hub Server` предупреждать пользователя о необходимости загрузить файлы на немецкий сервер.

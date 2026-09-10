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
7. [История ключевых изменений (Changelog v2.7.20 – v2.7.36)](#7-история-ключевых-изменений-changelog)
8. [Дорожная карта и планы на будущее (Roadmap)](#8-дорожная-карта-и-планы-на-будущее-roadmap)

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
  * `shell:openFolder(folderPath)` / `shell:openPath(targetPath)` — безопасное открытие файла или папки в проводнике Windows без вызова `require` в коде рендерера.
  * `autoDetectRustPath()` — сканирует реестр Steam (`HKCU\Software\Valve\Steam\SteamPath`) и `libraryfolders.vdf`, возвращая путь к Rust.
  * `browseForRustPath()` — вызывает диалог выбора папки Windows.
  * `diagnostics:pingUrl(urlStr)` — замеряет HTTP/HTTPS отклик до заданного URL (timeout 3000ms).
  * `diagnostics:getHardwareInfo()` — собирает имя ПК, платформу, модель CPU, имя GPU (через CIM/WMI PowerShell), RAM, Uptime приложения и ОС (с точным распознаванием Windows 10 vs Windows 11 по номеру билда >= 22000).
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
  * `gamma:setDisplayGamma(brightnessLevel, deviceName)` — вызывает `NativeHelper.exe gamma <level> <display>` (при включении активирует фиксированную 100% калиброванную кривую из Electric Guide).
  * `gamma:registerHook(vkCode)` — запускает фоновый процесс `NativeHelper.exe hook <vkCode>`, слушает вывод `HOTKEY_PRESSED` и шлет событие `gamma:hotkey_pressed` в окно React.
  * `gamma:unregisterHook()` — завершает фоновый процесс перехвата хоткея.
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
  Состояние ночного видения: `isGammaEnabled`, `gammaBind`, `displays`, `selectedDisplay`, методы `enableGamma()`, `disableGamma()`, `toggleGamma()`. Ползунок ручной регулировки удален — яркость зафиксирована на 100% с калиброванной гамма-кривой из Electric Guide.
* **`NetworkContext.jsx` (`useNetwork`):**
  Управляет WebSocket-подключением к серверу:
  * Регулярный `heartbeat` каждую минуту (для поддержания активности через Nginx).
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
  * Интерактивная виртуальная клавиатура ANSI, визуализация назначенных клавиш.
  * **Разделение каталога на две секции:**
    1. *Короткие бинды* (вверху, 3 колонки) — простые команды (авто-бег, авто-добыча, kill, disconnect, clear, duck, auto-swim).
    2. *Длинные бинды* (внизу, 2 колонки) — широкие консольные команды (combatlog, FOV, sound mute, bind toggles) с комфортным чтением без обрезки текста.
* **[`Conveyors.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Conveyors.jsx) (Конвейеры):**
  * Менеджер промышленных фильтров Rust. Пресеты, кастомные категории с Drag & Drop (`@hello-pangea/dnd`), кнопка быстрого копирования конфига для мгновенной вставки в игру.
  * Счетчик популярности `🔥 {tpl.copyCount}` для каждого предмета/шаблона, сортировка по популярности, категория «Популярные».
* **[`Monuments.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Monuments.jsx) (Монументы):**
  Справочник РТ (Нефтяные вышки, Космодром, Военные туннели и др.). Необходимые карты доступа (зеленые, синие, красные), предохранители, радиация, CCTV коды (копирование в 1 клик), пошаговые решения головоломок.
* **[`Electricity.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Electricity.jsx) (Электрика):**
  Интерактивные схемы электрических цепей Rust (авто-турели, автоматическая печь, сигнализация рейда), расчет мощности (rW), интеграция с сайтом `Rustrician`.
* **[`Gamma.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Gamma.jsx) (Гамма):**
  Настройка ночного видения: выбор монитора, привязка глобального хоткея. Кнопки мгновенного включения/выключения вынесены в шапку приложения.
* **[`Graphics.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Graphics.jsx) (Графика):**
  Оптимизация FPS в игре: готовые пресеты (`Potato`, `Low`, `Medium`, `Ultra`, `Custom`), бэкапы `client.cfg`, проверка `isRustRunning()`.
* **[`Servers.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Servers.jsx) (Серверы):**
  Мониторинг серверов Industrial Hub, быстрый коннект через `steam://connect` и копирование команды консоли.
* **[`Settings.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Settings.jsx) (Настройки):**
  Смена языка (`ru`, `en`, `ua`), темы оформления, изменение пути к Rust, переключение канала обновлений (Main/Test с PIN `2136`), управление бэкапами, подача заявки спонсора, сброс настроек.
* **[`Developer.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/Developer.jsx) (Разработчик):**
  * Точное определение ОС (Windows 10 vs Windows 11 по номерам билдов >= 22000).
  * Диагностика железа (CPU, GPU, RAM, Uptime), сетевой тест (Ping 6 сервисов), целостность файлов (10 файлов программы, 2 файла Rust).
  * **Кнопка сброса счетчиков огоньков предметов (`Flame`):** обнуляет `copyCount: 0` для всех шаблонов конвейеров с динамической индикацией успеха.
  * Краш-тест, автообновление, Factory Reset, кредиты команды (`Kozak`, `Кактус`, `RS6`).
* **[`ClanManager.jsx`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/views/ClanManager.jsx) (Клан / Состав):**
  * Привязка к Discord-боту по коду `/hub_link`.
  * **Настойчивый онбординг:** предложение настроить бота при привязке и при входе во вкладку, пока настройка не завершена.
  * Стилизованные кнопки («Мастер настройки», «Сброс настроек», «Отвязать сервер») с четкой обводкой, контрастным фоном, скруглениями `rounded-xl` и иконками.
  * **Полное переключение языка бота (вкладка «Основное»):** карточка переключения языка бота (RU / EN). Сохраняет `language` в `GuildConfig`, адаптирует язык тикетов и эмбедов, и запускает последовательную верифицированную синхронизацию ролей.
  * **Последовательная синхронизация ролей с верификацией и Telegram-репортом:** при переключении языка бот поочередно обновляет имена привязанных ролей в Discord, выполняет fetch-проверку, при необходимости повторяет попытку (2 попытки). При неудаче отправляет экстренный отчет разработчику в Telegram (`/api/crash`) и информирует в UI.
  * **Удаление стандартных ролей:** возможность удалять стандартные роли (`Trash2`), скрывая их из сетки и отвязывая ID, с сохранением в `deletedRolesJson` и кнопкой восстановления.
  * **Выборочный сброс к заводским настройкам (Factory Reset):** модальное окно с выборочным сбросом разделов (роли, каналы, права, войсы, рекрутинг, реклама, основные данные) в SQLite через Prisma.
  * Состав (ростер), роли, статистика голосового онлайна участников, опросы по вайпам.

---

### 2.5. Компоненты (`src/components/`)

* `TitleBar.jsx` / `Header.jsx`: верхняя панель, статус сервера, онлайн игроков и **компактные заметные кнопки переключения ночной гаммы** (`Eye` / `EyeOff`), доступные на любой вкладке.
* `SetupWizardModal.jsx`: интерактивный мастер настройки бота для Discord сервера.
* `Card.jsx`: базовая карточка инженерного стиля с подсветкой.
* `FullKeyboard.jsx`: полноразмерная интерактивная клавиатура с поддержкой цветовых меток типов команд.
* `ConveyorEditorModal.jsx`: модальное окно создания и редактирования фильтра конвейера с поиском по базе предметов и валидацией обязательных полей.
* `RustPathModal.jsx`: диалог привязки папки игры при первом запуске.
* `SetupWizard.jsx`: пошаговый мастер первой настройки (язык, тема, папка Rust).
* `SplashScreen.jsx`: вступительная анимация при запуске программы.
* `SuggestBindModal.jsx`: предложение бинда в общую базу.
* `SupportTicketModal.jsx`: создание тикета поддержки (отправляется на сервер и в Telegram разработчику).
* `FeedbackButton.jsx`: плавающая кнопка обратной связи.
* `ToastContainer.jsx`: контейнер нотификаций.
* `ErrorBoundary.jsx`: ловушка React-ошибок с автоматической отправкой стека на сервер.
* `RoleSelect.jsx` / `ChannelSelect.jsx`: селекты ролей и каналов с атрибутом `required` для валидации.

---

### 2.6. Базы данных и статика (`src/data/`)

* `itemsDB.ts`: База предметов Rust (shortname, категории, динамический импорт иконок).
* `items_ru.json`: Локализованные русские названия всех внутриигровых предметов.
* `defaultConveyors.js`: Готовые шаблоны конвейеров и категории по умолчанию (с `copyCount: 0`).
* `monumentsData.js`: Данные монументов Rust (радиация, карты, шаги, CCTV).
* `electricityData.js`: Данные электросхем Rust.
* `i18n.js`: Централизованные словари локализации (`ru`, `en`, `ua`).

---

### 2.7. Утилиты (`src/utils/`)

#### 1. [`formValidation.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/utils/formValidation.js) (Универсальная валидация форм)
* `validateForm(containerOrForm) -> boolean`:
  * Сканирует форму на обязательные незаполненные поля (`input[required]`, `textarea[required]`, `select[required]`, `[data-required="true"]`).
  * Сортирует найденные ошибки сверху вниз по координатам на экране (`getBoundingClientRect().top`).
  * Плавно скроллит страницу или модалку к **первому незаполненному полю** (`scrollIntoView({ behavior: 'smooth', block: 'center' })`), фокусирует его, включает красную рамку со свечением (`.input-error-highlight`) и шейк-анимацию (`.animate-field-shake`).
  * Подключает слушатель ввода, моментально снимающий ошибку при начале заполнения.
* `scrollToAndHighlight(element, shouldFocus)`: вспомогательный метод подсветки и скролла.

#### 2. [`SmartPatcher.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/utils/SmartPatcher.js):
* Функция `checkUpdates(addLog)`:
  * Запрашивает GitHub Releases API (`kozhaki-vik/industrial-hub-releases`) с Cache-Buster (`?t=${Date.now()}`).
  * Канал `main`: `/releases/latest`. Канал `test`: `/releases` (берется первый релиз, включая Prerelease).
  * Сравнивает трехзначную версию (Major.Main.Test).
  * Вызывает `network:apply-exe-update` с прямой ссылкой на скачивание `.exe`.

#### 3. [`keyboardMap.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub/src/utils/keyboardMap.js):
* Физическая раскладка ANSI клавиатуры (5 рядов, спецклавиши, скан-коды и VK-коды).

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
  * `POST /api/webhook/github`: Прием вебхуков от GitHub репозитория `kozhaki-vik/industrial-hub-releases`. Извлекает номер версии из `release.tag_name`, вызывает `setLatestVersion()` и рассылает сигнал `update_available` всем активным WebSocket клиентам в реальном времени.
  * `syncLatestVersion()`: На старте сервера опрашивает GitHub API и синхронизирует актуальный номер релиза, исключая рассинхронизацию версий.
  * `GET /version.json`: Редирект на `/updates/version.json`.
  * `WSS /`: WebSocket сервер с компрессией `perMessageDeflate`.

### 3.2. WebSocket обработчики (`ws/`)

* **[`ws/connection.js`](file:///C:/Users/dimav/source/repos/Industrial%20Hub%20Server/ws/connection.js):**
  * Ведет учет активных клиентов (`activeClients` Map).
  * `setLatestVersion(version)`: Сохраняет актуальную версию в память и файл `data/updates/version.json`.
  * `getLatestVersion()`: Возвращает актуальную версию клиентам при авторизации.
  * `handleConnection(ws, req)`: парсит IP, инициирует heartbeat, отправляет `auth_success` с реальной версией сервера.
  * `startHeartbeatChecker(wss)`: каждые 60 секунд проверяет сокеты, разделяя обычные клиенты и Discord-бота (`ws.isBot`).
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
  * Интеграция с Telegram-ботом разработчика (тикеты, краши, ответы клиентам).
  * Polling с таймаутом 30 секунд (предотвращает ошибки `502 Bad Gateway` / `504 Gateway Timeout`).
  * Троттлинг логирования ошибок соединения (не чаще 1 раза в 60 секунд).
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
  * Автоматический подсчет и логирование времени участников в голосовых каналах Discord (сохранение длительности сессий в Prisma).
  * **Динамические голосовые каналы (Join to Create):** при входе пользователя в канал-генератор бот автоматически создаёт временный голосовой канал пати (по шаблону с именем пользователя и лимитом мест), перемещает туда пользователя и регистрирует канал в базе данных `TempVoiceChannel`. При выходе последнего участника пустая комната мгновенно удаляется из Discord и базы.
* **[`src/events/ready.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/ready.js):**
  * Синхронизация серверов и кэширование участников гильдии.
  * Очистка осиротевших временных голосовых комнат из базы при старте бота.
* **[`src/events/messageCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/messageCreate.js):**
  Инкремент счетчика текстовых сообщений пользователя для аналитики клана.
* **[`src/events/interactionCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/interactionCreate.js):**
  Маршрутизация слеш-команд, кликов по кнопкам и модальных окон тикетов/заявок.

### 4.2. Связка с сервером (`serverConnection.js`)

* **[`src/services/serverConnection.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/serverConnection.js):**
  * Подключается к `wss://industrial-hub.duckdns.org` как авторизованный бот.
  * **Keep-Alive Heartbeat:** каждые 25 секунд отправляет `bot_heartbeat`, исключая разрыв соединения прокси-сервером Nginx (`proxy_read_timeout 120s`). Соединение поддерживается стабильно 24/7.
  * Обрабатывает прокси-запросы от десктопного клиента Industrial Hub:
    * `get_config` / `update_config`: получение и сохранение ролей, каналов, баннеров и шаблонов.
    * `get_roster`: собирает список всех участников гильдии, у которых есть клановые роли (Лидер, Зам, Коллер, Основной состав, Тестер, Фермер, Электрик, Строитель, Пилот).
    * `get_stats`: возвращает аналитику голосовой и текстовой активности мемберов.
    * `auto_setup`: автоматическое создание категорий, каналов и ролей на Discord сервере в один клик из программы.
    * `sync_permissions`: настройка прав доступа ко всем клановым комнатам.
    * `get_dynamic_voice`: получение параметров динамических войсов, списка каналов и активных комнат с участниками (ID, никнейм, аватар, mute/deaf).
    * `update_dynamic_voice`: сохранение конфигурации динамических комнат.
    * `auto_setup_dynamic_voice`: создание в Discord категории `🔊 ГОЛОСОВЫЕ КОМНАТЫ` и канала `➕ Создать пати` в 1 клик с сохранением привязок.
    * `manage_dynamic_room`: администрирование комнат (удаление комнаты `delete_room`, изменение лимита мест `set_limit`, отключение тиммейта `kick_member`).
    * `sync_single_role_verified`: поочередное переименование ролей в Discord при смене языка с двойной верификацией (`role.fetch()`), авто-повтором и аварийным отчетом в Telegram через `/api/crash` при неудаче.
    * `factory_reset`: выборочный сброс конфигурации гильдии (`roles`, `channels`, `permissions`, `voice`, `recruitment`, `ads`, `general`) в SQLite через Prisma.

### 4.3. Схема данных Prisma (`prisma/schema.prisma`)

* `GuildConfig`: Настройки сервера Discord (ID ролей, JSON названий ролей, JSON конфигов набора, рекламы, шаблонов вайпов, каналов, `dynamicVoiceConfigJson`, `language` ('ru'|'en'), `deletedRolesJson`).
* `TempVoiceChannel`: Временные динамические комнаты (`guildId`, `channelId`, `ownerId`, `ownerName`, `createdAt`). Сохраняются в SQLite, обеспечивая защиту от зависших комнат даже после перезапуска бота.
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
                 (Heartbeat│ (Crash Reports, Updates)
                  every 60s│
                           ▼
┌────────────────────────────────────────────────────────┐
│               INDUSTRIAL HUB SERVER (GERMANY)          │
│   • Nginx Reverse Proxy (proxy_read_timeout)           │
│   • Express HTTP (Crash dumps, GitHub Webhooks)        │
│   • WebSocket Server (Auth, Telemetry, Tickets, Proxy) │
│   • Version Auto-Sync (Webhook + GitHub API)           │
│   • SQLite Database                                    │
│   • Telegram Bot Service (polling timeout 30s)         │
└──────────────┬──────────────────────────▲──────────────┘
               │                          │
      Telegram │                 WS Proxy │ Keep-Alive
      Bot API  │                          │ Heartbeat (25s)
               ▼                          ▼
      ┌─────────────────┐       ┌────────────────────────┐
      │  Разработчик    │       │       DISCORD BOT      │
      │   в Telegram    │       │  Discord.js + Prisma   │
      │                 │       │  Voice/Chat Analytics  │
      └─────────────────┘       └────────────────────────┘
```

---

## 6. Памятка для ИИ-агента

1. **СТРОГИЙ ЗАПРЕТ:** Категорически запрещено заходить, сканировать или изменять любые файлы в `C:\Users\Developer\source\repos\BackUp`.
2. **Версионирование:** При любых изменениях клиента инкрементировать третью цифру версии (тестовую) в `package.json` (`2.x.+1`). Выпуск Main-сборки — только по прямому указанию пользователя.
3. **Локализация (i18n):** Приложение поддерживает 3 языка (`ru`, `en`, `ua`). Русский — по умолчанию. Украинский ВСЕГДА сокращается как `ua` (никогда `uk`). Все строки интерфейса обязаны быть в `src/i18n.js`.
4. **Стилистика интерфейса:** Строгий чистый инженерный стиль.
   - Light: `#F8F9FA`, карточки `bg-white`, текст `slate-900 / 500`.
   - Dark: `dark:bg-slate-900`, текст `slate-100 / 400`.
   - Акцент: Industrial Orange (`orange-500`).
   - Кнопки управления должны иметь четкую контрастную обводку (`border-slate-200 dark:border-slate-700`), читаемый фон и скругления `rounded-xl` / `rounded-lg`.
5. **Валидация форм (Обязательное правило):** При отправке, сохранении или применении любых форм использовать `validateForm()` из `src/utils/formValidation.js`. Невалидные поля подсвечиваются красным (`.input-error-highlight`), анимируются шейком (`.animate-field-shake`), а страница автоматически плавно скроллится к первому незаполненному полю сверху вниз.
6. **Гамма (Ночное видение):** Кнопки быстрого переключения гаммы (`Eye` / `EyeOff`) всегда размещаются в шапке приложения (`TitleBar.jsx`). Ручной ползунок яркости отключен — гамма фиксирована на 100% с проверенной плавной цветокоррекцией из Electric Guide.
7. **Пути Electron:** Всегда использовать `getRealAppPath()` через `process.env.PORTABLE_EXECUTABLE_DIR`, чтобы избежать работы во временной директории `%TEMP%`.
8. **Безопасность Rust:** Любые модификации файлов `keys.cfg` и `client.cfg` предварять проверкой `isRustRunning()` и автосозданием бэкапа в `cfg/industrial_hub_backups/`.
9. **Серверные изменения:** При правках в `Industrial Hub Server` или `Discord_Hub` обязательно предупреждать пользователя о необходимости загрузить файлы на удаленный сервер в Германии и перезапустить процессы.
10. **WebSocket Heartbeat:** Все постоянные соединения (клиент и бот) обязаны слать heartbeat с интервалом 25–60 секунд, иначе Nginx сбрасывает соединение по `proxy_read_timeout`.
11. **Сборка и публикация:**
    - `npm run build` -> `npx electron-builder --win`.
    - Подпись цифровым сертификатом (`Thumbprint: CF5FD177247FC2EEB561B69BE223EF0757218C08`).
    - Публикация скриптом `.\upload_release.ps1 -Version "X.X.X" -FilePath "release\Industrial Hub X.X.X.exe" -IsPreRelease $true`.
    - Обязательный `git commit -am "..."` и `git push origin main`.

---

## 7. История ключевых изменений (Changelog)

* **v2.7.37 (Динамические голосовые каналы Join-to-Create):**
  * В Discord_Hub реализована система автоматических временных комнат пати: при заходе в канал-генератор создается персональный голосовой канал в заданной категории, пользователь перемещается туда, а пустая комната автоматически удаляется при выходе тиммейтов.
  * В Prisma добавлена модель `TempVoiceChannel` и поле `dynamicVoiceConfigJson`, что предотвращает зависание комнат даже при перезапуске бота.
  * В десктопном клиенте Industrial Hub во вкладке Клан Менеджера добавлена новая вкладка «Динамические войсы» (`voice`):
    - Включение/выключение функционала.
    - Авто-настройка каналов в Discord в один клик (создание категории «🔊 ГОЛОСОВЫЕ КОМНАТЫ» и генератора «➕ Создать пати»).
    - Селекторы категорий и каналов, шаблон названия (`🔊 Пати {user}`), лимит участников.
    - Мониторинг активных комнат в реальном времени со списком участников, статусами микрофона/наушников и кнопками управления (удаление комнаты, смена лимита мест, кик участника).
  * Реализована полная локализация на русский, английский и украинский языки (`ru`, `en`, `ua`).
* **v2.7.36 (Сброс счетчиков популярности конвейеров):**
  * В Панель разработчика (`Developer.jsx`) добавлена кнопка «Сбросить огоньки предметов» с иконкой `Flame`.
  * Обнуляет `copyCount: 0` для всех шаблонов конвейеров в сторе с подтверждением и динамической анимацией успеха.
  * Устранена проблема 120-секундных разрывов Discord-бота через добавление `bot_heartbeat`.
  * Устранена застрявшая версия сервера `2.7.7` через авто-синхронизацию с GitHub Releases.
  * Увеличен таймаут Telegram long-polling до 30s.
* **v2.7.45 (Оптимизация порядка разделов Клан Менеджера):**
  * Обновлен порядок разделов в левом сайдбаре: Основное -> Роли -> Каналы -> Наборы -> Голосования -> Права Доступа -> Состав -> Статистика -> Модерация -> Логирование -> Динамические войсы -> Реклама.
* **v2.7.44 (Улучшение панели быстрых действий и очистка названий языков бота):**
  * Панель «Быстрые действия» во вкладке «Логирование» получила выразительный дизайн: стильный бейдж с иконкой `Zap`, индивидуальные иконки для каждого действия (`CheckCheck` — Включить все, `Ban` — Выключить все, `RotateCcw` — Сбросить каналы) и цветные интерактивные ховер-состояния с сохранением компактного размера кнопок.
  * Убраны дублирующиеся приписки и системные коды флагов `ru`, `gb`, `(RU)`, `(EN)` в переключателе языка Discord-бота («Основное») — кнопки теперь имеют чистые названия `Русский` и `English`.
* **v2.7.43 (Удаление выбора канала логов из вкладки «Каналы»):**
  * Из вкладки «Настройки каналов» (`channels`) удалена карточка выбора «Канал логов» — управление каналами аудита и логов теперь централизованно осуществляется исключительно во вкладке «Логирование».
  * В матрице прав доступа (`permissions`) добавлено бесшовное разрешение ID канала логов из `loggingConfigJson.defaultChannelId` при отсутствии в `channelsConfigJson`.
  * Проверка готовности конфигурации бота (`isBotConfigured`) расширена для учета `loggingConfigJson.defaultChannelId`.
* **v2.7.42 (Универсальное автосохранение с дебаунсом во всех вкладках Клан Менеджера):**
  * Полный отказ от необходимости нажимать кнопку «Сохранить изменения» — все настройки теперь сохраняются автоматически при выходе из поля ввода (`onBlur`) или выборе опции (`onChange` селектов, чекбоксов, тумблеров).
  * Интеллектуальный движок очереди сохранения с защитой от спама и пакетов (минимальный интервал между сетевыми запросами — 1 секунда).
  * Быстрые серии изменений аккумулируются и отправляются единым батчем по истечении 1-секундного интервала.
  * При непрерывном наборе текста без снятия фокуса работает 1000мс дебаунс.
  * Все вкладки конфигурации подключены к единой системе: `general`, `roles`, `channels`, `permissions`, `voice`, `recruitment`, `votes`, `ads`, `logs`, `moderation`.
  * Компонент `SaveButton` трансформирован в информативный статус-бар («✓ Все изменения сохраняются автоматически», «Синхронизация с сервером...») с компактной кнопкой «Сохранить сейчас» для мгновенного сброса очереди.
  * Локализация строк автосохранения на RU, EN, UA в `i18n.js`.
* **v2.7.41 (Система логирования и автоматическая модерация):**
  * **Вкладка «Логирование» (Audit Logs):**
    * Канал логов по умолчанию с кнопкой быстрого создания канала `📜・логи-сервера` в Discord в 1 клик.
    * Быстрые массовые действия: «Включить все», «Выключить все», «Сбросить каналы на по умолчанию».
    * 5 категорий событий аудита: Участники (вход, выход, кик, бан, разбан, никнейм), Сообщения (удаление, редактирование), Роли (выдача/снятие, создание, изменение, удаление), Каналы (создание, изменение, удаление), Голосовые каналы (подключение, отключение, перемещение, серверный мут/глушение).
    * Индивидуальный выбор канала для каждого события с наследованием основного канала.
  * **Вкладка «Модерация» (Auto-Moderation):**
    * Интеллектуальная защита от спама упоминаниями (Anti-Mass-Mention) со скользящим временным окном (Sliding Window).
    * Настройка порога упоминаний, временного окна (в секундах) и фильтра подсчета (@user, @role, @everyone/@here).
    * 4 типа санкций: Предупреждение (Warn), Таймаут/Мут (Timeout с выбором длительности от 1 мин до 1 недели), Кик (Kick), Бан (Ban).
    * Автоматическое удаление сообщений-нарушителей, настраиваемый текст предупреждения.
    * Выделенный канал для отчетов модерации (с подробными эмбедами нарушений).
    * Интерактивные белые списки (Whitelist): исключение ролей и каналов из проверок анти-спама (администраторы исключаются автоматически).
  * **Discord Bot (`Discord_Hub`):**
    * Сервисы `loggerService.js` и `moderationService.js`.
    * 15 обработчиков событий Discord с безопасным извлечением Audit Logs и проверкой прав бота.
    * Действие `create_log_channel` через WebSocket прокси.
    * Добавлены поля `loggingConfigJson` и `moderationConfigJson` в схему Prisma `GuildConfig`.
    * Интеграция секций `logging` и `moderation` в выборочный сброс настроек (Factory Reset).
  * **Локализация:** Полная поддержка RU, EN и UA (`i18n.js`).
* **v2.7.40 (Исправление блокировки ввода после сброса и фикс i18n):**
  * Добавлен `noValidate` на все формы в `ClanManager.jsx`, устранена блокировка ввода нативным всплывающим окном Chromium `❗ Заполните это поле.`.
  * Валидация полностью переведена на `validateForm()` из `formValidation.js` с плавным скроллом и подсветкой ошибок.
  * Санитизация полей `name` и `discordLink` при получении ответов сервера (`sanitizeClanConfig`), предотвращение `null` значений.
  * Добавлены недостающие переводы `clan_general_bot_lang_title` и `clan_general_bot_lang_desc` в `i18n.js` (RU, EN, UA).
  * Оптимизирован компонент `SaveButton` (вынесен наружу для предотвращения пересоздания DOM на каждый ввод).
* **v2.7.39 (Локализация бота, верификация ролей и Factory Reset):**
  * Перенос переключения языка бота в «Основное», полная локализация сообщений и тикетов бота в Discord.
  * Поочередное переименование ролей на сервере Discord с повторной попыткой при сбое и экстренным репортом в Telegram.
  * Удаление стандартных ролей в корзину и их быстрое восстановление.
  * Выборочный сброс к заводским настройкам (Factory Reset) через модальное окно.
* **v2.7.38 (Двусторонняя синхронизация ролей, кастомные роли и левый сайдбар):**
  * **Левый вертикальный сайдбар (`w-60`):** Заменил тесную горизонтальную полосу табов со стрелками прокрутки в Клан Менеджере на аккуратную левую панель со статусом синхронизации.
  * **Двусторонняя синхронизация ролей:**
    * При выборе роли из Discord её реальное имя из Discord автоматически подставляется в название роли в боте/программе.
    * При изменении имени роли в программе (по событию `onBlur`) бот мгновенно переименовывает роль на самом сервере Discord (`role.setName`).
  * **Выборочное создание ролей в Discord:** Кнопка «Создать» внутри каждой карточки роли позволяет в 1 клик создать роль в Discord и сразу же привязать её.
  * **Кастомные роли:** Возможность создавать любые дополнительные роли (шаблоны), привязывать к Discord и удалять ненужные.
  * **Быстрые языковые шаблоны (RU / EN):** Кнопки быстрого заполнения стандартных названий ролей на русском и английском языках.
  * **Бесшовное автосохранение:** Все изменения мгновенно сохраняются без необходимости жать кнопку «Сохранить».
* **v2.7.37 (Динамические голосовые каналы / Пати-румы):**
  * Добавлена вкладка «Динамические войсы» в Клан Менеджер.
  * Автоматическое создание временных каналов при входе в генератор («➕ Создать пати») и автоматическое удаление при выходе всех участников.
  * Управление активными комнатами из десктопного клиента: просмотр участников (статус микрофона/наушников), изменение лимита мест, кик участников, удаление комнат.
  * Кнопка «Авто-настройка каналов в Discord» для автоматического создания категории и канала-генератора.
* **v2.7.35 (Двухсекционный каталог биндов):**
  * Разделение каталога на короткие команды (вверху, 3 колонки) и длинные консольные команды (внизу, 2 колонки).
* **v2.7.34 (Фиксация ночной гаммы):**
  * Удален ползунок ручной регулировки гаммы — яркость зафиксирована на 100%.
  * Интегрирована корректная калибровка цветов из Electric Guide.
* **v2.7.33 (Редизайн кнопок Клан Менеджера):**
  * Кнопки «Мастер настройки» и «Отвязать сервер» получили четкую обводку, контрастный фон, скругления `rounded-xl` и иконки.
* **v2.7.32 (Универсальная валидация форм с автоскроллом):**
  * Создан модуль `formValidation.js` с авто-скроллом к первому невалидному полю сверху вниз и шейк-анимацией.
  * Интегрирован во все формы приложения: Клан Менеджер, Настройки, Тикеты, Обратная связь, Предложение бинда, Конвейеры.
* **v2.7.30 – v2.7.31 (Онбординг настройки бота):**
  * Добавлено настойчивое напоминание запустить мастер настройки бота при входе во вкладку «Клан Менеджер», пока бот не настроен.
* **v2.7.27 – v2.7.29 (Диагностика ОС и фикс проводника):**
  * Добавлено точное распознавание Windows 10 vs Windows 11 по номеру билда (>= 22000).
  * Исправлен краш `ReferenceError: require is not defined` при открытии папок через безопасный IPC `shell:openPath`.
* **v2.7.20 – v2.7.26 (Кнопки гаммы в шапке):**
  * Перенос кнопок включения/выключения гаммы в шапку приложения (`TitleBar.jsx`).

---

## 8. Дорожная карта и планы на будущее (Roadmap)

1. **Клан Менеджер и автоматизация Rust:**
   - **Rust+ Интеграция:** Прием сигналов тревоги (Smart Alarm) через Rust+ Companion API и мгновенная отправка алерта в Discord-канал рейда с упоминанием роли боевого состава.
   - **Интерактивная карта рейда:** Отображение статуса базы, турелей и ловушек в реальном времени внутри десктопного клиента.
   - **Голосовые комнаты:** Автоматическое создание временных голосовых каналов (пати-румы) при заходе игроков в Discord.
2. **Система профилей и облачная синхронизация:**
   - Создание персональных профилей настроек (Бинды + Графика + Конвейеры) с возможностью сохранения в облако через сервер Industrial Hub и восстановления на любом ПК по HWID/аккаунту.
3. **Улучшения гаммы:**
   - Поддержка индивидуальных профилей калибровки под разные типы матриц мониторов (IPS, VA, OLED, TN).
   - Поддержка составных хоткеев с модификаторами (`Ctrl + Key`, `Alt + Key`).
4. **Установщик и экосистема:**
   - Создание единого современного установщика с авто-ассоциацией ссылок `industrial-hub://` для импорта биндов и схем в один клик из браузера.
   - Автоматическая очистка временных файлов и логов при выходе из приложения.
5. **База знаний и калькуляторы:**
   - Добавление интерактивного калькулятора рейдов (стоимость взрыва стен, дверей, турелей в сере/ракетах/C4).
   - Расширение базы пресетов конвейеров под свежие ежемесячные обновления Rust (новые предметы, дроны, промышленные крафтеры).

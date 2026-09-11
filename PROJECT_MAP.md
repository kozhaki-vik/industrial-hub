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
7. [История ключевых изменений (Changelog v2.7.20 – v2.7.53)](#7-история-ключевых-изменений-changelog)
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
  * Привязка к Discord-боту по одноразовому коду `/hub_link`.
  * **Зафиксированный сайдбар навигации:** 12 разделов (Основное, Роли, Каналы, Наборы, Права Доступа, Состав, Статистика, Модерация, Логирование, Динамические войсы, Реклама, Голосования). Сайдбар строго зафиксирован (`w-64`, шрифт `text-sm font-medium`, иконки `w-4 h-4`) без прокрутки; независимый вертикальный скролл (`overflow-y-auto`) включен только для области содержимого вкладок.
  * **Фоновое автосохранение:** все поля ввода, тумблеры и селекторы сохраняются автоматически при потере фокуса (`onBlur`) или изменении (`onChange`) с дебаунсом 1000мс и батчингом. Нижняя панель сохранения удалена; статус пишется в шапке сайдбара.
  * **Универсальные ползунки ToggleSwitch:** повсеместное использование анимированных переключателей с явной индикацией «Вкл» / «Выкл» вместо стандартных чекбоксов.
  * **Система предупреждений участников (Clan Warnings):**
    - Вкладка «Статистика»: интерактивная колонка со статусом варнов (`⚠️ N/3` или `✓ 0`). Клик открывает модальное окно `UserWarningsModal` с историей варнов, формой быстрой выдачи варна модератором и кнопками снятия/очистки.
    - Вкладка «Модерация»: блок настроек варнов (порог 3/4/5, авто-наказание: таймаут 1ч/1д/1нед, кик, бан) и сводная таблица всех активных предупреждений клана.
  * **Расширенные клановые роли:** Коллер (`Coller`), Фармер (Ресурсы), Фермер (Урожай) (`plantFarmerRoleId`), Спонсор (`sponsorRoleId`).
  * **Скрининг кандидатов и мульти-Steam:**
    - Извлечение всех профилей Steam (`/(7656119\d{10})/g`), суммирование проверенных часов в Rust `10000 ч. (Steam: 9000 ч. (5000 + 1000 + 3000))`, проверка банов по каждому аккаунту.
    - Проверка минимального порога часов строго по анкете.
    - Карточка кандидата со всеми данными отправляется в аудит даже при `silentAutoReject: true`.
  * **Интерактивный журнал поданных анкет:** фильтрация по статусам (Ожидают, Приняты, Отклонены, Авто-отказ).
  * **Синхронизация и сброс:** последовательная верифицированная синхронизация имен ролей с Discord при смене языка, выборочный сброс настроек (Factory Reset).

---

### 2.5. Компоненты (`src/components/`)

* `Header.jsx`: верхняя панель, статус сервера, онлайн игроков и навигация по разделам.
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
* `ToggleSwitch`: универсальный интерактивный анимированный переключатель-ползунок Вкл/Выкл с акцентными стилями и поддержкой темной темы.
* `UserWarningsModal`: модальное окно деталей и управления предупреждениями участника клана (профиль, история варнов, форма выдачи, снятие и очистка).

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
    * **Server-Side Sliding-Window Rate Limiting:** Ограничение не более 5 прокси-запросов в секунду на 1 HWID. Защищает бота от блокировок Discord 429 Too Many Requests при случайном или намеренном спаме кнопок в клиенте. При превышении возвращает информативную ошибку клиенту без обращения к Discord API. Устаревшие таймстемпы очищаются фоновым сборщиком каждые 60 секунд.
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
**Стек:** Node.js, Discord.js v14, Prisma ORM, SQLite (`prisma/dev.db`), PostgreSQL (`prisma/schema.postgresql.prisma`).

### 4.1. Команды и обработчики

* **[`src/commands/hub_link.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/hub_link.js):**
  Слеш-команда `/hub_link` (для администраторов). Запрашивает у сервера генерацию 6-значного кода привязки (срок действия 15 минут) и выдает его в приватном сообщении.
* **[`src/commands/setup_panels.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/setup_panels.js):**
  Отправка интерактивных эмбедов с выпадающим списком специализаций для подачи заявок в клан (`CLAN_APP`) и кнопками рекламы (`ADVERTISEMENT`).
* **[`src/commands/vote.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/vote.js) & [`wipe_vote.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/wipe_vote.js):**
  Запуск опросов и голосований за сервер на следующий вайп Rust. Полная синхронизация как через слэш-команды в чате Discord, так и удаленно из десктопного приложения Industrial Hub.
* **[`src/commands/profile.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/profile.js):**
  Отображение карточки игрока: время в голосовых каналах, сообщения, сыгранные вайпы, участие в голосованиях, кликабельная ссылка на профиль Steam и кнопка перехода в Battlemetrics для проверки часов и банов.
* **[`src/commands/link_steam.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/commands/link_steam.js):**
  Слеш-команда `/link_steam` для привязки SteamID64 (или ссылки на профиль Steam) к аккаунту Discord с сохранением в `UserStat.steamId`, а также возможностью отвязки.
* **Локализация слэш-команд:** Все команды имеют полную интернационализацию названий и описаний (`setNameLocalizations`, `setDescriptionLocalizations`) для языков RU, EN, UA.

### 4.2. События и сервисы

* **[`src/events/interactionCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/interactionCreate.js):**
  * Защита от падений в ЛС: `if (!interaction.guild)` возвращает вежливое предупреждение об ограничении работы только серверами.
  * Маршрутизация слэш-команд, кликов по кнопкам и модальных окон.
  * При выборе специализации из меню набора (`ticket_create_menu`) открывает нативный Discord Modal (`showClanAppModal`).
  * При отправке модалки (`modal_clan_app_*`) передает управление в `handleClanAppModalSubmit`.
* **[`src/events/guildMemberAdd.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/guildMemberAdd.js):**
  * **Anti-Raid защита (Burst Detection):** трекер входов со скользящим окном 10 секунд. При наплыве 5+ участников генерирует тревожное уведомление в аудит-канал.
  * **Проверка свежих аккаунтов:** аккаунты моложе 3 дней помечаются предупреждением в журнале аудита.
  * **Авто-роль новичка:** автоматическая выдача настроенной стартовой роли (`trialRoleId` / `welcomeRoleId`) с проверкой прав бота.
  * **Приветственный эмбед:** публикация карточки приветствия с аватаром и счетчиком онлайна.
* **[`src/events/voiceStateUpdate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/voiceStateUpdate.js):**
  * Автоматический подсчет и логирование времени участников в голосовых каналах Discord (сохранение сессий в Prisma).
  * **Динамические голосовые каналы (Join to Create):** автосоздание временных комнат при входе в генератор и мгновенное удаление пустых комнат.
* **[`src/events/ready.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/ready.js):**
  * Синхронизация серверов, кэширование участников, очистка осиротевших временных голосовых комнат из базы при старте бота.
* **[`src/events/messageCreate.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/events/messageCreate.js):**
  * Учет текстовых сообщений для аналитики, проверка фильтра запретных слов и анти-спама.
  * Полное отсутствие бэкдоров: все права администрирования строго привязаны к ролям гильдии.
* **[`src/services/warnService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/warnService.js):**
  * Централизованный сервис управления системой предупреждений участников клана (Clan Warnings).
  * `addWarn(guildId, userId, moderatorId, reason)`: сохранение предупреждения в PostgreSQL, подсчет активных варнов участника, проверка настраиваемого порога (`warnsThreshold`: 3, 4 или 5) и автоматическое исполнение санкции:
    - Таймаут (1 час, 1 день, 1 неделя) через Discord REST API (`member.timeout()`).
    - Исключение участника с сервера (`member.kick()`).
    - Блокировка на сервере (`guild.members.ban()`).
  * `removeWarn(warnId, moderatorId)`: деактивация отдельного предупреждения.
  * `clearUserWarns(guildId, userId, moderatorId)`: пакетная очистка всех активных варнов пользователя.
  * `getUserWarnings(guildId, userId)` & `getClanWarnings(guildId, limit, offset)`: выборка истории нарушений.
  * Автоматическая отправка уведомлений нарушителю в личные сообщения Discord и подробный отчет в аудит-канал.
* **[`src/services/ticketService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/ticketService.js):**
  * `showClanAppModal`: нативное всплывающее окно Discord (`ModalBuilder`) с полями возраста, часов в Rust, Steam и опыта.
  * `handleClanAppModalSubmit`: парсинг всех указанных SteamID64 (`extractSteamIds`), суммирование проверенных часов в игре со всех профилей (`10000 ч. (Steam: 9000 ч. (5000 + 1000 + 3000))`), проверка дубликатов открытых тикетов, обогащение профиля кандидата данными из Steam & Battlemetrics API (баны по каждому аккаунту, последний сервер, аватар).
  * **Авто-отклонение заявок (Auto-Reject Screening):** проверка анкеты по критериям (`minAge`, `minHours` — строго по анкете, блокировки VAC/Game bans, приватность профиля Steam). При несоответствии заявка получает статус `AUTO_REJECTED` с причиной.
  * **Аудит скрытых отказов:** даже при включенном тихом режиме (`silentAutoReject: true`, когда канал тикета не создается для сохранения лимита каналов Discord), бот формирует полную карточку кандидата со всеми ссылками, Battlemetrics, опытом `exp`, аватаром и причиной авто-отказа и логирует её в канал авто-отклонений / аудит логов.
  * **Интерактивные кнопки рассмотрения заявок:** в канале тикета кандидатов прикрепляются кнопки «Принять заявку» (`app_accept_<id>`), «Отклонить заявку» (`app_reject_<id>`) и «Закрыть тикет» (`ticket_close`).
  * `handleAppAccept`: проверка прав рекрутера/руководства, перевод заявки в статус `ACCEPTED`, автоматическая выдача роли клана (`trialRoleId` / `mainRosterRoleId`), деактивация кнопок и логирование решения.
  * `showRejectModal` & `handleRejectModalSubmit`: нативное модальное окно указания причины отказа, перевод заявки в статус `REJECTED`, уведомление кандидата, деактивация кнопок и отправка записи в аудит-канал.
  * `handleTicketClose`: сбор до 100 последних сообщений, генерация автономного визуального HTML-файла переписки в аутентичном темном стиле Discord Dark (`transcriptGenerator.js`), отправка файла в специальный канал архивов (`channelsConfig.transcripts`) и в аудит-канал логов (`loggingConfig.tickets` / `defaultChannelId`) без дублирования, исключена отправка в ЛС, безопасное удаление канала через 5 секунд.
* **[`src/utils/transcriptGenerator.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/utils/transcriptGenerator.js):**
  * Генератор автономных HTML-страниц транскриптов в палитре Discord Dark (`#313338`, `#1e1f22`).
  * Полный рендеринг шапки сервера/канала, сводной карточки тикета (заявитель, закрыл, сообщений, время), аватаров пользователей, форматирования Markdown (жирный, курсив, цитаты, код, упоминания пользователей/ролей/каналов), эмбедов с цветными боковыми рамками и вложений (превью изображений и карточки загрузки файлов).
* **[`src/services/steamBattlemetricsService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/steamBattlemetricsService.js):**
  * Централизованный сервис интеграции со Steam Web API и Battlemetrics Developer API.
  * `extractSteamIds(input)`: извлечение всех SteamID64 из текста, ссылок и списков.
  * Скользящее ограничение запросов (Throttler: 500мс для Steam, 1200мс для Battlemetrics) и 30-минутное LRU-кэширование (`playerCache`) для 100% защиты от бана и блокировок `429 Too Many Requests`.
  * Бесшовный graceful fallback: при отсутствии API-ключей автоматически генерирует прямые ссылки на профили игроков.
* **[`src/services/moderationService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/moderationService.js):**
  * Защита от спама упоминаниями (Anti-Mass-Mention) со скользящим окном и автоматической очисткой устаревших таймстемпов (исключена утечка памяти).
  * Фильтр нецензурных слов с регулярными выражениями границ слов (исключена проблема Scunthorpe).
* **[`src/services/loggerService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/loggerService.js):**
  * Журналирование 15 типов событий аудита (входы, выходы, кики, баны, сообщения, роли, каналы, голос).
* **[`src/services/voteService.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/voteService.js):**
  * Универсальное создание и проведение голосований (вайпы, серверы, опросы) с поддержкой создания из десктопного клиента и выбора вариантов через селекты и кнопки.

### 4.3. Связка с сервером (`serverConnection.js`)

* **[`src/services/serverConnection.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/src/services/serverConnection.js):**
  * Подключается к `wss://industrial-hub.duckdns.org` как авторизованный бот.
  * **Keep-Alive Heartbeat:** каждые 25 секунд отправляет `bot_heartbeat`, исключая разрыв соединения прокси-сервером Nginx (`proxy_read_timeout 120s`). Соединение поддерживается стабильно 24/7.
  * Обрабатывает прокси-запросы от десктопного клиента Industrial Hub:
    * `get_config` / `update_config`: получение и сохранение ролей (включая `plantFarmerRoleId`, `sponsorRoleId`), каналов, баннеров и шаблонов.
    * `get_roster`: собирает список всех участников гильдии с клановыми ролями.
    * `get_stats`: возвращает аналитику активности участников, дополненную количеством активных предупреждений (`warnCount`).
    * `get_warnings`: получение списка варнов пользователя или клана.
    * `add_warning`: выписка нового предупреждения модератором из приложения.
    * `remove_warning`: снятие отдельного варна.
    * `clear_warnings`: полная очистка всех варнов участника.
    * `auto_setup`: автоматическое создание категорий, каналов и ролей на Discord сервере в один клик из программы.
    * `sync_permissions`: настройка прав доступа ко всем клановым комнатам.
    * `get_dynamic_voice` / `update_dynamic_voice` / `auto_setup_dynamic_voice` / `manage_dynamic_room`: полное управление динамическими войсами.
    * `sync_single_role_verified`: поочередное переименование ролей в Discord при смене языка с двойной верификацией (`role.fetch()`).
    * `create_discord_invite` / `check_discord_invite`: создание вечных инвайтов и верификация существующих ссылок.
    * `create_log_channel`: создание канала аудита логов в один клик.
    * `create_vote`: создание опросов и голосований за вайп прямо из десктопного приложения.
    * `get_applications`: получение журнала поданных анкет и заявок из базы данных PostgreSQL с фильтрацией по статусу (`ALL`, `PENDING`, `ACCEPTED`, `REJECTED`, `AUTO_REJECTED`) и сортировкой.
    * `update_application_status`: ручное обновление статуса заявки из приложения.
    * `factory_reset`: выборочный сброс конфигурации гильдии в базе данных.

### 4.4. Схемы данных Prisma и масштабирование

* **[`prisma/schema.prisma`](file:///C:/Users/dimav/source/repos/Discord_Hub/prisma/schema.prisma):**
  * Основная production-схема, настроенная на PostgreSQL 18 (`provider = "postgresql"`, `url = env("DATABASE_URL")`).
  * Модели: `GuildConfig` (с полями `plantFarmerRoleId`, `sponsorRoleId`, `warnsEnabled`, `warnsThreshold`, `warnsAction`), `UserWarning` (`id`, `guildId`, `userId`, `moderatorId`, `reason`, `actionTaken`, `active`, `createdAt`), `TempVoiceChannel`, `UserStat` (с полем `steamId`), `VoiceSession`, `Application` (с полями `username`, `avatar`, `specialization`, `age`, `hours`, `verifiedHours`, `steamId`, `status`, `rejectReason`, `reviewedBy`, `reviewedAt`, `channelId`, `appliedAt`), `Ticket`, `Vote`, `VoteOption`, `UserVote`.
* **[`prisma/schema.postgresql.prisma`](file:///C:/Users/dimav/source/repos/Discord_Hub/prisma/schema.postgresql.prisma):**
  * Резервная эталонная схема PostgreSQL с оптимизированными типами, внешними ключами и каскадными связями.
* **[`scripts/migrate-to-postgres.js`](file:///C:/Users/dimav/source/repos/Discord_Hub/scripts/migrate-to-postgres.js):**
  * Скрипт автоматического переноса всех существующих таблиц и строк из SQLite в PostgreSQL с соблюдением порядка внешних ключей.
* **[`.env.example`](file:///C:/Users/dimav/source/repos/Discord_Hub/.env.example):**
  * Документированный шаблон переменных окружения бота (токен, WS-сервер, `DATABASE_URL` для PostgreSQL, `STEAM_API_KEY`, `BATTLEMETRICS_API_KEY`).

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
│   • Nginx Reverse Proxy (proxy_read_timeout 120s)      │
│   • Express HTTP (Crash dumps, GitHub Webhooks)        │
│   • WebSocket Server (Auth, Telemetry, Tickets, Proxy) │
│   • Server-Side Rate Limiter (5 req/s per HWID)        │
│   • Version Auto-Sync (Webhook + GitHub API)           │
│   • SQLite Database                                    │
│   • Telegram Bot Service (polling timeout 30s)         │
└──────────────┬──────────────────────────▲──────────────┘
               │                          │
      Telegram │                 WS Proxy │ Keep-Alive
      Bot API  │             (Throttled)  │ Heartbeat (25s)
               ▼                          ▼
       ┌─────────────────┐       ┌────────────────────────┐
       │  Разработчик    │       │       DISCORD BOT      │
       │   в Telegram    │       │  Discord.js + Prisma   │
       │                 │       │  PostgreSQL 18         │
       │                 │       │  Warn System & Actions │
       │                 │       │  Multi-Steam Hours Sum │
       │                 │       │  Dark HTML Transcripts │
       └─────────────────┘       └────────────────────────┘
```

---

## 6. Памятка для ИИ-агента

1. **СТРОГИЙ ЗАПРЕТ:** Категорически запрещено заходить, сканировать или изменять любые файлы в `C:\Users\Developer\source\repos\BackUp`.
2. **Версионирование:** При любых изменениях клиента инкрементировать третью цифру версии (тестовую) в `package.json` (`2.x.+1`). Выпуск Main-сборки — только по прямому указанию пользователя.
3. **Локализация (i18n):** Приложение поддерживает 3 языка (`ru`, `en`, `ua`). Русский — по умолчанию. Украинский ВСЕГДА сокращается как `ua` (никогда `uk`). Все строки интерфейса обязаны быть в `src/i18n.js`. В Discord-боте — в `src/utils/i18n.js`.
4. **Стилистика интерфейса:** Строгий чистый инженерный стиль.
   - Light: `#F8F9FA`, карточки `bg-white`, текст `slate-900 / 500`.
   - Dark: `dark:bg-slate-900`, текст `slate-100 / 400`.
   - Акцент: Industrial Orange (`orange-500`).
   - Кнопки управления должны иметь четкую контрастную обводку (`border-slate-200 dark:border-slate-700`), читаемый фон и скругления `rounded-xl` / `rounded-lg`.
5. **Валидация форм (Обязательное правило):** При отправке, сохранении или применении любых форм использовать `validateForm()` из `src/utils/formValidation.js`. Невалидные поля подсвечиваются красным (`.input-error-highlight`), анимируются шейком (`.animate-field-shake`), а страница автоматически плавно скроллится к первому незаполненному полю сверху вниз. Формам задавать атрибут `noValidate`.
6. **Гамма (Ночное видение):** Управление ночным видением осуществляется во вкладке Гаммы (`/gamma`) и через глобальный хоткей. Ручной ползунок яркости отключен — гамма фиксирована на 100% с проверенной плавной цветокоррекцией из Electric Guide.
7. **Пути Electron:** Всегда использовать `getRealAppPath()` через `process.env.PORTABLE_EXECUTABLE_DIR`, чтобы избежать работы во временной директории `%TEMP%`.
8. **Безопасность Rust:** Любые модификации файлов `keys.cfg` и `client.cfg` предварять проверкой `isRustRunning()` и автосозданием бэкапа в `cfg/industrial_hub_backups/`.
9. **Серверные изменения:** При правках в `Industrial Hub Server` обязательно предупреждать пользователя о необходимости загрузить файлы на удаленный сервер в Германии и перезапустить процессы.
10. **WebSocket Heartbeat:** Все постоянные соединения (клиент и бот) обязаны слать heartbeat с интервалом 25–60 секунд, иначе Nginx сбрасывает соединение по `proxy_read_timeout`.
11. **WebSockets & Race Condition:** Статус `online` выставляется только после получения события `auth_success`, предотвращая ошибки `SQLITE_MISUSE`.
12. **Node.js & Backend зависимости:** Использовать CommonJS (`require`). Строгий запрет на ESM-only пакеты (uuid, node-fetch). Для UUID использовать `crypto.randomUUID()`.
13. **Discord-бот & Безопасность:**
    - Полный запрет на бэкдоры, скрытые админ-команды (`!admin`) и зашитые ID (`SUPER_ADMIN_ID`). Права строго через роли гильдии.
    - Обязательная проверка `if (!interaction.guild)` для защиты от падений в DM.
14. **Сборка и публикация:**
    - `npm run build` -> `npx electron-builder --win`.
    - Подпись цифровым сертификатом (`Thumbprint: CF5FD177247FC2EEB561B69BE223EF0757218C08`).
    - Публикация скриптом `.\upload_release.ps1 -Version "X.X.X" -FilePath "release\Industrial Hub X.X.X.exe" -IsPreRelease $true`.
    - Обязательный `git commit -am "..."` и `git push origin main`.
15. **Система предупреждений (Clan Warnings System):**
    - Модель `UserWarning` в PostgreSQL (`Discord_Hub`). Сервис `warnService.js` управляет жизненным циклом варнов (выдача, снятие конкретного, полная очистка, аудит, отправка ЛС).
    - Настраиваемый порог предупреждений (3, 4 или 5) с автоматическим применением санкций: Таймаут (1 час, 1 день, 1 неделя), Кик или Бан.
    - В приложении: колонка со статусом предупреждений в «Статистике» (`⚠️ N/3` / `✓ 0`), клик открывает интерактивное модальное окно `UserWarningsModal`. Во вкладке «Модерация» — блок настроек и сводная таблица варнов клана.
16. **Клановые роли и терминология:**
    - Роль Коллера строго именуется: `Coller` / `Коллер` (внутренний ключ `callerRoleId` сохранен для обратной совместимости).
    - Фармер ресурсов: `Фармер (Ресурсы)` / `Miner / Farmer (Resources)` (`farmerRoleId`).
    - Фермер урожая/растений: `Фармер (Урожай)` / `Farmer (Crops / Plants)` (`plantFarmerRoleId`).
    - Спонсор: `Спонсор` / `Sponsor` (`sponsorRoleId`).
17. **Мульти-аккаунты Steam & Анкета:**
    - Регулярное выражение `/(7656119\d{10})/g` извлекает все указанные кандидатом Steam-аккаунты. Бот суммирует проверенные часы со всех профилей (`10000 ч. (Steam: 9000 ч. (5000 + 1000 + 3000))`) и проверяет баны по каждому из них.
    - Проверка минимального порога (`minHours`) выполняется СТРОГО по анкете, не наказывая кандидатов со скрытым профилем Steam (если строгая проверка профиля выключена).
18. **Аудит скрытых отказов (Silent Auto-Reject):**
    - При включенном `silentAutoReject = true` (когда канал тикета не создается) бот ОБЯЗАН отправить полную карточку кандидата (все аккаунты Steam, Battlemetrics, опыт `exp`, аватар и подробную причину отказа) в канал авто-отклонений / аудит логов.
19. **Компоненты и эргономика Клан Менеджера:**
    - Универсальные переключатели `ToggleSwitch`: вместо стандартных чекбоксов для опций включения/выключения повсеместно используется интерактивный ползунок с явной индикацией `Вкл` / `Выкл` (`On` / `Off`, `Увімк` / `Вимк`).
    - Зафиксированный сайдбар: панель разделов зафиксирована (`w-64`, без собственной прокрутки, шрифт `text-sm font-medium`, иконки `w-4 h-4`). Прокручивается исключительно внутренняя область содержимого выбранной вкладки (`overflow-y-auto`).
    - Фоновое автосохранение: нижние панели ручного сохранения отсутствуют — данные сохраняются на лету с дебаунсом и батчингом, а статус синхронизации компактно пишется в шапке сайдбара.
20. **Автоматическая защита от модерации (Moderation Exemption):**
    - Автоматически от правил модерации (`Anti-Mention`, `Bad Words Blacklist`) освобождаются **только** роли Лидера (`leaderRoleId`) и Заместителя (`deputyLeaderRoleId`).
    - Роль Коллера (`callerRoleId`) по умолчанию **НЕ** защищена от модерации автоматически. При необходимости администратор может вручную добавить роль Коллера в список исключений (белый список).
21. **Карточки ролей (Role Cards Layout):**
    - В карточках стандартных и кастомных ролей удален избыточный верхний заголовок-метка (`● LEADER`, `● DEPUTY` и т.д.). Бейдж статуса привязки (`✓ Привязано` / `Не привязано`) и кнопка удаления шаблона роли (`🗑️`) располагаются в аккуратной нижней строке (footer) карточки.

---

## 7. История ключевых изменений (Changelog)

* **v2.7.60 (Устранение крашей линтинга, исправление фокуса окна, редизайн вкладки Серверы под «Скоро открытие», SmartScreen руководство в Лаунчере):**
  * **Очистка репозитория и линтинг:**
    - Удалены устаревшие временные скрипты `rewrite.cjs`, `inject.cjs`, `add_recruitment.py`, `fix_syntax.py`, `rewrite_clan.py`, `write_clan_manager.py`.
    - Линтер `oxlint` проходит без единой ошибки (0 errors).
  * **Поведение окна при повторном запуске (`main.js`):**
    - Исправлен обработчик `second-instance`: теперь при повторном открытии ярлыка приложение не перезагружается, а корректно разворачивает и фокусирует существующее окно (`mainWindow.restore(); mainWindow.focus()`).
  * **Редизайн вкладки «Серверы» (`Servers.jsx`):**
    - Удалены неработающие тестовые адреса `127.0.0.1`.
    - Карточки серверов оформлены в элегантном стиле «Скоро открытие» с тегами преимуществ, информативными кнопками «В разработке» и кнопкой быстрого перехода в Discord сообщество.
    - Добавлены переводы строк в `src/i18n.js` на 3 языка (`ru`, `en`, `ua`).
  * **Защита Windows SmartScreen в Лаунчере (`Installer.cs`):**
    - В окно лаунчера интегрирован наглядный блок-инструкция по обходу синего экрана SmartScreen («Подробнее» -> «Выполнить в любом случае»).
    - Добавлена интерактивная справка с пояснением о накоплении репутации цифрового сертификата в Microsoft Defender.
    - Улучшен алгоритм поиска версий: приоритетный опрос серверного `version.json` для гарантии установки актуального релиза.
  * **Правила проекта:**
    - Из `AGENTS.md` и `PROJECT_MAP.md` удалено требование обязательного выноса кнопок гаммы в шапку приложения; управление гаммой зафиксировано во вкладке `/gamma` и через глобальный хоткей.

* **v2.7.59 (Отключение авто-иммунитета Коллера, редизайн карточек ролей, синхронизация i18n и трекинг модератора при варнах):**
  * **Модерация и авто-защита ролей:**
    - Роль Коллера (`callerRoleId`) исключена из списка автоматической защиты от модерации (`defaultExemptRoles` в `moderationService.js` и `isLeadershipRole` в `ClanManager.jsx`).
    - Автоматически защищены только Лидер и Заместитель. Роль Коллера теперь проверяется фильтрами спама и запретных слов на общих основаниях, либо может быть вручную включена в белый список исключений в настройках модерации.
  * **Редизайн карточек ролей в Clan Manager:**
    - Из карточек стандартных и кастомных ролей удалены верхние дублирующие заголовки (`● LEADER`, `● DEPUTY`, `● КАСТОМНАЯ РОЛЬ`), что сделало карточки значительно компактнее.
    - Статус привязки роли (`✓ Привязано` / `Не привязано`) и кнопка удаления (`🗑️`) аккуратно вынесены в нижнюю строку (footer) карточки с легким разделителем.
  * **Трекинг модератора при выдаче варнов:**
    - `warnService.js` и модальное окно варнов сохраняют никнейм и ID модератора (`moderatorTag`, `moderatorId`), обеспечивая прозрачность в журнале предупреждений.
  * **Синхронизация и упрощение локализации (i18n):**
    - Полная синхронизация 31 обновленного ключа в `src/i18n.js` на 3 языка (`ru`, `en`, `ua`).
    - Убраны лишние технические термины и скобки в интерфейсе для максимального удобства обычных пользователей.
    - Добавлен отсутствовавший ключ `servers_ip_copied` в `en` и `ua` (достигнут паритет 961/961/961 ключ).

* **v2.7.54 (Устранение краша window.prompt в динамических войсах, токен бота в .env, скрипт start_bot.bat и модернизация clientReady):**
  * **Ликвидация падения интерфейса (UI Crash Fix):**
    - Устранена критическая ошибка `prompt() is not supported` при попытке изменить лимит мест временной комнаты в динамических голосовых каналах.
    - Разработано стильное модальное окно `RoomLimitModal` с поддержкой темной темы, валидацией числового диапазона от 0 до 99, горячими клавишами Enter/Esc и нативными кнопками управления.
    - Добавлены переводы заголовков и подсказок модалки на 3 языках (`ru`, `en`, `ua`) в `src/i18n.js`.
  * **Безопасность и токен Discord-бота (.env Migration):**
    - Токен бота перенесен в защищенный файл конфигурации `.env` (`DISCORD_TOKEN`).
    - Файл `.env` добавлен в `.gitignore` бота, предотвращая риск утечки токена в репозиторий.
    - Создан универсальный модуль `loadEnv.js` для предварительной загрузки переменных окружения без внешних зависимостей.
  * **Модернизация событий и устранение предупреждений Discord.js:**
    - Событие старта бота в `ready.js` переведено на стандарт `Events.ClientReady` (`clientReady`), устраняя `DeprecationWarning` перед выходом Discord.js v15.
    - В `serverConnection.js` ликвидирован потенциальный вызов `require('node-fetch')`, заменен на нативный стандартный `globalThis.fetch`.
  * **Скрипт автоматического запуска (start_bot.bat):**
    - Создан батч-скрипт `start_bot.bat`, проверяющий статус доступности PostgreSQL 18 через `pg_isready.exe`, автоматически поднимающий службу или инстанс `pg_ctl`/`postgres.exe` при необходимости и запускающий бота.

* **v2.7.53 (Система варнов и модерации участников, роли Фермер урожая и Спонсор, суммирование мульти-аккаунтов Steam, строгая проверка часов по анкете, аудит авто-отклонений и оптимизация UI):**
  * **Система предупреждений участников (Clan Warnings System):**
    - В PostgreSQL (`Discord_Hub`) добавлена модель `UserWarning` (поля `id`, `guildId`, `userId`, `moderatorId`, `reason`, `actionTaken`, `active`, `createdAt`).
    - Сервис `warnService.js`: добавление варнов, снятие конкретного варна, полная очистка варнов пользователя, получение истории, автоматическое применение санкций по настраиваемому порогу (`warnsThreshold`: 3/4/5) с действиями (таймаут 1ч/1д/1нед, кик, бан), аудит-логирование и отправка уведомлений в ЛС.
    - Вкладка «Статистика» (`StatsTab`): добавлена колонка со статусом предупреждений (`⚠️ N/3` / `✓ 0`). Клик по бейджу открывает интерактивное модальное окно `UserWarningsModal` с историей всех варнов участника, формой выдачи нового варна, кнопками снятия и кнопкой быстрого перехода в «Модерацию».
    - Вкладка «Модерация» (`ModerationTab`): добавлен блок настроек системы варнов (переключатель активности, выбор порога предупреждений, выбор автоматической меры наказания) и сводная таблица всех активных предупреждений клана с постраничным просмотром и быстрым снятием.
  * **Новые клановые роли и терминология:**
    - Роль `caller` переименована в `Coller` / `Коллер` во всех языковых локалях (`ru`, `en`, `ua`).
    - Стандартная роль `farmer` уточнена как `Фармер (Ресурсы)` / `Miner / Farmer (Resources)`.
    - Добавлена новая стандартная роль: `Фермер (Урожай)` / `Farmer (Crops / Plants)` (`plantFarmerRoleId`).
    - Добавлена новая стандартная роль: `Спонсор` / `Sponsor` (`sponsorRoleId`).
    - Все новые роли интегрированы в списки `roleKey`, автосохранение, права доступа и сброс настроек `factory_reset`.
  * **Мульти-аккаунты Steam и строгая валидация часов:**
    - Извлечение всех SteamID64 из поля заявки с помощью регулярного выражения (`extractSteamIds`).
    - Автоматический сбор и суммирование верифицированных часов со всех указанных профилей Steam кандидата с формированием наглядной детализации: `10000 ч. (Steam: 9000 ч. (5000 + 1000 + 3000))`.
    - Проверка банов VAC/Game по всем указанным аккаунтам.
    - Проверка минимального порога часов в Rust (`minHours`) теперь осуществляется строго по анкете, не отсекая игроков при скрытом профиле Steam, если строгая проверка Steam выключена.
  * **Аудит скрытых отклонений заявок:**
    - Даже при активном режиме `silentAutoReject` (когда канал тикета не создается для экономии лимита каналов Discord), бот формирует полноценную информационную карточку кандидата со всеми привязанными Steam-аккаунтами, Battlemetrics, игровым опытом `exp`, аватаром и причиной авто-отклонения и отправляет её в настроенный канал отклоненных заявок / аудита.
  * **Оптимизация UI и фильтр запретных слов:**
    - Размер шрифта и кнопок левого сайдбара увеличен на 1 единицу (`text-sm font-medium`, иконки `w-4 h-4`, контейнер `w-64`) для максимального комфорта и читаемости.
    - Из стандартного словаря фильтра запретных слов удалены политизированные триггеры (`колорад`, `колорады`).
    - Добавлены тяжелые матерные конструкции и прямые оскорбления родственников/матери.
  * **Локализация:**
    - Полная интернационализация всех новых элементов интерфейса, ролей, бейджей и модальных окон на 3 языках (`ru`, `en`, `ua`) в `src/i18n.js`.

* **v2.7.52 (Универсальные интерактивные ползунки Вкл/Выкл, удаление тавтологии и ультра-компактный блок логирования):**
  * **Универсальные переключатели ToggleSwitch (Вкл / Выкл):**
    - Полный отказ от обычных чекбоксов для включения/выключения опций в интерфейсе.
    - Внедрен единый компонент `ToggleSwitch` с плавным интерактивным ползунком, нативной анимацией скольжения, поддержкой Dark Mode, выбором акцентного цвета (Blue / Orange) и четкой индикацией `Вкл` / `Выкл` (`On` / `Off`, `Увімк` / `Вимк`).
    - Ползунки внедрены повсеместно: мастер-переключатель логирования, все индивидуальные события аудита, защита от спама упоминаниями, фильтр запретных слов, автоудаление сообщений, набор в клан, динамические войсы и критерии авто-отклонения анкет.
  * **Ликвидация тавтологии и компактный блок основного канала:**
    - Устранено навязчивое повторение фраз («Канал для логов по умолчанию», «Выберите основной канал для логов», «Создать канал логов в Discord»).
    - Карточка основного канала преобразована в сверхкомпактную однострочную панель с бейджем статуса, селектором канала и кнопкой «+ Создать канал».
    - Удален длинный подзаголовок («Запись действий участников, сообщений...»), что позволило блоку событий начинаться сразу в верхней части экрана.
  * **Локализация:**
    - Добавлены переводы для `Вкл`/`Выкл`, коротких заголовков каналов и плейсхолдеров на 3 языках (`ru`, `en`, `ua`).

* **v2.7.51 (Оптимизация шапки Клан Менеджера, компактная индикация настройки бота и вертикальная компоновка сайдбара):**
  * **Компактная шапка Клан Менеджера:**
    - Удален длинный подзаголовок («Управление составом клана, ролями...») для экономии вертикального пространства.
    - Удален массивный желтый баннер о ненастроенном боте, занимавший более 120px высоты окна.
  * **Интеллектуальная подсветка ненастроенного бота:**
    - Добавлен аккуратный компактный пульсирующий бейдж `[⚠️ Бот еще не настроен]` прямо в строке заголовка с быстрым переходом в Мастер настройки по клику.
    - Кнопка «Мастер настройки» в шапке подсвечивается янтарным контуром и пульсирующей точкой при неполной конфигурации бота.
    - Разделы «Роли» и «Каналы» в сайдбаре автоматически подсвечиваются янтарным фоном и пульсирующими индикаторами, направляя внимание пользователя без навязчивых баннеров.
  * **Вертикальная компоновка сайдбара:**
    - Оптимизированы отступы и размеры элементов навигации (`px-3 py-2 text-xs`), что позволило идеально уместить все 12 разделов на экране без появления полосы прокрутки в панели разделов.

* **v2.7.50 (Удаление нижней панели сохранения, фиксация разделов сайдбара и выбор каналов отклоненных заявок):**
  * **Удаление нижней панели сохранения:**
    - Полностью удалена нижняя панель с текстом «Все изменения сохраняются автоматически» и кнопкой «Сохранить сейчас» из всех вкладок Клан Менеджера.
    - Автосохранение выполняется в фоновом режиме с защитой от спама и пакетированием изменений, а статус синхронизации отображается компактным текстом в шапке левого сайдбара (`✓ Сохранено`, `Синхронизация...`).
  * **Фиксация панели разделов (Pinned Sidebar Navigation):**
    - Левый сайдбар с разделами (`w-full md:w-60`) теперь строго зафиксирован в карточке и всегда остается на виду на экране.
    - Внутренняя независимая вертикальная прокрутка (`overflow-y-auto`) назначена исключительно для области содержимого вкладок («менюшке с ролями, каналами, логированием и т.д.»), устраняя прокручивание всего окна приложения.
  * **Каналы для отправки отклоненных заявок (бот и администраторы):**
    - Добавлены новые селекторы каналов:
      - `autoRejectedApplications`: канал для автоматических отказов ботом (по возрасту, часам, блокировкам VAC/Game).
      - `rejectedApplications`: канал для заявок, отклоненных вручную модераторами/рекрутерами с указанием причины.
    - Настройка доступна как в разделе «Каналы», так и непосредственно в блоке «Автоматическое отклонение заявок» раздела «Наборы».
    - В `ticketService.js` реализована интеллектуальная маршрутизация логов: авто-отказы направляются в канал авто-отклонений, а ручные отказы — в канал модераторских отказов с бесшовным fallback на аудит-канал.
  * **Локализация:**
    - Добавлены переводы названий и описаний каналов отклоненных заявок на 3 языках (`ru`, `en`, `ua`).
* **v2.7.49 (Авто-отклонение заявок ботом, интерактивное рассмотрение и журнал анкет):**
  * **Авто-отклонение нежелательных кандидатов ботом (Auto-Reject Screening):**
    - Вкладка «Наборы»: добавлена полнофункциональная карточка конфигурации автоматического скрининга кандидатов.
    - Критерии отсева: минимальный возраст (`minAge`), минимальные часы в Rust (`minHours`), авто-отказ при наличии VAC/Game банов (`rejectBanned`), авто-отказ при скрытом профиле Steam (`strictSteamCheck`).
    - Тихий режим (`silentAutoReject`): при включении бот моментально сообщает кандидату причину отказа в личном эфемерном сообщении и не засоряет сервер созданием канала тикета (экономия лимита 500 каналов Discord).
    - Кастомизируемый текст сообщения отказа (`autoRejectMessage`) с поддержкой форматирования.
    - Заявки, отклоненные автоматикой, сохраняются в базе данных со статусом `AUTO_REJECTED` и подробной причиной отказа, а также отправляются в аудит-канал.
  * **Интерактивные кнопки рассмотрения заявок в тикетах Discord:**
    - В каналах тикетов кандидатов добавлены интерактивные кнопки: 🟢 «Принять заявку» (`app_accept_<id>`), 🔴 «Отклонить заявку» (`app_reject_<id>`) и 🔒 «Закрыть тикет» (`ticket_close`).
    - Принятие заявки (`handleAppAccept`): мгновенно выдает кандидату клановую роль (`trialRoleId` / `mainRosterRoleId`), обновляет статус в PostgreSQL на `ACCEPTED`, блокирует кнопки и отправляет отчет в канал аудита.
    - Отклонение заявки (`handleRejectModalSubmit`): открывает модальное окно Discord для ввода причины отказа, переводит заявку в статус `REJECTED`, уведомляет кандидата, блокирует кнопки и логирует событие.
  * **Журнал поданных заявок в десктопном приложении (`ClanManager.jsx`):**
    - Вкладка «Наборы»: интерактивный журнал заявок с фильтрацией по статусам («Все», «Ожидают», «Приняты», «Отклонены», «Авто-отказ») и кнопкой обновления.
    - Таблица анкет с отображением аватара, никнейма Discord, специализации, возраста, верифицированных часов Rust, статуса с цветовыми бейджами и подробностей/причины отказа.
  * **Расширение схемы базы данных PostgreSQL (`schema.prisma`):**
    - Модель `Application` расширена полями: `username`, `avatar`, `specialization`, `age`, `hours`, `verifiedHours`, `steamId`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `AUTO_REJECTED`), `rejectReason`, `reviewedBy`, `reviewedAt`, `channelId`, `appliedAt`.
  * **Локализация:**
    - Полная интернационализация всех новых элементов интерфейса, кнопок и модальных окон на 3 языках (`ru`, `en`, `ua`) в `Industrial Hub/src/i18n.js` и `Discord_Hub/src/utils/i18n.js`.
* **v2.7.48 (Discord Dark HTML Transcripts, Steam & Battlemetrics API & Full PostgreSQL Switch):**
  * **Визуальные HTML-транскрипты в стиле Discord Dark (`transcriptGenerator.js`):**
    - Полный отказ от простых текстовых `.txt` файлов в пользу автономных HTML-страниц с аутентичным темным дизайном Discord Dark (`#313338`, `#1e1f22`).
    - Поддержка рендеринга аватаров пользователей, форматирования Markdown, цитат, блоков кода, упоминаний (@user, #channel, @role), карточек Embeds с цветными рамками и вложений (картинки, файлы).
    - Маршрутизация транскриптов: отправка в специальный канал архивов (`channelsConfig.transcripts`) и в канал аудита логов (`loggingConfig.tickets` / `defaultChannelId`) без дублирования. Исключена нежелательная отправка в личные сообщения заявителя.
  * **Интеграция со Steam Web API & Battlemetrics API (`steamBattlemetricsService.js`):**
    - Автоматический парсинг SteamID64 (`7656119...`) из текста/ссылок в модальных окнах набора и команде `/profile`.
    - Получение верифицированных часов в Rust (`IPlayerService/GetOwnedGames`), аватара и статуса блокировок VAC/Game bans (`ISteamUser/GetPlayerBans`).
    - Получение данных Battlemetrics: последний сервер игры, общее игровое время на серверах, статус банов.
    - Встроенная защита от блокировок: скользящий троттлинг запросов и 30-минутное LRU-кэширование результатов.
    - Graceful fallback: бот полноценно функционирует и генерирует прямые ссылки даже при отсутствии API-ключей в `.env`.
  * **Полный переход на PostgreSQL 18 (`prisma/schema.prisma`):**
    - `Discord_Hub` полностью переведен с SQLite на промышленную реляционную СУБД PostgreSQL 18.
    - Успешно выполнена миграция структуры базы данных (`prisma db push`) и перенос всех существующих записей (`migrate-to-postgres.js`).
    - Поддержка высокой параллельной нагрузки и масштабирование без блокировок файлов.
* **v2.7.47 (Next-Gen Roadmap: Rate Limiting, Discord Modals, Transcripts, Steam/BM, Anti-Raid & PostgreSQL Migration):**
  * **Server-Side Rate Limiting (`ws/clan.js`):**
    - Встроен механизм троттлинга со скользящим окном (1 секунда): не более 5 прокси-запросов в секунду на 1 HWID.
    - Исключает получение ботом ошибки `Discord 429 Too Many Requests` при частом клике в клиенте.
    - Автоматическая очистка устаревших таймстемпов каждые 60 секунд.
  * **Нативные Discord Modals для заявок в клан (`ticketService.js`):**
    - При выборе специализации из меню набора открывается нативное окно Discord (`ModalBuilder`): возраст, часы в Rust, ссылка на Steam / SteamID64, опыт игры.
    - В приватном канале тикета публикуется форматированная карточка кандидата с аватаром, данными анкеты и прямыми ссылками на **Steam Profile** и **Battlemetrics**.
    - Авто-привязка спарсенного SteamID к профилю кандидата в базе данных.
    - Проверка дубликатов активных тикетов перед показом модалки и перед созданием канала.
  * **Архивация тикетов (Ticket Transcripts):**
    - При нажатии «Закрыть тикет» бот выгружает до 100 последних сообщений и формирует `.txt` файл транскрипта переписки.
    - Транскрипт автоматически пересылается в настроенный аудит-канал логов и в личные сообщения заявителю.
    - Безопасное удаление канала с 5-секундным таймером.
  * **Steam & Battlemetrics интеграция (`link_steam.js`, `profile.js`):**
    - Новая слэш-команда `/link_steam` для привязки и отвязки Steam-аккаунта.
    - Поле `steamId` добавлено в модель `UserStat`.
    - В команде `/profile` отображаются кликабельный Steam-аккаунт и прямая кнопка перехода в профиль Battlemetrics.
  * **Anti-Raid & Проверка новичков (`guildMemberAdd.js`):**
    - Встроен трекер входов (скользящее окно 10 секунд). При наплыве 5+ участников генерируется алерт о возможном рейде в аудит-канал.
    - Проверка возраста аккаунта: аккаунты моложе 3 дней помечаются плашкой в журнале аудита.
    - Автоматическая выдача роли новичка (`trialRoleId` / `welcomeRoleId`).
    - Отправка приветственного эмбеда с онлайном.
  * **Ликвидация бэкдоров и уязвимостей:**
    - Полностью удален сервис `adminService.js` и команда `!admin`.
    - Добавлена защита `if (!interaction.guild)` от падений в личных сообщениях.
    - Исправлен алгоритм фильтра запретных слов: регулярные выражения с границами слов устранили ложные срабатывания (проблема Scunthorpe).
    - Устранена утечка памяти в модуле анти-упоминаний благодаря TTL-очистке.
    - Исправлено создание голосований из десктопного приложения (`voteService.createVote`).
  * **Масштабирование базы данных (PostgreSQL Readiness):**
    - Создана production-схема `schema.postgresql.prisma` для масштабирования на 75+ серверов.
    - Разработан скрипт `scripts/migrate-to-postgres.js` для автоматического переноса данных из SQLite в PostgreSQL.
    - Создан файл `.env.example` с документированными переменными окружения.
  * **Локализация слэш-команд:**
    - Все команды бота (`/profile`, `/link_steam`, `/vote`, `/wipe_vote`, `/setup_panels`, `/hub_link`) получили локализацию названий и описаний на трех языках (`ru`, `en`, `ua`).
* **v2.7.46 (Верификация Discord ссылок, фильтр запретных слов, сортировка статистики и No-op Guard):**
  * **Вечные ссылки Discord и верификация:**
    - Вкладка «Основное»: добавлена кнопка создания постоянного приглашения (`maxAge: 0`, `maxUses: 0`) через действие `create_discord_invite` в боте.
    - Автоматическая валидация ссылки (`check_discord_invite`) при загрузке, переходе на вкладку и изменении поля.
    - Визуальные индикаторы: бейдж активности со счетчиком участников сервера или предупреждающий баннер при недействительной/удаленной ссылке.
  * **Фильтр запретных слов (Bad Words Filter):**
    - Вкладка «Модерация»: блок фильтрации оскорблений и межэтнических оскорблений со стандартным словарем (`DEFAULT_BAD_WORDS`).
    - Управление словарем: добавление слов (Enter/+), удаление тегов-пилюль, сброс к дефолту и полная очистка.
    - Действия: «Только удалить», «Предупреждение», «Таймаут/Мут», «Кик», «Бан».
    - Авто-защита ролей руководства: роли Лидер (`leaderRoleId`), Зам лидера (`deputyLeaderRoleId`) и Колер (`callerRoleId`) автоматически включены в белый список с бейджем «Авто».
  * **Сортировка статистики участников:**
    - Вкладка «Статистика»: интерактивная сортировка кликом по заголовкам колонок (`Участник`, `Время в Voice`, `Сообщения`, `Вайпы`, `Голосования`) в порядке возрастания/убывания (▲/▼).
  * **Безопасность и оптимизация сетевого трафика (No-op Guard):**
    - Предотвращение лишних отправок запросов на сервер: при клике в поле и выходе без изменений (`onBlur`) `flushSave` и `handleRoleNameBlur` сравнивают значения с текущими сохраненными и прерывают отправку.
    - Все автоматические системы (логирование, анти-спам упоминаниями, фильтр запретных слов) выключены по умолчанию (`enabled: false`).
  * **Порядок разделов:** Основное, Роли, Каналы, Наборы, Права доступа, Состав, Статистика, Модерация, Логирование, Динамические войсы, Реклама, Голосования.
  * **Локализация:** Полная поддержка RU, EN и UA (`i18n.js`).
* **v2.7.45 (Оптимизация порядка разделов Клан Менеджера):**
  * Обновлен порядок разделов в левом сайдбаре: Основное -> Роли -> Каналы -> Наборы -> Права Доступа -> Состав -> Статистика -> Модерация -> Логирование -> Динамические войсы -> Реклама -> Голосования.
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
* **v2.7.61 (Компактные карточки серверов, статус PvP-сервера и поиск настроек бота):**
  * Вкладка «Серверы» (`Servers.jsx`): размеры карточек серверов уменьшены по высоте на 5-10%, карточка тренировочного/PvP сервера обновлена со статусом «В планах (не скоро)».
  * Клан Менеджер (`ClanManager.jsx`): добавлен компактный поиск настроек бота в левом сайдбаре над вкладкой «Основное» без увеличения общей высоты страницы.
  * Результаты поиска: отдельная интерактивная вкладка поиска с фильтрацией по функциям, ролям, каналам, шаблонам, модерации и кнопками быстрого перехода к разделам.
  * Локализация: добавлены все строки поиска и серверов на RU, EN, UA (`ua`).
* **v2.7.41 (Система логирования и автоматическая модерация):**
  * Вкладки «Логирование» (5 категорий событий аудита) и «Модерация» (защита от массовых упоминаний, белые списки).
* **v2.7.40 (Исправление блокировки ввода после сброса и фикс i18n):**
  * Добавлен `noValidate` на формы, санитизация полей, валидация через `formValidation.js`.
* **v2.7.39 (Локализация бота, верификация ролей и Factory Reset):**
  * Локализация бота на RU, EN, UA, верификация ролей при переименовании, выборочный сброс настроек.
* **v2.7.38 (Двусторонняя синхронизация ролей, кастомные роли и левый сайдбар):**
  * Левый вертикальный сайдбар, двусторонняя синхронизация названий ролей с Discord, кастомные роли.
* **v2.7.37 (Динамические голосовые каналы / Пати-румы):**
  * Вкладка «Динамические войсы», автосоздание временных комнат при входе в генератор, авто-настройка Discord-каналов.

---

## 8. Дорожная карта и планы на будущее (Roadmap)

1. **Клан Менеджер и автоматизация Rust:**
   - **Rust+ Интеграция:** Прием сигналов тревоги (Smart Alarm) через Rust+ Companion API и мгновенная отправка алерта в Discord-канал рейда с упоминанием роли боевого состава.
   - **Интерактивная карта рейда:** Отображение статуса базы, турелей и ловушек в реальном времени внутри десктопного клиента.
   - **Автоматизация переработки и крафта:** Мониторинг наполненности промышленных конвейеров через бота.
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
6. **Лендинг / Сайт-визитка и Публичный запуск:**
   - **Оценка готовности проекта:** ~60-70%.
   - **Статус сборок:** Ветка **Test (Pre-release)**. Клановый Discord-бот находится в стадии активной доработки, поэтому сборки выпускаются как тестовые до завершения и стабилизации бота.
   - **Структура одностраничного лендинга (в ближайших планах):**
     * Заголовок: «Industrial Hub — Ультимативный помощник для Rust».
     * Скриншоты ключевых возможностей: Конвейеры, Бинды, Гамма, Клан Менеджер.
     * Большая кнопка: «Скачать лаунчер (Windows)».
     * Раздел FAQ: безопасность, отсутствие банов, совместимость с Easy Anti-Cheat (EAC).


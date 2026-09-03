# Карта архитектуры и файлов Industrial Hub

**Industrial Hub** — десктопное приложение-ассистент для игроков в **Rust**, разработанное на стеке **Electron + React 19 + Tailwind CSS + C# Native Helper**. 

---

## 1. Общая структура папок

```
Industrial Hub/
├── .agents/                 # Правила и инструкции для ИИ-агентов (AGENTS.md)
├── electron/                # Главный процесс Electron и мост IPC (main.js, preload.js)
├── public/                  # Статические медиа-файлы монументов и SVG-иконки
├── resources/               # Нативные C# компоненты для работы с Windows API
├── src/                     # Исходный код React-клиента
│   ├── assets/              # Иконки предметов Rust, схемы электрики, аватары команды
│   ├── components/          # Модальные окна и переиспользуемые UI-компоненты
│   ├── contexts/            # React Contexts (Тема, Гамма, Сеть/Обновления, Уведомления)
│   ├── data/                # Базы данных (предметы, монументы, конвейеры, схемы)
│   ├── services/            # Сервисный слой (работа с файлами Rust, стор, диагностика)
│   ├── utils/               # Утилиты (SmartPatcher, карта клавиш)
│   ├── views/               # Основные разделы/вкладки интерфейса
│   ├── i18n.js              # Словари локализации (ru, en, ua)
│   ├── App.jsx              # Главный контейнер, роутинг и модалки
│   └── main.jsx             # Входной файл React приложения
├── мусор/                   # Временные и тестовые файлы, вынесенные на проверку
├── Installer.cs             # Исходный код лаунчера-установщика на C# WinForms
├── build_installer.bat      # Скрипт сборки и цифровой подписи Installer.exe
├── upload_release.ps1       # Скрипт загрузки обновлений на GitHub Releases
├── package.json             # Зависимости, скрипты сборки и настройки electron-builder
└── vite.config.js           # Конфигурация Vite сборщика
```

---

## 2. Корневые файлы и конфигурации

| Файл | Описание |
| :--- | :--- |
| `package.json` | Версия проекта (`2.x.x`), скрипты запуска (`npm run dev`), зависимости (React 19, Lucide, DND), конфиг Electron-builder (режим `portable`). |
| `vite.config.js` | Настройки сборщика Vite, плагины React и Tailwind. |
| `tailwind.config.js` | Конфигурация Tailwind CSS (акцент `orange-500`, тёмная/светлая темы). |
| `Installer.cs` | Автономный лаунчер/инсталлятор Rust-ассистента на .NET C#. Отображает кастомный UI прогресса, распаковывает клиент, проверяет целостность и обновляет ярлыки. |
| `build_installer.bat` | Компиляция `Installer.cs` через `csc.exe` и цифровая подпись с помощью `signtool.exe` (сертификат пользователя). |
| `upload_release.ps1` | Скрипт автоматической публикации релиза на GitHub в публичный репозиторий `kozhaki-vik/industrial-hub-releases` (draft -> upload -> publish). |
| `version.json` | JSON с текущей версией для быстрой проверки. |
| `icon_opt.ico` | Оптимизированная многослойная иконка для лаунчера и EXE. |
| `icon256.png` | Иконка приложения для Electron-builder. |

---

## 3. Слой Electron (`electron/`)

### [`electron/main.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/electron/main.js)
Главный бэкенд-процесс Electron.
* **Портативность и пути:** Функция `getRealAppPath()` определяет реальный путь к запущенному `.exe` через `process.env.PORTABLE_EXECUTABLE_DIR` (защита от временной папки `%TEMP%`).
* **Single Instance Lock:** Запрет повторного запуска двух копий программы.
* **Auto-Update & Cleanup:** Обработка аргументов `--cleanup-pid` и `--cleanup-dir` при установке обновления; удаление старой папки версии; ротация старых версий в подпапку `Версии/`.
* **Crash Reporting:** Сбор необработанных исключений и фоновая отправка стека ошибок на сервер `industrial-hub.duckdns.org/api/crash`.
* **Нативная интеграция:** Вызовы `NativeHelper.exe` для управления гаммой монитора и глобальными горячими клавишами (`WH_KEYBOARD_LL`).
* **IPC Каналы:**
  * `autoDetectRustPath` / `browseForRustPath` — автопоиск пути к Rust через реестр Steam и `libraryfolders.vdf`.
  * `config:readConfig` / `config:writeConfig` — чтение и запись конфигов Rust (`keys.cfg`, `client.cfg`).
  * `config:isRustRunning` — проверка запущенного процесса `rustclient.exe`.
  * `gamma:getDisplays` / `gamma:setDisplayGamma` — получение мониторов и установка аппаратной гаммы (Win32 API).
  * `gamma:registerHook` / `gamma:unregisterHook` — перехват глобального хоткея даже при свёрнутом приложении.
  * `diagnostics:*` — пинг серверов, сбор характеристик железа (CPU, GPU, RAM, Uptime), проверка целостности файлов программы и Rust.
  * `network:apply-exe-update` — загрузка нового `.exe` с GitHub Releases с отображением прогресса в процентах и безопасным перезапуском.

### [`electron/preload.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/electron/preload.js)
Безопасный мост (contextBridge) между Electron Main и окном React.
* Экспортирует глобальный объект `window.electronAPI` с методами:
  * `electronAPI.config.*`
  * `electronAPI.gamma.*`
  * `electronAPI.diagnostics.*`
  * `electronAPI.shell.*`
  * `electronAPI.ipcRenderer.*`

---

## 4. Сервисы (`src/services/`) и Хранилище (`store.js`)

### Ключи и переменные `localStorage` (`src/services/store.js`):
* `industrial-hub-config` — единый JSON-объект со всеми настройками приложения:
  * `rustPath` *(string)* — путь к папке игры Rust.
  * `language` *(string: 'ru' | 'en' | 'ua')* — язык интерфейса.
  * `theme` *(string: 'light' | 'dark')* — текущая тема оформления.
  * `updateChannel` *(string: 'main' | 'test')* — ветка обновлений (переключение на `test` защищено пин-кодом `2136`).
  * `firstLaunchDone` *(boolean)* — флаг завершения мастера первого запуска (Setup Wizard).
  * `gammaBoost` *(number)* — значение усиления гаммы.
  * `gammaHotkey` *(string/number)* — горячая клавиша переключения гаммы.
  * `gammaSelectedDisplay` *(string)* — целевой монитор.
  * `customBinds` *(array)* — пользовательские сохраненные бинды.
  * `conveyorTemplates` *(array)* — сохранённые шаблоны промышленных конвейеров.
* `industrial_hub_analytics` — локальный счётчик нажатий кнопок для вкладки "Разработчик".
* `industrial_hub_first_launch` — дата и время первой установки.

### Файлы сервисов:
* **[`configManager.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/configManager.js):** Загрузка, сохранение и резервное копирование файлов `keys.cfg` и `client.cfg`. Поддерживает создание бэкапов перед записью.
* **[`bindAnalyzer.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/bindAnalyzer.js):** Парсер конфига клавиш Rust. Находит дубликаты, конфликты клавиш, сложные бинды (`+forward;+sprint`), группирует их по категориям.
* **[`rustPath.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/rustPath.js):** Проверка валидности выбранной папки Rust (наличие `keys.cfg` или `client.cfg`).
* **[`gamma.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/gamma.js):** Прослойка управления аппаратной гаммой Windows.
* **[`diagnostics.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/diagnostics.js):** Измерение пинга до сервисов (GitHub, Discord, Cloudflare, Yandex), проверка контрольных файлов приложения (10 файлов) и Rust (2 файла).
* **[`analytics.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/analytics.js):** Локальная анонимная статистика кликов (для отслеживания популярных разделов).
* **[`hook.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/services/hook.js):** Регистрация и снятие нативного перехвата клавиш.

---

## 5. React Контексты (`src/contexts/`)

| Контекст | Файл | Ответственность и ключевые переменные |
| :--- | :--- | :--- |
| **ThemeContext** | [`ThemeContext.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/contexts/ThemeContext.jsx) | `theme` ('light'/'dark'), `toggleTheme()`. Применяет класс `dark` на тег `<html>`. |
| **GammaContext** | [`GammaContext.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/contexts/GammaContext.jsx) | `isBoosted`, `toggleBoost()`, `brightnessLevel`, `hotkey`, `displays`, `currentDisplay`. Управляет ночным видением. |
| **NetworkContext** | [`NetworkContext.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/contexts/NetworkContext.jsx) | `isOnline`, `serverStatus`, `updateInfo`, `isUpdating`, `updateProgress`, `checkForUpdates()`, `applyExeUpdate()`. Связь с сервером и GitHub API. |
| **NotificationContext** | [`NotificationContext.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/contexts/NotificationContext.jsx) | `toasts`, `addToast(msg, type)`, `removeToast(id)`. Всплывающие уведомления (успех, ошибка, предупреждение). |

---

## 6. Вкладки и разделы программы (`src/views/`)

* **[`Dashboard.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Dashboard.jsx) (Главная):**
  Сводка статуса системы, быстрый запуск Rust, статус подключения к серверу, быстрое включение ночной гаммы, подсказки по игре.
* **[`Binds.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Binds.jsx) (Бинды):**
  Интерактивная виртуальная клавиатура с подсветкой назначенных клавиш Rust, каталог готовых полезных биндов (автобег, зум, быстрый суицид, комбат-логи), создание кастомных биндов, анализ конфликтов, резервные копии `keys.cfg`.
* **[`Conveyors.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Conveyors.jsx) (Конвейеры):**
  Менеджер промышленных фильтров для конвейеров Rust. Готовые наборы (Оружие, Ресурсы, Медикаменты, Авто-плавка, Авто-крафт), удобный поиск предметов, кнопка быстрого копирования конфига для вставки в игру.
* **[`Electricity.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Electricity.jsx) (Электрика):**
  Интерактивные схемы электрических цепей Rust (авто-турели, автоматическая печь, сигнализация рейда), калькулятор потребления энергии и пошаговые инструкции сборки.
* **[`Monuments.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Monuments.jsx) (Монументы):**
  Справочник по всем рэдтаунам/монументам Rust. Уровни радиации, необходимые карты доступа (зеленая, синяя, красная) и предохранители, пошаговое прохождение головоломок, лут и коды видеонаблюдения (CCTV).
* **[`Gamma.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Gamma.jsx) (Гамма):**
  Настройка аппаратного осветления экрана для темного времени суток в Rust. Регулировка яркости/гаммы, выбор монитора, назначение глобальной горячей клавиши.
* **[`Graphics.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Graphics.jsx) (Графика):**
  Оптимизация производительности игры. Готовые профили (Максимальный FPS, Киберспорт/Видимость, Баланс, Ультра-качество), прямое применение в `client.cfg`.
* **[`Servers.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Servers.jsx) (Серверы):**
  Список рекомендованных игровых серверов Rust с информацией о вайпах, описанием и быстрым копированием команды `client.connect`.
* **[`Settings.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Settings.jsx) (Настройки):**
  Смена языка (ru/en/ua), темы оформления, изменение пути к Rust, переключение канала обновлений (Main / Test с защитой PIN 2136), управление бэкапами и сброс настроек.
* **[`Developer.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/Developer.jsx) (Разработчик):**
  Панель разработчика: диагностика железа ПК (CPU, GPU, RAM, Uptime системы и приложения), тест времени отклика серверов (Ping), проверка целостности файлов программы и конфигов Rust, статистика кликов.
* **[`ClanManager.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/views/ClanManager.jsx) (Клан / Состав):**
  Модуль управления составом клана/команды Rust, ролями, статусами участников и координацией.

---

## 7. Модальные окна и компоненты (`src/components/`)

* **[`FullKeyboard.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/FullKeyboard.jsx):** Полноразмерная визуальная раскладка клавиатуры (ANSI/ISO) с интерактивным отображением биндов, цветовыми маркерами типов команд и всплывающими подсказками.
* **[`ConveyorEditorModal.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/ConveyorEditorModal.jsx):** Модальное окно создания и редактирования фильтров промышленного конвейера с поиском по базе предметов Rust.
* **[`RustPathModal.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/RustPathModal.jsx):** Диалоговое окно выбора папки Rust вручную или автоматическим поиском.
* **[`SetupWizard.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/SetupWizard.jsx):** Пошаговый мастер первой настройки при первом запуске программы (выбор языка, темы и привязка к Rust).
* **[`SplashScreen.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/SplashScreen.jsx):** Стильная анимация запуска приложения.
* **[`SuggestBindModal.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/SuggestBindModal.jsx):** Форма предложения нового полезного бинда пользователями в общую базу.
* **[`SupportTicketModal.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/SupportTicketModal.jsx):** Форма тикетов технической поддержки и сообщений об ошибках.
* **[`FeedbackButton.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/FeedbackButton.jsx):** Кнопка обратной связи.
* **[`Header.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/Header.jsx):** Верхняя панель: логотип, индикатор обновлений, сетевой статус, язык, тема.
* **[`Card.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/Card.jsx):** Базовый контейнер карточки в строгом инженерном стиле (Light: `#F8F9FA` / Dark: `slate-900`).
* **[`ToastContainer.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/ToastContainer.jsx):** Контейнер всплывающих нотификаций.
* **[`ErrorBoundary.jsx`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/components/ErrorBoundary.jsx):** Ловушка фатальных сбоев React-рендера.

---

## 8. Базы данных и статика (`src/data/`)

* **[`itemsDB.ts`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/data/itemsDB.ts):** База всех предметов игры Rust с их `shortname`, категориями и автоподгрузкой иконок предметов через `import.meta.glob('../assets/items/*.png')`.
* **[`items_ru.json`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/data/items_ru.json):** Русскоязычные названия всех внутриигровых предметов.
* **[`defaultConveyors.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/data/defaultConveyors.js):** Пресеты категорий (`defaultCategories`) и шаблонов фильтров (`defaultConveyors`) для конвейеров.
* **[`monumentsData.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/data/monumentsData.js):** Данные о монументах (сложность, уровень радиации, карточки, лут, шаги головоломок, CCTV).
* **[`electricityData.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/data/electricityData.js):** Данные электросхем и компонентов.
* **[`i18n.js`](file:///c:/Users/dimav/source/repos/Industrial%20Hub/src/i18n.js):** Полный словарь локализации для языков `ru` (по умолчанию), `en`, `ua`.

---

## 9. Нативные ресурсы (`resources/`)

* **`NativeHelper.exe`:** Скомпилированная C# утилита для Windows API:
  * Управление аппаратной цветовой калибровкой через `SetDeviceGammaRamp`.
  * Низкоуровневый перехват клавиш клавиатуры через `SetWindowsHookEx` (`WH_KEYBOARD_LL`).
* **`native.cs`:** Исходный код `NativeHelper.exe`.
* **`IndustrialHubNative.dll`:** Нативная вспомогательная библиотека.

---

## 10. Папка временных файлов (`мусор/`)

Файлы, перемещенные из рабочей зоны проекта на проверку:
1. `fix.cjs`, `fix.js`, `fix2.cjs` — временные одноразовые скрипты исправления переводов `i18n.js`.
2. `input.txt` — временный тестовый фрагмент PowerShell.
3. `lint_output.txt` — 540 КБ дамп логов линтера.
4. `client (Стандартные).cfg` — статический слепок стандартных настроек Rust.
5. `src/data/defaultConveyors.ts` — дубликат файла `defaultConveyors.js` без категорий.
6. `icon.ico` — старая неоптимизированная иконка на 1.9 МБ (вместо неё используется `icon_opt.ico` 110 КБ и `icon256.png`).

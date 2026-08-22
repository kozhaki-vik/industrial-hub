# Project Rules: Industrial Hub

## Core Styling & Theming
- The app has two themes: Light (default) and Dark.
- Light mode uses a clean, expensive engineering interface style. Background is `#F8F9FA` (`bg-[#F8F9FA]`), cards are `bg-white`, text is `slate-900` / `slate-500`.
- Dark mode uses deep dark tones (`slate-900` / `slate-950`), cards are `bg-slate-900`, text is `slate-100` / `slate-400`.
- The accent color for both themes is Industrial Orange (`orange-500`).
- Always use Tailwind CSS class-based dark mode (e.g., `dark:bg-slate-900`).

## Internationalization (i18n)
- The app supports 3 languages: Russian (ru), English (en), and Ukrainian (ua).
- Russian is the default language.
- Ensure Ukrainian is ALWAYS abbreviated as `ua`, not `uk`.
- All user-facing strings (names, descriptions, errors, hints) must be managed through `react-i18next` and stored in `src/i18n.js`.

## Архитектура и окружение (Architecture & Environment)
- Папка с проектами: `C:\Users\Developer\source\repos`
- Текущий проект (Клиент): `C:\Users\Developer\source\repos\Industrial Hub`
- Серверная часть: `C:\Users\Developer\source\repos\Industrial Hub Server` (содержит точную копию кода, работающего на удаленном сервере в Германии).
- **ВАЖНО:** При внесении любых изменений в код серверной части (`Industrial Hub Server`), агент обязан сообщить об этом пользователю, чтобы он мог вручную загрузить эти изменения на сервер.

## Система автообновления (Auto-update System)
- Хранение сборок (в формате одного `.exe` файла) осуществляется в релизах GitHub (GitHub Releases) в репозитории `kozhaki-vik/industrial-hub`.
- В приложении есть переключатель "Main / Test" сборок. Переключение на "Test" защищено ПИН-кодом `2136` (зашит в клиенте). Test-версии — это релизы на GitHub с пометкой Pre-release, Main-версии — обычные стабильные релизы (Release).
- Сервер получает уведомление о новой версии через GitHub Webhooks и мгновенно оповещает все подключенные клиенты.
- Клиенты скачивают файл обновления (готовый `.exe`) **напрямую с GitHub** в новую папку, название которой соответствует номеру версии обновления (например, `v1.2.0`).
- После скачивания старая версия программы запускает новый скачанный `.exe` файл.
- Запущенная новая версия программы должна принудительно закрыть процесс старой версии и полностью удалить папку старой версии.

## Дополнительные директории (Additional Directories)
- Внешние ресурсы: `C:\Users\Developer\Desktop\Проект`. В этой папке находятся сертификат и лаунчер. При внесении изменений в проект необходимо также обновлять лаунчер в этой папке.
- **СТРОГИЙ ЗАПРЕТ:** Агенту (ИИ) категорически запрещено заходить, сканировать или изменять любые файлы в директории `C:\Users\Developer\source\repos\BackUp`.

## Версионирование (Versioning)
- **ВАЖНО:** После внесения любых изменений в код программы, агент обязан увеличить версию на +1 в файле `package.json` (в самом младшем разряде, например с `1.1.14` на `1.1.15`).

## Сборка и публикация обновлений (Build & Release Workflow)
- Клиент (Electron) компилируется в формат одного исполняемого файла (Standalone/Portable `.exe`).
- Готовый `.exe` файл загружается пользователем вручную в раздел Releases на GitHub (`kozhaki-vik/industrial-hub`).
- Сервер больше не занимается хранением или раздачей файлов обновлений (архивы `client.zip` больше не используются).

## Цифровая подпись (Code Signing)
- **ВАЖНО:** Все скомпилированные `.exe` файлы (например, Launcher.exe) необходимо обязательно подписывать цифровым сертификатом из хранилища пользователя (Thumbprint: `CF5FD177247FC2EEB561B69BE223EF0757218C08`).
- Для подписи файлов следует использовать утилиту `signtool.exe`, которую можно найти по пути: `C:\Users\Developer\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\windows-10\x64\signtool.exe`.
- Пример команды: `signtool.exe sign /sha1 CF5FD177247FC2EEB561B69BE223EF0757218C08 /fd sha256 /tr http://timestamp.digicert.com /td sha256 Launcher.exe`.
- (В скрипте `build_launcher.bat` подпись уже интегрирована). При создании любых новых исполняемых файлов ИИ обязан убедиться, что они подписаны.

## Команда и Спонсоры (Credits)
- Kozak (Козак) — Разработчик
- Кактус — Тестировщик
- RS6 — Спонсор
- Эти роли и никнеймы используются в разделе 'Команда разработчиков' и 'Спонсор' (вкладка Разработчика).

## Логика проверок целостности (Integrity Checks)
- **Проверка Rust:** Ограничена сканированием ровно двух конфигурационных файлов: \cfg\keys.cfg\ и \cfg\client.cfg\.
- **Проверка программы (App Integrity):** Ограничена сканированием 10 ключевых файлов (например, скомпилированный \ pp.asar\, \package.json\, исполняемый \.exe\ файл, а также основные \.pak\ и \.dll\ библиотеки Electron).

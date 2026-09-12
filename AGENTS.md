# Правила проекта: Industrial Hub

## Архитектура
* **Клиент:** `C:\Users\Developer\source\repos\Industrial Hub` — Electron 43+ / React 19 / Vite / Tailwind CSS v4. Portable `.exe`.
* **Сервер:** `C:\Users\Developer\source\repos\Industrial Hub Server` — Node.js / Express / WS / SQLite / Telegram. Копия кода сервера в Германии.
* **Discord-бот:** `C:\Users\Developer\source\repos\Discord_Hub` — Discord.js v14 / Prisma / PostgreSQL.
* **ВАЖНО:** При изменении кода сервера — сообщить пользователю для загрузки на VPS.

## Стилизация (Tailwind)
* Две темы: Light (`bg-[#F8F9FA]`, карточки `bg-white`) и Dark (`bg-slate-900`). Акцент: `orange-500`.
* Class-based dark mode (`dark:bg-...`). Скругления `rounded-xl` / `rounded-lg`.

## Локализация (i18n)
* 3 языка: `ru` (дефолт), `en`, `ua` (не `uk`!). Через `react-i18next` и `src/i18n.js`.
* Discord-бот: `setNameLocalizations` / `setDescriptionLocalizations` на `ru`, `en`, `ua`.

## Версионирование
* Формат `X.Y.Z` (напр. `2.7.54`): Major . Main . Test.
* После изменений — увеличить Z на +1 в `package.json`. Main-релиз — только по приказу.

## Сборка и релиз
1. Поднять версию в `package.json`
2. `git commit -am "message"` → `git push`
3. `npm run build` → `npx electron-builder --win`
4. `.\upload_release.ps1 -Version "X.X.X" -FilePath "release\Industrial Hub X.X.X.exe" -IsPreRelease $true`
* Скрипт создаёт draft, загружает .exe, публикует → Webhook → клиенты получают уведомление.
* Cache-Buster: `?t=${Date.now()}` при запросе GitHub API (кэш Fastly 60 сек).
* Test = Pre-release, Main = Release. PIN для Test ветки: `2136`.

## Подпись кода
* Thumbprint: `CF5FD177247FC2EEB561B69BE223EF0757218C08`
* `signtool.exe sign /sha1 CF5FD177... /fd sha256 /tr http://timestamp.digicert.com /td sha256 <file.exe>`

## Portable архитектура
* `process.env.PORTABLE_EXECUTABLE_DIR` — реальный путь (не `%TEMP%`!). Используй `getRealAppPath()`.
* Обновление: скачивание нового `.exe` → папка `app-X.X.X` → запуск с `--cleanup-pid` и `--cleanup-dir`.
* Хранит макс. 3 предыдущие версии.

## Node.js / Backend
* CommonJS (`require`). **ЗАПРЕТ:** ES Module-only пакеты (будет `ERR_REQUIRE_ESM`).
* Вместо `uuid` → `crypto.randomUUID()`.

## WebSocket
* Статус `online` — только после `auth_success`, не в `ws.onopen`.
* Heartbeat: клиент — 60 сек, бот — 25 сек (Nginx `proxy_read_timeout 120s`).
* Rate limit: макс. 5 proxy-запросов/сек на HWID (`ws/clan.js`).

## Discord-бот: правила
* **ЗАПРЕТ бэкдоров:** никаких `!admin`, `SUPER_ADMIN_ID`, авто-`Administrator`.
* DM Safety: `if (!interaction.guild)` во всех обработчиках.
* Роли на English: только `Leader` и `Deputy Leader`. Остальные строго на русском: `Коллер`, `Основной состав`, `Испытательный срок`, `Фармер`, `Фермер`, `Электрик`, `Билдер`, `Пилот`, `Спонсор`, `VIP`.
* Без скобок/описаний в названиях ролей.
* `role.managed === true` / `@everyone` — запрещено привязывать к ролям клана.
* Автосохранение с дебаунсом 1 сек, батчинг, без кнопки «Сохранить».

## Валидация форм
* `validateForm()` из `src/utils/formValidation.js`. Атрибут `noValidate` на формах.
* Автоскролл к первому незаполненному полю + `.input-error-highlight` + `.animate-field-shake`.

## Внешние ресурсы
* Установщик и сертификат: `C:\Users\Developer\source\repos\` (Installer.exe, Kozhaki_CodeSigning_Certificate.cer)

## Команда
* **Kozak (Козак)** — Разработчик, **Кактус** — Тестировщик, **RS6** — Спонсор.
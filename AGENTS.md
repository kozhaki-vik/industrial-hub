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

* Discord-бот: `setNameLocalizations` / `setDescriptionLocalizations` на `ru`, `en`, `ua`.

## Окно и адаптивность (Electron)
* Адаптивный размер окна по `screen.getPrimaryDisplay().workAreaSize` (вычет таскбара):
  - Ноутбуки ($\le 800$px по высоте): `1080 × 680` (min: `960 × 600`).
  - Стандарт Full HD (1920×1080): `1280 × 820` (min: `1000 × 650`).
  - Большие 27"+ (2K/4K, $> 1100$px): `1500 × 960` (min: `1080 × 700`).
* Автосохранение размеров и положения в `store`: `windowBounds`, `isWindowMaximized`. При рестарте восстанавливается.

## Версионирование (Major . Main . Test)
* Формат: `X.Y.Z` (текущая стабильная: `2.15.0`).
  - **`X` (Major):** Глобальное обновление архитектуры.
  - **`Y` (Main):** Стабильный релиз. **Только по прямому указанию пользователя!** При выходе Main-релиза номер `Y` увеличивается на `+1`, а `Z` сбрасывается в `0` (напр. с `2.9.0` → `2.10.0`).
  - **`Z` (Test):** Тестовый билд. При **любом** изменении/патче увеличивается на `+1` (напр. `2.10.1`, `2.10.2`...).
* Ветка git `pre-release` для тестов, ветка `main` для стабильных версий.

## Сборка и релиз
1. Поднять версию в `package.json` (`Z+1` для Test или `Y+1, Z=0` для Main).
2. `git commit -am "message"` → `git push`
3. `npm run build` → `npx electron-builder --win`
4. Подписать `.exe` утилитой `signtool.exe` основным сертификатом `F275C9D4...`
5. Публикация в `kozhaki-vik/industrial-hub-releases`:
   - **Test-сборка:** `.\upload_release.ps1 -Version "X.Y.Z" -FilePath "release\Industrial Hub X.Y.Z.exe" -IsPreRelease $true`
   - **Main-релиз:** `.\upload_release.ps1 -Version "X.Y.0" -FilePath "release\Industrial Hub X.Y.0.exe" -IsPreRelease $false`
* Скрипт создаёт draft, загружает .exe, публикует → Webhook → клиенты получают уведомление.
* Cache-Buster: `?t=${Date.now()}` при запросе GitHub API (кэш Fastly 60 сек).
* Test = Pre-release, Main = Release. PIN для Test ветки: `2136`.

## Подпись кода и безопасность
* **Основной сертификат (10 лет, до 09.2036):**
  - Thumbprint: `F275C9D48A3325871DB04B0FDFB5701BE34802B7`
  - Субъект: `CN=Industrial Studio, O=Kozak`
  - Команда подписи: `signtool.exe sign /sha1 F275C9D48A3325871DB04B0FDFB5701BE34802B7 /fd sha256 /tr http://timestamp.digicert.com /td sha256 <file.exe>`
* **Резервные доверенные сертификаты (`TRUSTED_THUMBPRINTS`):**
  - `CF5FD177247FC2EEB561B69BE223EF0757218C08` (CN=Industrial Systems Studio, O=Kozhaki, до 08.2027)
  - `4061B8CF1678362998377C36C8F16A505ED8CE34` (CN=Kozhaki, O=Industrial Hub Systems, до 08.2036)
* **Автообновление:** перед запуском скачанного `.exe` обязательно валидируется Thumbprint подписи через PowerShell (`Get-AuthenticodeSignature`), проверяя наличие в доверенном списке (`TRUSTED_THUMBPRINTS`).
* **Конфиги Rust:** `config:writeConfig` пишет строго внутри `store.get('rustPath')/cfg`, проверяя `path.basename` от Path Traversal.
* **Диагностика:** `diagnostics:pingUrl` валидирует DNS через `dns.lookup` против SSRF приватных подсетей.

## Ассеты предметов (CDN и локальный кэш)
* Предметы хранятся в единой общей папке: `%APPDATA%\IndustrialHubClient\client\items\` (не удаляется при обновлении версий `app-X.X.X`).
* Протокол `hub-asset://` обслуживается `AssetManager`: локальный кэш + мгновенная on-demand докачка с CDN GitHub при отсутствии файла.

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
const fs = require('fs');
const code = fs.readFileSync('src/i18n.js', 'utf8');

const ru = {
  clan_setup_title: 'Настройка Clan Manager',
  clan_setup_desc: 'Для управления кланом необходимо привязать это приложение к вашему Discord серверу.',
  clan_setup_step1: 'Пригласите бота Industrial Hub на ваш Discord сервер.',
  clan_setup_step2: 'Напишите /hub_link в любом канале вашего сервера.',
  clan_setup_step3: 'Введите 6-значный код ниже.',
  clan_setup_placeholder: 'Введите 6-значный код',
  clan_setup_btn: 'Привязать сервер',
  clan_manager_title: 'Управление кланом',
  clan_unlink_btn: 'Отвязать сервер',
  clan_general_settings: 'Общие настройки',
  clan_name_label: 'Название клана (опционально)',
  clan_name_placeholder: 'Мой Rust клан',
  clan_recruitment_open: 'Набор открыт',
  clan_roles_config: 'Настройка ID ролей',
  clan_roles_desc: 'Включите режим разработчика в Discord, чтобы копировать ID ролей.',
  clan_role_leader: 'ID роли Лидера',
  clan_role_main: 'ID роли Основного состава',
  clan_role_farmer: 'ID роли Фармера',
  clan_role_builder: 'ID роли Билдера',
  clan_save_btn: 'Сохранить изменения',
  clan_stats_title: 'Статистика клана',
  clan_stats_coming_soon: 'Скоро: Обзор голосовой активности, статистика участников и тикеты.',
  clan_connecting: 'Подключение к серверу...',
  clan_loading: 'Загрузка настроек клана...',
  clan_failed: 'Не удалось загрузить конфигурацию.',
  clan_waiting: 'Ожидание подключения...'
};

const en = {
  clan_setup_title: 'Clan Manager Setup',
  clan_setup_desc: 'To manage your clan, you need to link this app to your Discord server.',
  clan_setup_step1: 'Invite the Industrial Hub Bot to your Discord Server.',
  clan_setup_step2: 'Type /hub_link in any channel on your server.',
  clan_setup_step3: 'Enter the 6-digit code below.',
  clan_setup_placeholder: 'Enter 6-digit code',
  clan_setup_btn: 'Link Server',
  clan_manager_title: 'Clan Manager',
  clan_unlink_btn: 'Unlink Server',
  clan_general_settings: 'General Settings',
  clan_name_label: 'Clan Name (Optional)',
  clan_name_placeholder: 'My Rust Clan',
  clan_recruitment_open: 'Recruitment Open',
  clan_roles_config: 'Role IDs Configuration',
  clan_roles_desc: 'Enable Developer Mode in Discord to copy role IDs.',
  clan_role_leader: 'Leader Role ID',
  clan_role_main: 'Main Roster Role ID',
  clan_role_farmer: 'Farmer Role ID',
  clan_role_builder: 'Builder Role ID',
  clan_save_btn: 'Save Changes',
  clan_stats_title: 'Clan Statistics',
  clan_stats_coming_soon: 'Coming soon: Overview of voice activity, member stats, and tickets.',
  clan_connecting: 'Connecting to server...',
  clan_loading: 'Loading clan settings...',
  clan_failed: 'Failed to load configuration.',
  clan_waiting: 'Waiting for active WebSocket connection...'
};

const ua = {
  clan_setup_title: 'Налаштування Clan Manager',
  clan_setup_desc: 'Для керування кланом необхідно прив\'язати цей додаток до вашого Discord серверу.',
  clan_setup_step1: 'Запросіть бота Industrial Hub на ваш Discord сервер.',
  clan_setup_step2: 'Напишіть /hub_link у будь-якому каналі вашого серверу.',
  clan_setup_step3: 'Введіть 6-значний код нижче.',
  clan_setup_placeholder: 'Введіть 6-значний код',
  clan_setup_btn: 'Прив\'язати сервер',
  clan_manager_title: 'Керування кланом',
  clan_unlink_btn: 'Відв\'язати сервер',
  clan_general_settings: 'Загальні налаштування',
  clan_name_label: 'Назва клану (необов\'язково)',
  clan_name_placeholder: 'Мій Rust клан',
  clan_recruitment_open: 'Набір відкрито',
  clan_roles_config: 'Налаштування ID ролей',
  clan_roles_desc: 'Увімкніть режим розробника в Discord, щоб копіювати ID ролей.',
  clan_role_leader: 'ID ролі Лідера',
  clan_role_main: 'ID ролі Основного складу',
  clan_role_farmer: 'ID ролі Фармера',
  clan_role_builder: 'ID ролі Білдера',
  clan_save_btn: 'Зберегти зміни',
  clan_stats_title: 'Статистика клану',
  clan_stats_coming_soon: 'Незабаром: Огляд голосової активності, статистика учасників та тікети.',
  clan_connecting: 'Підключення до сервера...',
  clan_loading: 'Завантаження налаштувань клану...',
  clan_failed: 'Не вдалося завантажити конфігурацію.',
  clan_waiting: 'Очікування підключення...'
};

let modified = code;

function inject(langCode, obj) {
  const marker = langCode + ": {\n    translation: {";
  const idx = modified.indexOf(marker);
  if (idx !== -1) {
    let toInsert = '';
    for (const k in obj) {
      toInsert += '      "' + k + '": "' + obj[k] + '",\n';
    }
    modified = modified.substring(0, idx + marker.length) + '\n' + toInsert + modified.substring(idx + marker.length);
  } else {
    console.log("Not found marker for", langCode);
  }
}

inject('ru', ru);
inject('en', en);
inject('ua', ua);

fs.writeFileSync('src/i18n.js', modified, 'utf8');
console.log('Injected translations into i18n.js');

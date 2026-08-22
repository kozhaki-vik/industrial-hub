import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useNetwork } from '../contexts/NetworkContext';
import { Globe, Moon, Sun, FolderSearch, Code2, Users, Terminal, Bug, Heart, MessageSquare, Send, Gamepad2, RefreshCw } from 'lucide-react';
import { getConfigKey, setConfigKey } from '../services/store';
import { autoDetectRustPath } from '../services/rustPath';
import { useNavigate } from 'react-router-dom';

import kozhakiAvatar from '../assets/team/kozhaki.jpg';
import kaktusAvatar from '../assets/team/kaktus.png';
import pc6Avatar from '../assets/team/pc6.jpg';
import sponsorAvatar from '../assets/team/sponsor.jpg';

const SteamIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.004 0C5.378 0 0 5.378 0 12c0 5.05 3.12 9.345 7.555 11.16l3.414-4.88c-.463-.223-.9-.49-1.295-.8l-4.482 1.28a6.035 6.035 0 01-.044-.694c0-3.322 2.695-6.017 6.017-6.017 2.63 0 4.887 1.685 5.675 4.02l4.478-1.277c-.013-.23-.026-.464-.026-.704 0-5.522-4.477-10-10-10-2.438 0-4.664.88-6.4 2.34l3.157 4.51c.905-.51 1.964-.813 3.094-.813 3.535 0 6.4 2.866 6.4 6.4s-2.865 6.4-6.4 6.4c-1.35 0-2.602-.42-3.634-1.135l-3.38 4.834C18.636 24 24 18.623 24 12c0-6.622-5.378-12-11.996-12zM17.42 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const UaFlag = ({ className }) => (
  <svg viewBox="0 0 24 16" className={`rounded-sm overflow-hidden ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="8" fill="#0057B7" />
    <rect y="8" width="24" height="8" fill="#FFD700" />
  </svg>
);

const EuFlag = ({ className }) => (
  <svg viewBox="0 0 24 16" className={`rounded-sm overflow-hidden ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" fill="#034694" />
    <circle cx="12" cy="8" r="4.5" fill="none" stroke="#FFCC00" strokeWidth="1.5" strokeDasharray="1 1.35" />
  </svg>
);

const UsFlag = ({ className }) => (
  <svg viewBox="0 0 24 16" className={`rounded-sm overflow-hidden ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" fill="#B22234" />
    <rect y="1.23" width="24" height="1.23" fill="#FFFFFF" />
    <rect y="3.69" width="24" height="1.23" fill="#FFFFFF" />
    <rect y="6.15" width="24" height="1.23" fill="#FFFFFF" />
    <rect y="8.61" width="24" height="1.23" fill="#FFFFFF" />
    <rect y="11.07" width="24" height="1.23" fill="#FFFFFF" />
    <rect y="13.53" width="24" height="1.23" fill="#FFFFFF" />
    <rect width="9.6" height="8.61" fill="#3C3B6E" />
  </svg>
);

const RuFlag = ({ className }) => (
  <svg viewBox="0 0 24 16" className={`rounded-sm overflow-hidden ${className}`} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="5.33" fill="#FFFFFF" />
    <rect y="5.33" width="24" height="5.33" fill="#0039A6" />
    <rect y="10.66" width="24" height="5.34" fill="#D52B1E" />
  </svg>
);

const DiscordIcon = ({ className }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
);

const TelegramIcon = ({ className }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
);

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { createTicket, status } = useNetwork();
  const navigate = useNavigate();
  
  const [rustPath, setRustPath] = React.useState(getConfigKey('rustPath') || '');
  
  // Sponsor Modal State
  const [sponsorStep, setSponsorStep] = React.useState(null);
  const [sponsorTime, setSponsorTime] = React.useState('');
  const [sponsorContact, setSponsorContact] = React.useState('');
  const [isSubmittingSponsor, setIsSubmittingSponsor] = React.useState(false);
  const [sponsorSuccess, setSponsorSuccess] = React.useState(false);
  const [sponsorError, setSponsorError] = React.useState(null);

  // Update Channel State
  const [updateChannel, setUpdateChannel] = React.useState(getConfigKey('updateChannel') || 'main');
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [pinInput, setPinInput] = React.useState('');
  const [pinError, setPinError] = React.useState('');

  const handleChannelSwitch = (channel) => {
    if (channel === 'test') {
      setShowPinModal(true);
      setPinError('');
      setPinInput('');
    } else {
      setUpdateChannel('main');
      setConfigKey('updateChannel', 'main');
    }
  };

  const submitPin = () => {
    if (pinInput === '2136') {
      setUpdateChannel('test');
      setConfigKey('updateChannel', 'test');
      setShowPinModal(false);
    } else {
      setPinError(t('invalid_pin', 'Неверный ПИН-код'));
    }
  };

  const resetSponsorState = () => {
    setSponsorTime('');
    setSponsorContact('');
    setSponsorSuccess(false);
    setSponsorError(null);
  };

  React.useEffect(() => {
    let mounted = true;
    if (!rustPath) {
      autoDetectRustPath().then((detected) => {
        if (mounted && detected) {
          setRustPath(detected);
          setConfigKey('rustPath', detected);
        }
      });
    }
    return () => { mounted = false; };
  }, [rustPath]);

  const handlePathChange = (e) => {
    setRustPath(e.target.value);
    setConfigKey('rustPath', e.target.value);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('industrial-hub-lang', newLang);
  };

  return (
    <div className="mb-8 max-w-5xl">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings_title')}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{t('settings_desc')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-8 h-fit">
          
          {/* Rust Path Configuration */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderSearch className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('rust_path')}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">{t('settings_rust_path_desc')}</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('rust_path_placeholder')} 
                value={rustPath}
                onChange={handlePathChange}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-orange-500" 
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800"></div>

          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('language')}</h3>
            </div>
            <div className="flex gap-4">
              {['ru', 'en', 'ua'].map(lang => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="language" 
                    value={lang} 
                    checked={i18n.language === lang} 
                    onChange={handleLanguageChange}
                    className="w-4 h-4 text-orange-500 border-slate-300 dark:border-slate-700 focus:ring-orange-500 dark:bg-slate-800"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 uppercase">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800"></div>

          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-orange-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('theme')}</h3>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="theme" 
                  value="light" 
                  checked={theme === 'light'} 
                  onChange={() => setTheme('light')}
                  className="w-4 h-4 text-orange-500 border-slate-300 dark:border-slate-700 focus:ring-orange-500 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{t('theme_light')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark" 
                  checked={theme === 'dark'} 
                  onChange={() => setTheme('dark')}
                  className="w-4 h-4 text-orange-500 border-slate-300 dark:border-slate-700 focus:ring-orange-500 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{t('theme_dark')}</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800"></div>

          {/* Developer Mode */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('developer_title', 'Режим разработчика')}</h3>
                </div>
                <p className="text-sm text-slate-500">{t('developer_desc', 'Доступ к инструментам диагностики и отладки')}</p>
              </div>
              <button 
                onClick={() => navigate('/developer')}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                {t('developer_open', 'Открыть')}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800"></div>

          {/* Update Channel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('settings_update_channel', 'Канал обновлений')}</h3>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="updateChannel" 
                  value="main" 
                  checked={updateChannel === 'main'} 
                  onChange={() => handleChannelSwitch('main')}
                  className="w-4 h-4 text-orange-500 border-slate-300 dark:border-slate-700 focus:ring-orange-500 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{t('settings_update_main', 'Стабильная (Main)')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="updateChannel" 
                  value="test" 
                  checked={updateChannel === 'test'} 
                  onChange={() => handleChannelSwitch('test')}
                  className="w-4 h-4 text-orange-500 border-slate-300 dark:border-slate-700 focus:ring-orange-500 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{t('settings_update_test', 'Тестовая (Test)')}</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2">{t('settings_update_test_desc', 'Для перехода на тестовую версию требуется ПИН-код.')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Developers Group */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('settings_team_title')}</h3>
            </div>

            <div className="space-y-4">
              {/* Kozak */}
              <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src={kozhakiAvatar} alt="Kozak" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Kozak (Kozhaki)</h4>
                  <p className="text-sm text-orange-500 font-medium mb-2">{t('settings_team_dev')}</p>
                  <div className="flex gap-3">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://steamcommunity.com/id/Kochz/', '_blank'); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Steam">
                      <Gamepad2 className="w-5 h-5" />
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText('@kozhaki.vn'); alert('Discord тег @kozhaki.vn скопирован!'); }} className="text-slate-400 hover:text-[#5865F2] transition-colors" title="Discord: @kozhaki.vn">
                      <DiscordIcon className="w-5 h-5" />
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://t.me/DimitryVik', '_blank'); }} className="text-slate-400 hover:text-[#229ED9] transition-colors" title="Telegram">
                      <TelegramIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* KakTyc */}
              <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src={kaktusAvatar} alt="KakTyc" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">KakTyc</h4>
                  <p className="text-sm text-orange-500 font-medium mb-2">{t('settings_team_qa')}</p>
                  <div className="flex gap-3">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://steamcommunity.com/profiles/76561198131045923', '_blank'); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Steam">
                      <Gamepad2 className="w-5 h-5" />
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText('@kaktycfps'); alert('Discord тег @kaktycfps скопирован!'); }} className="text-slate-400 hover:text-[#5865F2] transition-colors" title="Discord: @kaktycfps">
                      <DiscordIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsors Group */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('settings_sponsors_title')}</h3>
            </div>

            <div className="space-y-4">
              {/* RS6 */}
              <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src={pc6Avatar} alt="RS6" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">RS6</h4>
                  <p className="text-sm text-orange-500 font-medium mb-2">{t('settings_team_sponsor')}</p>
                  <div className="flex gap-3">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://steamcommunity.com/profiles/76561199490640903', '_blank'); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Steam">
                      <Gamepad2 className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Become a sponsor */}
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  resetSponsorState();
                  setSponsorStep('select'); 
                }}
                className="relative w-full overflow-hidden rounded-xl p-[2px] group"
              >
                <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_160deg,#f97316_180deg,transparent_180deg_340deg,#f97316_360deg)] animate-[spin_3s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex gap-4 items-center text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-[10px] w-full h-full hover:bg-orange-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm border border-slate-300 dark:border-slate-600 group-hover:border-orange-500 transition-colors z-10">
                    <img src={sponsorAvatar} alt={t('settings_sponsor_btn')} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors">{t('settings_sponsor_btn')}</h4>
                    <p className="text-sm text-slate-500 mt-1">{t('settings_sponsor_socials')}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Modal */}
      {sponsorStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-main-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('settings_support_project')}</h3>
              <button onClick={() => setSponsorStep(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {sponsorStep === 'select' && (
              <div className="space-y-3 animate-main-fade-in">
                <button onClick={() => setSponsorStep('monobank')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <UaFlag className="w-8 h-6 shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('settings_support_mono')}</span>
                  <div className="ml-auto flex items-center gap-2" title={t('settings_support_tooltip_mono')}>
                    <EuFlag className="w-6 h-4 opacity-80" />
                    <UsFlag className="w-6 h-4 opacity-80" />
                  </div>
                </button>
                <button onClick={() => setSponsorStep('stars')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Globe className="w-6 h-6 text-blue-500 ml-1 mr-1 shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('settings_support_stars')}</span>
                  <div className="ml-auto flex items-center gap-2" title={t('settings_support_tooltip')}>
                    <RuFlag className="w-6 h-4 opacity-80" />
                    <EuFlag className="w-6 h-4 opacity-80" />
                    <UsFlag className="w-6 h-4 opacity-80" />
                  </div>
                </button>
                <button onClick={() => setSponsorStep('crypto')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Globe className="w-6 h-6 text-purple-500 ml-1 mr-1 shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('settings_support_crypto')}</span>
                  <div className="ml-auto flex items-center gap-2" title={t('settings_support_tooltip')}>
                    <RuFlag className="w-6 h-4 opacity-80" />
                    <EuFlag className="w-6 h-4 opacity-80" />
                    <UsFlag className="w-6 h-4 opacity-80" />
                  </div>
                </button>
                <div className="w-full flex justify-between items-center p-4 rounded-xl border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5 opacity-80 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <RuFlag className="w-8 h-6 shrink-0" />
                    <span className="font-medium text-slate-600 dark:text-slate-400">{t('settings_support_rf')}</span>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-md whitespace-nowrap">{t('settings_support_wip')}</span>
                </div>
              </div>
            )}

            {sponsorSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center h-48 animate-main-fade-in">
                <div className="text-4xl">🎉</div>
                <div>
                  <p className="font-bold text-lg">{t('settings_support_success')}</p>
                  <p className="text-sm mt-1 opacity-80">{t('settings_support_success_desc')}</p>
                </div>
              </div>
            ) : (sponsorStep !== 'select' && sponsorStep !== null) && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sponsorTime || !sponsorContact) {
                    setSponsorError(t('settings_support_err_fill'));
                    return;
                  }
                  setIsSubmittingSponsor(true);
                  setSponsorError(null);
                  try {
                    const type = sponsorStep === 'monobank' ? 'Monobank' : sponsorStep === 'stars' ? 'Telegram Stars' : 'Telegram Crypto';
                    const message = `Новая заявка на спонсорство!\nСпособ: ${type}\nВремя из чека: ${sponsorTime}\nКонтакт для карточки: ${sponsorContact}`;
                    await createTicket(message, "Sponsorship");
                    setSponsorSuccess(true);
                    setTimeout(() => setSponsorStep(null), 3000);
                  } catch (err) {
                    setSponsorError(err.message || t('settings_support_err_send'));
                  } finally {
                    setIsSubmittingSponsor(false);
                  }
                }} 
                className="flex flex-col gap-4 animate-main-fade-in"
              >
                <button type="button" onClick={() => setSponsorStep('select')} className="text-sm text-orange-500 hover:underline mb-2 flex items-center gap-1 -ml-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {t('settings_support_back')}
                </button>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {sponsorStep === 'monobank' ? t('settings_support_pay_mono') : sponsorStep === 'stars' ? t('settings_support_pay_stars') : t('settings_support_pay_crypto')}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {sponsorStep === 'monobank' && t('settings_support_mono_desc')}
                    {sponsorStep === 'stars' && t('settings_support_stars_desc')}
                    {sponsorStep === 'crypto' && t('settings_support_crypto_desc')}
                  </p>
                  <div className="font-mono text-sm bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-700 select-all break-all">
                    {sponsorStep === 'monobank' && '4441111058883608 (DMYTRO KONDRATENKO)'}
                    {sponsorStep === 'stars' && '@DimitryVik'}
                    {sponsorStep === 'crypto' && 'UQB9fUOuZNUEo0qkkEXaeehiZT-W3IgPfAwmwtRhG7BrdJ7t'}
                  </div>
                </div>

                {sponsorError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                    {sponsorError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('settings_support_time')}
                  </label>
                  <input 
                    type="text"
                    value={sponsorTime}
                    onChange={(e) => setSponsorTime(e.target.value)}
                    placeholder={t('settings_support_example')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('settings_support_contact')}
                  </label>
                  <input 
                    type="text"
                    value={sponsorContact}
                    onChange={(e) => setSponsorContact(e.target.value)}
                    placeholder={t('settings_support_tag')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingSponsor || !sponsorTime || !sponsorContact || status !== 'online'}
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSponsor ? (
                    <span className="animate-spin text-xl">↻</span>
                  ) : (
                    t('settings_support_send')
                  )}
                </button>
                {status !== 'online' && (
                  <p className="text-xs text-red-500 text-center mt-1">Нет подключения к серверу</p>
                )}
              </form>
            )}
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-main-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('settings_pin_title', 'Ввод ПИН-кода')}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('settings_pin_desc', 'Введите ПИН-код для доступа к тестовым сборкам.')}</p>
            
            <input 
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={t('settings_pin_placeholder', 'ПИН-код')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-2"
              onKeyDown={(e) => e.key === 'Enter' && submitPin()}
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500 mb-4">{pinError}</p>}
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => { setShowPinModal(false); setUpdateChannel('main'); }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('settings_pin_cancel', 'Отмена')}
              </button>
              <button 
                onClick={submitPin}
                className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('settings_pin_submit', 'Подтвердить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

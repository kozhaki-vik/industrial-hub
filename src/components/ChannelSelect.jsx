import React from 'react';

const ChannelSelect = ({ label, description, value, onChange, discordChannels = [], typeFilter = null, required = false }) => {
  const filteredChannels = typeFilter !== null 
    ? discordChannels.filter(c => c.type === typeFilter || (Array.isArray(typeFilter) && typeFilter.includes(c.type)))
    : discordChannels;

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{description}</p>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-colors"
      >
        <option value="">{t('select_none', '-- Не выбрано --')}</option>
        {filteredChannels.map(c => {
          let prefix = '';
          if (c.type === 4) prefix = '📁 ';
          else if (c.type === 2) prefix = '🔊 ';
          else prefix = '#️⃣ ';
          return <option key={c.id} value={c.id}>{prefix}{c.name}</option>
        })}
      </select>
    </div>
  );
};

export default ChannelSelect;

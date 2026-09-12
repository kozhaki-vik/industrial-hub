import React from 'react';
import { useTranslation } from 'react-i18next';

const RoleSelect = ({ label, description, value, onChange, discordRoles = [], required = false, rightAction = null }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500 ml-1">*</span>}</span>
        </label>
      )}
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{description}</p>}
      <div className="flex items-center gap-2">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-colors truncate"
        >
          <option value="">{t('select_none', '-- Не выбрано --')}</option>
          {discordRoles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {rightAction}
      </div>
    </div>
  );
};

export default RoleSelect;

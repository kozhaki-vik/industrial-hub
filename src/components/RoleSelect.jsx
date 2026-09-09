import React from 'react';

const RoleSelect = ({ label, description, value, onChange, discordRoles = [], required = false }) => {
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
        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
      >
        <option value="">-- Не выбрано --</option>
        {discordRoles.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelect;

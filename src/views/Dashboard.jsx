import React from 'react';
import { LayoutDashboard, Map, Zap, Monitor, MonitorPlay, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('overview_title')}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{t('overview_desc')}</p>

      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card 
          title={t('conveyors_title')}
          description={t('conveyors_desc')}
          icon={LayoutDashboard}
          onClick={() => navigate('/conveyors')}
        />
        <Card 
          title={t('monuments_title')}
          description={t('monuments_desc')}
          icon={Map}
          onClick={() => navigate('/monuments')}
        />
        <Card 
          title={t('electricity_title')}
          description={t('electricity_desc')}
          icon={Zap}
          onClick={() => navigate('/electricity')}
        />
      </div>

      {/* Row 2: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          title={t('gamma_title')}
          description={t('gamma_desc')}
          icon={Monitor}
          onClick={() => navigate('/gamma')}
        />
        <Card 
          title={t('binds_title')}
          description={t('binds_desc')}
          icon={Keyboard}
          onClick={() => navigate('/binds')}
        />
        <Card 
          title={t('graphics_title')}
          description={t('graphics_desc')}
          icon={MonitorPlay}
          onClick={() => navigate('/graphics')}
        />
      </div>
    </div>
  );
}

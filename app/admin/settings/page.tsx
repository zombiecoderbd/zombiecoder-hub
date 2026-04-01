'use client';

import { useState } from 'react';
import { Header } from '../components/Header';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemName: 'ZombieCoder Hub v2.0',
    environment: 'production',
    enableLogging: true,
    enableAudit: true,
    maxSessions: 1000,
    sessionTimeout: 3600,
    backupSchedule: 'daily',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <>
      <Header title="System Settings" subtitle="Configure ZombieCoder Hub settings" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* General Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">General</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                System Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleChange('systemName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Environment
              </label>
              <select
                value={settings.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">System Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Sessions
              </label>
              <input
                type="number"
                value={settings.maxSessions}
                onChange={(e) => handleChange('maxSessions', parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Session Timeout (seconds)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Features</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Enable Logging</label>
              <input
                type="checkbox"
                checked={settings.enableLogging}
                onChange={(e) => handleChange('enableLogging', e.target.checked)}
                className="w-5 h-5 rounded border-border cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Enable Audit Trail</label>
              <input
                type="checkbox"
                checked={settings.enableAudit}
                onChange={(e) => handleChange('enableAudit', e.target.checked)}
                className="w-5 h-5 rounded border-border cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Backup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Backup Schedule
              </label>
              <select
                value={settings.backupSchedule}
                onChange={(e) => handleChange('backupSchedule', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
              Backup Now
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save Settings
        </button>
      </div>
    </>
  );
}

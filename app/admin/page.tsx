'use client';

import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { Users, Zap, Clock, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="System overview and key metrics" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        <MetricCard
          label="Total Users"
          value={"-"}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          label="Active Agents"
          value={"-"}
          icon={<Zap className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          label="Active Sessions"
          value={"-"}
          icon={<Clock className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          label="Governance"
          value={"Enabled"}
          icon={<Shield className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <h2 className="text-xl font-bold text-foreground">Quick Links</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Use the sidebar to navigate users, agents, tools, and governance.
        </p>
      </div>
    </>
  );
}

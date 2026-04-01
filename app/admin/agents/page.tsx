'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  version: string;
  lastUpdated: string;
  sessionsCount: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/admin/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const mockAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Editor Agent',
      description: 'Code editing and refactoring assistant',
      status: 'active',
      version: '2.0.0',
      lastUpdated: '2024-03-28',
      sessionsCount: 45,
    },
    {
      id: 'agent-2',
      name: 'Documentation Agent',
      description: 'Automatic documentation generator',
      status: 'active',
      version: '1.8.5',
      lastUpdated: '2024-03-25',
      sessionsCount: 28,
    },
    {
      id: 'agent-3',
      name: 'Governance Agent',
      description: 'System policy enforcement',
      status: 'active',
      version: '2.1.0',
      lastUpdated: '2024-03-30',
      sessionsCount: 12,
    },
  ];

  const displayAgents = agents.length > 0 ? agents : mockAgents;

  const columns = [
    {
      key: 'name' as const,
      label: 'Agent Name',
    },
    {
      key: 'description' as const,
      label: 'Description',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'version' as const,
      label: 'Version',
    },
    {
      key: 'sessionsCount' as const,
      label: 'Active Sessions',
    },
    {
      key: 'lastUpdated' as const,
      label: 'Last Updated',
    },
  ];

  return (
    <>
      <Header title="Agents" subtitle="Manage AI agents and their configurations" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Agents</h2>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Deploy Agent
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={displayAgents}
          loading={loading && agents.length === 0}
        />
      </div>
    </>
  );
}

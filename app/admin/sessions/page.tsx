'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface Session {
  id: string;
  userId: string;
  agentId: string;
  status: 'active' | 'inactive';
  duration: string;
  startedAt: string;
  messageCount: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/admin/sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const mockSessions: Session[] = [
    {
      id: 'sess-001',
      userId: '1',
      agentId: 'agent-1',
      status: 'active',
      duration: '2h 15m',
      startedAt: '2024-04-01 08:30',
      messageCount: 34,
    },
    {
      id: 'sess-002',
      userId: '2',
      agentId: 'agent-2',
      status: 'active',
      duration: '45m',
      startedAt: '2024-04-01 09:15',
      messageCount: 12,
    },
    {
      id: 'sess-003',
      userId: '3',
      agentId: 'agent-1',
      status: 'active',
      duration: '1h 30m',
      startedAt: '2024-04-01 08:45',
      messageCount: 28,
    },
  ];

  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  const columns = [
    {
      key: 'id' as const,
      label: 'Session ID',
      render: (value: string) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: 'userId' as const,
      label: 'User',
    },
    {
      key: 'agentId' as const,
      label: 'Agent',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'duration' as const,
      label: 'Duration',
    },
    {
      key: 'messageCount' as const,
      label: 'Messages',
    },
    {
      key: 'startedAt' as const,
      label: 'Started At',
    },
  ];

  return (
    <>
      <Header title="Sessions" subtitle="Monitor active and completed sessions" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Sessions</h2>
        </div>
        
        <DataTable
          columns={columns}
          data={displaySessions}
          loading={loading && sessions.length === 0}
        />
      </div>
    </>
  );
}

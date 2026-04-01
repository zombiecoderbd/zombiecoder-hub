'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
  details: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/logs');
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const mockLogs: AuditLog[] = [
    {
      id: 'log-001',
      action: 'User Login',
      userId: '1',
      resource: 'User',
      status: 'success',
      timestamp: '2024-04-01 10:30:15',
      details: 'Successful login from IP 192.168.1.100',
    },
    {
      id: 'log-002',
      action: 'Agent Deployed',
      userId: '1',
      resource: 'Agent',
      status: 'success',
      timestamp: '2024-04-01 10:15:42',
      details: 'Editor Agent v2.0.0 deployed',
    },
    {
      id: 'log-003',
      action: 'Policy Updated',
      userId: '1',
      resource: 'Policy',
      status: 'success',
      timestamp: '2024-04-01 09:45:30',
      details: 'File Operations policy updated',
    },
    {
      id: 'log-004',
      action: 'Tool Execution',
      userId: '2',
      resource: 'Tool',
      status: 'success',
      timestamp: '2024-04-01 09:20:12',
      details: 'read-file tool executed successfully',
    },
    {
      id: 'log-005',
      action: 'Access Denied',
      userId: '3',
      resource: 'Tool',
      status: 'failure',
      timestamp: '2024-04-01 08:50:45',
      details: 'Unauthorized access to execute-command tool',
    },
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  const columns = [
    {
      key: 'action' as const,
      label: 'Action',
    },
    {
      key: 'userId' as const,
      label: 'User',
    },
    {
      key: 'resource' as const,
      label: 'Resource',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'details' as const,
      label: 'Details',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs">{value}</span>
      ),
    },
    {
      key: 'timestamp' as const,
      label: 'Timestamp',
      render: (value: string) => (
        <span className="text-xs text-muted-foreground">{value}</span>
      ),
    },
  ];

  return (
    <>
      <Header title="Audit Logs" subtitle="Complete system audit trail and operation history" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Audit Logs</h2>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Export
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={displayLogs}
          loading={loading && logs.length === 0}
        />
      </div>
    </>
  );
}

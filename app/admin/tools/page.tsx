'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  usageCount: number;
  lastUsed: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/admin/tools');
        if (response.ok) {
          const data = await response.json();
          setTools(data);
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const mockTools: Tool[] = [
    {
      id: 'tool-1',
      name: 'read-file',
      description: 'Read file contents',
      status: 'active',
      usageCount: 342,
      lastUsed: '2024-04-01 10:15',
      riskLevel: 'low',
    },
    {
      id: 'tool-2',
      name: 'write-file',
      description: 'Write or modify files',
      status: 'active',
      usageCount: 187,
      lastUsed: '2024-04-01 09:45',
      riskLevel: 'medium',
    },
    {
      id: 'tool-3',
      name: 'execute-command',
      description: 'Execute system commands',
      status: 'active',
      usageCount: 54,
      lastUsed: '2024-03-31 16:20',
      riskLevel: 'high',
    },
    {
      id: 'tool-4',
      name: 'search-files',
      description: 'Search file system',
      status: 'active',
      usageCount: 128,
      lastUsed: '2024-04-01 08:30',
      riskLevel: 'low',
    },
  ];

  const displayTools = tools.length > 0 ? tools : mockTools;

  const columns = [
    {
      key: 'name' as const,
      label: 'Tool Name',
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
      key: 'riskLevel' as const,
      label: 'Risk Level',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'high' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
          value === 'medium' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400' :
          'bg-green-500/10 text-green-700 dark:text-green-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'usageCount' as const,
      label: 'Usage Count',
    },
    {
      key: 'lastUsed' as const,
      label: 'Last Used',
    },
  ];

  return (
    <>
      <Header title="Tools" subtitle="Manage and monitor available tools" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Tools</h2>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Register Tool
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={displayTools}
          loading={loading && tools.length === 0}
        />
      </div>
    </>
  );
}

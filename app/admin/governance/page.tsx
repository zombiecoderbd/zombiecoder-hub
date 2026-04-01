'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface Policy {
  id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export default function GovernancePage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch('/api/admin/governance');
        if (response.ok) {
          const data = await response.json();
          setPolicies(data);
        }
      } catch (error) {
        console.error('Failed to fetch policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const mockPolicies: Policy[] = [
    {
      id: 'policy-1',
      name: 'File Operations',
      description: 'Controls file read/write operations',
      type: 'OPERATION',
      isActive: true,
      riskScore: 25,
      createdAt: '2024-01-15',
      updatedAt: '2024-03-20',
    },
    {
      id: 'policy-2',
      name: 'Command Execution',
      description: 'Limits system command execution',
      type: 'OPERATION',
      isActive: true,
      riskScore: 75,
      createdAt: '2024-01-10',
      updatedAt: '2024-03-25',
    },
    {
      id: 'policy-3',
      name: 'Data Access',
      description: 'Governs data access and retrieval',
      type: 'DATA',
      isActive: true,
      riskScore: 15,
      createdAt: '2024-02-01',
      updatedAt: '2024-03-22',
    },
  ];

  const displayPolicies = policies.length > 0 ? policies : mockPolicies;

  const columns = [
    {
      key: 'name' as const,
      label: 'Policy Name',
    },
    {
      key: 'description' as const,
      label: 'Description',
    },
    {
      key: 'type' as const,
      label: 'Type',
      render: (value: string) => (
        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'isActive' as const,
      label: 'Status',
      render: (value: boolean) => <StatusBadge status={value ? 'active' : 'inactive'} />,
    },
    {
      key: 'riskScore' as const,
      label: 'Risk Score',
      render: (value: number) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value > 50 ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
          value > 25 ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400' :
          'bg-green-500/10 text-green-700 dark:text-green-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'updatedAt' as const,
      label: 'Updated',
    },
  ];

  return (
    <>
      <Header title="Governance" subtitle="Manage system policies and risk assessments" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Governance Policies</h2>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Create Policy
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={displayPolicies}
          loading={loading && policies.length === 0}
        />
      </div>
    </>
  );
}

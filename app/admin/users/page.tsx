'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Mock data for demo
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@zombiecoder.local',
      name: 'Admin User',
      role: 'ADMIN',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-04-01 10:30',
    },
    {
      id: '2',
      email: 'user1@example.com',
      name: 'John Developer',
      role: 'CLIENT',
      status: 'active',
      createdAt: '2024-02-10',
      lastLogin: '2024-03-31 14:20',
    },
    {
      id: '3',
      email: 'user2@example.com',
      name: 'Jane Coder',
      role: 'CLIENT',
      status: 'active',
      createdAt: '2024-02-15',
      lastLogin: '2024-04-01 09:15',
    },
    {
      id: '4',
      email: 'user3@example.com',
      name: 'Bob Inactive',
      role: 'CLIENT',
      status: 'inactive',
      createdAt: '2024-03-01',
      lastLogin: '2024-03-15 11:00',
    },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  const columns = [
    {
      key: 'email' as const,
      label: 'Email',
    },
    {
      key: 'name' as const,
      label: 'Name',
    },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: string) => (
        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: 'lastLogin' as const,
      label: 'Last Login',
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
    },
  ];

  return (
    <>
      <Header title="Users" subtitle="Manage system users and access levels" />
      
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">User List</h2>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Add User
          </button>
        </div>
        
        <DataTable
          columns={columns}
          data={displayUsers}
          loading={loading && users.length === 0}
        />
      </div>
    </>
  );
}

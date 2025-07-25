'use client';

import { useState, useEffect } from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { UserFilters, useUsers } from '@/hooks/useUserManage';
import { UserTable } from '@/components/admin/users/user-table';
import { UserForm } from '@/components/admin/users/user-form';
import { Modal } from '@/components/admin/ui/modal';
import { Pagination } from '@/components/admin/ui/pagination';
import { AUser } from '@/types/admin';

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AUser | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };

  const handleSubmit = async (
    userData: Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleFilterChange = (
    key: keyof UserFilters,
    value: string | number,
  ) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } transition-colors duration-100`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          User Management
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
            aria-label={`Switch to ${
              theme === 'light' ? 'dark' : 'light'
            } theme`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300">
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => {
              const search = e.target.value;
              setFilters((prev) => ({ ...prev, search, page: 1 }));
              fetchUsers({ ...filters, search, page: 1 });
            }}
            placeholder="Search users by name or email..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              value: filters.sortBy,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange('sortBy', e.target.value),
              options: [
                { value: 'createdAt', label: 'Created At' },
                { value: 'name', label: 'Name' },
                { value: 'email', label: 'Email' },
              ],
              label: 'Sort By',
            },
            {
              value: filters.sortOrder,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange('sortOrder', e.target.value),
              options: [
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' },
              ],
              label: 'Order',
            },
            {
              value: filters.roles || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange('roles', e.target.value),
              options: [
                { value: '', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
              ],
              label: 'Role',
            },
            {
              value: filters.status || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange('status', e.target.value),
              options: [
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ],
              label: 'Status',
            },
            {
              value: filters.oauthProvider || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange('oauthProvider', e.target.value),
              options: [
                { value: '', label: 'All Providers' },
                { value: 'google', label: 'Google' },
                { value: 'facebook', label: 'Facebook' },
                { value: 'local', label: 'Email/Password' },
              ],
              label: 'Provider',
            },
          ].map((filter, index) => (
            <div key={index} className="relative">
              <select
                value={filter.value}
                onChange={filter.onChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none transition-all duration-300 hover:shadow-md"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-8 animate-pulse">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          loading={loading}
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t dark:border-gray-700">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <UserForm
          user={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}

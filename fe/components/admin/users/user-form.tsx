'use client';

import type React from 'react';

import { User } from '@/types/auth';
import { AUser } from '@/types/admin';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

interface UserFormProps {
  user?: AUser;
  onSubmit: (
    userData: Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, loading }: UserFormProps) {
  const userForm: UseFormReturn<Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>> =
    useForm<Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>>({
      // Set default values from the user prop or initial states
      defaultValues: {
        username: user?.username || '',
        password: '',
        email: user?.email || '',
        status: user?.status || 'UNVERIFIED', // Default status as 'UNVERIFIED'
        // role: user?.role || 'user', // Uncomment if role is used
      },
    });

  const handleSubmit = async () => {
    await onSubmit(userForm.getValues());
    onCancel();
  };

  return (
    <form onSubmit={userForm.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          id="username"
          type="text"
          // Sử dụng form.register để truy cập phương thức register
          {...userForm.register('username', { required: 'Name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Sử dụng form.errors để truy cập đối tượng errors */}
        {userForm.formState.errors.username && (
          <p className="text-red-500 text-xs mt-1">
            {userForm.formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...userForm.register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: 'Invalid email address',
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {userForm.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {userForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          {...userForm.register('password', {
            required: user ? false : 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {userForm.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {userForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          {...userForm.register('status', { required: 'Status is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="UNVERIFIED">Unverified</option>
          <option value="VERIFIED">Verified</option>
        </select>
        {userForm.formState.errors.status && (
          <p className="text-red-500 text-xs mt-1">
            {userForm.formState.errors.status.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

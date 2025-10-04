import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import Button from './Button';
import { API_BASE_URL, ADMIN_CREATION_ROLES } from '../utils/constants';

const AdminTools = ({ authState }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ADMIN_CREATION_ROLES[0]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (authState.role !== 'admin') {
        return <div className="p-6 text-red-500">Access Denied: Only Admins can access these tools.</div>;
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! User ${email} created with role ${role.toUpperCase()}.`);
                setEmail('');
                setPassword('');
            } else {
                setMessage(`Error: ${data.message || 'Failed to create user.'}`);
            }
        } catch (error) {
            setMessage('Network error or server unreachable.');
            console.error('Admin Tools Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <Settings size={28} />
                <span>Admin Tools</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use this module to securely create new **Admin** or **HR** users. Standard users must use the public registration page.
            </p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Management User</h3>
                {message && (
                    <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            id="adminEmail"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="adminPassword"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <select
                            id="adminRole"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            {ADMIN_CREATION_ROLES.map(r => (
                                <option key={r} value={r}>{r.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={isLoading} icon={Plus} variant="primary" className="w-full">
                        {isLoading ? 'Creating...' : `Create ${role.toUpperCase()} User`}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminTools;

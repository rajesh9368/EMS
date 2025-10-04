import React, { useState } from 'react';
import { LogOut, Plus } from 'lucide-react';
import Button from './Button';
import { API_BASE_URL } from '../utils/constants';

const Auth = ({ setAuthState }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        const method = 'POST';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login or signup
                if (data.token) {
                    // Store token in local storage and update main App state
                    localStorage.setItem('jwt', data.token);
                    setAuthState({
                        token: data.token,
                        user: data.data.user,
                        isAuthenticated: true,
                        role: data.data.user.role 
                    });
                } else if (!isLogin) {
                    setMessage('Registration successful! Please log in.');
                    setIsLogin(true); // Switch to login after successful signup
                }
            } else {
                setMessage(`Error: ${data.message || (data.errors ? data.errors.join(', ') : 'Authentication failed.')}`);
            }
        } catch (error) {
            setMessage('Network error or server unreachable.');
            console.error('Auth Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
                    {isLogin ? 'Sign In' : 'Register'} to HRMS
                </h2>
                {message && (
                    <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <Button type="submit" disabled={isLoading} icon={isLogin ? LogOut : Plus} variant="primary">
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </Button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition font-medium"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;

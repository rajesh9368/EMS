import React, { useState, useEffect } from 'react';
import { LogOut, Users, Building, Settings } from 'lucide-react';
import Auth from './components/Auth';
import DepartmentManagement from './components/DepartmentManagement';
import EmployeeManagement from './components/EmployeeManagement';
import AdminTools from './components/AdminTools';
import Button from './components/Button';
import { API_BASE_URL } from './utils/constants';

// Icon mapping for navigation
const iconMap = {
    Users,
    Building,
    Settings
};

// --- MAIN APP COMPONENT ---

const App = () => {
    // page: 1=Employees, 2=Departments, 3=AdminTools
    const [page, setPage] = useState(1); 
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        user: null,
        role: null,
    });
    const [isAppLoading, setIsAppLoading] = useState(true);

    // Check for existing token on load (validate with server)
    useEffect(() => {
        const validateAuthOnLoad = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    // Validate token with server by testing a protected endpoint
                    const response = await fetch(`${API_BASE_URL}/departments`, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });
                    
                    if (response.ok) {
                        // Token is valid, set authenticated state
                        // We'll use the saved login approach where actual user data comes from login
                        setAuthState({ 
                            isAuthenticated: true, 
                            token: token, 
                            user: { email: 'Authenticated User', role: 'check_login' },
                            role: 'check_login' // This will be updated when user actually logs in
                        });
                    } else {
                        // Token is invalid, remove from localStorage
                        localStorage.removeItem('jwt');
                        setAuthState({ isAuthenticated: false, token: null, user: null, role: null });
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('jwt');
                    setAuthState({ isAuthenticated: false, token: null, user: null, role: null });
                }
            }
            setIsAppLoading(false);
        };
        
        validateAuthOnLoad();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setAuthState({ isAuthenticated: false, token: null, user: null, role: null });
        setPage(1); // Reset page to default view
    };

    if (isAppLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Loading Application...
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return <Auth setAuthState={setAuthState} />;
    }

    // Determine the component to render based on the current page state
    const renderPage = () => {
        switch (page) {
            case 1:
                return <EmployeeManagement authState={authState} />;
            case 2:
                return <DepartmentManagement authState={authState} />;
            case 3:
                return <AdminTools authState={authState} />;
            default:
                return <EmployeeManagement authState={authState} />;
        }
    };

    const navItems = [
        { id: 1, name: 'Employees', icon: 'Users', component: EmployeeManagement },
        { id: 2, name: 'Departments', icon: 'Building', component: DepartmentManagement },
    ];

    if (authState.role === 'admin') {
        navItems.push({ id: 3, name: 'Admin Tools', icon: 'Settings', component: AdminTools });
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {/* Header / Navigation Bar */}
            <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">HRMS</span>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden sm:flex space-x-4 items-center">
                            {navItems.map(item => {
                                const IconComponent = iconMap[item.icon];
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setPage(item.id)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${page === item.id ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <IconComponent size={18} />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* User Info and Logout */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
                                Logged in as: <span className="font-semibold">{authState.user?.email || 'User'}</span>
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                    {authState.role}
                                </span>
                            </div>
                            <Button onClick={handleLogout} icon={LogOut} variant="danger" title="Logout" className="p-2 sm:p-0">
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation (Bottom Bar) */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-20">
                    <div className="flex justify-around items-center h-14">
                        {navItems.map(item => {
                            const IconComponent = iconMap[item.icon];
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setPage(item.id)}
                                    className={`flex flex-col items-center p-2 text-xs transition duration-150 ease-in-out ${page === item.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                >
                                    <IconComponent size={20} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-20 sm:mb-0">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
// --- CONFIGURATION ---
// IMPORTANT: Change this base URL if your backend server runs on a different location.
export const API_BASE_URL = 'https://ems-1-fkup.onrender.com/api';

// Available roles for assignment
export const EMPLOYEE_ROLES = ['employee', 'HR', 'admin'];

// Roles an admin can create
export const ADMIN_CREATION_ROLES = ['HR', 'admin'];

// Navigation items configuration
export const NAV_ITEMS = [
    { id: 1, name: 'Employees', icon: 'Users', component: 'EmployeeManagement' },
    { id: 2, name: 'Departments', icon: 'Building', component: 'DepartmentManagement' },
    { id: 3, name: 'Admin Tools', icon: 'Settings', component: 'AdminTools' }
];

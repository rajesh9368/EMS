import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Edit, Search, Filter, Link as LinkIcon, Slash } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import { API_BASE_URL, EMPLOYEE_ROLES } from '../utils/constants';
import { formatDate, getDeptName, canManage } from '../utils/helpers';

const EmployeeManagement = ({ authState }) => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [unlinkedUsers, setUnlinkedUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        role: 'employee', 
        department_id: '', 
        joining_date: '', 
        user_id: '' 
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const userCanManage = canManage(authState.role);

    const fetchDropdownData = async () => {
        setIsLoading(true);
        try {
            // Fetch Departments
            const deptResponse = await fetch(`${API_BASE_URL}/departments`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (deptResponse.ok) {
                const deptData = await deptResponse.json();
                setDepartments(deptData.data.departments || []);
            }

            // Fetch Unlinked Users (for linkage feature)
            if (userCanManage) {
                const usersResponse = await fetch(`${API_BASE_URL}/employees/unlinked-users`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUnlinkedUsers(usersData.data.unlinkedUsers || []);
                }
            }
        } catch (error) {
            setMessage('Network error fetching dropdown data.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            let url = `${API_BASE_URL}/employees?`;
            
            if (searchQuery) {
                url += `search=${encodeURIComponent(searchQuery)}&`;
            }
            if (filterDept) {
                url += `department_id=${encodeURIComponent(filterDept)}&`;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.data.employees || []);
            } else {
                setMessage('Failed to fetch employees.');
            }
        } catch (error) {
            setMessage('Network error while fetching employees.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (authState.token) {
            fetchDropdownData();
            fetchEmployees();
        }
    }, [authState.token, searchQuery, filterDept]); // Re-fetch when search or filter changes

    const openModal = (employee = null) => {
        setCurrentEmployee(employee);
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email,
                role: employee.role,
                department_id: employee.department_id?._id || employee.department_id || '', // Handle nested object if populated
                joining_date: employee.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : '',
                user_id: employee.user_id || '',
            });
        } else {
            setFormData({ name: '', email: '', role: 'employee', department_id: '', joining_date: '', user_id: '' });
        }
        setMessage('');
        setModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const method = currentEmployee ? 'PUT' : 'POST';
        const endpoint = currentEmployee ? `/employees/${currentEmployee._id}` : '/employees';

        // Prepare data: remove user_id if it's an empty string (to avoid linking error)
        const dataToSend = { ...formData };
        if (dataToSend.user_id === '') {
            delete dataToSend.user_id;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMessage(`Employee ${currentEmployee ? 'updated' : 'added'} successfully!`);
                setModalOpen(false);
                fetchEmployees();
                fetchDropdownData(); // Refresh unlinked users list
            } else {
                const data = await response.json();
                setMessage(`Failed to save: ${data.message || (data.errors ? data.errors.join(', ') : 'Check network.')}`);
            }
        } catch (error) {
            setMessage('Network error during save operation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (empId) => {
        if (!window.confirm('Are you sure you want to delete this employee record?')) return;
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/employees/${empId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.ok) {
                setMessage('Employee deleted successfully!');
                fetchEmployees();
                fetchDropdownData(); // Refresh unlinked users list
            } else {
                const data = await response.json();
                setMessage(`Failed to delete: ${data.message || 'Check network.'}`);
            }
        } catch (error) {
            setMessage('Network error during delete operation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <Users size={28} />
                    <span>Employee Management</span>
                </h2>
                {userCanManage && (
                    <Button onClick={() => openModal()} icon={Plus} variant="primary">
                        Add New Employee
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') || message.startsWith('Failed') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                    {message}
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search by Name or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <div className="relative">
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="appearance-none w-full sm:w-48 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                
                <Button onClick={() => { setSearchQuery(''); setFilterDept(''); }} variant="secondary">
                    Clear Filters
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-x-auto">
                {isLoading && (searchQuery || filterDept) ? (
                    <div className="p-10 text-center text-gray-500">Searching...</div>
                ) : isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading employees...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Auth Status</th>
                                {userCanManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {employees.length > 0 ? employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : emp.role === 'HR' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {getDeptName(emp.department_id?._id || emp.department_id, departments)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(emp.joining_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {emp.user_id ? (
                                            <span className="flex items-center text-green-600 dark:text-green-400">
                                                <LinkIcon size={16} className="mr-1" /> Linked
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 dark:text-red-400">
                                                <Slash size={16} className="mr-1" /> Unlinked
                                            </span>
                                        )}
                                    </td>
                                    {userCanManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button onClick={() => openModal(emp)} icon={Edit} variant="secondary">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(emp._id)} icon={X} variant="danger">
                                                Delete
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        No employees match your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalOpen && (
                <Modal title={currentEmployee ? 'Edit Employee' : 'Add New Employee'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input id="name" type="text" name="name" required value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input id="email" type="email" name="email" required value={formData.email} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                <select id="role" name="role" required value={formData.role} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                    {EMPLOYEE_ROLES.map(r => (
                                        <option key={r} value={r}>{r.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                <select id="department_id" name="department_id" required value={formData.department_id} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</label>
                                <input id="joining_date" type="date" name="joining_date" required value={formData.joining_date} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            {/* User Linkage Field - only visible for managers */}
                            {userCanManage && (
                                <div>
                                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link User Account</label>
                                    <select id="user_id" name="user_id" value={formData.user_id} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">{currentEmployee?.user_id ? 'Current User Linked' : 'Do Not Link (Default)'}</option>
                                        {unlinkedUsers.map(user => (
                                            <option key={user._id} value={user._id}>{user.email} (Role: {user.role})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select an existing user login to link to this employee profile.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setModalOpen(false)} variant="secondary">Cancel</Button>
                            <Button type="submit" disabled={isLoading} icon={Plus} variant="primary">
                                {isLoading ? 'Saving...' : (currentEmployee ? 'Update Employee' : 'Create Employee')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default EmployeeManagement;

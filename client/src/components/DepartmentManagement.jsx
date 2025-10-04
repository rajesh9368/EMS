import React, { useState, useEffect } from 'react';
import { Building, Plus, X, Edit } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import { API_BASE_URL } from '../utils/constants';
import { canManage } from '../utils/helpers';

const DepartmentManagement = ({ authState }) => {
    const [departments, setDepartments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null);
    const [deptName, setDeptName] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const userCanManage = canManage(authState.role);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/departments`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data.data.departments || []);
            } else {
                setMessage('Failed to fetch departments.');
            }
        } catch (error) {
            setMessage('Network error while fetching departments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [authState.token]);

    const openModal = (department = null) => {
        setCurrentDept(department);
        setDeptName(department ? department.name : '');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const method = currentDept ? 'PUT' : 'POST';
        const endpoint = currentDept ? `/departments/${currentDept._id}` : '/departments';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify({ name: deptName }),
            });

            if (response.ok) {
                setMessage(`Department ${currentDept ? 'updated' : 'added'} successfully!`);
                setModalOpen(false);
                fetchDepartments();
            } else {
                const data = await response.json();
                setMessage(`Failed to save: ${data.message || 'Check network.'}`);
            }
        } catch (error) {
            setMessage('Network error during save operation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (deptId) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/departments/${deptId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.ok) {
                setMessage('Department deleted successfully!');
                fetchDepartments();
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <Building size={28} />
                    <span>Department Management</span>
                </h2>
                {userCanManage && (
                    <Button onClick={() => openModal()} icon={Plus} variant="primary">
                        Add New Department
                    </Button>
                )}
            </div>
            {message && (
                <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') || message.startsWith('Failed') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                    {message}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading departments...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employees</th>
                                {userCanManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {departments.length > 0 ? departments.map((dept, index) => (
                                <tr key={dept._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{dept.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {/* This requires a separate API call in a real app to count employees */}
                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">N/A</span>
                                    </td>
                                    {userCanManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button onClick={() => openModal(dept)} icon={Edit} variant="secondary">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(dept._id)} icon={X} variant="danger">
                                                Delete
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={userCanManage ? 4 : 3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No departments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalOpen && (
                <Modal title={currentDept ? 'Edit Department' : 'Add New Department'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="deptName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department Name</label>
                            <input
                                id="deptName"
                                type="text"
                                required
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button onClick={() => setModalOpen(false)} variant="secondary">Cancel</Button>
                            <Button type="submit" disabled={isLoading} icon={Plus} variant="primary">
                                {isLoading ? 'Saving...' : (currentDept ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default DepartmentManagement;

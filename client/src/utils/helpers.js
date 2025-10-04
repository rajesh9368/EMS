// Utility function to format date
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Helper function to get department name by ID
export const getDeptName = (deptId, departments) => {
    return departments.find(d => d._id === deptId)?.name || 'N/A';
};

// Helper function to validate authentication state
export const validateAuthState = (authState) => {
    return authState && authState.isAuthenticated && authState.token;
};

// Helper function to check if user can manage (admin or HR)
export const canManage = (role) => {
    return role === 'admin' || role === 'HR';
};

# HRMS Frontend Component Structure

This document outlines the refactored component structure for the HRMS (Human Resource Management System) frontend application.

## 📁 Project Structure

```
src/
├── components/
│   ├── index.js                    # Component exports
│   ├── Auth.jsx                    # Authentication component
│   ├── AdminTools.jsx              # Admin tools component
│   ├── Button.jsx                  # Reusable button component
│   ├── DepartmentManagement.jsx    # Department management component
│   ├── EmployeeManagement.jsx      # Employee management component
│   └── Modal.jsx                   # Reusable modal component
├── utils/
│   ├── index.js                    # Utility exports
│   ├── constants.js                # Application constants
│   └── helpers.js                  # Helper functions
├── App.jsx                         # Main application component
├── App.css                         # Application styles
├── index.js                        # Application entry point
└── index.css                       # Global styles
```

## 🔧 Components Overview

### Main Application Components

#### `App.jsx`
- **Purpose**: Main application component that handles routing and authentication state
- **Key Features**:
  - Authentication state management
  - Navigation between different pages
  - Token validation on app load
  - Responsive design with mobile navigation

#### `Auth.jsx`
- **Purpose**: Handles user authentication (login/signup)
- **Props**: 
  - `setAuthState`: Function to update authentication state
- **Features**:
  - Login and registration forms
  - Form validation
  - Error handling
  - Token storage

#### `DepartmentManagement.jsx`
- **Purpose**: Manages department CRUD operations
- **Props**: 
  - `authState`: Current authentication state
- **Features**:
  - List all departments
  - Add new departments (Admin/HR only)
  - Edit departments (Admin/HR only)
  - Delete departments (Admin/HR only)
  - Role-based access control

#### `EmployeeManagement.jsx`
- **Purpose**: Manages employee CRUD operations
- **Props**: 
  - `authState`: Current authentication state
- **Features**:
  - List all employees with search and filtering
  - Add new employees (Admin/HR only)
  - Edit employees (Admin/HR only)
  - Delete employees (Admin/HR only)
  - Link/unlink user accounts
  - Department filtering
  - Search by name or email

#### `AdminTools.jsx`
- **Purpose**: Admin-only tools for creating management users
- **Props**: 
  - `authState`: Current authentication state
- **Features**:
  - Create Admin or HR users (Admin only)
  - Form validation
  - Access control

### Shared Components

#### `Modal.jsx`
- **Purpose**: Reusable modal component for forms and confirmations
- **Props**:
  - `title`: Modal title
  - `children`: Modal content
  - `onClose`: Function to close modal

#### `Button.jsx`
- **Purpose**: Reusable button component with multiple variants
- **Props**:
  - `children`: Button text
  - `onClick`: Click handler
  - `variant`: Button style (primary, secondary, danger, success, disabled)
  - `icon`: Icon component
  - `disabled`: Disabled state
  - `type`: Button type
  - `className`: Additional CSS classes

## 🛠️ Utilities

### `constants.js`
Contains application-wide constants:
- `API_BASE_URL`: Backend API base URL
- `EMPLOYEE_ROLES`: Available employee roles
- `ADMIN_CREATION_ROLES`: Roles that can be created by admin
- `NAV_ITEMS`: Navigation configuration

### `helpers.js`
Contains utility functions:
- `formatDate()`: Format date strings
- `getDeptName()`: Get department name by ID
- `validateAuthState()`: Validate authentication state
- `canManage()`: Check if user can perform management operations

## 🔄 Data Flow

1. **Authentication**: User logs in through `Auth` component
2. **State Management**: Authentication state is managed in `App.jsx`
3. **Navigation**: User navigates between different management components
4. **API Calls**: Each component makes API calls using the stored token
5. **Role-Based Access**: Components check user role for feature access

## 🎨 Styling

The application uses Tailwind CSS for styling with:
- Dark mode support
- Responsive design
- Consistent color scheme
- Modern UI components

## 🔐 Security Features

- JWT token-based authentication
- Role-based access control
- Token validation on app load
- Protected API endpoints
- Secure logout functionality

## 📱 Responsive Design

- Desktop navigation in header
- Mobile navigation at bottom
- Responsive tables and forms
- Touch-friendly interface

## 🚀 Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Shared components can be used across the app
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testability**: Individual components can be tested in isolation
5. **Scalability**: Easy to add new features or components
6. **Code Organization**: Clear separation of concerns

## 🔧 Development Guidelines

1. **Component Creation**: Create new components in the `components/` folder
2. **Utility Functions**: Add reusable functions to `utils/helpers.js`
3. **Constants**: Add new constants to `utils/constants.js`
4. **Imports**: Use the index files for cleaner imports
5. **Props**: Define clear prop interfaces for each component
6. **Error Handling**: Include proper error handling in all components

## 📋 Future Enhancements

- Add unit tests for components
- Implement error boundaries
- Add loading states and skeleton screens
- Implement data caching
- Add internationalization support
- Implement component lazy loading

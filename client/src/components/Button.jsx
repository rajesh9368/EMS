import React from 'react';

/**
 * Reusable Button Component
 */
const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, type = 'button', className = '' }) => {
    let classes = 'px-4 py-2 rounded-lg font-semibold transition duration-200 shadow-md flex items-center justify-center space-x-2 whitespace-nowrap ';

    switch (variant) {
        case 'secondary':
            classes += 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50';
            break;
        case 'danger':
            classes += 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50';
            break;
        case 'success':
            classes += 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50';
            break;
        case 'disabled':
            classes += 'bg-gray-400 text-white cursor-not-allowed';
            break;
        case 'primary':
        default:
            classes += 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50';
            break;
    }

    // Add any additional classes
    classes += ' ' + className;

    return (
        <button type={type} onClick={onClick} className={classes} disabled={disabled || variant === 'disabled'}>
            {Icon && <Icon size={18} />}
            <span>{children}</span>
        </button>
    );
};

export default Button;

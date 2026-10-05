import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    
    const menuItems = [
        { path: '/', name: 'Dashboard', icon: '📊' },
        { path: '/members', name: 'Members', icon: '👥' },
        { path: '/utilities', name: 'Utilities', icon: '💡' },
        { path: '/food-cost', name: 'Food Cost', icon: '🍽️' },
        { path: '/cook-salary', name: 'Cook Salary', icon: '👨‍🍳' },
        { path: '/meal-system', name: 'Meal System', icon: '🍴' },
        { path: '/monthly-report', name: 'Reports', icon: '📈' },
    ];

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold">🏠 Bachelor Mess</span>
                    </div>
                    <div className="hidden md:flex space-x-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    location.pathname === item.path
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-100 hover:bg-blue-700'
                                }`}
                            >
                                {item.icon} {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
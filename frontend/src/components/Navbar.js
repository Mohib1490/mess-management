import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { admin, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/', name: 'Dashboard', icon: '📊' },
        { path: '/members', name: 'Members', icon: '👥' },
        { path: '/utilities', name: 'Utilities', icon: '💡' },
        { path: '/food-cost', name: 'Food Cost', icon: '🍽️' },
        { path: '/cook-salary', name: 'Cook Salary', icon: '👨‍🍳' },
        { path: '/meal-system', name: 'Meal System', icon: '🍴' },
        { path: '/monthly-report', name: 'Reports', icon: '📈' },
    ].filter((item) => admin?.role !== 'member' || ['/', '/meal-system'].includes(item.path));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <span className="text-3xl">🏠</span>
                        <div>
                            <h1 className="text-xl font-bold">Bachelor Mess</h1>
                            <p className="text-xs text-blue-200">Management System</p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    location.pathname === item.path
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                }`}
                            >
                                <span className="mr-1">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">
                                        {admin?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <span className="text-sm font-medium hidden xl:block">
                                    {admin?.name || 'Admin'}
                                </span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                                        <p className="text-xs text-gray-500">{admin?.email}</p>
                                    </div>
                                    
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        👤 Profile Settings
                                    </Link>
                                    
                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-4 border-t border-blue-700 mt-2">
                        {/* Mobile User Info */}
                        <div className="flex items-center space-x-3 p-4 bg-blue-700 bg-opacity-50 rounded-lg my-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">
                                    {admin?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium">{admin?.name}</p>
                                <p className="text-xs text-blue-200">{admin?.email}</p>
                            </div>
                        </div>

                        {/* Mobile Menu Items */}
                        <div className="flex flex-col space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        location.pathname === item.path
                                            ? 'bg-white text-blue-600'
                                            : 'text-blue-100 hover:bg-blue-700'
                                    }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                            
                            <hr className="border-blue-700 my-2" />
                            
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-3 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700"
                            >
                                👤 Profile Settings
                            </Link>
                            
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-600 hover:text-white text-left"
                            >
                                🚪 Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
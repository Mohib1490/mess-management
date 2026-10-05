import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

const Dashboard = () => {
    const { admin } = useAuth();
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        monthlyRent: 0,
        monthlyFoodCost: 0,
        monthlyUtilityCost: 0,
        cookSalary: 0,
        totalMeals: 0,
        mealRate: 0
        ,todayMeals: { breakfast: 0, lunch: 0, dinner: 0 }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const membersRes = await API.get('/members');
            const membersData = membersRes.data;
            setMembers(membersData);

            // Fetch meals stats
            const mealsRes = await API.get('/meals/current-month-stats');
            const mealsData = mealsRes.data;
            const todayMealsRes = await API.get('/meals/today-stats');

            // Fetch food costs
            const foodRes = await API.get('/food/current-month');
            const foodData = foodRes.data;

            // Fetch utility bills
            const utilityRes = await API.get('/utilities/current-month');
            const utilityData = utilityRes.data;

            setStats({
                totalMembers: membersData.length,
                activeMembers: membersData.filter(m => m.isActive).length,
                monthlyRent: membersData.reduce((sum, m) => sum + (m.isActive ? m.seatRent : 0), 0),
                monthlyFoodCost: foodData.totalCost || 0,
                monthlyUtilityCost: utilityData.totalAmount || 0,
                cookSalary: 0,
                totalMeals: mealsData.totalMeals || 0,
                mealRate: mealsData.mealRate || 0
                ,todayMeals: todayMealsRes.data
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const quickActions = [
        { name: 'Add Member', icon: '👤', path: '/members', color: 'bg-blue-500' },
        { name: 'Record Meal', icon: '🍽️', path: '/meal-system', color: 'bg-green-500' },
        { name: 'Add Food Cost', icon: '🛒', path: '/food-cost', color: 'bg-yellow-500' },
        { name: 'Pay Utility', icon: '💡', path: '/utilities', color: 'bg-purple-500' },
        { name: 'Cook Salary', icon: '💰', path: '/cook-salary', color: 'bg-red-500' },
        { name: 'View Report', icon: '📊', path: '/monthly-report', color: 'bg-indigo-500' },
    ].filter((action) => (
        (admin?.role !== 'member' && admin?.role !== 'viewer') ||
        ['Record Meal', 'View Report'].includes(action.name)
    ));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome to Bachelor Mess Management System</p>
                </div>

                <div className="mt-4 md:mt-0">
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Meal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(stats.todayMeals).map(([meal, total]) => (
                        <div key={meal} className="rounded-lg bg-green-50 border border-green-200 p-4">
                            <p className="text-sm text-gray-600 capitalize">{meal}</p>
                            <p className="text-2xl font-bold text-green-700">{total}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Total Members</p>
                            <p className="text-3xl font-bold">{stats.activeMembers}/{stats.totalMembers}</p>
                        </div>
                        <span className="text-4xl">👥</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">Monthly Rent</p>
                            <p className="text-3xl font-bold">৳{stats.monthlyRent.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">🏠</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100">Total Meals</p>
                            <p className="text-3xl font-bold">{stats.totalMeals}</p>
                        </div>
                        <span className="text-4xl">🍽️</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100">Food Cost</p>
                            <p className="text-3xl font-bold">৳{stats.monthlyFoodCost.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">🛒</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100">Utilities Bill</p>
                            <p className="text-3xl font-bold">৳{stats.monthlyUtilityCost.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">💡</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100">Total Expense</p>
                            <p className="text-3xl font-bold">৳{(stats.monthlyFoodCost + stats.monthlyUtilityCost).toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">💸</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.path}
                            className={`${action.color} text-white rounded-lg p-4 text-center hover:opacity-90 transition-opacity`}
                        >
                            <div className="text-2xl mb-2">{action.icon}</div>
                            <div className="text-sm font-medium">{action.name}</div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Members Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                        <div key={member._id} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-blue-600">{member.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-gray-600">৳{member.seatRent}/month</p>
                                </div>
                            </div>
                            <div className="mt-2 flex justify-between text-sm">
                                <span className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                                    {member.isActive ? '● Active' : '○ Inactive'}
                                </span>
                                <span>{member.seatType}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
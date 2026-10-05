import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        monthlyExpense: 0,
        totalMeals: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [membersRes, calculationsRes] = await Promise.all([
                axios.get(`${API_URL}/members`),
                axios.get(`${API_URL}/calculations/current-month`),
            ]);

            setStats({
                totalMembers: membersRes.data.length,
                activeMembers: membersRes.data.filter(m => m.isActive).length,
                monthlyExpense: calculationsRes.data?.totalExpense || 0,
                totalMeals: calculationsRes.data?.totalMeals || 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const expenseData = [
        { name: 'Food', value: 4000 },
        { name: 'Rent', value: 3000 },
        { name: 'Utilities', value: 2000 },
        { name: 'Cook', value: 1500 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm">Total Members</p>
                            <p className="text-2xl font-bold">{stats.totalMembers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm">Active Members</p>
                            <p className="text-2xl font-bold">{stats.activeMembers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm">Monthly Expense</p>
                            <p className="text-2xl font-bold">৳{stats.monthlyExpense}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <span className="text-2xl">🍽️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm">Total Meals</p>
                            <p className="text-2xl font-bold">{stats.totalMeals}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Expense Distribution</h2>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={expenseData}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Monthly Overview</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                            <span>This Month's Meal Rate</span>
                            <span className="font-bold text-lg">৳45.50</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                            <span>Total Collection</span>
                            <span className="font-bold text-lg">৳21,000</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                            <span>Total Expense</span>
                            <span className="font-bold text-lg">৳18,500</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                            <span>Balance</span>
                            <span className="font-bold text-lg text-green-600">৳2,500</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
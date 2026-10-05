import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MealSystem = () => {
    const { members } = useAppContext();
    const { admin } = useAuth();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState({});
    const [loading, setLoading] = useState(false);
    const [reportMonth, setReportMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const mealOptions = {
        breakfast: [0, 0.5],
        lunch: [0, 0.5, 1, 1.5, 2],
        dinner: [0, 0.5, 1, 1.5, 2]
    };

    const activeMembers = members.filter(m => m.isActive && (
        admin?.role !== 'member' || m._id === admin._id
    ));

    const fetchMeals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get(`/meals/date/${selectedDate}`);
            const mealsData = {};
            response.data.forEach((meal) => {
                const mealMemberId = typeof meal.member === 'object' && meal.member !== null
                    ? meal.member._id
                    : meal.member;

                if (mealMemberId) {
                    mealsData[mealMemberId] = meal;
                }
            });
            setMeals(mealsData);
        } catch (error) {
            console.error('Failed to fetch meals', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    const openMealReportWindow = () => {
        navigate(`/meal-monthly-report?month=${reportMonth}`);
    };

    const updateMealCount = async (memberId, mealType, value) => {
        try {
            const currentMeal = meals[memberId] || {
                meals: { breakfast: 0, lunch: 0, dinner: 0 },
                guestMeals: { breakfast: 0, lunch: 0, dinner: 0 }
            };

            const updatedMeal = {
                ...currentMeal,
                meals: {
                    ...currentMeal.meals,
                    [mealType]: value
                }
            };

            const payload = {
                member: memberId,
                date: selectedDate,
                meals: admin?.role === 'member'
                    ? { [mealType]: value }
                    : updatedMeal.meals,
                guestMeals: updatedMeal.guestMeals || {
                    breakfast: 0,
                    lunch: 0,
                    dinner: 0
                }
            };

            const response = await API.post('/meals', payload);

            setMeals(prev => ({
                ...prev,
                [memberId]: response.data
            }));

            await fetchMeals();

            toast.success(`${mealType} updated to ${response.data.meals?.[mealType]}`);
        } catch (error) {
            console.error('Failed to update meal', error);
            toast.error(error.response?.data?.message || 'Failed to update meal');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Meal System</h1>
                        <p className="text-gray-600">Manage daily meals (On/Off)</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                        <input
                            type="date"
                            className="input-field w-full sm:w-auto"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 shrink-0">Month</label>
                            <input
                                type="month"
                                className="input-field rounded-lg border border-gray-300 px-3 py-2 w-full sm:w-auto"
                                value={reportMonth}
                                onChange={(e) => setReportMonth(e.target.value)}
                            />
                            <button
                                onClick={openMealReportWindow}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Open Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin text-4xl">⚡</div>
                    <p className="mt-2 text-gray-600">Loading meals...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeMembers.map((member) => {
                        const memberMeals = meals[member._id] || {
                            meals: { breakfast: 0, lunch: 0, dinner: 0 }
                        };

                        return (
                            <div key={member._id} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-green-600">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{member.name}</h3>
                                        <p className="text-sm text-gray-600">Seat: ৳{member.seatRent}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                        const currentValue = memberMeals.meals?.[mealType] ?? 0;

                                        const canEdit = admin?.role !== 'member' ||
                                            !memberMeals.lockedMeals?.includes(mealType);

                                        return mealType === 'breakfast' ? (
                                        <button
                                            key={mealType}
                                            onClick={() => updateMealCount(member._id, mealType, currentValue ? 0 : 0.5)}
                                            disabled={!canEdit}
                                                className={`w-full p-3 rounded-lg flex justify-between items-center transition-all ${
                                                    currentValue
                                                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                                                }`}
                                            >
                                                <span className="capitalize font-medium">
                                                    🌅 {mealType}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    currentValue
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                    {currentValue ? 'ON' : 'OFF'}
                                                </span>
                                            </button>
                                        ) : (
                                            <div key={mealType} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                                                <div className="capitalize font-medium text-gray-700">
                                                    {mealType === 'lunch' ? '☀️ lunch' : '🌙 dinner'}
                                                </div>
                                                <select
                                                    value={currentValue}
                                                    onChange={(e) => updateMealCount(member._id, mealType, Number(e.target.value))}
                                                    disabled={!canEdit}
                                                    className="input-field rounded-lg border border-gray-300 px-3 py-2 bg-white"
                                                >
                                                    {mealOptions[mealType].map((option) => (
                                                        <option key={option} value={option}>
                                                            {option === 0 ? 'OFF' : option === 0.5 ? 'HALF' : option === 1 ? 'FULL' : option === 1.5 ? 'FULL + HALF' : 'EXTRA'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    {admin?.role === 'member' && meals[member._id] && (
                                        <p className="mb-2 text-sm font-medium text-amber-700">
                                            Submitted and locked. Contact an admin to correct it.
                                        </p>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Meals Today:</span>
                                        <span className="font-bold text-blue-600">
                                            {((memberMeals.meals?.breakfast || 0) + 
                                              (memberMeals.meals?.lunch || 0) + 
                                              (memberMeals.meals?.dinner || 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MealSystem;
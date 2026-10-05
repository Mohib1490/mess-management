import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CookSalary = () => {
    const [salaries, setSalaries] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        cookName: 'Khala',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        baseSalary: 0,
        bonus: 0,
        advance: 0,
        deductions: 0
    });

    const fetchSalaries = useCallback(async (monthValue = selectedMonth) => {
        try {
            const [year, month] = monthValue.split('-');
            const response = await API.get('/cook', { params: { month, year } });
            setSalaries(response.data);
        } catch (error) {
            toast.error('Failed to fetch cook salaries');
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchSalaries(selectedMonth);
    }, [fetchSalaries, selectedMonth]);

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            cookName: 'Khala',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear(),
            baseSalary: 0,
            bonus: 0,
            advance: 0,
            deductions: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salaryExists = salaries.some((salary) => {
            const sameMonthYear = salary.month === formData.month && salary.year === Number(formData.year);
            const isDifferentRecord = editingId ? (salary._id !== editingId && salary.id !== editingId) : true;
            return sameMonthYear && isDifferentRecord;
        });

        if (salaryExists) {
            toast.error('A salary for this month and year already exists.');
            return;
        }

        try {
            const payload = {
                cookName: formData.cookName,
                month: formData.month,
                year: Number(formData.year),
                baseSalary: Number(formData.baseSalary),
                bonus: Number(formData.bonus),
                advance: Number(formData.advance),
                deductions: Number(formData.deductions)
            };

            if (editingId) {
                await API.put(`/cook/${editingId}`, payload);
            } else {
                await API.post('/cook', payload);
            }

            toast.success(editingId ? 'Cook salary updated successfully!' : 'Cook salary added successfully!');
            fetchSalaries();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            const errorMsg = error.response?.data?.message || (editingId ? 'Failed to update salary' : 'Failed to add salary');
            toast.error(errorMsg);
            console.error('Cook salary submit error:', error);
        }
    };

    const handlePayment = async (id) => {
        const amount = prompt('Enter payment amount:');
        if (amount) {
            try {
                await API.post(`/cook/${id}/payment`, { amount: Number(amount) });
                toast.success('Payment recorded!');
                fetchSalaries();
            } catch (error) {
                toast.error('Payment failed');
            }
        }
    };

    const handleEditSalary = (salary) => {
        setEditingId(salary._id || salary.id);
        setFormData({
            cookName: 'Khala',
            month: salary.month,
            year: salary.year,
            baseSalary: salary.baseSalary,
            bonus: salary.bonus,
            advance: salary.advance,
            deductions: salary.deductions
        });
        setIsModalOpen(true);
    };

    const handleDeleteSalary = async (id) => {
        if (!window.confirm('Are you sure you want to delete this salary record?')) return;
        try {
            await API.delete(`/cook/${id}`);
            setSalaries((prev) => prev.filter((salary) => (salary._id || salary.id) !== id));
            toast.success('Cook salary deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete salary');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Cook Salary Management</h1>
                    <p className="text-gray-600">Manage cook salary and payments</p>
                </div>
                <div className="flex items-center gap-3">
                    <label htmlFor="salary-month" className="text-sm font-medium text-gray-700">Month</label>
                    <input
                        id="salary-month"
                        type="month"
                        className="input-field rounded-lg border border-gray-300 px-3 py-2"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                    />
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        👨‍🍳 Add Salary
                    </button>
                </div>
            </div>

            {salaries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salaries.map((salary) => (
                    <div key={salary._id || salary.id} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{salary.cookName}</h3>
                                <p className="text-sm text-gray-600">{salary.month} {salary.year}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                salary.status === 'paid' ? 'bg-green-100 text-green-800' :
                                salary.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {salary.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Base Salary:</span>
                                <span>৳{salary.baseSalary}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bonus:</span>
                                <span>৳{salary.bonus}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span>৳{salary.totalSalary}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Due:</span>
                                <span>৳{salary.dueAmount}</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <button onClick={() => handleEditSalary(salary)}
                                className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                                ✏️ Edit
                            </button>
                            <button onClick={() => handleDeleteSalary(salary._id)}
                                className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                🗑️ Delete
                            </button>
                            {salary.status !== 'paid' && (
                                <button onClick={() => handlePayment(salary._id)}
                                    className="w-full py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                    💰 Record Payment
                                </button>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-md">
                    No cook salary records found for the selected month.
                </div>
            )}

            {/* Add Salary Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 mx-4">
                        <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Cook Salary' : 'Add Cook Salary'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Cook Name</label>
                                <input type="text" className="input-field bg-gray-100 cursor-not-allowed" value="Khala" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Month</label>
                                    <select className="input-field" value={formData.month}
                                        onChange={(e) => setFormData({...formData, month: e.target.value})}>
                                        {['January','February','March','April','May','June',
                                          'July','August','September','October','November','December']
                                          .map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Year</label>
                                    <input type="number" className="input-field" value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Base Salary</label>
                                <input type="number" className="input-field" required
                                    value={formData.baseSalary}
                                    onChange={(e) => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="label">Bonus</label>
                                <input type="number" className="input-field"
                                    value={formData.bonus}
                                    onChange={(e) => setFormData({...formData, bonus: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="label">Advance</label>
                                <input type="number" className="input-field"
                                    value={formData.advance}
                                    onChange={(e) => setFormData({...formData, advance: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="label">Deductions</label>
                                <input type="number" className="input-field"
                                    value={formData.deductions}
                                    onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})} />
                            </div>
                            <div className="flex space-x-4">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit"
                                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">{editingId ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookSalary;
import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Utilities = () => {
    const [utilityBills, setBills] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [reportMonth, setReportMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [formData, setFormData] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        electricityBill: 0,
        gasBill: 0,
        waterBill: 0,
        internetBill: 0,
        garbageBill: 0,
        otherUtilities: 0,
        isPaid: false,
        notes: ''
    });

    const fetchBills = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (reportMonth) {
                params.append('month', reportMonth);
            }
            const url = `/utilities${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await API.get(url);
            setBills(response.data);
        } catch (error) {
            toast.error('Failed to fetch utility bills');
        }
    }, [reportMonth]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    // Calculate total
    const calculateTotal = () => {
        return (Number(formData.electricityBill) || 0) +
               (Number(formData.gasBill) || 0) +
               (Number(formData.waterBill) || 0) +
               (Number(formData.internetBill) || 0) +
               (Number(formData.garbageBill) || 0) +
               (Number(formData.otherUtilities) || 0);
    };

    const totalAmount = calculateTotal();

    // Reset form
    const resetForm = () => {
        setFormData({
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear(),
            electricityBill: 0,
            gasBill: 0,
            waterBill: 0,
            internetBill: 0,
            garbageBill: 0,
            otherUtilities: 0,
            isPaid: false,
            notes: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    // Open modal for adding
    const handleAddNew = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEdit = (bill) => {
        setFormData({
            month: bill.month,
            year: bill.year,
            electricityBill: bill.electricityBill || 0,
            gasBill: bill.gasBill || 0,
            waterBill: bill.waterBill || 0,
            internetBill: bill.internetBill || 0,
            garbageBill: bill.garbageBill || 0,
            otherUtilities: bill.otherUtilities || 0,
            isPaid: bill.isPaid || false,
            notes: bill.notes || ''
        });
        setEditingId(bill._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Handle form submit (Add or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data with calculated total
        const billData = {
            ...formData,
            totalAmount: calculateTotal()
        };

        try {
            if (isEditing) {
                // Update existing bill
                await API.put(`/utilities/${editingId}`, billData);
                toast.success('Utility bill updated successfully!');
            } else {
                // Add new bill
                await API.post('/utilities', billData);
                toast.success('Utility bill added successfully!');
            }
            
            fetchBills();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save bill';
            toast.error(errorMsg);
        }
    };

    // Delete bill
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await API.delete(`/utilities/${id}`);
                toast.success('Bill deleted successfully!');
                fetchBills();
            } catch (error) {
                toast.error('Failed to delete bill');
            }
        }
    };

    // Toggle payment status
    const handleTogglePayment = async (bill) => {
        try {
            await API.put(`/utilities/${bill._id}`, {
                ...bill,
                isPaid: !bill.isPaid,
                paymentDate: !bill.isPaid ? new Date() : null
            });
            toast.success(`Bill marked as ${!bill.isPaid ? 'paid' : 'unpaid'}`);
            fetchBills();
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Utility Bills</h1>
                    <p className="text-gray-600">Manage electricity, gas, water and other bills</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Month</label>
                        <input
                            type="month"
                            className="input-field rounded-lg border border-gray-300 px-3 h-12"
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <span>➕</span>
                        <span>Add Bill</span>
                    </button>
                </div>
            </div>

            {utilityBills.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <span className="text-6xl">💡</span>
                    <p className="text-gray-600 mt-4 text-lg">No utility bills found for the selected month.</p>
                    <p className="text-gray-400 text-sm">Change the month above or click "Add Bill" to create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {utilityBills.map((bill) => (
                        <div key={bill._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{bill.month} {bill.year}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        bill.isPaid 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {bill.isPaid ? '✅ Paid' : '❌ Unpaid'}
                                    </span>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEdit(bill)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bill._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Bill Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">⚡ Electricity:</span>
                                    <span className="font-medium">৳{bill.electricityBill?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">🔥 Gas:</span>
                                    <span className="font-medium">৳{bill.gasBill?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">💧 Water:</span>
                                    <span className="font-medium">৳{bill.waterBill?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">🌐 Internet:</span>
                                    <span className="font-medium">৳{bill.internetBill?.toLocaleString() || 0}</span>
                                </div>
                                {bill.garbageBill > 0 && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">🗑️ Garbage:</span>
                                        <span className="font-medium">৳{bill.garbageBill?.toLocaleString()}</span>
                                    </div>
                                )}
                                {bill.otherUtilities > 0 && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">📦 Others:</span>
                                        <span className="font-medium">৳{bill.otherUtilities?.toLocaleString()}</span>
                                    </div>
                                )}
                                
                                {/* Total */}
                                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                                    <span>Total:</span>
                                    <span className="text-blue-600 text-lg">
                                        ৳{(bill.totalAmount || calculateTotal()).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t">
                                <button
                                    onClick={() => handleTogglePayment(bill)}
                                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                        bill.isPaid
                                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {bill.isPaid ? '💰 Mark as Unpaid' : '✅ Mark as Paid'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 text-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">
                                    {isEditing ? 'Edit Utility Bill' : 'Add Utility Bill'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-blue-100 mt-1">
                                {isEditing ? 'Update the utility bill details' : 'Fill in the utility bill details'}
                            </p>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Month and Year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Month <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.month}
                                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                                        required
                                    >
                                        {['January','February','March','April','May','June',
                                          'July','August','September','October','November','December']
                                          .map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Bill Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ⚡ Electricity Bill (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.electricityBill}
                                        onChange={(e) => setFormData({...formData, electricityBill: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🔥 Gas Bill (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.gasBill}
                                        onChange={(e) => setFormData({...formData, gasBill: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💧 Water Bill (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.waterBill}
                                        onChange={(e) => setFormData({...formData, waterBill: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🌐 Internet Bill (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.internetBill}
                                        onChange={(e) => setFormData({...formData, internetBill: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🗑️ Garbage Bill (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.garbageBill}
                                        onChange={(e) => setFormData({...formData, garbageBill: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📦 Other Utilities (Tk)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.otherUtilities}
                                        onChange={(e) => setFormData({...formData, otherUtilities: Number(e.target.value) || 0})}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPaid}
                                        onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Mark as Paid</span>
                                </label>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📝 Notes
                                </label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Add any notes..."
                                />
                            </div>

                            {/* Total Display */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Total Amount:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                                >
                                    {isEditing ? '💾 Update Bill' : '💾 Save Bill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Utilities;
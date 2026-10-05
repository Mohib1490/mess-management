import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const FoodCost = () => {
    const { members } = useAppContext();
    const navigate = useNavigate();
    const [foodCosts, setFoodCosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportMonth, setReportMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [reportUserName, setReportUserName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        market: 'Local Market',
        items: [{ category: 'rice', itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0, totalPrice: 0 }],
        boughtBy: '',
        deduction: 0
    });

    useEffect(() => {
        fetchFoodCosts();
    }, [reportMonth, reportUserName]);

    const fetchFoodCosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (reportMonth) {
                params.append('month', reportMonth);
            }

            if (reportUserName.trim()) {
                params.append('userName', reportUserName.trim());
            }

            const url = `/food${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await API.get(url);
            setFoodCosts(response.data);
        } catch (error) {
            toast.error('Failed to fetch food costs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCost = async (id) => {
        if (!window.confirm('Delete this food cost record?')) return;

        try {
            await API.delete(`/food/${id}`);
            setFoodCosts((prev) => prev.filter((cost) => cost._id !== id));
            toast.success('Food cost deleted successfully');
        } catch (error) {
            toast.error('Failed to delete food cost');
        }
    };

    const openEditModal = (cost) => {
        setEditingId(cost._id);
        setFormData({
            date: new Date(cost.date).toISOString().split('T')[0],
            market: cost.market || 'Local Market',
            items: cost.items.length ? cost.items.map((item) => ({
                ...item,
                quantity: item.quantity || 0,
                pricePerUnit: item.pricePerUnit || 0,
                totalPrice: item.totalPrice || 0
            })) : [{ category: 'rice', itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0, totalPrice: 0 }],
            boughtBy: cost.boughtBy?._id || cost.boughtBy || '',
            deduction: cost.deduction || 0
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            market: 'Local Market',
            items: [{ category: 'rice', itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0, totalPrice: 0 }],
            boughtBy: '',
            deduction: 0
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { category: 'rice', itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0, totalPrice: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'pricePerUnit') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].pricePerUnit;
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const normalizedItems = formData.items.map((item) => {
                const quantity = Number(item.quantity || 0);
                const pricePerUnit = Number(item.pricePerUnit || 0);
                return {
                    ...item,
                    quantity,
                    pricePerUnit,
                    totalPrice: quantity * pricePerUnit
                };
            });

            const payload = {
                ...formData,
                items: normalizedItems,
                totalCost: normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0),
                deduction: Number(formData.deduction || 0)
            };

            const url = editingId ? `/food/${editingId}` : '/food';
            const method = editingId ? 'put' : 'post';
            const response = await API[method](url, payload);

            toast.success(editingId ? 'Food cost updated successfully!' : 'Food cost added successfully!');

            if (editingId) {
                setFoodCosts((prev) => prev.map((cost) =>
                    cost._id === editingId ? response.data : cost
                ));
            } else {
                setFoodCosts((prev) => [response.data, ...prev]);
            }

            fetchFoodCosts();
            closeModal();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save food cost';
            toast.error(errorMsg);
            console.error('Food cost submit error:', error);
        }
    };

    const totalCost = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const categories = ['rice', 'vegetable', 'fish', 'chicken', 'beef', 'mutton', 'eggs', 'spices', 'oil', 'dal', 'other'];

    const openReportWindow = () => {
        const [year, month] = reportMonth.split('-');
        const monthParam = `${month}/${year}`;
        const params = new URLSearchParams({ month: monthParam });

        if (reportUserName.trim()) {
            params.set('userName', reportUserName.trim());
        }

        navigate(`/food-cost-monthly-report?${params.toString()}`);
    };

    const handleReportUserChange = (event) => {
        setReportUserName(event.target.value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Food Cost Management</h1>
                    <p className="text-gray-600">Track daily bazar and food expenses</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Month</label>
                        <input
                            type="month"
                            className="input-field rounded-lg border border-gray-300 px-3 h-12"
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">User</label>
                        <select
                            className="input-field rounded-lg border border-gray-300 px-3 h-12 min-w-[180px]"
                            value={reportUserName}
                            onChange={handleReportUserChange}
                        >
                            <option value="">All members</option>
                            {members.filter((m) => m.isActive).map((member) => (
                                <option key={member._id} value={member.name}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={openReportWindow}
                        className="h-12 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Open Report
                    </button>
                    <button onClick={() => { closeModal(); setIsModalOpen(true); }}
                        className="h-12 px-5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        ➕ Add Food Cost
                    </button>
                </div>
            </div>

            {/* Food Costs List */}
            {loading ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <div className="animate-spin text-4xl">⚡</div>
                    <p className="mt-2 text-gray-600">Loading food costs...</p>
                </div>
            ) : foodCosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-600 mt-4 text-lg">No food cost records found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodCosts.map((cost) => (
                        <div key={cost._id} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold">{new Date(cost.date).toLocaleDateString()}</h3>
                                    <p className="text-sm text-gray-600">{cost.market}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Bought by: <span className="font-medium text-gray-800">
                                            {cost.boughtBy?.name || cost.boughtBy || 'Unknown'}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right space-y-2">
                                    <span className="text-sm text-gray-600">Deduction: -৳{cost.deduction || 0}</span>
                                    <span className="text-2xl font-bold text-green-600">৳{(cost.totalCost || 0) - (cost.deduction || 0)}</span>
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(cost)}
                                        className="w-full rounded-lg bg-blue-100 text-blue-700 px-3 py-2 text-sm hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCost(cost._id)}
                                        className="w-full rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {cost.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span>{item.itemName || item.category} ({item.quantity} {item.unit})</span>
                                        <span className="text-gray-600">৳{item.totalPrice}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Food Cost Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Food Cost' : 'Add Food Cost'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Date</label>
                                    <input type="date" className="input-field" value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label">Market</label>
                                    <input type="text" className="input-field" value={formData.market}
                                        onChange={(e) => setFormData({...formData, market: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Bought By</label>
                                <select className="input-field" value={formData.boughtBy}
                                    onChange={(e) => setFormData({...formData, boughtBy: e.target.value})} required>
                                    <option value="">Select Member</option>
                                    {members.filter(m => m.isActive).map(member => (
                                        <option key={member._id} value={member._id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Deduction</label>
                                <input type="number" className="input-field" value={formData.deduction}
                                    onChange={(e) => setFormData({...formData, deduction: Number(e.target.value)})}
                                    min={0} />
                            </div>

                            {/* Items */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Items</h3>
                                    <button type="button" onClick={addItem}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                                        ➕ Add Item
                                    </button>
                                </div>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Item #{index + 1}</span>
                                            {formData.items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-800">✕</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm">Category</label>
                                                <select className="input-field" value={item.category}
                                                    onChange={(e) => updateItem(index, 'category', e.target.value)}>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm">Item Name</label>
                                                <input type="text" className="input-field" value={item.itemName}
                                                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                                    placeholder="e.g., Rice, Potato" />
                                            </div>
                                            <div>
                                                <label className="text-sm">Quantity</label>
                                                <input type="number" className="input-field" value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-sm">Unit</label>
                                                <select className="input-field" value={item.unit}
                                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}>
                                                    <option value="kg">Kg</option>
                                                    <option value="gram">Gram</option>
                                                    <option value="piece">Piece</option>
                                                    <option value="packet">Packet</option>
                                                    <option value="liter">Liter</option>
                                                    <option value="dozen">Dozen</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm">Price/Unit</label>
                                                <input type="number" className="input-field" value={item.pricePerUnit}
                                                    onChange={(e) => updateItem(index, 'pricePerUnit', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-sm">Total</label>
                                                <input type="number" className="input-field bg-gray-100" value={item.totalPrice} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Cost:</span>
                                    <span className="text-green-600">৳{totalCost}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Deduction:</span>
                                    <span className="text-red-600">-৳{Number(formData.deduction || 0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Net Cost:</span>
                                    <span className="text-blue-600">৳{totalCost - Number(formData.deduction || 0)}</span>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit"
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodCost;
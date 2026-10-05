import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import API from '../utils/api';
import toast from 'react-hot-toast';



const Members = () => {
    const { members, setMembers, fetchMembers } = useAppContext();
    //const { members, setMembers, fetchMembers } = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        joinDate: new Date().toISOString().split('T')[0],
        leavingDate: '',
        seatRent: 2740,
        seatType: 'regular',
        isActive: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const membersRes = await API.get('/members');
                setMembers(membersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [setMembers]);


    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            joinDate: new Date().toISOString().split('T')[0],
            leavingDate: '',
            seatRent: 2740,
            seatType: 'regular',
            isActive: true
        });
        setEditingMember(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const memberData = {
                ...formData,
                leavingDate: formData.leavingDate || null
            };

            if (editingMember) {
                // UPDATE existing member
                await API.put(`/members/${editingMember._id}`, memberData);
                
                // Update local state immediately
                setMembers(prev => prev.map(m => 
                    m._id === editingMember._id ? { ...m, ...memberData } : m
                ));
                
                toast.success('Member updated successfully!');
            } else {
                // ADD new member
                const response = await API.post('/members', memberData);
                
                // Add to local state
                const newMember = { ...memberData, _id: response.data?._id || Date.now().toString() };
                setMembers(prev => [...prev, newMember]);
                
                toast.success('Member added successfully!');
            }
            
            setIsModalOpen(false);
            resetForm();
            fetchMembers(); // Refresh from server
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Something went wrong!';
            toast.error(errorMsg);
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal with member data
    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            phone: member.phone,
            email: member.email || '',
            joinDate: new Date(member.joinDate).toISOString().split('T')[0],
            leavingDate: member.leavingDate ? new Date(member.leavingDate).toISOString().split('T')[0] : '',
            seatRent: member.seatRent,
            seatType: member.seatType,
            isActive: member.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await API.delete(`/members/${id}`);
                
                // Remove from local state immediately
                setMembers(prev => prev.filter(m => m._id !== id));
                
                toast.success('Member deleted successfully!');
                fetchMembers(); // Refresh from server
            } catch (error) {
                toast.error('Failed to delete member');
            }
        }
    };

    const handleToggleActive = async (member) => {
        try {
            await API.patch(`/members/${member._id}/toggle-active`);
            
            // Update local state immediately
            setMembers(prev => prev.map(m => 
                m._id === member._id ? { ...m, isActive: !m.isActive } : m
            ));
            
            toast.success(`Member ${member.isActive ? 'deactivated' : 'activated'} successfully!`);
            fetchMembers(); // Refresh from server
        } catch (error) {
            toast.error('Failed to update member status');
        }
    };
//totalMembers: membersData.length,
    // Stats calculations
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.isActive).length;
    const inactiveMembers = totalMembers - activeMembers;
    const totalRent = members.reduce((sum, m) => sum + (m.isActive ? m.seatRent : 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Members Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all mess members ({totalMembers} total, {activeMembers} active)
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
                >
                    <span>➕</span>
                    <span>Add Member</span>
                </button>
            </div>

            {/* Members Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Members</p>
                    <p className="text-2xl font-bold">{totalMembers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Active Members</p>
                    <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-red-600">{inactiveMembers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Monthly Rent</p>
                    <p className="text-2xl font-bold text-blue-600">৳{totalRent.toLocaleString()}</p>
                </div>
            </div>

            {/* Members Grid */}
            {members.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <span className="text-6xl">👥</span>
                    <p className="text-gray-600 mt-4 text-lg">No members found</p>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add First Member
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div 
                            key={member._id} 
                            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 ${
                                !member.isActive ? 'opacity-60 border-2 border-red-200' : ''
                            }`}
                        >
                            {/* Member Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-blue-600">
                                            {member.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            member.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {member.isActive ? '🟢 Active' : '🔴 Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    {/* EDIT BUTTON */}
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Member"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    
                                    {/* DELETE BUTTON */}
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Member"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Member Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">📱 Phone:</span>
                                    <span className="font-medium">{member.phone}</span>
                                </div>
                                {member.email && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">📧 Email:</span>
                                        <span className="font-medium text-xs">{member.email}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">📅 Joined:</span>
                                    <span className="font-medium">
                                        {new Date(member.joinDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                {member.leavingDate && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">📅 Left:</span>
                                        <span className="font-medium">
                                            {new Date(member.leavingDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">💰 Rent:</span>
                                    <span className="font-bold text-blue-600">৳{member.seatRent.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">🏷️ Type:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        member.seatType === 'regular' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {member.seatType === 'regular' ? 'Regular' : 'Special'}
                                    </span>
                                </div>
                            </div>

                            {/* Toggle Active/Inactive Button */}
                            <div className="mt-4 pt-4 border-t">
                                <button
                                    onClick={() => handleToggleActive(member)}
                                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                                        member.isActive
                                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                >
                                    {member.isActive ? '🔴 Deactivate Member' : '🟢 Activate Member'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-5 text-white sticky top-0">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">
                                    {editingMember ? '✏️ Edit Member' : '➕ Add New Member'}
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {editingMember && (
                                <p className="text-blue-100 text-sm mt-1">
                                    Editing: {editingMember.name}
                                </p>
                            )}
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter member name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Join Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.joinDate}
                                    onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                                />
                            </div>

                            {editingMember && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Leaving Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={formData.leavingDate}
                                        onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Set the date the member left so historical monthly reports show the correct roster.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seat Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.seatType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        seatType: e.target.value,
                                        seatRent: e.target.value === 'regular' ? 2740 : 2060
                                    })}
                                >
                                    <option value="regular">Regular Seat (2740 Tk/month)</option>
                                    <option value="special">Special Seat (2060 Tk/month)</option>
                                </select>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Seat Rent:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        ৳{formData.seatRent.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingMember ? '💾 Update Member' : '➕ Add Member'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
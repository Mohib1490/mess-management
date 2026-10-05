import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { admin, updateProfile } = useAuth();
    const canEditProfile = ['admin', 'super_admin', 'manager'].includes(admin?.role);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
        phone: admin?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };

        if (formData.newPassword) {
            updateData.password = formData.newPassword;
        }

        const result = await updateProfile(updateData);
        if (result.success) {
            setIsEditing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
                    {canEditProfile && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    )}
                </div>

                {!isEditing || !canEditProfile ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {admin?.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{admin?.name}</h3>
                                <p className="text-gray-600">{admin?.role}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{admin?.email}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{admin?.phone || 'Not set'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Role</p>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {admin?.role}
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Status</p>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        
                        <div className="border-t pt-4">
                            <h3 className="font-medium text-gray-800 mb-3">Change Password</h3>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="New Password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Update Profile
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
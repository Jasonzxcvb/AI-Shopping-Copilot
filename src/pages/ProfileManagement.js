import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Adjust import based on jwt-decode version

const ProfileManagement = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        password: '',
        profile: {
            addresses: [],
            paymentMethods: [],
        },
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    setError('User not logged in or invalid session.');
                    return;
                }

                // Decode the token to get the user ID
                const decodedToken = jwtDecode(user.token);
                const userId = decodedToken.id;

                const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Error fetching profile. Please try again.');
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const decodedToken = jwtDecode(user.token);
            const userId = decodedToken.id;

            // Prepare the data to match the backend schema
            const updateData = {
                name: profile.name,
                email: profile.email,
                password: profile.password, // Ensure password is hashed on the backend
                profile: {
                    addresses: profile.profile.addresses,
                    paymentMethods: profile.profile.paymentMethods,
                },
            };

            await axios.put(`http://localhost:5000/api/users/${userId}`, updateData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        }
    };


    const handleAddAddress = () => {
        if (newAddress.trim()) {
            setProfile({
                ...profile,
                profile: {
                    ...profile.profile,
                    addresses: [...profile.profile.addresses, newAddress],
                },
            });
            setNewAddress('');
        }
    };

    const handleAddPaymentMethod = () => {
        if (newPaymentMethod.trim()) {
            setProfile({
                ...profile,
                profile: {
                    ...profile.profile,
                    paymentMethods: [...profile.profile.paymentMethods, newPaymentMethod],
                },
            });
            setNewPaymentMethod('');
        }
    };

    return (
        <div className="form-container profile-management">
            <h1>Profile Management</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div>
                <label>Name: </label>
                <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                />
            </div>
            <div>
                <label>Email: </label>
                <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                />
            </div>
            <div>
                <label>Password: </label>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    disabled={!isEditing}
                />
            </div>
            <div>
                <label>Addresses: </label>
                <ul>
                    {profile.profile.addresses?.map((address, index) => (
                        <li key={index}>{address}</li>
                    ))}
                </ul>
                {isEditing && (
                    <div>
                        <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Add new address"
                        />
                        <button onClick={handleAddAddress}>Add Address</button>
                    </div>
                )}
            </div>
            <div>
                <label>Payment Methods: </label>
                <ul>
                    {profile.profile.paymentMethods?.map((method, index) => (
                        <li key={index}>{method}</li>
                    ))}
                </ul>
                {isEditing && (
                    <div>
                        <input
                            type="text"
                            value={newPaymentMethod}
                            onChange={(e) => setNewPaymentMethod(e.target.value)}
                            placeholder="Add new payment method"
                        />
                        <button onClick={handleAddPaymentMethod}>Add Payment Method</button>
                    </div>
                )}
            </div>
            <div>
                <button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && <button onClick={handleSave}>Save</button>}
            </div>
        </div>
    );
};

export default ProfileManagement;

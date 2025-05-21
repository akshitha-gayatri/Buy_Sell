import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        contactNumber: '',
        password: '', 
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:4345/api/auth/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setFormData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch profile.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(user);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.put(
                'http://localhost:4345/api/auth/profile',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(response.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <h1>Welcome, {user.firstName} {user.lastName}</h1>

            {isEditing ? (
                <div className="profile-edit-form">
                    <label>
                        First Name:
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                        />
                    </label>
                    <label>
                        Age:
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Contact Number:
                        <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Password: {/* New field */}
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </label>
                    <div className="form-actions">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Age:</strong> {user.age}</p>
                    <p><strong>Contact Number:</strong> {user.contactNumber}</p>
                    <button onClick={handleEdit}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default Profile;

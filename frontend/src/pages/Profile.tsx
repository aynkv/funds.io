import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/types";
import { getProfile, updateProfile } from "../api/users";
import '../css/Profile.css';

function Profile() {
    const { token } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [token]);

    async function fetchProfile() {
        try {
            if (token) {
                const profile = await getProfile(token);
                setUser(profile);
                setEmail(profile.email);
                setFirstName(profile.firstName);
                setLastName(profile.lastName);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (token) {
                const updateData: { email?: string; firstName?: string; lastName?: string, password?: string } = {};
                if (email && email !== user?.email) updateData.email = email;
                if (firstName && firstName !== user?.firstName) updateData.firstName = firstName;
                if (lastName && lastName !== user?.lastName) updateData.lastName = lastName;
                if (password) updateData.password = password;

                if (Object.keys(updateData).length === 0) {
                    setError('No changes to update');
                    return;
                }

                const updated = await updateProfile(token, updateData);
                setUser(updated.user);
                setPassword('');
                setSuccess('Profile updated successfully');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to update profile');
        }
    }


    return (
        <div className="profile-container">
            <h1 className="profile-title">Profile</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {user ? (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password (optional):</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="submit-button">Update Profile</button>
                </form>
            ) : (
                <p className="loading-message">Loading profile...</p>
            )}
        </div>
    );

}
export default Profile;
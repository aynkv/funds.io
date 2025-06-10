import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/user";
import { getProfile, updateProfile } from "../api/users";

function Profile() {
    const { token } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
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
                setName(profile.name);
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
                const updateData: { email?: string; name?: string; password?: string } = {};
                if (email && email !== user?.email) updateData.email = email;
                if (name && name !== user?.name) updateData.name = name;
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
        <div>
            <h1>Profile</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {user ? (
                <form onSubmit={handleUpdateProfile}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>New Password (optional):</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Update Profile</button>
                </form>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
}
export default Profile;
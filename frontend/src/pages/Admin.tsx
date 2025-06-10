import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/user';

function Admin() {
  const { token, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role === 'admin' && token) {
      fetchUsers();
    }
  }, [token, role]);

  async function fetchUsers() {
    try {
      if (token) {
        const fetchedUsers = await getAllUsers(token);
        setUsers(fetchedUsers);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load users');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      if (token) {
        await deleteUser(token, id);
        setUsers(users.filter((user) => user.id !== id));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    }
  }

  if (role !== 'admin') {
    return <p>Access denied. Admin privileges required.</p>;
  }

  return (
    <div>
      <h1>Manage Users</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email}) - Role: {user.role}
            <button
              onClick={() => handleDeleteUser(user.id)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
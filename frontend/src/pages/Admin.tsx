import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUserRole } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/types';
import '../css/Admin.css';

function Admin() {
  const { token, role, userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (role === 'admin' && token) {
      fetchUsers();
    }
  }, [token, role]);

  useEffect(() => {
    applyFilters();
  }, [search, roleFilter, users]);

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

  function applyFilters() {
    let filtered = users;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(s) ||
          u.lastName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    setFilteredUsers(filtered);
  }

  async function handleDeleteUser(id: string) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      if (token) {
        await deleteUser(token, id);
        setUsers(users.filter((user) => user._id !== id));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    if (newRole !== 'admin' && newRole !== 'user') {
      return;
    }
    try {
      if (token) {
        await updateUserRole(token, userId, newRole);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user role');
    }
  }

  if (role !== 'admin') {
    return <p>Access denied. Admin privileges required.</p>;
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Users</h1>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-controls">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="admin-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th">Name</th>
              <th className="admin-th">Email</th>
              <th className="admin-th">Role</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="admin-td">{user.firstName} {user.lastName}</td>
                <td className="admin-td">{user.email}</td>
                <td className="admin-td">{user.role}</td>
                <td className="admin-td">
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    className="admin-select"
                    disabled={user._id === userId}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="admin-button delete"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && <p>No users found.</p>}
    </div>
  );
}

export default Admin;

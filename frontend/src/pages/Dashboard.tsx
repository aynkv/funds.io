import { useState, useEffect } from 'react';
import { getAccounts, getTransactions } from '../api/finance';
import { getGoals, getGoalProgress } from '../api/goals';
import { getNotifications } from '../api/notifications';
import { Account, Goal, Notification, Transaction } from '../types/types';
import '../css/Dashboard.css';

function Dashboard({ token }: { token: string }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchData();
    }, [token]);

    async function fetchData() {
        try {
            const fetchedAccounts = await getAccounts(token);
            setAccounts(fetchedAccounts);

            const fetchedGoals = await getGoals(token);
            const goalsWithProgress = await Promise.all(
                fetchedGoals.map(async (goal) => {
                    const { progress } = await getGoalProgress(token, goal._id);
                    return { ...goal, progress };
                })
            );
            setGoals(goalsWithProgress);

            const fetchedNotifications = await getNotifications(token);
            setNotifications(
                fetchedNotifications.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            );
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard</h1>

            <section className="dashboard-section">
                <h2 className="section-title">Spending Progress</h2>
                <div className="card-grid">
                    {accounts.map((acc) => {
                        const spent = acc.balance;
                        const overBudget = acc.budget && spent > acc.budget;
                        return (
                            <div key={acc._id} className={`card ${overBudget ? 'card-danger' : ''}`}>
                                <h3 className="card-title">{acc.name}</h3>
                                {acc.type === 'credit' ? (
                                    <p>
                                        Spent: <strong>${spent.toFixed(2)}</strong> / Budget:{' '}
                                        <strong>${acc.budget?.toFixed(2) || '∞'}</strong>
                                    </p>
                                )
                                    : (
                                        <p>
                                            Balance: <strong>${spent.toFixed(2)}</strong>
                                        </p>
                                    )
                                }
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="dashboard-section">
                <h2 className="section-title">Goal Status</h2>
                <div className="card-grid">
                    {goals.map((goal) => {
                        const progressPercent = Math.min((goal.progress / goal.targetAmount) * 100, 100);
                        return (
                            <div key={goal._id} className="card">
                                <h3 className="card-title">{goal.name}</h3>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <p>
                                    ${goal.progress.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                                </p>
                                {goal.deadline && (
                                    <p className="card-subtext">
                                        Due: {new Date(goal.deadline).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="dashboard-section">
                <h2 className="section-title">Recent Notifications</h2>
                <ul className="notification-list">
                    {notifications.slice(0, 5).map((notif) => (
                        <li
                            key={notif._id}
                            className={`notification-item ${notif.type === 'budget' ? 'notification-danger' : ''
                                }`}
                        >
                            <p className="notification-message">{notif.message}</p>
                            <div className="notification-meta">
                                <span>{notif.read ? 'Read' : 'Unread'}</span>
                                <span>{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default Dashboard;

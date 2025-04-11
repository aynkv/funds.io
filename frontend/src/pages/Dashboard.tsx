import { useState, useEffect } from 'react';
import { getAccounts, getTransactions } from '../api/finance';
import { getGoals, getGoalProgress } from '../api/goals';
import { getNotifications } from '../api/notifications';
import { Account, Goal, Notification, Transaction } from '../types/user';

function Dashboard({ token }: { token: string }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchData();
        // Socket.IO listeners are in App.tsx, updating state globally
    }, [token]);

    async function fetchData() {
        try {
            const fetchedAccounts = await getAccounts(token);
            setAccounts(fetchedAccounts);

            const fetchedTransactions = await getTransactions(token);
            setTransactions(fetchedTransactions);

            const fetchedGoals = await getGoals(token);
            const goalsWithProgress = await Promise.all(
                fetchedGoals.map(async (goal) => {
                    const { progress } = await getGoalProgress(token, goal._id);
                    return { ...goal, progress };
                })
            );
            setGoals(goalsWithProgress);

            const fetchedNotifications = await getNotifications(token);
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    }

    function getSpendingForAccount(accountId: string) {
        const accountTransactions = transactions.filter(
            (tx) => (tx.accountId as string) === accountId && tx.type === 'expense'
        );
        return accountTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>Spending Progress</h2>
            <ul>
                {accounts.map((acc) => {
                    const spent = getSpendingForAccount(acc._id);
                    return (
                        <li key={acc._id}>
                            {acc.name}: Spent ${spent} / Budget ${acc.budget}
                        </li>
                    );
                })}
            </ul>

            <h2>Goal Status</h2>
            <ul>
                {goals.map((goal) => (
                    <li key={goal._id}>
                        {goal.name}: ${goal.progress} / ${goal.targetAmount}{' '}
                        {goal.deadline && `(Due: ${new Date(goal.deadline).toLocaleDateString()})`}
                    </li>
                ))}
            </ul>

            <h2>Recent Notifications</h2>
            <ul>
                {notifications.slice(0, 5).map((notif) => (
                    <li key={notif._id}>
                        {notif.message} - {notif.read ? 'Read' : 'Unread'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
import {
    Chart as ChartJs,
    ArcElement,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { getAccounts } from '../api/finance';
import { useEffect, useState } from 'react';
import { Account, Goal, Transaction } from '../types/types';
import { getGoalProgress, getGoals } from '../api/goals';
import { Bar, Line, Pie } from 'react-chartjs-2';
import "../css/Summary.css";

ChartJs.register(
    ArcElement, BarElement, LineElement,
    CategoryScale, LinearScale, PointElement,
    Title, Tooltip, Legend
);

/**
 * Summary page component displaying financial visualizations.
 * Fetches accounts and goals, calculates spending and progress,
 * and renders Pie, Bar, and Line charts for user insights.
 *
 * @param token - The user's authentication token.
 * @param transactions - Array of all user transactions.
 * @returns The rendered summary page with charts.
 */
function Summary({ token, transactions }: { token: string; transactions: Transaction[] }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        fetchData();
    }, [token]);

    /**
     * Fetches accounts and goals from the API,
     * and updates state with progress for each goal.
     */
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

        } catch (error) {
            console.error('Failed to fetch summary data:', error);
        }
    }

    // Calculate total expenses per account for the pie chart
    const spendingAccounts = accounts.map((acc) => {
        const totalExpenses = transactions
            .filter((tx) => (tx.accountId as Account)._id === acc._id && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        return { name: acc.name, totalExpenses};
    })
    .filter(acc => acc.totalExpenses > 0);

    // Data for the spending pie chart
    const spendingData = {
        labels: spendingAccounts.map((acc) => acc.name),
        datasets: [
            {
                label: 'Spending ($)',
                data: spendingAccounts.map((acc) => acc.totalExpenses),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    // Data for the goals bar chart
    const goalData = {
        labels: goals.map((goal) => goal.name),
        datasets: [
            {
                label: 'Progress ($)',
                data: goals.map((goal) => goal.progress),
                backgroundColor: '#36A2EB'
            },
            {
                label: 'Target ($)',
                data: goals.map((goal) => goal.targetAmount),
                backgroundColor: '#FF6384'
            }
        ]
    }

    // Generate last 30 days for the trends chart
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    // Calculate daily income and expenses for the line chart
    const transactionTrends = last30Days.map((date) => {
        const dailyTransactions = transactions
            .filter((tx) =>
                new Date(tx.date).toISOString().split('T')[0] === date
            );
        const income = dailyTransactions
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expense = dailyTransactions
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        return { date, income, expense };
    });

    // Data for the transaction trends line chart
    const trendData = {
        labels: last30Days,
        datasets: [
            {
                label: 'Income ($)',
                data: transactionTrends.map((t) => t.income),
                borderColor: '#36A2EB',
                fill: false,
            },
            {
                label: 'Expenses ($)',
                data: transactionTrends.map((t) => t.expense),
                fill: false,
            },
        ],
    };

    return (
        <div className="summary-page">
            <div className="summary-header">
                <h1>Summary</h1>
                <p>Browse diagrams related to your goals and spending</p>
            </div>

            <div className="summary-section">
                <h2>Spending by Account</h2>
                <div className="chart-container pie-chart">
                    <Pie
                        data={spendingData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        boxWidth: 20,
                                        padding: 20,
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    },
                                }
                            },
                        }}
                    />
                </div>
            </div>

            <div className="summary-section">
                <h2>Goal progress</h2>
                <div className="chart-container">
                    <Bar
                        data={goalData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: 'top' } },
                            scales: { y: { beginAtZero: true } },
                        }}
                    />
                </div>
            </div>

            <div className="summary-section">
                <h2>Transaction Trends (Last 30 Days)</h2>
                <div className="chart-container">
                    <Line
                        data={trendData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: 'top' } },
                            scales: { y: { beginAtZero: true } },
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Summary;
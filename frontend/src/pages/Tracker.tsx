import { FormEvent, useEffect, useState } from "react";
import { Account, Goal, Transaction } from "../types/user";
import { createAccount, createTransaction, getAccounts } from "../api/finance";
import { createGoal, getGoals } from "../api/goals";

interface ConstraintForm {
    type: 'min' | 'max' | 'percentage';
    value: number;
    accountId?: string;
};

function Tracker({ token, transactions }: { token: string; transactions: Transaction[] }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [accountName, setAccountName] = useState('');
    const [accountBudget, setAccountBudget] = useState('');
    const [transactionAccountId, setTransactionAccountId] = useState('');
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionCategory, setTransactionCategory] = useState('');
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [goalAccountId, setGoalAccountId] = useState('');
    const [constraints, setConstraints] = useState<ConstraintForm[]>([]);

    useEffect(() => {
        fetchData();
    }, [token])

    async function fetchData() {
        try {
            const fetchedAccounts = await getAccounts(token);
            setAccounts(fetchedAccounts);
            const fetchedGoals = await getGoals(token);
            setGoals(fetchedGoals);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    }

    async function handleCreateAccount(e: FormEvent) {
        e.preventDefault();
        try {
            const account = await createAccount(token, accountName, parseFloat(accountBudget) || 0);
            setAccounts([...accounts, account]);
            setAccountName('');
            setAccountBudget('');
        } catch (error) {
            console.error('Account creation failed: ', error);
        }
    }

    async function handleCreateTransaction(e: FormEvent) {
        e.preventDefault();
        try {
            await createTransaction(
                token,
                transactionAccountId,
                transactionType,
                parseFloat(transactionAmount),
                transactionCategory
            );
            setTransactionAmount('');
            setTransactionCategory('');
        } catch (error) {
            console.error('Transaction creation failed: ', error);
        }
    }

    async function handleCreateGoal(e: FormEvent) {
        e.preventDefault();
        try {
            const cleanedConstraints = constraints.map((c) => ({
                type: c.type,
                value: parseFloat(c.value as any),
                accountId: c.accountId && c.accountId !== '' ? c.accountId : undefined
            }));
            const goal = await createGoal(
                token,
                goalName,
                parseFloat(goalTarget),
                goalDeadline,
                goalAccountId || undefined,
                cleanedConstraints
            );
            setGoals([...goals, goal]);
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
            setGoalAccountId('');
            setConstraints([]);
        } catch (error) {
            console.error('Goal creation failed:', error);
        }
    }

    function addConstraint() {
        setConstraints([...constraints, { type: 'min', value: 0 }]);
    }

    function updateConstraint(index: number, field: keyof ConstraintForm, value: string | number) {
        const newConstraints = [...constraints];
        newConstraints[index] = { ...newConstraints[index], [field]: value };
        setConstraints(newConstraints);
    }

    return (
        <div>
            <h1>Tracker</h1>

            <h2>Create Account</h2>
            <form onSubmit={handleCreateAccount}>
                <input
                    type="text"
                    placeholder="Account name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Budget"
                    value={accountBudget}
                    onChange={(e) => setAccountBudget(e.target.value)}
                />
                <button type="submit">Add Account</button>
            </form>

            <h2>Log Transaction</h2>
            <form onSubmit={handleCreateTransaction}>
                <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as 'income' | 'expense')}
                >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={transactionCategory}
                    onChange={(e) => setTransactionCategory(e.target.value)}
                />
                <select
                    value={transactionAccountId}
                    onChange={(e) => setTransactionAccountId(e.target.value)}
                    required
                >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                </select>
                <button type="submit">Add Transaction</button>
            </form>

            <h2>Create Goal</h2>
            <form onSubmit={handleCreateGoal}>
                <input
                    type="text"
                    placeholder="Goal Name"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Target Amount"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                />
                <select
                    value={goalAccountId}
                    onChange={(e) => setGoalAccountId(e.target.value)}
                >
                    <option value="">No Account</option>
                    {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                </select>

                <h3>Constraints</h3>
                {constraints.map((c, index) => (
                    <div key={index}>
                        <select
                            value={c.type}
                            onChange={(e) => updateConstraint(index, 'type', e.target.value as 'min' | 'max' | 'percentage')}
                        >
                            <option value="min">Min</option>
                            <option value="max">Max</option>
                            <option value="percentage">Percentage</option>
                        </select>
                        <input
                            type="number"
                            value={c.value}
                            onChange={(e) => updateConstraint(index, 'value', parseFloat(e.target.value))}
                            required
                        />
                        {c.type === 'percentage' && (
                            <select
                                value={c.accountId}
                                onChange={(e) => updateConstraint(index, 'accountId', e.target.value)}
                            >
                                <option value="">Select Account</option>
                                {accounts.map((acc) => (
                                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addConstraint}>Add Constraint</button>
                <button type="submit">Add Goal</button>
            </form>

            <h2>Accounts</h2>
            <ul>
                {accounts.map((acc) => (
                    <li key={acc._id}>{acc.name} - Budget: ${acc.budget}</li>
                ))}
            </ul>
            <h2>Transactions</h2>
            <ul>
                {transactions.map((tx) => (
                    <li key={tx._id}>
                        {tx.type}: ${tx.amount} ({tx.category}) - {(tx.accountId as Account).name}
                    </li>
                ))}
            </ul>
            <h2>Goals</h2>
            <ul>
                {goals.map((goal) => (
                    <li key={goal._id}>
                        {goal.name} - Target: ${goal.targetAmount} | Progress: ${goal.progress}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Tracker;

import React, { useEffect, useState } from 'react';
import '../css/Tracker.css';
import { createAccount, createTransaction, getAccounts, getTransactions } from '../api/finance';
import {  Constraint } from '../types/types';
import { createConstraint, createGoal, getConstraints, getGoals } from '../api/goals';
import { AccountDto, GoalDto, TransactionDto } from '../api/dto/dtos';
import { accountToDto, goalToDto, transactionToDto } from '../util';

interface FormData {
    name?: string;
    budget?: string;
    transactionType?: 'income' | 'expense';
    transactionAmount?: string;
    accountId: string;
    transactionCategory?: string;
    transactionDescription?: string;
    goalAccountId?: string;
    goalDeadline?: string;
    targetAmount?: string;
    constraintId?: string;
    newConstraintType?: 'min' | 'max' | 'percentage';
    newConstraintValue?: string;
}

function Tracker({ token }: { token: string }) {
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
    const [goals, setGoals] = useState<GoalDto[]>([]);
    const [constraints, setConstraints] = useState<Constraint[]>([]);
    const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'goals'>('accounts');
    const [sortKey, setSortKey] = useState<string>('id');
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [token]);

    async function fetchData() {
        try {
            const fetchedAccounts = await getAccounts(token);
            const accountDtos: AccountDto[] = [];
            fetchedAccounts.forEach(a => accountDtos.push(accountToDto(a)));
            setAccounts(accountDtos);


            const fetchedTransactions = await getTransactions(token);
            const transactionDtos: TransactionDto[] = [];
            fetchedTransactions.forEach(t => transactionDtos.push(transactionToDto(t)));
            setTransactions(transactionDtos);

            const fetchedGoals = await getGoals(token);
            const goalDtos: GoalDto[] = [];
            fetchedGoals.forEach(g => goalDtos.push(goalToDto(g)));
            setGoals(goalDtos);

            const fetchedConstraints = await getConstraints(token);
            setConstraints(fetchedConstraints);

        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    }

    async function handleCreateAccount(accountName: string, accountBudget: number) {
        try {
            const account = await createAccount(token, accountName, accountBudget || 0);
            setAccounts([...accounts, accountToDto(account)]);
        } catch (error) {
            console.error('Account creation failed: ', error);
        }
    }

    async function handleCreateTransaction(
        transactionAccount: AccountDto,
        transactionType: "income" | "expense",
        transactionAmount: string,
        transactionCategory?: string,
        transactionDescription?: string
    ) {
        try {
            const transaction = await createTransaction(
                token,
                transactionAccount._id,
                transactionType,
                parseFloat(transactionAmount),
                transactionCategory,
                transactionDescription
            );
            setTransactions([...transactions, transactionToDto(transaction)]);
        } catch (error) {
            console.error('Transaction creation failed: ', error);
        }
    }

    async function handleCreateGoal(form: FormData) {
        try {
            if (!form.name || !form.goalAccountId || !form.targetAmount) {
                throw new Error("Missing required goal fields");
            }

            let constraintId = form.constraintId;

            if (!constraintId && form.newConstraintType && form.newConstraintValue) {
                const newConstraint = {
                    type: form.newConstraintType,
                    value: parseFloat(form.newConstraintValue),
                };
                const response = await createConstraint(token, newConstraint);
                constraintId = response._id;
                setConstraints([...constraints, response]);
            }

            if (!constraintId) {
                throw new Error('Constraint ID is required');
            }

            const goal = await createGoal(
                token,
                form.name,
                form.goalAccountId,
                parseFloat(form.targetAmount),
                constraintId,
                form.goalDeadline,
            );

            setGoals([...goals, goalToDto(goal)]);
        } catch (error) {
            console.error('Goal creation failed:', error);
        }
    }

    const getCurrentEntryType = () => {
        return activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1, -1);
    }

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const sortedData = () => {
        let data: any[] = [];
        if (activeTab === 'accounts') data = accounts;
        else if (activeTab === 'transactions') data = transactions;
        else if (activeTab === 'goals') data = goals;

        return [...data].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
            return 0;
        });
    };

    const sortedDataCleanup = () => {
        const sorted = sortedData();
        sorted.forEach(entry => {
            if (activeTab === 'accounts' || activeTab === 'goals') {
                delete entry._id;
            }
        });
        return sorted;
    }

    const openModal = () => {
        setFormData({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'accounts') {
            const newAccount = {
                name: formData.name,
                budget: parseFloat(formData.budget),
            };

            handleCreateAccount(newAccount.name, newAccount.budget);
        } else if (activeTab === 'transactions') {
            const account: AccountDto = accounts.find(acc => acc.name === formData.accountId)!;
            handleCreateTransaction(
                account,
                formData.transactionType,
                formData.transactionAmount,
                formData.transactionCategory,
                formData.transactionDescription);
        } else if (activeTab === 'goals') {
            handleCreateGoal(formData);
        }
        closeModal();
    };

    return (
        <div className="tracker-container">
            <div className="header-row">
                <div className="tab-switcher">
                    <button
                        className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accounts')}
                    >
                        Accounts
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goals')}
                    >
                        Goals
                    </button>
                </div>

                <button className="add-button" onClick={openModal}>Add {getCurrentEntryType()}</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {activeTab === 'accounts' && (
                                <>
                                    <th onClick={() => toggleSort('name')} className={sortKey === 'name' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Name</th>
                                    <th onClick={() => toggleSort('budget')} className={sortKey === 'budget' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Budget</th>
                                    <th onClick={() => toggleSort('createdAt')} className={sortKey === 'createdAt' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Date Created</th>
                                </>
                            )}

                            {activeTab === 'transactions' && (
                                <>
                                    <th onClick={() => toggleSort('_id')} className={sortKey === '_id' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>ID</th>
                                    <th onClick={() => toggleSort('accountName')} className={sortKey === 'accountName' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Account</th>
                                    <th onClick={() => toggleSort('type')} className={sortKey === 'type' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Type</th>
                                    <th onClick={() => toggleSort('amount')} className={sortKey === 'amount' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Amount</th>
                                    <th onClick={() => toggleSort('category')} className={sortKey === 'category' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Category</th>
                                    <th onClick={() => toggleSort('description')} className={sortKey === 'description' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Description</th>
                                    <th onClick={() => toggleSort('date')} className={sortKey === 'date' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Date</th>
                                </>
                            )}
                            {activeTab === 'goals' && (
                                <>
                                    <th onClick={() => toggleSort('name')} className={sortKey === 'name' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Name</th>
                                    <th onClick={() => toggleSort('progress')} className={sortKey === 'progress' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Current</th>
                                    <th onClick={() => toggleSort('targetAmount')} className={sortKey === 'targetAmount' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Target</th>
                                    <th onClick={() => toggleSort('deadline')} className={sortKey === 'deadline' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Deadline</th>
                                    <th onClick={() => toggleSort('accountName')} className={sortKey === 'accountName' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Account</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDataCleanup().map((entry) => (
                            <tr key={entry._id}>
                                {Object.keys(entry).map((key) => (
                                    <td key={key} data-label={key}>{entry[key] || '-'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New {getCurrentEntryType()}</h3>
                        <form onSubmit={handleSubmit}>
                            {activeTab === 'accounts' && (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Account Name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="budget"
                                        placeholder="Budget"
                                        value={formData.budget || ''}
                                        onChange={handleInputChange}
                                    />
                                </>
                            )}
                            {activeTab === 'transactions' && (
                                <>
                                    <select
                                        name="transactionType"
                                        value={formData.transactionType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>Type</option>
                                        {["income", "expense"].map((t, k) => (
                                            <option key={k} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        name="transactionAmount"
                                        placeholder="Amount"
                                        value={formData.transactionAmount || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <select
                                        name="accountId"
                                        value={formData.accountId || ''}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select Account</option>
                                        {accounts.map((acc) => (
                                            <option key={acc.createdAt} value={acc.name}>{acc.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="transactionCategory"
                                        placeholder="Category"
                                        value={formData.transactionCategory || ''}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="transactionDescription"
                                        placeholder="Description"
                                        value={formData.transactionDescription || ''}
                                        onChange={handleInputChange}
                                    />
                                </>
                            )}
                            {activeTab === 'goals' && (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Goal Name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        placeholder="Target Amount"
                                        value={formData.targetAmount || ''}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <select
                                        name="goalAccountId"
                                        value={formData.goalAccountId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map((acc) => (
                                            <option key={acc._id} value={acc._id}>{acc.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        name="goalDeadline"
                                        placeholder="Goal Deadline"
                                        value={formData.goalDeadline || ''}
                                        onChange={handleInputChange}
                                    />

                                    <select name="constraintId"
                                        value={formData.constraintId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Create New Constraint</option>
                                        {constraints.map(c => (
                                            <option key={c._id} value={c._id}>{`${c.type} - ${c.value}`}</option>
                                        ))}
                                    </select>

                                    <div className="new-constraint">
                                        <select name="newConstraintType" onChange={handleInputChange}>
                                            <option value="">Select Constraint Type</option>
                                            <option value="min">Minimum</option>
                                            <option value="max">Maximum</option>
                                            <option value="percentage">Percentage</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="newConstraintValue"
                                            placeholder="Constraint Value"
                                            value={formData.newConstraintValue || ''}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step={formData.newConstraintType === 'percentage' ? '0.1' : '0.01'}
                                        />
                                    </div>

                                </>
                            )}
                            <button type="submit">Add</button>
                            <button type="button" onClick={closeModal}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tracker;

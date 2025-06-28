import React, { useEffect, useState } from 'react';
import '../css/Tracker.css';
import { createAccount, createTransaction, getAccounts, getTransactions } from '../api/finance';
import { Constraint } from '../types/types';
import { createConstraint, createGoal, getConstraints, getGoals } from '../api/goals';
import { AccountDto, GoalDto, TransactionDto } from '../api/dto/dtos';
import { accountToDto, goalToDto, transactionToDto } from '../util';

function Tracker({ token }: { token: string }) {
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
    const [goals, setGoals] = useState<GoalDto[]>([]);
    const [constraints, setConstraints] = useState<Constraint[]>([]);
    const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'goals'>('accounts');
    const [sortKey, setSortKey] = useState<string>('createdAt');
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [token]);

    /**
     * Fetches all necessary data from the backend APIs:
     * - Accounts
     * - Transactions
     * - Goals
     * - Constraints
     * Converts them to DTOs where necessary and updates the component state.
     */
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

    /**
     * Creates a new account using the provided name and budget.
     * Updates the accounts state with the newly created account.
     * 
     * @param accountName - The name of the account to be created
     * @param accountBudget - The initial budget of the account
     */
    async function handleCreateAccount(accountName: string, type: string, accountBudget: number) {
        try {
            const account = await createAccount(token, accountName, type, accountBudget || 0);
            setAccounts([...accounts, accountToDto(account)]);
            fetchData();
        } catch (error) {
            console.error('Account creation failed: ', error);
        }
    }

    /**
     * Creates a new transaction associated with a specific account.
     * Updates the transactions state with the new transaction.
     * 
     * @param transactionAccount - The account to which the transaction belongs
     * @param transactionType - Either 'income' or 'expense'
     * @param transactionAmount - The amount of the transaction as a string
     * @param transactionCategory - Optional transaction category
     * @param transactionDescription - Optional transaction description
     */
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
            fetchData();
        } catch (error) {
            console.error('Transaction creation failed: ', error);
        }
    }

    /**
     * Creates a new goal, optionally creating a new constraint if one is not selected.
     * Updates both goals and constraints states accordingly.
     * 
     * @param form - Object containing form data from the goal creation modal
     */
    async function handleCreateGoal(
        goalAccount: AccountDto,
        name: string,
        targetAmount: string,
        constraintId: string,
        newConstraintType?: 'min' | 'max' | 'percentage',
        newConstraintValue?: string,
        goalDeadline?: string
    ) {
        try {
            if (!name || !goalAccount || !targetAmount) {
                throw new Error("Missing required goal fields");
            }

            if (!constraintId && newConstraintType && newConstraintValue) {
                const newConstraint = {
                    type: newConstraintType,
                    value: parseFloat(newConstraintValue),
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
                name,
                goalAccount._id,
                parseFloat(targetAmount),
                constraintId,
                goalDeadline,
            );

            setGoals([...goals, goalToDto(goal)]);
            fetchData();
        } catch (error) {
            console.error('Goal creation failed:', error);
        }
    }

    /**
     * Returns the singular form of the current tab's type 
     * (e.g., "accounts" => "Account").
     * 
     * @returns The singular entry type name
     */
    const getCurrentEntryType = () => {
        return activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1, -1);
    }

    /**
     * Toggles sorting order for a given key.
     * If the same key is selected again, toggles the direction.
     * Otherwise, updates the sort key and resets to ascending order.
     * 
     * @param key - The property name to sort by
    */
    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    /**
     * Returns a sorted copy of the current active tab's data 
     * (accounts, transactions, or goals) based on the selected sort key and direction.
     * 
     * @returns Sorted data array
     */
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

    /**
     * Opens the modal form and resets the form data.
     */
    const openModal = () => {
        setFormData({});
        setModalOpen(true);
    };

    /**
     * Closes the modal form.
     */
    const closeModal = () => {
        setModalOpen(false);
    };

    /**
     * Handles changes to form input fields in the modal.
     * Updates the `formData` state accordingly.
     * 
     * @param e - The change event from an input or select field
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles form submission depending on the active tab:
     * - 'accounts': Calls `handleCreateAccount`
     * - 'transactions': Calls `handleCreateTransaction`
     * - 'goals': Calls `handleCreateGoal`
     * Closes the modal after creation.
     * 
     * @param e - The form submission event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'accounts') {
            const newAccount = {
                name: formData.name,
                type: formData.type,
                budget: parseFloat(formData.budget),
            };

            handleCreateAccount(newAccount.name, newAccount.type, newAccount.budget);
        } else if (activeTab === 'transactions') {
            const account: AccountDto = accounts.find(acc => acc.name === formData.accountId)!;
            handleCreateTransaction(
                account,
                formData.transactionType,
                formData.transactionAmount,
                formData.transactionCategory,
                formData.transactionDescription);
        } else if (activeTab === 'goals') {
            const account: AccountDto = accounts.find(acc => acc._id === formData.goalAccountId)!;
            handleCreateGoal(
                account,
                formData.name,
                formData.targetAmount,
                formData.constraintId,
                formData.newConstraintType,
                formData.newConstraintValue,
                formData.goalDeadline
            );
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
                                    <th onClick={() => toggleSort('balance')} className={sortKey === 'balance' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Credit/Debit</th>
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
                                    <th onClick={() => toggleSort('createdAt')} className={sortKey === 'date' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Date</th>
                                </>
                            )}
                            {activeTab === 'goals' && (
                                <>
                                    <th onClick={() => toggleSort('name')} className={sortKey === 'name' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Goal</th>
                                    <th onClick={() => toggleSort('accountName')} className={sortKey === 'accountName' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Account</th>
                                    <th onClick={() => toggleSort('progress')} className={sortKey === 'progress' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Current</th>
                                    <th onClick={() => toggleSort('targetAmount')} className={sortKey === 'targetAmount' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Target</th>
                                    <th onClick={() => toggleSort('deadline')} className={sortKey === 'deadline' ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}>Deadline</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData().map((entry) => {
                            if (activeTab === 'goals') {
                                return (
                                    <tr key={entry._id}>
                                        <td data-label="name">{entry.name}</td>
                                        <td data-label="accountName">{entry.accountName}</td>
                                        <td data-label="progress">${entry.progress?.toFixed(2)}</td>
                                        <td data-label="targetAmount">${entry.targetAmount?.toFixed(2)}</td>
                                        <td data-label="deadline">{entry.deadline || '-'}</td>
                                    </tr>
                                )
                            } else if (activeTab === 'accounts') {
                                return (
                                    <tr key={entry._id}>
                                        <td data-label="name">{entry.name}</td>
                                        <td data-label="balance">${entry.balance.toFixed(2)}</td>
                                        <td data-label="budget">{entry.budget ? `$${entry.budget.toFixed(2)}` : 'N/A'}</td>
                                        <td data-label="createdAt">{entry.createdAt}</td>
                                    </tr>
                                )
                            } else {
                                return (
                                    <tr key={entry._id}>
                                        <td data-label="_id">{entry._id}</td>
                                        <td data-label="accountName">{entry.accountName}</td>
                                        <td data-label="type">{entry.type}</td>
                                        <td data-label="amount">${entry.amount.toFixed(2)}</td>
                                        <td data-label="category">{entry.category || '-'}</td>
                                        <td data-label="description">{entry.description || '-'}</td>
                                        <td data-label="date">{entry.createdAt}</td>
                                    </tr>
                                )
                            }
                        })}
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
                                    <select
                                        name="type"
                                        value={formData.type || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Type</option>
                                        {["credit", "debit"].map((t, k) => (
                                            <option key={k} value={t}>{t}</option>
                                        ))}
                                    </select>
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
                                        <option value="">Type</option>
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
                                        {accounts
                                            .filter((a) => {
                                                if (!formData.transactionType) return true;
                                                return formData.transactionType === 'income'
                                                    ? a.type === 'debit'
                                                    : a.type === 'credit';
                                            })
                                            .map((acc) => (
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

                                    {!formData.constraintId &&
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
                                    }
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

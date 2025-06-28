/**
 * Represents an account with budget and spending information.
 */
export type AccountDto = {
    _id: string;
    name: string;
    type: "credit" | "debit";
    balance: number;
    budget: number;
    createdAt: string;
}

/**
 * Represents a transaction (income or expense) associated with an account.
 */
export type TransactionDto = {
    _id: string;
    accountName: string;
    type: "income" | "expense";
    amount: number;
    category?: string;
    description?: string;
    createdAt: string;
}

/**
 * Represents a financial goal linked to an account.
 */
export type GoalDto = {
    _id: string;
    name: string;
    accountName: string;
    progress: number;
    targetAmount: number;
    deadline: string;
    createdAt: string;
}
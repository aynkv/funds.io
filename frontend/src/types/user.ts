/**
 * Represents a user in the system.
 */
export interface User {
    /**
     * Unique identifier for the user.
     */
    id: string;

    /**
     * Email address of the user.
     */
    email: string;

    /**
     * Name of the user.
     */
    name: string;

    /**
     * Role of the user, either 'user' or 'admin'.
     */
    role: 'user' | 'admin';
};

/**
 * Represents the response from an authentication request.
 */
export interface AuthResponse {
    /**
     * Authentication token.
     */
    token: string;

    /**
     * Authenticated user information.
     */
    user: User;
};

/**
 * Represents a user's account.
 */
export interface Account {
    /**
     * Unique identifier for the account.
     */
    _id: string;

    /**
     * Unique identifier for the user who owns the account.
     */
    userId: string;

    /**
     * Name of the account.
     */
    name: string;

    /**
     * Budget associated with the account.
     */
    budget: number;

    /**
     * Date and time when the account was created.
     */
    createdAt: string;
};

/**
 * Represents a financial transaction.
 */
export interface Transaction {
    /**
     * Unique identifier for the transaction.
     */
    _id: string;

    /**
     * Unique identifier for the user who made the transaction.
     */
    userId: string;

    /**
     * Unique identifier for the account associated with the transaction.
     * Can be a string or an Account object.
     */
    accountId: string | Account;

    /**
     * Type of the transaction, either 'income' or 'expense'.
     */
    type: 'income' | 'expense';

    /**
     * Amount of money involved in the transaction.
     */
    amount: number;

    /**
     * Optional category of the transaction.
     */
    category?: string;

    /**
     * Optional description of the transaction.
     */
    description?: string;

    /**
     * Date and time when the transaction occurred.
     */
    date: string;
};
/**
 * Represents a user in the system.
 */
export interface User {
    /**
     * Unique identifier for the user.
     */
    _id: string;

    /**
     * Email address of the user.
     */
    email: string;

    /**
     * First name of the user.
     */
    firstName: string;

    /**
     * Last name of the user.
     */
    lastName: string;

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
     * Type of an account.
     */
    type: 'credit' | 'debit';
    /**
     * Balance on this account
     */
    balance: number;

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
     */
    accountId: Account;

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

/**
 * Type of a constraint, either 'min', 'max', or 'percentage'.
 */
export type ConstraintType = 'min' | 'max' | 'percentage';

/**
 * Represents a constraint on an account.
 */
export interface Constraint {
    /**
     * Unique identifier for the constraint.
     */
    _id: string;

    /**
     * Unique identifier for the user who owns the constraint.
     */
    userId: string;

    /**
     * Type of the constraint, either 'min', 'max', or 'percentage'.
     */
    type: ConstraintType;

    /**
     * Value of the constraint.
     */
    value: number;

    /**
     * Optional unique identifier for the account associated with the constraint.
     */
    accountId?: string;
};

/**
 * Represents a financial goal for a user.
 */
export interface Goal {
    /**
     * Unique identifier for the goal.
     */
    _id: string;

    /**
     * Unique identifier for the user who owns the goal.
     */
    userId: string;

    /**
     * Name of the goal.
     */
    name: string;

    /**
     * Target amount of money to achieve the goal.
     */
    targetAmount: number;

    /**
     * Optional deadline for achieving the goal.
     */
    deadline?: string;

    /**
     * Unique identifier for the account associated with the goal.
     */
    accountId: Account;

    /**
     * Constraint associated with the goal.
     */
    constraintId: string;

    /**
     * Progress towards achieving the goal.
     */
    progress: number;

    /**
     * Date and time when the goal was created.
     */
    createdAt: string;
};

export interface GoalFormInput {
  name: string;
  deadline?: string;
  accountId?: string;
  constraintId?: string;
  createNewConstraint: boolean;
  newConstraint?: {
    type: ConstraintType;
    value: number;
  };
}
 
/**
 * Represents a notification for a user.
 */
export interface Notification {
    /**
     * Unique identifier for the notification.
     */
    _id: string;

    /**
     * Unique identifier for the user who received the notification.
     */
    userId: string;

    /**
     * Message content of the notification.
     */
    message: string;

    /**
     * Type of the notification, either 'budget', 'goal', or 'general'.
     */
    type: 'budget' | 'goal' | 'general';

    /**
     * Optional unique identifier for the related entity (e.g., goal or budget).
     */
    relatedId?: string;

    /**
     * Indicates whether the notification has been read.
     */
    read: boolean;

    /**
     * Date and time when the notification was created.
     */
    createdAt: string;
};
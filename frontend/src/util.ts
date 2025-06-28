import { AccountDto, GoalDto, TransactionDto } from "./api/dto/dtos";
import { Account, Goal, Transaction } from "./types/types";

export const validateEmail = (value: string) => {
    if (!value) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return "Invalid email format."
    }
    return "";
}

export const validatePassword = (value: string) => {
    if (!value) return "Password is required.";
    if (value.length < 6) {
        return "Password must be at least 6 characters";
    }
    return "";
}

export const validateConfirmPassword = (value: string, password: string) => {
    if (!value) return 'Confirm your password.';
    if (value !== password) {
        return "Passwords don't match.";
    }
    return "";
}

export function transactionToDto(transaction: Transaction): TransactionDto {
    return {
        _id: transaction._id,
        accountName: transaction.accountId.name,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        createdAt: dateFormatter(transaction.date),
    }
}

export function accountToDto(account: Account): AccountDto {
    return {
        _id: account._id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        budget: account.budget,
        createdAt: new Date(account.createdAt).toISOString().split('T')[0],
    }
}

export function goalToDto(goal: Goal): GoalDto {
    return {
        _id: goal._id,
        name: goal.name,
        accountName: goal.accountId.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '-',
        progress: goal.progress,
        createdAt: goal.createdAt
    }
}

function dateFormatter(dateStr: string) {
    const date = new Date(dateStr);
    const formatted = date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    });

    return formatted;
}
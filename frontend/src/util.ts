import { AccountDto, TransactionDto } from "./api/dto/dtos";
import { Account, Transaction } from "./types/types";

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
        date: dateFormatter(transaction.date),
    }
}

export function accountToDto(account: Account): AccountDto {
    return {
        _id: account._id,
        name: account.name,
        budget: account.budget,
        createdAt: new Date(account.createdAt).toISOString().split('T')[0],
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
import axios from "axios";
import { Account, Transaction } from "../types/user";

const API_URL = 'http://localhost:5000/api';

/**
 * Returns the configuration object for axios requests with the authorization header.
 * @param token - The authentication token.
 * @returns The configuration object.
 */
const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});

/**
 * Fetches the list of accounts for the authenticated user.
 * @param token - The authentication token.
 * @returns A promise that resolves to an array of Account objects.
 */
export const getAccounts = async (token: string) => {
    const response = await axios.get(`${API_URL}/accounts`, getConfig(token));
    return response.data as Account[];
};

/**
 * Creates a new account for the authenticated user.
 * @param token - The authentication token.
 * @param name - The name of the account.
 * @param budget - The budget associated with the account.
 * @returns A promise that resolves to the created Account object.
 */
export const createAccount = async (token: string, name: string, budget: number) => {
    const response = await axios.post(`${API_URL}/accounts`, { name, budget }, getConfig(token));
    return response.data as Account;
};

/**
 * Fetches the list of transactions for the authenticated user.
 * @param token - The authentication token.
 * @returns A promise that resolves to an array of Transaction objects.
 */
export const getTransactions = async (token: string) => {
    const response = await axios.get(`${API_URL}/transactions`, getConfig(token));
    return response.data as Transaction[];
};

/**
 * Creates a new transaction for the authenticated user.
 * @param token - The authentication token.
 * @param accountId - The unique identifier for the account associated with the transaction.
 * @param type - The type of the transaction, either 'income' or 'expense'.
 * @param amount - The amount of money involved in the transaction.
 * @param category - The optional category of the transaction.
 * @param description - The optional description of the transaction.
 * @returns A promise that resolves to the created Transaction object.
 */
export const createTransaction = async (
    token: string,
    accountId: string,
    type: 'income' | 'expense',
    amount: number,
    category?: string,
    description?: string
) => {
    const response = await axios.post(`${API_URL}/transactions`,
        { accountId, type, amount, category, description },
        getConfig(token)
    );
    return response.data as Transaction;
};
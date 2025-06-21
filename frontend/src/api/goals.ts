import axios from "axios";
import { Goal, Constraint } from "../types/types";
import { API_URL } from "../../constants/app-constants";

/**
 * Returns the configuration object for axios requests with the authorization header.
 * @param token - The authentication token.
 * @returns The configuration object.
 */
const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});


export const getGoals = async (token: string) => {
    const response = await axios.get(`${API_URL}/goals`, getConfig(token));
    return response.data as Goal[];
}

export const createGoal = async (
    token: string,
    name: string,
    targetAmount: number,
    deadline?: string,
    accountId?: string,
    constraints: Constraint[] = []
) => {
    const response = await axios.post(
        `${API_URL}/goals`,
        { name, targetAmount, deadline, accountId, constraints },
        getConfig(token)
    );

    return response.data as Goal;
}

export const getGoalProgress = async (token: string, goalId: string) => {
    const response = await axios.get(`${API_URL}/goals/${goalId}/progress`, getConfig(token));
    return response.data as { goal: Goal, progress: number };
}
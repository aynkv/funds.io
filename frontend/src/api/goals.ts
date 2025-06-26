import axios from "axios";
import { Constraint, Goal } from "../types/types";
import { API_URL } from "../../constants/app-constants";

/**
 * Returns the configuration object for axios requests with the authorization header.
 * @param token - The authentication token.
 * @returns The configuration object.
 */
const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});


export const getConstraints = async (token: string): Promise<Constraint[]> => {
    const response = await axios.get(`${API_URL}/goals/constraints`, getConfig(token));
    return response.data;
};

export const createConstraint = async (
    token: string,
    constraint: { type: string; value: number }
): Promise<Constraint> => {
    const response = await axios.post(
        `${API_URL}/goals/constraints`,
        constraint,
        getConfig(token)
    );
    return response.data;
}

export const getGoals = async (token: string): Promise<Goal[]> => {
    const response = await axios.get(`${API_URL}/goals`, getConfig(token));
    return response.data;
}

/**
 * Creates a new goal using either an existing constraint or a new one.
 * @param token - Auth token.
 * @param name - Name of the goal.
 * @param deadline - Optional deadline.
 * @param accountId - ID of the associated account.
 * @param useExistingConstraint - Whether to use an existing constraint.
 * @param constraintId - Existing constraint ID (required if using existing constraint).
 * @param newConstraint - New constraint data (required if creating new constraint).
 * @returns The created goal.
 */
export const createGoal = async (
    token: string,
    name: string,
    accountId: string,
    targetAmount: number,
    constraintId: string,
    deadline?: string,
): Promise<Goal> => {
    const payload: any = {
        name,
        accountId,
        targetAmount,
        constraintId,
        deadline,
    };

    const response = await axios.post(
        `${API_URL}/goals`,
        payload,
        getConfig(token)
    );

    return response.data;
};

export const getGoalProgress = async (token: string, goalId: string) => {
    const response = await axios.get(`${API_URL}/goals/${goalId}/progress`, getConfig(token));
    return response.data as { goal: Goal, progress: number };
}
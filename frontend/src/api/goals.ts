import axios from "axios";
import { Constraint, Goal } from "../types/types";
import { API_URL } from "../../constants/app-constants";
import { getConfig } from "./apiUtils";

/**
 * Fetches all goal constraints for the authenticated user.
 * @param token - The authentication token.
 * @returns A promise resolving to an array of Constraint objects.
 */
export const getConstraints = async (token: string): Promise<Constraint[]> => {
    const response = await axios.get(`${API_URL}/goals/constraints`, getConfig(token));
    return response.data;
};

/**
 * Creates a new constraint for goals.
 * @param token - The authentication token.
 * @param constraint - The constraint object containing type and value.
 * @returns A promise resolving to the created Constraint object.
 */
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

/**
 * Fetches all goals for the authenticated user.
 * @param token - The authentication token.
 * @returns A promise resolving to an array of Goal objects.
 */
export const getGoals = async (token: string): Promise<Goal[]> => {
    const response = await axios.get(`${API_URL}/goals`, getConfig(token));
    return response.data;
}

/**
 * Creates a new goal using an existing constraint.
 * @param token - Auth token.
 * @param name - Name of the goal.
 * @param accountId - ID of the associated account.
 * @param targetAmount - The target amount for the goal.
 * @param constraintId - Existing constraint ID.
 * @param deadline - Optional deadline for the goal.
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

/**
 * Fetches the progress of a specific goal.
 * @param token - The authentication token.
 * @param goalId - The ID of the goal.
 * @returns A promise resolving to an object containing the goal and its progress.
 */
export const getGoalProgress = async (token: string, goalId: string) => {
    const response = await axios.get(`${API_URL}/goals/${goalId}/progress`, getConfig(token));
    return response.data as { goal: Goal, progress: number };
}
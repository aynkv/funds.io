export type AccountDto = {
    _id: string;
    name: string;
    budget: number;
    createdAt: string;
}

export type TransactionDto = {
    _id: string;
    accountName: string;
    type: "income" | "expense";
    amount: number;
    category?: string;
    description?: string;
    date: string;
}


export type GoalDto = {
    _id: string;
    name: string,
    accountName: string;
    targetAmount: number;
    deadline: string;
    progress: number;
}
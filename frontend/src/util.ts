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
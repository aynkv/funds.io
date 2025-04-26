import { ChangeEvent, FormEvent, useState } from "react";
import { login } from "../api/auth";
import "../css/Form.css";

interface LoginProps {
    onLogin: (token: string) => void;
}

function LoginForm({ onLogin }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState
        <{ email?: string; name?: string, password?: string }>({});

    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "Invalid email format."
        }
        return "";
    }

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await login(email, password);
            onLogin(response.token);
            setError('');
        } catch (err) {
            setError('Login failed. Check your credentials.');
        }
    };

    const handleInputFocus = () => {
        if (error) {
            setError('');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h1 className="form-header">Login</h1>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={handleInputFocus}
                    required />
                <p className="field-error">{errors.email}</p>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handleInputFocus}
                    required />
                <p className="error-message">
                    {error && <span>{error}</span>}
                </p>
            </div>
            <button type="submit" className="submit-button">Login</button>

        </form>
    );
}

export default LoginForm;
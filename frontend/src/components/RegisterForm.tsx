import { ChangeEvent, FormEvent, useState } from "react";
import { register } from "../api/auth";
import "../css/Form.css";

interface RegisterProps {
    onRegister: (token: string) => void;
}

function RegisterForm({ onRegister }: RegisterProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState
        <{ email?: string; name?: string, password?: string }>({});
    const [submitError, setSubmitError] = useState('');

    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "Invalid email format."
        }
        return "";
    }

    const validateName = (value: string) => {
        if (!value) return 'Name is required.';
        if (value.length < 2) {
            return "Name must be at least 2 characters."
        }
        return "";
    }

    const validatePassword = (value: string) => {
        if (!value) return "Password is required.";
        if (value.length < 6) {
            return "Password must be at least 6 characters";
        }
        return "";
    }

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setErrors(prev => ({ ...prev, name: validateName(value) }));
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await register(email, name, password);
            onRegister(response.token);
        } catch {
            setSubmitError('Registration failed. Email might be already in use.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h1 className="form-header">Join Us</h1>
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={handleEmailChange} required />
                <p className="field-error">{errors.email}</p>
            </div>
            <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={handleNameChange} required />
                <p className="field-error">{errors.name}</p>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={handlePasswordChange} required />
                <p className="field-error">{errors.password}</p>
            </div>
            <button
                type="submit"
                className="submit-button"
                disabled={Object.values(errors).some(Boolean)}>
                Register
            </button>
        </form>
    )
}

export default RegisterForm;
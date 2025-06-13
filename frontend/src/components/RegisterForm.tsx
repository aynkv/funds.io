import { ChangeEvent, FormEvent, useState } from "react";
import { register } from "../api/auth";
import "../css/Form.css";
import { validateConfirmPassword, validateEmail, validatePassword } from "../util";

interface RegisterProps {
    onRegister: (token: string) => void;
}

interface ErrorState {
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
}

function RegisterForm({ onRegister }: RegisterProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<ErrorState>({});
    const [submitError, setSubmitError] = useState('');

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) }));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await register(email, password);
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
                <label>Password</label>
                <input type="password" value={password} onChange={handlePasswordChange} required />
                <p className="field-error">{errors.password}</p>
            </div>
            <div className="form-group">
                <label>Confirm password</label>
                <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                <p className="field-error">{errors.confirmPassword}</p>
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
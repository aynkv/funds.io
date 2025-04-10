import LoginForm from '../components/LoginForm';

interface LoginProps {
    onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
    return (
        <div>
            <LoginForm onLogin={onLogin} />
        </div>
    )
}

export default Login;
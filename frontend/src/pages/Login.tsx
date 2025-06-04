import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    return (
        <div>
            <LoginForm onLogin={login} />
        </div>
    )
}

export default Login;
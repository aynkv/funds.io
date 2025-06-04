import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { login } = useAuth();
    return (
        <div>
            <RegisterForm onRegister={login} />
        </div>
    )
}
export default Register;
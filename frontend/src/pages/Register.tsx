import RegisterForm from "../components/RegisterForm";

interface RegisterProps {
    onRegister: (token: string) => void;
}

function Register({ onRegister }: RegisterProps) {
    return (
        <div>
            <RegisterForm onRegister={onRegister} />
        </div>
    )
}
export default Register;
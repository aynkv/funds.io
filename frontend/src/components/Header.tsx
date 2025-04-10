import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
    token: string | null;
    onLogout: () => void;
}

function Header({ token, onLogout }: HeaderProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <header>
            <nav>
                <Link to="/">Home</Link> | {' '}
                {token ? (
                    <>
                        <Link to="/tracker">Tracker</Link>
                        <Link to="/summary">Summary</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/notifications">Notifications</Link>
                        <Link to="/personal">Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
                    </>
                )}
                {' | '}
                <Link to="/about">About</Link>
            </nav>
        </header>
    );
}

export default Header;

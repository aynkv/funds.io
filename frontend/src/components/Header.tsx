import { Link, useNavigate } from "react-router-dom";
import '../css/Header.css'

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
                <div className="nav-left">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    {token && (
                        <>
                            <Link to="/tracker">Tracker</Link>
                            <Link to="/summary">Summary</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/notifications">Notifications</Link>
                        </>
                    )}
                </div>
                <div className="nav-right">
                    {token ? (
                        <>
                            <Link to="/personal">Profile</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <div className="guestButtons">
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;

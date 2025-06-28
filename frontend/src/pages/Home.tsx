import { Link } from 'react-router-dom';
import '../css/Home.css';

function Home() {
    return (
        <main id="homepage">
            <div className="jumbotron">
                <h1>Welcome to funds.io</h1>
                <p>Create accounts for your every need, set goals and stay in control of your finances</p>
                <Link id="redirect-btn" to={"/register"}>Start Now</Link>
            </div>

            <section className="features-section">
                <div className="feature-card">
                    <h2>Accounts</h2>
                    <p>Organize your finances by creating separate accounts for each purpose—savings, travel, daily expenses, and more.</p>
                </div>
                <div className="feature-card">
                    <h2>Goals</h2>
                    <p>Set clear financial goals, track your progress, and stay motivated to reach your targets on time.</p>
                </div>
                <div className="feature-card">
                    <h2>Transactions</h2>
                    <p>Log your income and expenses effortlessly. Get a clear picture of where your money is going.</p>
                </div>
            </section>
        </main>
    );
}

export default Home;

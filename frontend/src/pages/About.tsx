import '../css/About.css';

function About() {
    return (
        <div className="about-bg">

            <div className="about-container">
                <h1 className="about-title">About funds.io</h1>
                <p className="about-lead">
                    <strong>funds.io</strong> is your personal finance companion – helping you track income, manage
                    expenses, set savings goals, and stay on top of your financial health.
                </p>

                <div className="about-section">
                    <h2>Why use funds.io?</h2>
                    <ul>
                        <li>✔️ Stay organized by tracking all your accounts in one place</li>
                        <li>✔️ Monitor transactions and categorize spending easily</li>
                        <li>✔️ Set financial goals and watch your progress</li>
                        <li>✔️ Receive real-time notifications for budget activity</li>
                        <li>✔️ Keep your data safe and secure</li>
                    </ul>
                </div>

                <div className="about-section">
                    <h2>Main Features</h2>
                    <ul>
                        <li><strong>Accounts Dashboard:</strong> See your budgets and spending across all accounts</li>
                        <li><strong>Goal Tracking:</strong> Set savings targets and deadlines for your financial goals</li>
                        <li><strong>Transaction Management:</strong> View and organize your revenue and expenses</li>
                        <li><strong>Notifications:</strong> Get alerts for budget thresholds and goal updates</li>
                    </ul>
                </div>

                <div className="about-section">
                    <h2>Made for simplicity and clarity</h2>
                    <p>
                        Whether you're budgeting for groceries, saving for a vacation, or keeping tabs on multiple accounts,
                        <strong> funds.io</strong> gives you the tools to take control of your finances — all in a simple,
                        clean interface.
                    </p>
                </div>
            </div>
        </div>

    );
}

export default About;

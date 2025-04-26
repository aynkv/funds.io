import { Link } from 'react-router-dom';
import '../css/Home.css';
function Home() {
    return (
        <main>
            <div className="jumbotron">
                <h1>Welcome to funds.io</h1>
                <p>Create accounts for your every need, set goals and stay in control of your finances</p>
                <Link id="redirect-btn" to={"/register"}>Start Now</Link>
            </div>
        </main>
    )
}

export default Home;
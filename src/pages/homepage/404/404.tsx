
import { Link } from 'react-router-dom';
import './404.css';

const NotFoundPage = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Oops! Page not found</h2>
                <p className="not-found-text">
                    The page you are looking for might have been removed,
                    had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="not-found-link">
                    Go back to the homepage
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
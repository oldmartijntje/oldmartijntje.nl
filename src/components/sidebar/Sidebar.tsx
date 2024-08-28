import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    return (
        <>


            <button id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>
            <div id="sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <h2>Navigator</h2>
                    <ul className="sidebar-menu">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/yeet">YEET</Link></li>
                        <li><a href="https://github.com/oldmartijntje" target="_blank" className="icon-link">Github <i className="bi bi-box-arrow-up-right" style={{ height: '26px' }}></i></a></li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
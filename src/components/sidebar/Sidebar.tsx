import { Link } from 'react-router-dom';
import './Sidebar.css';
import { NavDropdown } from 'react-bootstrap';


interface SidebarProps {
    userProfile?: any;
    isOpen: boolean;
    toggleSidebar: () => void;
}

// UserPage component
const Sidebar: React.FC<SidebarProps> = ({ userProfile, isOpen, toggleSidebar }) => {
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
                        {userProfile.clearanceLevel >= 4 && <li><NavDropdown title="admin" id="basic-nav-dropdown" className="text-light">
                            {userProfile.clearanceLevel >= 4 && <Link className="dropdown-item bg-light link-dark" to="/registerCode">Account Keys</Link>}
                            {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item bg-light link-dark" to="/api/projects">Projects</Link>}
                        </NavDropdown></li>}
                        <li><Link to="/user">account</Link></li>
                        <li><a href="https://github.com/oldmartijntje" target="_blank" className="icon-link">Github <i className="bi bi-box-arrow-up-right" style={{ height: '26px' }}></i></a></li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
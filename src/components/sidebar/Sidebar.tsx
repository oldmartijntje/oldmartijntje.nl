import { Link } from 'react-router-dom';
import './Sidebar.css';
import AdminPathsPopup from '../buttons/adminSelectPaths';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
    userProfile?: any;
    isOpen: boolean;
    toggleSidebar: () => void;
    isEventActive: boolean;
}

// UserPage component
const Sidebar: React.FC<SidebarProps> = ({ userProfile, isOpen, toggleSidebar, isEventActive }) => {
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const currentYear = new Date().getFullYear();

    const navToEvents = () => {
        window.location.href = "#/events";
    }

    // Check if it's a mobile device
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // You can adjust the breakpoint as needed
        };

        handleResize(); // Run on mount to set initial state
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <button id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>
            {isEventActive && location.pathname != "/events" && <div id="EventLabel" className="EventLabel" onClick={navToEvents}>

            </div>}
            <div id="sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <h2>Navigator</h2>
                    <ul className="sidebar-menu">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/discovery">Discovery</Link></li>
                        <li><Link to="/blogs">Blogs</Link></li>
                        <AdminPathsPopup userProfile={userProfile} title="Admin"></AdminPathsPopup>
                        <li><Link to="/user">Account</Link></li>
                        {/* <li><Link to="/events">Events</Link></li> */}
                        {!isMobile && (
                            // TODO: delete MARA
                            <li><span style={{ color: "#0ac800" }}> // to be deleted:</span><br></br><Link to="/console">M.A.R.A. OS</Link></li>
                        )}
                        <li>
                            <a href="https://github.com/oldmartijntje" target="_blank" className="icon-link">
                                Github <i className="bi bi-box-arrow-up-right" style={{ height: '26px' }}></i>
                            </a>
                        </li>

                    </ul>
                    <p style={{ flexGrow: 2 }} />
                    <footer>
                        <p className="text-primary">oldmartijntje © {currentYear}</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

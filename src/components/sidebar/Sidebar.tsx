import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    return (
        <>
            <button id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>
            <div id="sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <h2>Menu</h2>
                    <ul className="sidebar-menu">
                        <li><a href="#" target="_blank">Homepage</a></li>
                        <li><a href="https://github.com/oldmartijntje" target="_blank">Github</a></li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
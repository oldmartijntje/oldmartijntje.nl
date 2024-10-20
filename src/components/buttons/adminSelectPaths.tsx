import { Link } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';


interface SidebarProps {
    userProfile?: any;
    title: string;
}

// UserPage component
const AdminPathsPopup: React.FC<SidebarProps> = ({ userProfile, title }) => {
    return (
        <>
            {userProfile && userProfile.clearanceLevel >= 4 && <li><NavDropdown title={title} id="basic-nav-dropdown" className="text-light">
                {userProfile.clearanceLevel >= 4 && <Link className="dropdown-item bg-light link-dark" to="/registerCode">Account Keys</Link>}
                {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item bg-light link-dark" to="/api/DisplayItems">DisplayItems</Link>}
                {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item bg-light link-dark" to="/api/projectDataManager">ProjectData</Link>}
            </NavDropdown></li>}
        </>
    );
};

export default AdminPathsPopup;
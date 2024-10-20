import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import icon from '../../assets/images/mii.png';
import { allEvents } from '../../services/EventsSystem';
import { Link } from 'react-router-dom';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';

interface UserPageProps {
    userProfile?: any;
}

// UserPage component
const UserPage: React.FC<UserPageProps> = ({ userProfile }) => {

    useEffect(() => {
        // Simulating a check for user authentication

    }, []);

    const handleLogout = () => {
        localStorage.removeItem('UserLogin');
        allEvents.emit('logout');

    };

    return (
        <Container fluid className="p-0">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px' }}>
                <Navbar.Brand href="#" className="d-flex align-items-center">
                    <img src={icon} alt="Logo" width="40" height="40" className="mr-2" />
                    <span style={{ marginLeft: '4px' }} className="font-weight-bold">OldMartijntje.nl</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <AdminPathsPopup userProfile={userProfile} title="Admin"></AdminPathsPopup>
                        <Button variant="danger" className="ml-3" onClick={handleLogout}>Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <Row className="justify-content-center">
                <Col md={6}>
                    <Card bg="dark" text="white" className="shadow-lg">
                        <Card.Body className="text-center">
                            <Card.Title className="display-4">Welcome, {userProfile.username}!</Card.Title>
                            <Card.Text className="lead">
                                This is your user dashboard.
                            </Card.Text>
                            <hr className="my-4" />
                            <h5>User Information</h5>
                            <p><strong>Username:</strong> {userProfile.username}</p>
                            <p><strong>Clearance Level:</strong> {userProfile.clearanceLevel}</p>
                            {userProfile.role && <p><strong>Role:</strong> {userProfile.role}</p>}

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserPage;

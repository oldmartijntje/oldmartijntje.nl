import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';

// UserPage component
const UserPage: React.FC = () => {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        // Simulating a check for user authentication
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(loggedInUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Container fluid className="p-3">
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="#" style={{ marginLeft: '3rem' }}>Home</Navbar.Brand>
                <Nav className="ml-auto">
                    <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                </Nav>
            </Navbar>
            <Row className="mt-4">
                <Col md={8} className="mx-auto">
                    <Card bg="dark" text="white">
                        <Card.Body>
                            <Card.Title>Welcome, {user}!</Card.Title>
                            <Card.Text>
                                This is your user dashboard. You're currently logged in.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserPage;
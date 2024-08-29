import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';
import { Link } from 'react-router-dom';
import settings from '../../assets/json/settings.json';


// LoginPage component
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const serverConnector = new ServerConnector();

    const handleLogin = (e: React.FormEvent | null = null, credentialLoginMethod: boolean = true, customPassword: string | undefined = undefined, CustomUsername: string | undefined = undefined) => {
        let password2 = customPassword ? customPassword : password;
        let username2 = CustomUsername ? CustomUsername : username;
        if (e) {
            e.preventDefault();
        }

        // Simulating login logic
        if (password2 && username2) {
            serverConnector.loginRequest(username2, password2, credentialLoginMethod, (data: any) => {
                alert(data.message);
            },
                (error: any) => {
                    alert(error.message);
                })
        }
    };

    return (
        <Container fluid className="p-3">
            <Row className="mt-5">
                <Col md={6} className="mx-auto">
                    <Card bg="dark" text="white">
                        <Card.Body>
                            <Card.Title>Login</Card.Title>
                            <Form onSubmit={handleLogin}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword" style={{ marginBottom: "1rem" }}>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <Button variant="primary" type="submit">
                                        Login
                                    </Button>
                                    <Button variant="secondary" onClick={() => {
                                        handleLogin(undefined, false, settings.guestLogin.password, settings.guestLogin.username);
                                    }}>
                                        Guest Account
                                    </Button>
                                </div>
                                <Link to="/signup"><Button variant="dark" style={{ marginLeft: "1rem" }} >
                                    Sign up
                                </Button></Link>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container >
    );
};

export default LoginPage;
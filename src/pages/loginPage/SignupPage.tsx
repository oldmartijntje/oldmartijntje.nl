import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';
import { allEvents } from '../../services/EventsSystem';


const SignupPage: React.FC = () => {
    const [accountKey, setAccountKey] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isFillr, setIsFillr] = useState(false);
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        console.log('Query params:', Object.fromEntries(params));

        const fillrParam = params.get('fillr');
        if (fillrParam) {
            setIsFillr(true);
            setAccountKey(fillrParam);
        }
    }, [location]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted:', { accountKey, username, password });
        // Handle form submission logic here
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/register', 'POST', JSON.stringify({ activationCode: accountKey, username, password }),
            (response: any) => {
                console.log(response);
                if (response.status == 400) {
                    setErrorMessage(response.message);
                } else if (response.status == 200) {
                    // Redirect to login page
                    localStorage.removeItem('UserLogin');
                    allEvents.emit('logout');

                    window.location.hash = '/user';
                }

            }, (error: any) => {
                console.log(error);
                // Handle error here
            });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="w-100 text-bg-dark" style={{ maxWidth: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">{isFillr ? 'Welcome to M.A.R.A.' : 'Sign up'}</h2>
                    {isFillr && (
                        <p className="text-center mb-4">
                            You are invited to <span className="text-info" style={{ cursor: 'pointer' }} onClick={() => {
                                alert("M.A.R.A.\nMartijn's Authorized Repository Access");
                            }} title="Martijn's Authorized Repository Access">M.A.R.A.</span>
                            <br />Please fill out this form to create your account.
                        </p>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="accountKey">
                            <Form.Label>Account Key</Form.Label>
                            <Form.Control
                                type="text"
                                value={accountKey}
                                onChange={(e) => setAccountKey(e.target.value)}
                                readOnly={isFillr}
                                required
                                placeholder='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
                                className={isFillr ? 'text-bg-secondary' : ''}
                            />
                        </Form.Group>
                        {errorMessage && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder='Admin'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder='Root'
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SignupPage;
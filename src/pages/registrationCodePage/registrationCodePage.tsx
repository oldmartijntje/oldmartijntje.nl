import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';
import CopyToClipboardButton from '../../components/buttons/copyToClipboard';
import { Link } from 'react-router-dom';


interface RegistrationCode {
    clearanceLevel: number;
    role?: string;
    code: string;
    textNote?: string;
}

interface UserPageProps {
    userProfile?: any;
}


const RegistrationCodeManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [codes, setCodes] = useState<RegistrationCode[]>([]);
    const [newCode, setNewCode] = useState<Omit<RegistrationCode, 'code'>>({
        clearanceLevel: 0,
        role: '',
        textNote: ''
    });

    useEffect(() => {
        // Fetch codes from API here
        // For demonstration, we'll use dummy data

        const body = {
            "sessionToken": userProfile.sessionToken
        }

        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/register/find', 'POST', JSON.stringify(body), (response: any) => {
            console.log(response);

            if (response.status === 200) {
                setCodes(response.codes);
            }
        }, (error: any) => {
            console.log(error);
        });

    }, []);

    const handleDelete = (code: string) => {
        // Delete code from API here
        const serverConnector = new ServerConnector();

        serverConnector.fetchData('https://api.oldmartijntje.nl/register/delete', 'POST', JSON.stringify({ "sessionToken": userProfile.sessionToken, "activationCode": code }), (response: any) => {
            console.log(response);

            if (response.status === 200) {
                setCodes(response.codes);
            }
        }, (error: any) => {
            console.log(error);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit new code to API here
        const serverConnector = new ServerConnector();
        const body = {
            "sessionToken": userProfile.sessionToken,
            "clearanceLevel": newCode.clearanceLevel,
            "role": newCode.role,
            "textNote": newCode.textNote
        }
        serverConnector.fetchData('https://api.oldmartijntje.nl/register/generate', 'POST', JSON.stringify(body), (response: any) => {
            console.log(response);

            if (response.status === 200) {
                setCodes(response.codes);
                setNewCode({ clearanceLevel: 0, role: '', textNote: '' });
            }
        }, (error: any) => {
            console.log(error);
        });

    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center text-light">Account Key Manager</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                {userProfile.clearanceLevel >= 5 && <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Add New Code</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Clearance Level</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newCode.clearanceLevel}
                                        onChange={(e) => setNewCode({ ...newCode, clearanceLevel: parseInt(e.target.value) })}
                                        required
                                        max={userProfile.clearanceLevel - 1}
                                        min={0}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Role</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newCode.role}
                                        onChange={(e) => setNewCode({ ...newCode, role: e.target.value })}
                                        placeholder='Optional'
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">TextNote</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newCode.textNote}
                                        onChange={(e) => setNewCode({ ...newCode, textNote: e.target.value })}
                                        placeholder='Optional'
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Create Account Key
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>}
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Codes</Card.Title>
                            {codes.map((code) => (
                                <Card key={code.code} className="mb-2">
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Text>
                                            <strong>Account Key:</strong> {code.code}<br />
                                            <strong>Clearance Level:</strong> {code.clearanceLevel}<br />
                                            <strong>Role:</strong> {code.role || 'N/A'} <br />
                                            <strong>Note:</strong> {code.textNote || 'N/A'}
                                            <Link className="nav-link link-primary" to={"/signup?fillr=" + code.code}>Redeem Code</Link>
                                        </Card.Text>
                                        <div className="btn-group" role="group" aria-label="Basic example" style={{ marginBottom: '1rem' }}>
                                            <CopyToClipboardButton text={code.code} className="btn btn-secondary" displayText="Copy Account Key" />
                                            <CopyToClipboardButton text={"https://oldmartijntje.nl/#/signup?fillr=" + code.code} className="btn btn-secondary" displayText="Copy Link" />
                                        </div>
                                        {userProfile.clearanceLevel >= 5 && <Button variant="danger" size="sm" onClick={() => handleDelete(code.code)}>
                                            Delete
                                        </Button>}
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegistrationCodeManager;
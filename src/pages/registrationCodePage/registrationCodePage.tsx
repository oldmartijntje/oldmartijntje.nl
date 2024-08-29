import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';


interface RegistrationCode {
    clearanceLevel: number;
    role?: string;
    code: string;
}

interface UserPageProps {
    userProfile?: any;
}


const RegistrationCodeManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [codes, setCodes] = useState<RegistrationCode[]>([]);
    const [newCode, setNewCode] = useState<Omit<RegistrationCode, 'code'>>({
        clearanceLevel: 0,
        role: '',
    });

    useEffect(() => {
        // Fetch codes from API here
        // For demonstration, we'll use dummy data
        setCodes([
            { clearanceLevel: 1, role: 'User', code: 'ABC123' },
            { clearanceLevel: 2, role: 'Admin', code: 'XYZ789' },
        ]);
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
        setCodes(codes.filter(c => c.code !== code));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit new code to API here
        const generatedCode = Math.random().toString(36).substring(7);
        setCodes([...codes, { ...newCode, code: generatedCode }]);
        setNewCode({ clearanceLevel: 0, role: '' });
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center text-light">Registration Code Manager</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
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
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Add Code
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Codes</Card.Title>
                            {codes.map((code) => (
                                <Card key={code.code} className="mb-2">
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Text>
                                            <strong>Code:</strong> {code.code}<br />
                                            <strong>Clearance Level:</strong> {code.clearanceLevel}<br />
                                            <strong>Role:</strong> {code.role || 'N/A'}
                                        </Card.Text>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(code.code)}>
                                            Delete
                                        </Button>
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
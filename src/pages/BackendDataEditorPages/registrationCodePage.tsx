import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, NavDropdown, Navbar, Nav } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';
import CopyToClipboardButton from '../../components/buttons/copyToClipboard';
import { Link } from 'react-router-dom';
import { allEvents } from '../../services/EventsSystem';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';


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
    const [searchFilter, setSearchFilter] = useState(getSearchFilters('registrationCode') || '');
    const [newCode, setNewCode] = useState<Omit<RegistrationCode, 'code'>>({
        clearanceLevel: 0,
        role: '',
        textNote: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Fetch codes from API here
        // For demonstration, we'll use dummy data

        const body = {
            "sessionToken": userProfile.sessionToken
        }

        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/register/find', 'POST', JSON.stringify(body), (response: any) => {
            if (response.status === 200) {
                setCodes(response.codes);
            } else if (response.status == 401) {
                localStorage.removeItem('UserLogin');
                alert('Session expired. Please log in again.');
                allEvents.emit('logout');
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });

    }, []);

    const doesThisProjectMatchSearch = (project: RegistrationCode) => {
        if (!searchFilter) {
            return true;
        }
        let fitsSearch = true;
        const search = searchFilter.toLowerCase();
        const allQueryWords = search.split(' ');
        allQueryWords.forEach((queryWord: any) => {
            let keywordFits = true
            let inverse = false
            if (queryWord[0] == "!") {
                if (queryWord.length < 2) {
                    return
                }
                inverse = true
                queryWord = queryWord.substring(1)
            }

            if (!`${project.clearanceLevel}`.toLowerCase().includes(queryWord) && !project.textNote?.toLowerCase().includes(queryWord) && !project.role?.toLowerCase().includes(queryWord) && !project.code.toLowerCase().includes(queryWord)) {
                keywordFits = false;
            }
            if (inverse) {
                keywordFits = !keywordFits;
            }
            if (!keywordFits) {
                fitsSearch = false;
            }
        });
        return fitsSearch;

    }

    const handleDelete = (code: string) => {
        // Delete code from API here
        const serverConnector = new ServerConnector();

        serverConnector.fetchData('https://api.oldmartijntje.nl/register/delete', 'POST', JSON.stringify({ "sessionToken": userProfile.sessionToken, "activationCode": code }), (response: any) => {
            console.log(response);

            if (response.status === 200) {
                setCodes(response.codes);
            } else if (response.status == 401) {
                localStorage.removeItem('UserLogin');
                alert('Session expired. Please log in again.');
                allEvents.emit('logout');
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
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
            } else if (response.status == 401) {
                localStorage.removeItem('UserLogin');
                alert('Session expired. Please log in again.');
                allEvents.emit('logout');
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });

    };

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><NavDropdown title="Account Keys" id="basic-nav-dropdown" className="text-light">
                            {userProfile.clearanceLevel >= 4 && <Link className="dropdown-item text-dark bg-light" to="/registerCode">Account Keys</Link>}
                            {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item text-dark bg-light" to="/api/projects">Projects</Link>}
                        </NavDropdown></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>

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
                                {errorMessage && <><br /><Form.Text className="text-danger">{errorMessage}</Form.Text></>}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>}
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Codes</Card.Title>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-light">Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchFilters('registrationCode', value)
                                        setSearchFilter(e.target.value)
                                    }}
                                    placeholder='Search by clearance level, role, key or note'
                                />
                            </Form.Group>
                            {codes.map((code) => (doesThisProjectMatchSearch(code) &&
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
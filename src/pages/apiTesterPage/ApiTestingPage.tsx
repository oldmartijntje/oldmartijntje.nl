import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

// Define your endpoints here
const ENDPOINTS = {
    project: '/api/projects',
    blog: '/api/blogs',
};

// Base API URL
const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type EndpointKey = keyof typeof ENDPOINTS;

const ApiTestComponent: React.FC = () => {
    const [method, setMethod] = useState<Method>('GET');
    const [body, setBody] = useState<string>('');
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('project');
    const [id, setId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResponse(null);
        setError(null);

        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            let url = `${API_BASE_URL}${ENDPOINTS[selectedEndpoint]}`;

            if (method === 'DELETE' && id) {
                url += `/${id}`;
            }

            if (method !== 'GET' && method !== 'DELETE') {
                options.body = body;
            }

            const res = await fetch(url, options);
            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <div className="bg-dark text-light min-vh-100">
            <Container className="py-4">
                <h1 className="mb-4">API Tester</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Endpoint</Form.Label>
                        <Form.Select
                            value={selectedEndpoint}
                            onChange={(e) => setSelectedEndpoint(e.target.value as EndpointKey)}
                            className="bg-dark text-light"
                        >
                            {Object.entries(ENDPOINTS).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Method</Form.Label>
                        <Form.Select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as Method)}
                            className="bg-dark text-light"
                        >
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </Form.Select>
                    </Form.Group>
                    {method === 'DELETE' && (
                        <Form.Group className="mb-3">
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter ID"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="bg-dark text-light"
                            />
                        </Form.Group>
                    )}
                    {(method === 'POST' || method === 'PUT') && (
                        <Form.Group className="mb-3">
                            <Form.Label>Request Body (JSON)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="bg-dark text-light"
                            />
                        </Form.Group>
                    )}
                    <Button variant="primary" type="submit">
                        Send Request
                    </Button>
                </Form>
                {error && (
                    <Alert variant="danger" className="mt-3">
                        Error: {error}
                    </Alert>
                )}
                {response && (
                    <Card className="mt-3 bg-dark text-light">
                        <Card.Header>Response</Card.Header>
                        <Card.Body>
                            <pre>{JSON.stringify(response, null, 2)}</pre>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </div>
    );
};

export default ApiTestComponent;
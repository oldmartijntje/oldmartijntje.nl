import React, { useState } from 'react';
import { Card, Form, Button, Container, Navbar, Nav, Col } from 'react-bootstrap';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';

interface FileStructure {
    name: string;
    type: string;
    content: string;
    path: string;
}

interface UserPageProps {
    userProfile?: any;
}

const FileEditor: React.FC<UserPageProps> = ({ userProfile }) => {
    const [file, setFile] = useState<FileStructure>({
        name: "",
        type: "",
        content: "function myFunction(consoleApp, lines, commandName, param) {\n\n\n}",
        path: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFile(prevFile => ({
            ...prevFile,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        file.content = file.content.replace('\n', '\\n');
        file.content = file.content.replace('\n', '\\n');
        console.log(file);
        // Here you would typically send the updated file data to a server
    };

    return (
        <Container className="mt-5">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><AdminPathsPopup userProfile={userProfile} title="ConsoleApp"></AdminPathsPopup></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>
            <Card bg="dark" text="white">
                <Card.Body>
                    <Card.Title className="mb-4">File Editor</Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="fileName">
                            <Form.Label>File Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={file.name}
                                onChange={handleChange}
                                className="bg-secondary text-white"
                                placeholder="myFunction.exe"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="fileType">
                            <Form.Label>File Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="type"
                                value={file.type}
                                onChange={handleChange}
                                className="bg-secondary text-white"
                                placeholder='"file" or "folder"'
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="fileContent">
                            <Form.Label>File Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={10}
                                name="content"
                                value={file.content}
                                onChange={handleChange}
                                className="bg-secondary text-white"
                                placeholder="function myFunction(consoleApp, lines, commandName, param) { ... }"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="filePath">
                            <Form.Label>File Path</Form.Label>
                            <Form.Control
                                type="text"
                                name="path"
                                value={file.path}
                                onChange={handleChange}
                                className="bg-secondary text-white"
                                placeholder="C:/apps or C:/desktop"
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Export to console
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FileEditor;
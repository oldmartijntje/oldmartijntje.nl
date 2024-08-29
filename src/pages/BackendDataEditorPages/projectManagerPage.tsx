import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';

interface Project {
    _id?: string;
    title: string;
    images: string[];
    tumbnailImageId: number;
    link?: string;
    info: string;
    lastUpdated?: Date;
    hidden?: boolean;
    tags?: string[];
}

interface UserPageProps {
    userProfile?: any;
}

const ProjectManager: React.FC<UserPageProps> = ({ }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProject, setNewProject] = useState<Project>({
        title: '',
        images: [],
        tumbnailImageId: 0,
        info: '',
    });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/projects', 'POST', '', (response: any) => {
            if (response.status === 200) {
                setProjects(response.projects);
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('UserLogin');
        alert('Session expired. Please log in again.');
        // Assuming you have a logout event
        // allEvents.emit('logout');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = editingProject ? `https://api.example.com/projects/${editingProject._id}` : 'https://api.example.com/projects';
        const method = editingProject ? 'PUT' : 'POST';
        const projectData = editingProject ? { ...editingProject, ...newProject } : newProject;

        serverConnector.fetchData(endpoint, method, JSON.stringify(projectData), (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setNewProject({
                    title: '',
                    images: [],
                    tumbnailImageId: 0,
                    info: '',
                });
                setEditingProject(null);
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });
    };

    const handleDelete = (id: string) => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData(`https://api.example.com/projects/${id}`, 'DELETE', '', (response: any) => {
            if (response.status === 200) {
                fetchProjects();
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setNewProject(project);
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center text-light">Project Manager</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">{editingProject ? 'Edit Project' : 'Add New Project'}</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Images (comma-separated URLs)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.images.join(',')}
                                        onChange={(e) => setNewProject({ ...newProject, images: e.target.value.split(',') })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Thumbnail Image ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newProject.tumbnailImageId}
                                        onChange={(e) => setNewProject({ ...newProject, tumbnailImageId: parseInt(e.target.value) })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Link</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.link || ''}
                                        onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Info</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        value={newProject.info}
                                        onChange={(e) => setNewProject({ ...newProject, info: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Hidden"
                                        checked={newProject.hidden || false}
                                        onChange={(e) => setNewProject({ ...newProject, hidden: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Tags (comma-separated)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.tags?.join(',') || ''}
                                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value.split(',') })}
                                    />
                                </Form.Group>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <Button variant="primary" type="submit">
                                        {editingProject ? 'Update Project' : 'Create Project'}
                                    </Button>
                                    {editingProject && <Button variant="secondary" onClick={() => setEditingProject(null)}>
                                        Deselect Project
                                    </Button>}
                                </div>
                                {errorMessage && <><br /><Form.Text className="text-danger">{errorMessage}</Form.Text></>}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Projects</Card.Title>
                            {projects.map((project) => (
                                <Card key={project._id} className="mb-2">
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Title>{project.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Images:</strong> {project.images.length}<br />
                                            <strong>Thumbnail ID:</strong> {project.tumbnailImageId}<br />
                                            <strong>Link:</strong> {project.link || 'N/A'}<br />
                                            <strong>Info:</strong> {project.info.substring(0, 100)}...<br />
                                            <strong>Last Updated:</strong> {project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : 'N/A'}<br />
                                            <strong>Hidden:</strong> {project.hidden ? 'Yes' : 'No'}<br />
                                            <strong>Tags:</strong> {project.tags?.join(', ') || 'N/A'}
                                        </Card.Text>
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <Button variant="primary" size="sm" onClick={() => handleEdit(project)}>
                                                Edit
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => handleEdit(project)}>
                                                Duplicate
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(project._id!)}>
                                                Delete
                                            </Button>
                                        </div>
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

export default ProjectManager;
import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col } from 'react-bootstrap';
import '../../assets/styling/darkmode.css';
import ServerConnector from '../../services/ServerConnector';

interface Project {
    _id: string;
    title: string;
    images: string[];
    thumbnailImageId: number;
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
    const [newProject, setNewProject] = useState<Omit<Project, '_id'>>({
        title: '',
        images: [],
        thumbnailImageId: 0,
        info: '',
    });
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/projects', 'POST', '', (response: any) => {
            if (response.status === 200) {
                setProjects(response.projects);
            }
        }, (error: any) => {
            console.error('Error fetching projects:', error);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = editingProject ? `https://api.example.com/projects/${editingProject._id}` : 'https://api.example.com/projects';
        const method = editingProject ? 'PUT' : 'POST';
        const projectData = editingProject ? { ...editingProject } : { ...newProject };

        serverConnector.fetchData(endpoint, method, JSON.stringify(projectData), (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setNewProject({
                    title: '',
                    images: [],
                    thumbnailImageId: 0,
                    info: '',
                });
                setEditingProject(null);
            }
        }, (error: any) => {
            console.error('Error saving project:', error);
        });
    };

    const handleDelete = (id: string) => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData(`https://api.example.com/projects/${id}`, 'DELETE', '', (response: any) => {
            if (response.status === 200) {
                fetchProjects();
            }
        }, (error: any) => {
            console.error('Error deleting project:', error);
        });
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
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
                                        value={editingProject ? editingProject.title : newProject.title}
                                        onChange={(e) => editingProject
                                            ? setEditingProject({ ...editingProject, title: e.target.value })
                                            : setNewProject({ ...newProject, title: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Images (comma-separated URLs)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editingProject ? editingProject.images.join(',') : newProject.images.join(',')}
                                        onChange={(e) => {
                                            const images = e.target.value.split(',').map(url => url.trim());
                                            editingProject
                                                ? setEditingProject({ ...editingProject, images })
                                                : setNewProject({ ...newProject, images });
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Thumbnail Image ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={editingProject ? editingProject.thumbnailImageId : newProject.thumbnailImageId}
                                        onChange={(e) => editingProject
                                            ? setEditingProject({ ...editingProject, thumbnailImageId: parseInt(e.target.value) })
                                            : setNewProject({ ...newProject, thumbnailImageId: parseInt(e.target.value) })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Link</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editingProject ? editingProject.link : newProject.link}
                                        onChange={(e) => editingProject
                                            ? setEditingProject({ ...editingProject, link: e.target.value })
                                            : setNewProject({ ...newProject, link: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Info</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editingProject ? editingProject.info : newProject.info}
                                        onChange={(e) => editingProject
                                            ? setEditingProject({ ...editingProject, info: e.target.value })
                                            : setNewProject({ ...newProject, info: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Hidden"
                                        checked={editingProject ? editingProject.hidden : newProject.hidden}
                                        onChange={(e) => editingProject
                                            ? setEditingProject({ ...editingProject, hidden: e.target.checked })
                                            : setNewProject({ ...newProject, hidden: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Tags (comma-separated)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editingProject ? editingProject.tags?.join(',') : newProject.tags?.join(',')}
                                        onChange={(e) => {
                                            const tags = e.target.value.split(',').map(tag => tag.trim());
                                            editingProject
                                                ? setEditingProject({ ...editingProject, tags })
                                                : setNewProject({ ...newProject, tags });
                                        }}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </Button>
                                {editingProject && (
                                    <Button variant="secondary" className="ms-2" onClick={() => setEditingProject(null)}>
                                        Cancel Edit
                                    </Button>
                                )}
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
                                            <strong>Images:</strong> {project.images.length} images<br />
                                            <strong>Thumbnail ID:</strong> {project.thumbnailImageId}<br />
                                            <strong>Link:</strong> {project.link || 'N/A'}<br />
                                            <strong>Info:</strong> {project.info.substring(0, 100)}...<br />
                                            <strong>Last Updated:</strong> {project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : 'N/A'}<br />
                                            <strong>Hidden:</strong> {project.hidden ? 'Yes' : 'No'}<br />
                                            <strong>Tags:</strong> {project.tags?.join(', ') || 'N/A'}
                                        </Card.Text>
                                        <Button variant="primary" size="sm" onClick={() => handleEdit(project)} className="me-2">
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(project._id)}>
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

export default ProjectManager;
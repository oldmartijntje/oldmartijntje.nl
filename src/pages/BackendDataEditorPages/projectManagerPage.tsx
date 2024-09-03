import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { Link } from 'react-router-dom';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';

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

const ProjectManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProject, setNewProject] = useState<Project>({
        title: '',
        images: [],
        tumbnailImageId: 0,
        info: '',
        lastUpdated: new Date(),
        hidden: false,
        tags: [],
    });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchFilter, setSearchFilter] = useState(getSearchFilters('projects') || '');

    useEffect(() => {
        fetchProjects();
    }, []);

    const isEmptyForm = (project: Project) => {
        return project.title === '' &&
            (project.images.length === 0 || (project.images[0] == '' && project.images.length == 1)) &&
            project.tumbnailImageId === 0 &&
            (project.link === '' || !project.link) &&
            (!project.tags || project.tags.length === 0 || (project.tags[0] == '' && project.tags.length == 1)) &&
            project.info === '';
    }

    const fetchProjects = () => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/getProjects', 'POST', JSON.stringify({ hidden: true }), (response: any) => {
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

    const doesThisProjectMatchSearch = (project: Project) => {
        if (!searchFilter) {
            return true;
        }
        let fitsSearch = true;
        const search = searchFilter.toLowerCase();
        const allQueryWords = search.split(' ');
        allQueryWords.forEach((queryWord: any) => {
            if ('hidden'.includes(queryWord) || 'shown'.includes(queryWord)) {
                if (project.hidden && 'hidden'.includes(queryWord)) {
                    // do nothing
                } else if (!project.hidden && 'shown'.includes(queryWord)) {
                    // do nothing
                } else {
                    fitsSearch = false;
                }

            } else if (!project.title.toLowerCase().includes(queryWord) && !project.info.toLowerCase().includes(queryWord) && !project.tags?.some((tag) => tag.toLowerCase().includes(queryWord))) {
                fitsSearch = false;
            }
        });
        return fitsSearch;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = `https://api.oldmartijntje.nl/getData/projects`;
        const method = editingProject ? 'PUT' : 'POST';
        const projectData: any = editingProject ? { ...editingProject, ...newProject } : newProject;
        projectData.sessionToken = userProfile.sessionToken

        serverConnector.fetchData(endpoint, method, JSON.stringify(projectData), (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setNewProject({
                    title: '',
                    images: [],
                    tumbnailImageId: 0,
                    info: '',
                    hidden: false,
                });
                setErrorMessage('');
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
        console.log(userProfile)
        const url = ServerConnector.encodeQueryData({
            id: id,
            sessionToken: userProfile.sessionToken,
        }, `https://api.oldmartijntje.nl/getData/projects`);
        serverConnector.fetchData(url, 'DELETE', undefined, (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setErrorMessage('');
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            alert(error.message);
            console.log(error);
        });
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setNewProject(project);
    };

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><NavDropdown title="Projects" id="basic-nav-dropdown" className="text-light">
                            {userProfile.clearanceLevel >= 4 && <Link className="dropdown-item text-dark bg-light" to="/registerCode">Account Keys</Link>}
                            {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item text-dark bg-light" to="/api/projects">Projects</Link>}
                        </NavDropdown></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>
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
                                    {(editingProject || !isEmptyForm(newProject)) && <Button variant="secondary" onClick={() => {
                                        setEditingProject(null)
                                        setNewProject({
                                            title: '',
                                            images: [],
                                            tumbnailImageId: 0,
                                            info: '',
                                            lastUpdated: new Date(),
                                            hidden: false,
                                            tags: [],
                                        })

                                    }}>
                                        {editingProject ? "Deselect Project" : 'Clear'}
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
                            <Form.Group className="mb-3">
                                <Form.Label className="text-light">Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setSearchFilters('projects', value)
                                        setSearchFilter(e.target.value)
                                    }}
                                    placeholder='Search by title, info, visibility or tags'
                                />
                            </Form.Group>
                            {projects.map((project) => (doesThisProjectMatchSearch(project) &&
                                <Card key={project._id} className="mb-2">
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Title>{project.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Images:</strong> {project.images.length}<br />
                                            <strong>Thumbnail ID:</strong> {project.tumbnailImageId}<br />
                                            <strong>Link:</strong> {project.link || 'N/A'}<br />
                                            <strong>Info:</strong> {project.info.substring(0, 100)}...<br />
                                            <strong>Last Updated:</strong> {project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : 'N/A'}<br />
                                            <strong>Visibility:</strong> {project.hidden ? 'Hidden' : 'Shown'}<br />
                                            <strong>Tags:</strong> {project.tags?.join(', ') || 'N/A'}
                                        </Card.Text>
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <Button variant="primary" size="sm" onClick={() => handleEdit(project)}>
                                                Edit
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => {
                                                setEditingProject(null)
                                                setNewProject({
                                                    title: project.title,
                                                    images: project.images,
                                                    tumbnailImageId: project.tumbnailImageId,
                                                    info: project.info,
                                                    lastUpdated: project.lastUpdated,
                                                    hidden: project.hidden,
                                                    tags: project.tags,
                                                });
                                            }}>
                                                Duplicate
                                            </Button>
                                            {userProfile.clearanceLevel >= 6 && <Button variant="danger" size="sm" onClick={() => handleDelete(project._id!)}>
                                                Delete
                                            </Button>}
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
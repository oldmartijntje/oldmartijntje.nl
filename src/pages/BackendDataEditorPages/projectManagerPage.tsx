import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Nav, NavDropdown, Modal } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { Link } from 'react-router-dom';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';

interface InfoPage {
    title: string;
    content: string;
}

interface Project {
    _id?: string;
    title: string;
    tumbnailImage?: string;
    description?: string;
    link?: string;
    infoPages: InfoPage[];
    lastUpdated?: Date;
    hidden: boolean;
    spoiler: boolean;
    nsfw: boolean;
    tags: string[];
    displayItemType: string;
}

interface UserPageProps {
    userProfile?: any;
}

const ProjectManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProject, setNewProject] = useState<Project>({
        title: '',
        infoPages: [{ title: '', content: '' }],
        hidden: false,
        spoiler: false,
        nsfw: false,
        tags: [],
        displayItemType: 'Project',
    });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchFilter, setSearchFilter] = useState(getSearchFilters('projects') || '');
    const [showModal, setShowModal] = useState(false);
    const [previewProject, setPreviewProject] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const isEmptyForm = (project: Project) => {
        return project.title === '' &&
            project.infoPages.length === 0 &&
            project.tags.length === 0;
    }

    const fetchProjects = () => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/getDisplayItems', 'POST', JSON.stringify({ hidden: true }), (response: any) => {
            if (response.status === 200) {
                setProjects(response.displayItems);
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

            } else if (!project.title.toLowerCase().includes(queryWord) && !JSON.stringify(project.infoPages).toLowerCase().includes(queryWord) && !project.tags?.some((tag) => tag.toLowerCase().includes(queryWord))) {
                fitsSearch = false;
            }
        });
        return fitsSearch;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = `https://api.oldmartijntje.nl/getData/displayItems`;
        const method = editingProject ? 'PUT' : 'POST';
        const projectData: any = editingProject ? { ...editingProject, ...newProject } : newProject;
        projectData.sessionToken = userProfile.sessionToken

        serverConnector.fetchData(endpoint, method, JSON.stringify(projectData), (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setNewProject({
                    title: '',
                    hidden: false,
                    tags: [],
                    infoPages: [{ title: '', content: '' }],
                    displayItemType: 'Project',
                    spoiler: false,
                    nsfw: false,
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
        }, `https://api.oldmartijntje.nl/getData/displayItems`);
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

    const showProjectDetails = () => {
        setShowModal(true);
    };

    return (
        <div>
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
                                            value={JSON.stringify(newProject.infoPages)}
                                            onChange={(e) => setNewProject({ ...newProject, infoPages: JSON.parse(e.target.value) })}
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
                                        {!isEmptyForm(newProject) && <Button variant="info" onClick={() => {
                                            setPreviewProject(newProject)
                                            showProjectDetails()
                                        }}>
                                            Preview
                                        </Button>}
                                        {(editingProject || !isEmptyForm(newProject)) && <Button variant="secondary" onClick={() => {
                                            setEditingProject(null)
                                            setNewProject({
                                                title: '',
                                                lastUpdated: new Date(),
                                                hidden: false,
                                                displayItemType: 'Project',
                                                spoiler: false,
                                                nsfw: false,
                                                infoPages: [{ title: '', content: '' }],
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
                                                <strong>Link:</strong> {project.link || 'N/A'}<br />
                                                <strong>Info:</strong> {JSON.stringify(project.infoPages).substring(0, 100)}...<br />
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
                                                        lastUpdated: project.lastUpdated,
                                                        hidden: project.hidden,
                                                        tags: project.tags,
                                                        infoPages: project.infoPages,
                                                        displayItemType: project.displayItemType,
                                                        spoiler: project.spoiler,
                                                        nsfw: project.nsfw,
                                                        description: project.description,
                                                    });
                                                }}>
                                                    Duplicate
                                                </Button>
                                                <Button variant="info" onClick={() => {
                                                    setPreviewProject(project)
                                                    showProjectDetails()
                                                }}>
                                                    Preview
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
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" contentClassName="bg-dark text-white">
                <Modal.Header className="border-secondary">
                    <Modal.Title onClick={() => {
                        if (previewProject?.link) {
                            window.open(previewProject.link, '_blank');
                        }
                    }}
                        className={(previewProject?.link ? 'clickable' : '')}
                    >{previewProject?.title}</Modal.Title>
                    {/* make the button red */}
                    <Button variant="close" className="btn btn-primary" onClick={() => setShowModal(false)}
                        style={{ backgroundColor: '#2a75fe' }}></Button>
                </Modal.Header>
                <Modal.Body>
                    <div dangerouslySetInnerHTML={{ __html: previewProject?.infoPages || '' }} />
                    {previewProject?.link && (
                        <p className="btn btn-primary">
                            <a href={previewProject.link} target="_blank" className="text-light">
                                View Project
                            </a>
                        </p>
                    )}
                    {previewProject?.lastUpdated && (
                        <p className="text-muted">
                            <small className="text-secondary">Last article update: {new Date(previewProject.lastUpdated).toLocaleDateString()}</small>
                        </p>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ProjectManager;
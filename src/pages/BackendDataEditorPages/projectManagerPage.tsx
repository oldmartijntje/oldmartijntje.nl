import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Modal } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';

interface InfoPage {
    title: string;
    content: string;
}

interface Project {
    _id?: string;
    title: string;
    thumbnailImage?: string;
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
        thumbnailImage: '',
        description: '',
        link: '',
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
            let keywordFits = true
            let inverse = false
            if (queryWord[0] == "!") {
                if (queryWord.length < 2) {
                    return
                }
                inverse = true
                queryWord = queryWord.substring(1)
            }

            if ('hidden'.includes(queryWord) || 'shown'.includes(queryWord)) {
                if (project.hidden && 'hidden'.includes(queryWord)) {
                    keywordFits = true;
                } else if (!project.hidden && 'shown'.includes(queryWord)) {
                    keywordFits = true;
                } else {
                    fitsSearch = false;
                }

            } else if (project.spoiler && 'spoiler'.includes(queryWord)) {
                keywordFits = true;
            } else if (project.nsfw && 'nsfw'.includes(queryWord)) {
                keywordFits = true;
            } else if (!project.title.toLowerCase().includes(queryWord) && !JSON.stringify(project.infoPages).toLowerCase().includes(queryWord) && !project.tags?.some((tag) => tag.toLowerCase().includes(queryWord))) {
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

    const handleInfoPageChange = (index: number, field: keyof InfoPage, value: string) => {
        const updatedInfoPages = [...newProject.infoPages];
        updatedInfoPages[index] = { ...updatedInfoPages[index], [field]: value };
        setNewProject({ ...newProject, infoPages: updatedInfoPages });
    };

    const addInfoPage = () => {
        setNewProject({
            ...newProject,
            infoPages: [...newProject.infoPages, { title: '', content: '' }],
        });
    };

    const removeInfoPage = (index: number) => {
        const updatedInfoPages = newProject.infoPages.filter((_, i) => i !== index);
        setNewProject({ ...newProject, infoPages: updatedInfoPages });
    };

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
                {/* ... (Navbar content remains the same) */}
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
                                    <Form.Label className="text-light">Thumbnail Image URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.thumbnailImage || ''}
                                        onChange={(e) => setNewProject({ ...newProject, thumbnailImage: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newProject.description || ''}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                                    <Form.Label className="text-light">Info Pages</Form.Label>
                                    {newProject.infoPages.map((infoPage, index) => (
                                        <Card key={index} className="mb-2 bg-secondary">
                                            <Card.Body>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="text-light">Title</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={infoPage.title}
                                                        onChange={(e) => handleInfoPageChange(index, 'title', e.target.value)}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="text-light">Content</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={infoPage.content}
                                                        onChange={(e) => handleInfoPageChange(index, 'content', e.target.value)}
                                                    />
                                                </Form.Group>
                                                <Button variant="danger" size="sm" onClick={() => removeInfoPage(index)}>
                                                    Remove Info Page
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    <Button variant="secondary" size="sm" onClick={addInfoPage}>
                                        Add Info Page
                                    </Button>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Hidden"
                                        checked={newProject.hidden}
                                        onChange={(e) => setNewProject({ ...newProject, hidden: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Spoiler"
                                        checked={newProject.spoiler}
                                        onChange={(e) => setNewProject({ ...newProject, spoiler: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="NSFW"
                                        checked={newProject.nsfw}
                                        onChange={(e) => setNewProject({ ...newProject, nsfw: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Tags (comma-separated)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProject.tags.join(',')}
                                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value.split(',') })}
                                    />
                                </Form.Group>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <Button variant="primary" type="submit">
                                        {editingProject ? 'Update Project' : 'Create Project'}
                                    </Button>
                                    <Button variant="info" onClick={() => {
                                        setPreviewProject(newProject);
                                        showProjectDetails();
                                    }}>
                                        Preview
                                    </Button>
                                    <Button variant="secondary" onClick={() => {
                                        setEditingProject(null);
                                        setNewProject({
                                            title: '',
                                            thumbnailImage: '',
                                            description: '',
                                            link: '',
                                            infoPages: [{ title: '', content: '' }],
                                            hidden: false,
                                            spoiler: false,
                                            nsfw: false,
                                            tags: [],
                                            displayItemType: 'Project',
                                        });
                                    }}>
                                        {editingProject ? "Deselect Project" : 'Clear'}
                                    </Button>
                                </div>
                                {errorMessage && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
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
                                        const value = e.target.value;
                                        setSearchFilters('projects', value);
                                        setSearchFilter(value);
                                    }}
                                    placeholder='Search by title, info, visibility or tags'
                                />
                            </Form.Group>
                            {projects.map((project) => (doesThisProjectMatchSearch(project) &&
                                <Card key={project._id} className="mb-2">
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Title>{project.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Description:</strong> {project.description || 'N/A'}<br />
                                            <strong>Link:</strong> {project.link || 'N/A'}<br />
                                            <strong>Info Pages:</strong> {project.infoPages.length}<br />
                                            <strong>Last Updated:</strong> {project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : 'N/A'}<br />
                                            <strong>Visibility:</strong> {project.hidden ? 'Hidden' : 'Shown'}<br />
                                            <strong>Spoiler:</strong> {project.spoiler ? 'Yes' : 'No'}<br />
                                            <strong>NSFW:</strong> {project.nsfw ? 'Yes' : 'No'}<br />
                                            <strong>Tags:</strong> {project.tags.join(', ') || 'N/A'}
                                        </Card.Text>
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <Button variant="primary" size="sm" onClick={() => handleEdit(project)}>
                                                Edit
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => {
                                                setEditingProject(null);
                                                setNewProject({ ...project, _id: undefined });
                                            }}>
                                                Duplicate
                                            </Button>
                                            <Button variant="info" size="sm" onClick={() => {
                                                setPreviewProject(project);
                                                showProjectDetails();
                                            }}>
                                                Preview
                                            </Button>
                                            {userProfile.clearanceLevel >= 6 && (
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(project._id!)}>
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" contentClassName="bg-dark text-white">
                <Modal.Header className="border-secondary">
                    <Modal.Title
                        onClick={() => {
                            if (previewProject?.link) {
                                window.open(previewProject.link, '_blank');
                            }
                        }}
                        className={(previewProject?.link ? 'clickable' : '')}
                    >
                        {previewProject?.title}
                    </Modal.Title>
                    <Button variant="close" className="btn btn-primary" onClick={() => setShowModal(false)}
                        style={{ backgroundColor: '#2a75fe' }}></Button>
                </Modal.Header>
                <Modal.Body>
                    {previewProject?.thumbnailImage && (
                        <img src={previewProject.thumbnailImage} alt={previewProject.title} className="img-fluid mb-3" />
                    )}
                    <p><strong>Description:</strong> {previewProject?.description}</p>
                    <h4>Info Pages:</h4>
                    {previewProject?.infoPages.map((infoPage, index) => (
                        <div key={index} className="mb-3">
                            <h5>{infoPage.title}</h5>
                            <div dangerouslySetInnerHTML={{ __html: infoPage.content }} />
                        </div>
                    ))}
                    {previewProject?.link && (
                        <p className="btn btn-primary">
                            <a href={previewProject.link} target="_blank" rel="noopener noreferrer" className="text-light">
                                View Project
                            </a>
                        </p>
                    )}
                    {previewProject?.lastUpdated && (
                        <p className="text-muted">
                            <small className="text-secondary">Last update: {new Date(previewProject.lastUpdated).toLocaleDateString()}</small>
                        </p>
                    )}
                    <p>
                        <strong>Visibility:</strong> {previewProject?.hidden ? 'Hidden' : 'Shown'}<br />
                        <strong>Spoiler:</strong> {previewProject?.spoiler ? 'Yes' : 'No'}<br />
                        <strong>NSFW:</strong> {previewProject?.nsfw ? 'Yes' : 'No'}<br />
                        <strong>Tags:</strong> {previewProject?.tags.join(', ') || 'N/A'}
                    </p>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ProjectManager;
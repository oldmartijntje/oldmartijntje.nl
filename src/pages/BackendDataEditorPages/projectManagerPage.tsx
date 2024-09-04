import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';
import '../../App.css'
import { Link } from 'react-router-dom';
import { displayItemTypes, InfoPage, ItemDisplay } from '../../models/itemDisplayModel';
import ItemDisplayViewer from '../../components/overlay/ItemDisplayViewer';




interface UserPageProps {
    userProfile?: any;
}

const ProjectManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [projects, setProjects] = useState<ItemDisplay[]>([]);
    const [newProject, setNewProject] = useState<ItemDisplay>({
        title: '',
        thumbnailImage: '',
        description: '',
        link: '',
        infoPages: [{ title: '', content: '' }],
        hidden: false,
        spoiler: false,
        nsfw: false,
        tags: [],
        displayItemType: '',
    });
    const [editingProject, setEditingProject] = useState<ItemDisplay | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchFilter, setSearchFilter] = useState(getSearchFilters('projects') || '');
    const [showModal, setShowModal] = useState(false);
    const [previewProject, setPreviewProject] = useState<ItemDisplay | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleInfoPageChange = (index: number, field: keyof InfoPage, value: string) => {
        const updatedProject = { ...newProject! };

        updatedProject.infoPages[index] = { ...updatedProject.infoPages[index], [field]: value };
        setPreviewProject(updatedProject);
    };

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

    const doesThisProjectMatchSearch = (project: ItemDisplay) => {
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
            } else if (!project.title.toLowerCase().includes(queryWord) &&
                !JSON.stringify(project.infoPages).toLowerCase().includes(queryWord) &&
                !project.tags?.some((tag) => tag.toLowerCase().includes(queryWord)) &&
                !project.displayItemType.toLowerCase().includes(queryWord) &&
                !project.description?.toLowerCase().includes(queryWord) &&
                !project.link?.toLowerCase().includes(queryWord)
            ) {
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

    const previewableCheck = () => {
        let previewable = false
        if (newProject) {
            if (newProject.infoPages.length !== 1) {
                previewable = true
            } else if (newProject.infoPages[0].title !== "") {
                previewable = true
            } else if (newProject.infoPages[0].content !== "") {
                previewable = true
            }
        }
        return previewable
    }

    const emptyEditingCheck = () => {
        let empty = true
        if (newProject) {
            if (newProject.title !== "") {
                empty = false
            } else if (newProject.thumbnailImage !== "") {
                empty = false
            } else if (newProject.description !== "") {
                empty = false
            } else if (newProject.link !== "") {
                empty = false
            } else if (newProject.infoPages.length !== 1) {
                empty = false
            } else if (newProject.infoPages[0].title !== "") {
                empty = false
            } else if (newProject.infoPages[0].content !== "") {
                empty = false
            } else if (newProject.tags.length !== 0) {
                empty = false
            }
        }
        return empty
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
                    displayItemType: '',
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

    const handleEdit = (project: ItemDisplay) => {
        setEditingProject(project);
        setNewProject(project);

    };

    const showProjectDetails = () => {
        setShowModal(true);
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
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><NavDropdown title="DisplayItem" id="basic-nav-dropdown" className="text-light">
                            {userProfile.clearanceLevel >= 4 && <Link className="dropdown-item text-dark bg-light" to="/registerCode">Account Keys</Link>}
                            {userProfile.clearanceLevel >= 5 && <Link className="dropdown-item text-dark bg-light" to="/api/DisplayItems">DisplayItems</Link>}
                        </NavDropdown></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">{editingProject ? 'Edit DisplayItem' : 'Add New DisplayItem'}</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Title</Form.Label>
                                    <Form.Control
                                        placeholder='Epic Title'
                                        type="text"
                                        value={newProject.title}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, title: e.target.value })
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Thumbnail Image URL</Form.Label>
                                    <Form.Control
                                        placeholder='https://i.imgur.com'
                                        type="text"
                                        value={newProject.thumbnailImage || ''}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, thumbnailImage: e.target.value })
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Description</Form.Label>
                                    <Form.Control
                                        placeholder='Only used if there is no tumbnail image.'
                                        as="textarea"
                                        rows={3}
                                        value={newProject.description || ''}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, description: e.target.value })
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Link</Form.Label>
                                    <Form.Control
                                        placeholder='https://example.com'
                                        type="text"
                                        value={newProject.link || ''}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, link: e.target.value })
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">DisplayItemType</Form.Label>
                                    <Form.Control
                                        placeholder={displayItemTypes.join(', ')}
                                        type="text"
                                        value={newProject.displayItemType || ''}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, displayItemType: e.target.value })
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Info Pages</Form.Label><br />
                                    <div className="accordion accordion text-bg-dark" id="accordionFlushExample">
                                        {newProject.infoPages.map((infoPage, index) => (
                                            <div className="accordion-item bg-dark" key={index}>
                                                <h2 className="accordion-header text-bg-dark">
                                                    <button
                                                        className={"accordion-button bg-secondary text-light"}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={"#accordion-flush" + index}
                                                        aria-expanded="false"
                                                        aria-controls={"accordion-flush" + index}
                                                    >
                                                        {`Info Page ${index + 1}`}
                                                    </button>
                                                </h2>
                                                <div
                                                    id={"accordion-flush" + index}
                                                    className={"accordion-collapse " + (index === 0 ? 'collapse show' : 'collapse')}
                                                    data-bs-parent="#accordionFlushExample"
                                                >
                                                    <Card className="mb-2 bg-dark">
                                                        <Card.Body>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="text-light">Title</Form.Label>
                                                                <Form.Control
                                                                    placeholder='Tab Title Goes Here'
                                                                    type="text"
                                                                    value={infoPage.title}
                                                                    onChange={(e) => handleInfoPageChange(index, 'title', e.target.value)}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="text-light">Content</Form.Label>
                                                                <Form.Control
                                                                    placeholder='<h1>Example HTML Go BRRRRRR</h1>'
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={addInfoPage}>
                                        Add Info Page
                                    </Button>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Hidden"
                                        checked={newProject.hidden}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, hidden: e.target.checked })
                                        }}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Spoiler"
                                        checked={newProject.spoiler}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, spoiler: e.target.checked })
                                        }}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="NSFW"
                                        checked={newProject.nsfw}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, nsfw: e.target.checked })
                                        }}
                                        className="text-light"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Tags (comma-separated)</Form.Label>
                                    <Form.Control
                                        placeholder='Example1,Example2,Example3'
                                        type="text"
                                        value={newProject.tags.join(',')}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, tags: e.target.value.split(',') })
                                        }}
                                    />
                                </Form.Group>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <Button variant="primary" type="submit">
                                        {editingProject ? 'Update Item' : 'Create Item'}
                                    </Button>
                                    {previewableCheck() && <Button variant="info" onClick={() => {
                                        setPreviewProject(newProject);
                                        showProjectDetails();
                                    }}>
                                        Preview
                                    </Button>}
                                    {(!emptyEditingCheck() || editingProject) && <Button variant="secondary" onClick={() => {
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
                                            displayItemType: '',
                                        });

                                    }}>
                                        {editingProject ? "Deselect Item" : 'Clear'}
                                    </Button>}
                                </div>
                                {errorMessage && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Items</Card.Title>
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
                                            <strong>DisplayItemType:</strong> {project.displayItemType}<br />
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
                                                <Button variant="danger" size="sm" onClick={() => {
                                                    if (confirm("Are you sure you want to proceed?")) {
                                                        // Code to execute if the user clicks "OK"
                                                        handleDelete(project._id!)
                                                    }
                                                }}>
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
            <ItemDisplayViewer previewProject={previewProject} showModal={showModal} setShowModal={function (bool: boolean): void {
                setShowModal(bool);
            }} />
        </Container>
    );
};

export default ProjectManager;
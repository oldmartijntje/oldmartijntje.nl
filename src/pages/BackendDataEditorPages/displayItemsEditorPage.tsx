import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';
import '../../App.css'
import { displayItemTypes, InfoPage, ItemDisplay } from '../../models/itemDisplayModel';
import ItemDisplayViewer from '../../components/overlay/ItemDisplayViewer';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';

interface UserPageProps {
    userProfile?: any;
}

const DisplayItemsManager: React.FC<UserPageProps> = ({ userProfile }) => {
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
    const [useCustomDatetime, setUseCustomDatetime] = useState(false);
    const [datetimeInput, setDatetimeInput] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    // Move info page up or down
    const moveInfoPage = (index: number, direction: -1 | 1) => {
        const pages = [...newProject.infoPages];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= pages.length) return;
        [pages[index], pages[newIndex]] = [pages[newIndex], pages[index]];
        setNewProject({ ...newProject, infoPages: pages });
        setPreviewProject({ ...newProject, infoPages: pages });
    };

    const handleInfoPageChange = (index: number, field: keyof InfoPage, value: string) => {
        const updated = { ...newProject };
        updated.infoPages[index] = { ...updated.infoPages[index], [field]: value };
        setNewProject(updated);
        setPreviewProject(updated);
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

    // Update datetime input when date changes
    const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dtString = e.target.value;
        setDatetimeInput(dtString);
        const newDate = new Date(dtString);
        setNewProject({ ...newProject, lastUpdated: newDate });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = `https://api.oldmartijntje.nl/getData/displayItems`;
        const method = editingProject ? 'PUT' : 'POST';
        let projectData: any = editingProject ? { ...editingProject, ...newProject } : newProject;

        // Clear lastUpdated if custom datetime is disabled
        if (!useCustomDatetime) {
            projectData.lastUpdated = null;
        }

        projectData.sessionToken = userProfile.sessionToken;

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
        const updated = newProject.infoPages.filter((_, i) => i !== index);
        setNewProject({ ...newProject, infoPages: updated });
    };

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><AdminPathsPopup userProfile={userProfile} title="DisplayItems"></AdminPathsPopup></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">
                                {editingProject ? 'Edit DisplayItem' : 'Add New DisplayItem'}
                            </Card.Title>
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
                                    <div className="accordion accordion-flush text-bg-dark" id="accordionFlushExample">
                                        {newProject.infoPages.map((infoPage, index) => (
                                            <div className="accordion-item bg-dark" key={index}>
                                                <h2 className="accordion-header">
                                                    <button
                                                        className="accordion-button bg-secondary text-light"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#accordion-flush${index}`}
                                                        aria-expanded="false"
                                                        aria-controls={`accordion-flush${index}`}
                                                    >
                                                        {`Info Page ${index + 1}`}
                                                    </button>
                                                </h2>
                                                <div
                                                    id={`accordion-flush${index}`}
                                                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                    data-bs-parent="#accordionFlushExample"
                                                >
                                                    <Card className="mb-2 bg-dark">
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
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => moveInfoPage(index, -1)}
                                                                    disabled={index === 0}
                                                                >
                                                                    Move Up
                                                                </Button>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => moveInfoPage(index, 1)}
                                                                    disabled={index === newProject.infoPages.length - 1}
                                                                >
                                                                    Move Down
                                                                </Button>
                                                                <Button variant="danger" size="sm" onClick={() => removeInfoPage(index)}>
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={addInfoPage} className="mt-2">
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
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Last Updated</Form.Label>
                                    <Form.Control
                                        type="text"
                                        readOnly
                                        value={newProject.lastUpdated ?
                                            new Date(newProject.lastUpdated).toLocaleString() :
                                            'Last Update'}
                                        className="text-dark text-bg-secondary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Use Custom Datetime"
                                        checked={useCustomDatetime}
                                        onChange={(e) => {
                                            setUseCustomDatetime(e.target.checked);
                                            if (!e.target.checked) {
                                                setNewProject({ ...newProject, lastUpdated: undefined });
                                            }
                                        }}
                                        className="text-light"
                                    />
                                </Form.Group>

                                {useCustomDatetime && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Select Date & Time</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            value={datetimeInput}
                                            onChange={handleDatetimeChange}
                                        />
                                    </Form.Group>
                                )}
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
                                            <strong>Tags:</strong> {project.tags.join(', ') || 'N/A'}<br />
                                            <strong>Id:</strong> {project._id}
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
            <ItemDisplayViewer previewProject={previewProject} showModal={showModal} setShowModal={(bool) => setShowModal(bool)} />
        </Container>
    );
};

export default DisplayItemsManager;

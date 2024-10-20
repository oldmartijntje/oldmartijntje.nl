import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';
import '../../App.css'
import { ProjectData } from '../../models/itemDisplayModel';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';




interface UserPageProps {
    userProfile?: any;
}

const ProjectDataManager: React.FC<UserPageProps> = ({ userProfile }) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [newProject, setNewProject] = useState<ProjectData>({
        projectId: '',
        attributes: `"${JSON.stringify({})}"`,
        clearanceLevelNeeded: 0,
    });
    const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchFilter, setSearchFilter] = useState(getSearchFilters('projectData') || '');
    const [allProjectIds, setTopics] = useState<string[]>([]);
    const [activeTopic, setActiveTopic] = useState<string>('');

    useEffect(() => {
        fetchProjectDataTopics();
        fetchProjects();
    }, []);

    const fetchProjectDataTopics = () => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/projectData/getAllProjectIds', 'POST', JSON.stringify({ sessionToken: userProfile.sessionToken }), (response: any) => {
            if (response.status === 200) {
                setTopics(response.projectIds);
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                setErrorMessage(response.message);
            }
        }, (error: any) => {
            setErrorMessage(error.message);
            console.log(error);
        });
    }

    const fetchProjects = (customId: string | undefined = undefined) => {
        const serverConnector = new ServerConnector();
        serverConnector.fetchData('https://api.oldmartijntje.nl/projectData/getProjectData', 'POST', JSON.stringify({ sessionToken: userProfile.sessionToken, projectId: customId ? customId : activeTopic }), (response: any) => {
            if (response.status === 200) {
                console.log(response)
                for (let i = 0; i < response.projectData.length; i++) {
                    response.projectData[i].attributes = `"${JSON.stringify(response.projectData[i].attributes)}"`
                }
                setProjects(response.projectData);
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

    const doesThisProjectMatchSearch = (project: ProjectData) => {
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

            if (!project.projectId.toLowerCase().includes(queryWord) &&
                !project.attributes.toLowerCase().includes(queryWord) &&
                !`${project.clearanceLevelNeeded}`.includes(queryWord)
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

    const emptyEditingCheck = () => {
        let empty = true
        if (newProject) {
            if (newProject.projectId !== "") {
                empty = false
            } else if (newProject.attributes !== '"{}"') {
                empty = false
            }
        }
        return empty
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const serverConnector = new ServerConnector();
        const endpoint = `https://api.oldmartijntje.nl/projectData`;
        const method = editingProject ? 'PUT' : 'POST';
        const projectData: any = editingProject ? { ...editingProject, ...newProject } : newProject;
        if (projectData.attributes.startsWith('"') && projectData.attributes.endsWith('"')) {
            projectData.attributes = projectData.attributes.substring(1, projectData.attributes.length - 1);
        }
        projectData.attributes = JSON.parse(projectData.attributes);
        projectData.sessionToken = userProfile.sessionToken;

        serverConnector.fetchData(endpoint, method, JSON.stringify(projectData), (response: any) => {
            if (response.status === 200) {
                setActiveTopic(projectData.projectId);
                fetchProjects(projectData.projectId);
                fetchProjectDataTopics();
                setNewProject({
                    projectId: '',
                    attributes: `"${JSON.stringify({})}"`,
                    clearanceLevelNeeded: 0,
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
        }, `https://api.oldmartijntje.nl/projectData`);
        serverConnector.fetchData(url, 'DELETE', undefined, (response: any) => {
            if (response.status === 200) {
                fetchProjects();
                setErrorMessage('');
                fetchProjectDataTopics();
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

    const handleEdit = (project: ProjectData) => {
        setEditingProject(project);
        setNewProject(project);

    };

    const isValidData = (data: string) => {
        if (data.startsWith('"') && data.endsWith('"')) {
            data = data.substring(1, data.length - 1);
        }

        try {
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><AdminPathsPopup userProfile={userProfile} title="ProjectData"></AdminPathsPopup></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">{editingProject ? 'Edit ProjectData object' : 'Add New ProjectData object'}</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Project ID</Form.Label>
                                    <Form.Control
                                        placeholder='Project ID'
                                        type="text"
                                        value={newProject.projectId}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, projectId: e.target.value })
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Attributes (Stringified JSON)</Form.Label>
                                    <Form.Control
                                        placeholder='{"key":"value"}'
                                        type="text"
                                        value={newProject.attributes}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, attributes: e.target.value })
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Clearance Level Needed</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newProject.clearanceLevelNeeded}
                                        onChange={(e) => {
                                            setNewProject({ ...newProject, clearanceLevelNeeded: parseInt(e.target.value) })
                                        }}
                                        required
                                    />
                                </Form.Group>

                                <div className="btn-group" role="group" aria-label="Basic example">
                                    {isValidData(newProject.attributes) &&
                                        <Button variant="primary" type="submit">
                                            {editingProject ? 'Update Item' : 'Create Item'}
                                        </Button>
                                    }
                                    {!isValidData(newProject.attributes) &&
                                        <Button variant="danger" onClick={() => {
                                            alert("Invalid Attributes JSON string");
                                        }}>
                                            {editingProject ? 'Update Item' : 'Create Item'}
                                        </Button>
                                    }
                                    {(!emptyEditingCheck() || editingProject) && <Button variant="secondary" onClick={() => {
                                        setEditingProject(null);
                                        setNewProject({
                                            projectId: '',
                                            attributes: `"${JSON.stringify({})}"`,
                                            clearanceLevelNeeded: 0,
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
                            <Card.Title className="text-light">Existing Objects</Card.Title>
                            {/* Topics Selector, topic is string */}
                            <Form.Group className="mb-3">
                                <Form.Label className="text-light">Topics</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={activeTopic}
                                    onChange={(e) => {
                                        setActiveTopic(e.target.value);
                                        fetchProjects(e.target.value);
                                    }}
                                >
                                    <option value="">None</option>
                                    {allProjectIds?.map((topic) => (
                                        <option key={topic} value={topic}>
                                            {topic}
                                        </option>
                                    ))}

                                </Form.Control>
                            </Form.Group>

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
                                        <Card.Title>{project.projectId}</Card.Title>
                                        <Card.Text>
                                            <strong>Attributes:</strong> {project.attributes}<br />
                                            <strong>Clearance Level Needed:</strong> {project.clearanceLevelNeeded}
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
        </Container>
    );
};

export default ProjectDataManager;
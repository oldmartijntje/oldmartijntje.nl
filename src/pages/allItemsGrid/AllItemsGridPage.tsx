import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { ItemDisplay } from '../../models/itemDisplayModel';
import ItemDisplayViewer from '../../components/overlay/ItemDisplayViewer';
import ServerConnector from '../../services/ServerConnector';
import offlineProjects from '../../assets/json/projects.json';
import { getDiscoveryRows, setSeededRandom, DiscoveryDisplay } from '../../helpers/discoveryRowsConfig';
import './AllItemsGridPage.css';

function getOfflineProjects(): ItemDisplay[] {
    let cachedProjects = sessionStorage.getItem('cached-projects');
    if (cachedProjects) {
        return JSON.parse(cachedProjects);
    } else {
        return offlineProjects.displayItems as unknown as ItemDisplay[];
    }
}

const AllItemsGridPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ItemDisplay | null>(null);
    const [mainProjects, setProjects] = useState<ItemDisplay[]>([]);
    const [mainBlog, setBlog] = useState<ItemDisplay[]>([]);
    const [justPosts, setPosts] = useState<ItemDisplay[]>([]);
    const [mainWebposts, setWebposts] = useState<ItemDisplay[]>([]);
    const [mainRandomPosts, setRandomPosts] = useState<ItemDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const serverConnector = new ServerConnector();

    const { rowIndex } = location.state || { rowIndex: 0 };

    useEffect(() => {
        fetchProjects();
    }, []);

    const formatProjects = (projects: any) => {
        const sortedProjects = projects.sort((a: ItemDisplay, b: ItemDisplay) => {
            const dateA = new Date(a.lastUpdated || 0).getTime();
            const dateB = new Date(b.lastUpdated || 0).getTime();
            return dateB - dateA;
        });
        setProjects(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'project'));
        setPosts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'post'));
        setBlog(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'blog'));
        setWebposts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'url'));
        setRandomPosts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'random'));
        setLoading(false);
    };

    const fetchProjects = async () => {
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/getDisplayItems', 'POST', undefined, (data: any) => {
            sessionStorage.setItem('cached-projects', JSON.stringify(data.displayItems));
            formatProjects(data.displayItems);
        }, () => {
            formatProjects(getOfflineProjects());
        });
    };

    const filterProjects = (
        projects: ItemDisplay[],
        filters: string[]
    ): ItemDisplay[] => {
        return projects.filter((project) => {
            return filters.every((filter) => {
                if (filter.startsWith("!")) {
                    const excludeTag = filter.slice(1);
                    return !project.tags?.includes(excludeTag);
                }
                return project.tags?.includes(filter);
            });
        });
    };

    setSeededRandom(Math.random() * 10000);

    const discoveryRows: DiscoveryDisplay[] = getDiscoveryRows(mainProjects, mainBlog, justPosts, mainWebposts, mainRandomPosts);

    const currentRow = discoveryRows[rowIndex];
    const filteredData = currentRow ? filterProjects(currentRow.dataList, currentRow.appliedFilters) : [];
    const title = currentRow?.title || 'All Items';

    if (loading) {
        return (
            <div className="all-items-grid">
                <header className="header text-center text-white py-5">
                    <Container>
                        <h1 className="display-4">Loading...</h1>
                    </Container>
                </header>
                <main className="py-5">
                    <Container>
                        <p className="text-center">Loading items...</p>
                    </Container>
                </main>
            </div>
        );
    }

    if (!filteredData || filteredData.length === 0) {
        return (
            <div className="all-items-grid">
                <header className="header text-center text-white py-5">
                    <Container>
                        <h1 className="display-4">{title}</h1>
                    </Container>
                </header>
                <main className="py-5">
                    <Container>
                        <p className="text-center">No items found.</p>
                        <div className="text-center">
                            <Button variant="outline-primary" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </div>
                    </Container>
                </main>
            </div>
        );
    }

    const showProjectDetails = (project: ItemDisplay) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    return (
        <div className="all-items-grid">
            <header className="header text-center text-white py-5">
                <Container>
                    <h1 className="display-4">{title}</h1>
                    <p className="lead">{filteredData.length} items</p>
                </Container>
            </header>
            <main className="py-5">
                <Container>
                    <div style={{ marginBottom: "2rem" }}>
                        <Button variant="outline-primary" onClick={() => navigate(-1)}>
                            ← Go Back
                        </Button>
                    </div>
                </Container>
                <Container>
                    <Row className="g-4">
                        {filteredData.map((project: ItemDisplay, index: number) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="itemCard">
                                <Card className="h-100 project-card bg-dark text-white">
                                    {project.thumbnailImage && (
                                        <Card.Img
                                            variant="top"
                                            src={project?.thumbnailImage}
                                            alt={project.title}
                                            title={project?.thumbnailImage}
                                            onClick={() => {
                                                if (project?.link) {
                                                    window.open(project.link, '_blank');
                                                }
                                            }}
                                            className={project?.link ? 'clickable' : ''}
                                        />
                                    )}
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{project.title}</Card.Title>
                                        {!project.thumbnailImage && project.description && (
                                            <Card.Text>{project.description}</Card.Text>
                                        )}
                                        {(project.infoPages.length > 0 && (
                                            <Button
                                                variant="outline-primary"
                                                className="mt-auto"
                                                onClick={() => {
                                                    if (project.blogkey) {
                                                        navigate(`/blogs/${encodeURIComponent(project.blogkey)}`);
                                                        return;
                                                    }
                                                    showProjectDetails(project);
                                                }}
                                            >
                                                More Info
                                            </Button>
                                        )) ||
                                            (project.link && (
                                                <Button
                                                    variant="outline-primary"
                                                    className="mt-auto"
                                                    onClick={() => {
                                                        if (project?.link) {
                                                            window.open(project.link, '_blank');
                                                        }
                                                    }}
                                                >
                                                    Visit
                                                </Button>
                                            )) ||
                                            (project.description && project.thumbnailImage && (
                                                <span className="mt-auto">{project.description}</span>
                                            ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <div className="text-center mt-5">
                        <Button variant="outline-primary" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </div>
                </Container>
            </main>

            <ItemDisplayViewer
                previewProject={selectedProject}
                showModal={showModal}
                setShowModal={(bool: boolean) => setShowModal(bool)}
            />
        </div>
    );
};

export default AllItemsGridPage;

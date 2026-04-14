import React, { useState, useEffect } from 'react';
import { Container, Col, Card, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import offlineProjects from '../../assets/json/projects.json';
import './Homepage.css';
import ServerConnector from '../../services/ServerConnector';
import { Link, useNavigate } from 'react-router-dom';
import { ItemDisplay } from '../../models/itemDisplayModel';
import ItemDisplayViewer from '../../components/overlay/ItemDisplayViewer';
import { getDiscoveryRows, setSeededRandom, DiscoveryDisplay } from '../../helpers/discoveryRowsConfig';

const MAX_DISPLAY_ITEMS_PER_ROW = 5;

interface HomepageProps {
    data?: any;
}


function getOfflineProjects(): ItemDisplay[] {
    let cachedProjects = sessionStorage.getItem('cached-projects');
    if (cachedProjects) {
        return JSON.parse(cachedProjects);
    } else {
        return offlineProjects.displayItems as unknown as ItemDisplay[]; // Show offline projects
    }

}

const Homepage: React.FC<HomepageProps> = ({ data }) => {
    const navigate = useNavigate();
    const discovery = data?.title === 'Discovery';
    let fetched = false;
    const [mainProjects, setProjects] = useState<ItemDisplay[]>([]);
    const [mainBlog, setBlog] = useState<ItemDisplay[]>([]);
    const [justPosts, setPosts] = useState<ItemDisplay[]>([]);
    const [mainWebposts, setWebposts] = useState<ItemDisplay[]>([]);
    const [mainRandomPosts, setRandomPosts] = useState<ItemDisplay[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ItemDisplay | null>(null);
    const [offline, setOfflineModeModal] = useState(false);
    const serverConnector = new ServerConnector();
    setSeededRandom(data.randomnessSeed);
    let discoveryRows: DiscoveryDisplay[] = getDiscoveryRows(mainProjects, mainBlog, justPosts, mainWebposts, mainRandomPosts);

    useEffect(() => {
        if (!fetched) {
            fetched = true;
            fetchProjects();
        }
    }, []);

    const formatProjects = (projects: any) => {
        const sortedProjects = projects.sort((a: ItemDisplay, b: ItemDisplay) => {
            const dateA = new Date(a.publishDate || 0).getTime();
            const dateB = new Date(b.publishDate || 0).getTime();
            return dateB - dateA;
        });
        setProjects(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'project'));
        setPosts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'post'));
        setBlog(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'blog'));
        setWebposts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'url'));
        setRandomPosts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'random'));
    }

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

    const fetchProjects = async () => {
        const rateLimit = localStorage.getItem('rateLimit')
        if (rateLimit && Date.now() - parseInt(rateLimit) < 60000 * 0) {
            formatProjects(getOfflineProjects());
            setOfflineModeModal(true)
            return;
        }
        localStorage.removeItem('rateLimit');
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/getDisplayItems', 'POST', undefined, (data: any) => {
            sessionStorage.setItem('cached-projects', JSON.stringify(data.displayItems));
            formatProjects(data.displayItems);

        }, () => {
            formatProjects(getOfflineProjects());
            setOfflineModeModal(true)
        });
    };

    const showProjectDetails = (project: ItemDisplay) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const popover = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">No connection.</Popover.Header>
            <Popover.Body>
                The backend is currently offline, or has refused our connection attempt. Showing cached projects.
            </Popover.Body>
        </Popover>
    );

    return (
        <div className="homepage">
            <header className={"header text-center text-white " + (discovery ? '' : ' py-5')}>
                <Container>
                    <h1 className="display-4">OldMartijntje</h1>
                    <p className="lead">Software Developer</p>
                </Container>
            </header>
            <main className="py-5">
                {discoveryRows.map((row, index) => {
                    if (!discovery && !row.showOnHome) return;
                    const filteredProjects = filterProjects(row.dataList, row.appliedFilters);
                    const hasMoreItems = filteredProjects.length > MAX_DISPLAY_ITEMS_PER_ROW;

                    return (
                        <Container key={index} style={{ marginBottom: "1rem" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className="text-primary" style={{ margin: 0 }}>{row.title}</h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {hasMoreItems && (
                                        <Link
                                            to="/all-items"
                                            state={{ rowIndex: index }}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Button variant="outline-secondary" size="sm">
                                                View All ({filteredProjects.length})
                                            </Button>
                                        </Link>
                                    )}
                                    {offline && (
                                        <OverlayTrigger trigger="click" placement="top" overlay={popover}>
                                            <Button variant="danger">Offline</Button>
                                        </OverlayTrigger>
                                    )}
                                </div>
                            </div>
                            <div className="g-4 scrollBar">
                                {filteredProjects.slice(0, MAX_DISPLAY_ITEMS_PER_ROW).map((project, index) => (
                                    <Col key={index} xs={12} sm={6} md={4} lg={3} className="itemCard">
                                        <Card className="h-100 project-card bg-dark text-white">
                                            {project.thumbnailImage && <Card.Img variant="top" src={project?.thumbnailImage} alt={project.title} title={project?.thumbnailImage} onClick={() => {
                                                if (project?.link) {
                                                    window.open(project.link, '_blank');
                                                }
                                            }} className={
                                                (project?.link ? 'clickable' : '')
                                            } />}
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title>{project.title}</Card.Title>
                                                {!project.thumbnailImage && project.description && <Card.Text>{project.description}</Card.Text>}
                                                {(project.infoPages.length > 0 && <Button
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
                                                </Button>) || (project.link && <Button
                                                    variant="outline-primary"
                                                    className="mt-auto"
                                                    onClick={() => {
                                                        if (project?.link) {
                                                            window.open(project.link, '_blank');
                                                        }
                                                    }}
                                                > Visit</Button>) || (project.description && project.thumbnailImage && <span className="mt-auto">{project.description}</span>)
                                                }
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </div>
                        </Container>
                    );
                })}
                {!discovery && (
                    <Container style={{ marginBottom: "1rem" }}>
                        <Link type="button" className="btn btn-info" to="/discovery">View Discovery</Link>
                    </Container>
                )}
            </main>

            <ItemDisplayViewer previewProject={selectedProject} showModal={showModal} setShowModal={function (bool: boolean): void {
                setShowModal(bool);
            }} />
        </div>
    );
};

export default Homepage;
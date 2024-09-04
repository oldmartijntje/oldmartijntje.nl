import React, { useState, useEffect } from 'react';
import { Container, Col, Card, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import offlineProjects from '../../assets/json/projects.json';
import './Homepage.css';
import ServerConnector from '../../services/ServerConnector';
import { Link } from 'react-router-dom';
import { ItemDisplay } from '../../models/itemDisplayModel';
import ItemDisplayViewer from '../../components/overlay/ItemDisplayViewer';

interface HomepageProps {
    data?: any;
}

interface DiscoveryDisplay {
    dataList: ItemDisplay[];
    title: string;
    appliedFilters: string[];
}

let seedRotations = Math.random() * 10000;
function seededRandom(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    seedRotations = (seedRotations * a + c) % m;
    const answer = seedRotations / m;
    seedRotations = (seedRotations * 9301 + 49297) % 233280
    return answer;
}

function setSeededRandom(seed: number) {
    seedRotations = seed;
}


function getOfflineProjects(): any[] {
    let chachedProjects = sessionStorage.getItem('cached-projects');
    if (chachedProjects) {
        return JSON.parse(chachedProjects);
    } else {
        return offlineProjects; // Show offline projects
    }

}

const Homepage: React.FC<HomepageProps> = ({ data }) => {
    const discovery = data?.title === 'Discovery';
    let fetched = false;
    const [mainProjects, setProjects] = useState<ItemDisplay[]>([]);
    const [mainBlog, setBlog] = useState<ItemDisplay[]>([]);
    const [mainWebposts, setWebposts] = useState<ItemDisplay[]>([]);
    const [mainRandomPosts, setRandomPosts] = useState<ItemDisplay[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ItemDisplay | null>(null);
    const [offline, setOfflineModeModal] = useState(false);
    const serverConnector = new ServerConnector();
    setSeededRandom(data.randomnessSeed);
    let discoveryRows: DiscoveryDisplay[] = [
        {
            dataList: [...mainProjects],
            title: 'Top Picks',
            appliedFilters: ['favourite']
        },
        {
            dataList: [...mainProjects].sort(() => {
                return seededRandom() - 0.5;
            }),
            title: 'Website Projects',
            appliedFilters: ['website', 'my-code']
        },
        {
            dataList: [...mainBlog],
            title: 'Blog Posts',
            appliedFilters: []
        },
        {
            dataList: [...mainProjects],
            title: 'My Games',
            appliedFilters: ['game', 'my-code']
        },
        {
            dataList: [...mainWebposts],
            title: 'Weblinks',
            appliedFilters: []
        },
        {
            dataList: [...mainProjects],
            title: 'Side Projects',
            appliedFilters: ['side-project']
        },
        {
            dataList: [...mainProjects].sort(() => {
                return seededRandom() - 0.5;
            }),
            title: 'All Projects',
            appliedFilters: []
        },
        {
            dataList: [...mainRandomPosts],
            title: 'Random Things',
            appliedFilters: []
        }
    ];
    if (!discovery) {
        discoveryRows = [discoveryRows[0], discoveryRows[2]];
    }

    useEffect(() => {
        if (!fetched) {
            fetched = true;
            fetchProjects();
        }
    }, []);

    const formatProjects = (projects: any) => {
        const sortedProjects = projects.sort((a: ItemDisplay, b: ItemDisplay) => {
            const dateA = new Date(a.lastUpdated || 0).getTime();
            const dateB = new Date(b.lastUpdated || 0).getTime();
            return dateB - dateA;
        });
        setProjects(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'project'));
        setBlog(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'blog'));
        setWebposts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'url'));
        setRandomPosts(sortedProjects.filter((project: ItemDisplay) => project.displayItemType.toLocaleLowerCase() === 'random'));
    }

    const filterProjects = (projects: ItemDisplay[], filters: string[]): ItemDisplay[] => {
        let filteredProjects: ItemDisplay[] = [];
        projects.forEach((project) => {
            let doesHaveAllFilters = true;
            filters.forEach((filter) => {
                if (!project.tags?.includes(filter)) {
                    doesHaveAllFilters = false;
                }
            });
            if (doesHaveAllFilters) {
                filteredProjects.push(project);
            }
        });

        return filteredProjects
    }

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
                {discoveryRows.map((row, index) => (
                    <Container key={index} style={{ marginBottom: "1rem" }}>
                        <h2 className="text-primary">{row.title} {offline && (<OverlayTrigger trigger="click" placement="top" overlay={popover}>
                            <Button variant="danger">Offline</Button>
                        </OverlayTrigger>
                        )}</h2>
                        <div className="g-4 scrollBar">
                            {filterProjects(row.dataList, row.appliedFilters).map((project, index) => (
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
                                                onClick={() => showProjectDetails(project)}
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
                    </Container>))}
                {!discovery && (
                    <Container style={{ marginBottom: "1rem" }}>
                        <Link type="button" className="btn btn-info" to="/discovery">View Discovery</Link>
                    </Container>
                )
                }
            </main>

            <ItemDisplayViewer previewProject={selectedProject} showModal={showModal} setShowModal={function (bool: boolean): void {
                setShowModal(bool);
            }} />
        </div>
    );
};

export default Homepage;
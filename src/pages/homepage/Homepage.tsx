import React, { useState, useEffect } from 'react';
import { Container, Col, Card, Button, Popover, OverlayTrigger, Modal } from 'react-bootstrap';
import offlineProjects from '../../assets/json/projects.json';
import './Homepage.css';
import ServerConnector from '../../services/ServerConnector';

export interface Project {
    title: string;
    link: string;
    info: string;
    lastUpdated: string;
    tumbnailImageId: string;
    images: { [key: string]: string };
}

function getOfflineProjects(): any[] {
    let chachedProjects = sessionStorage.getItem('cached-projects');
    if (chachedProjects) {
        return JSON.parse(chachedProjects);
    } else {
        return offlineProjects; // Show offline projects
    }

}

const Homepage: React.FC = () => {
    let fetched = false;
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [offline, setOfflineModeModal] = useState(false);
    const serverConnector = new ServerConnector();

    useEffect(() => {
        if (!fetched) {
            fetched = true;
            fetchProjects();
        }
    }, []);

    const formatProjects = (projects: any) => {
        const sortedProjects = projects.sort((a: Project, b: Project) =>
            new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        setProjects(sortedProjects);
    }



    const fetchProjects = async () => {
        const rateLimit = localStorage.getItem('rateLimit')
        if (rateLimit && Date.now() - parseInt(rateLimit) < 60000 * 0) {
            formatProjects(getOfflineProjects());
            setOfflineModeModal(true)
            return;
        }
        localStorage.removeItem('rateLimit');
        serverConnector.fetchData('https://api.oldmartijntje.nl/getData/projects', 'POST', undefined, (data: any) => {
            sessionStorage.setItem('cached-projects', JSON.stringify(data.projects));
            formatProjects(data.projects);

        }, () => {
            formatProjects(getOfflineProjects());
            setOfflineModeModal(true)
        });
    };

    const showProjectDetails = (project: Project) => {
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
            <header className="header text-center text-white py-5">
                <Container>
                    <h1 className="display-4">OldMartijntje</h1>
                    <p className="lead">Software Developer</p>
                </Container>
            </header>
            <main className="py-5">
                <Container>
                    <h2 className="text-primary mb-4">My Projects  {offline && (<OverlayTrigger trigger="click" placement="top" overlay={popover}>
                        <Button variant="danger">Offline</Button>
                    </OverlayTrigger>
                    )}</h2>
                    <div className="g-4 scrollBar">
                        {projects.map((project, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="itemCard">
                                <Card className="h-100 project-card bg-dark text-white">
                                    <Card.Img variant="top" src={project.images[project.tumbnailImageId]} alt={project.title} onClick={() => {
                                        if (project?.link) {
                                            window.open(project.link, '_blank');
                                        }
                                    }} className={
                                        (project?.link ? 'clickable' : '')
                                    } />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{project.title}</Card.Title>
                                        <Button
                                            variant="outline-primary"
                                            className="mt-auto"
                                            onClick={() => showProjectDetails(project)}
                                        >
                                            More Info
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </div>
                </Container>
            </main>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" contentClassName="bg-dark text-white">
                <Modal.Header className="border-secondary">
                    <Modal.Title onClick={() => {
                        if (selectedProject?.link) {
                            window.open(selectedProject.link, '_blank');
                        }
                    }}
                        className={(selectedProject?.link ? 'clickable' : '')}
                    >{selectedProject?.title}</Modal.Title>
                    {/* make the button red */}
                    <Button variant="close" className="btn btn-primary" onClick={() => setShowModal(false)}
                        style={{ backgroundColor: '#2a75fe' }}></Button>
                </Modal.Header>
                <Modal.Body>
                    <div dangerouslySetInnerHTML={{ __html: selectedProject?.info || '' }} />
                    {selectedProject?.link && (
                        <p className="btn btn-primary">
                            <a href={selectedProject.link} target="_blank" className="text-light">
                                View Project
                            </a>
                        </p>
                    )}
                    {selectedProject?.lastUpdated && (
                        <p className="text-muted">
                            <small className="text-secondary">Last updated: {new Date(selectedProject.lastUpdated).toLocaleDateString()}</small>
                        </p>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Homepage;
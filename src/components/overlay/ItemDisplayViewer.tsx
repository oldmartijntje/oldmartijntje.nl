import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { ItemDisplay } from '../../models/itemDisplayModel';
import { useState } from 'react';


interface SidebarProps {
    previewProject?: ItemDisplay | null;
    showModal: boolean;
    setShowModal: (bool: boolean) => void;
}

// UserPage component
const ItemDisplayViewer: React.FC<SidebarProps> = ({ previewProject, showModal, setShowModal }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <>
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
                    {previewProject && previewProject.infoPages.length > 1 && <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(Number(k))}
                        className="mb-3 custom-tabs"
                    >
                        {previewProject?.infoPages.map((infoPage, index) => (
                            <Tab eventKey={index} title={infoPage.title} key={index}>
                                <div dangerouslySetInnerHTML={{ __html: infoPage.content }} />
                            </Tab>
                        ))}
                    </Tabs> || previewProject?.infoPages.length === 1 && (
                        <div dangerouslySetInnerHTML={{ __html: previewProject.infoPages[0].content }} />
                    )}

                </Modal.Body>
                <Modal.Footer>
                    {previewProject?.link && (
                        <p className="btn btn-primary">
                            <a href={previewProject.link} target="_blank" rel="noopener noreferrer" className="text-light">
                                Visit URL
                            </a>
                        </p>
                    )}
                    {previewProject?.lastUpdated && (
                        <p className="text-muted">
                            <small className="text-secondary">Last article update: {new Date(previewProject.lastUpdated).toLocaleDateString()}</small>
                        </p>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ItemDisplayViewer;
import React, { useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';

interface RssPopupProps {
    rssUrl: string;
    buttonClassName?: string;
}

const RssPopup: React.FC<RssPopupProps> = ({ rssUrl, buttonClassName }) => {
    const [showModal, setShowModal] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(rssUrl);
            setCopyStatus('RSS URL copied.');
        } catch {
            setCopyStatus('Copy failed. Please copy manually.');
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setCopyStatus('');
    };

    return (
        <>
            <Button
                variant="outline-warning"
                className={buttonClassName}
                onClick={() => setShowModal(true)}
                title="RSS feed"
            >
                <i className="bi bi-rss-fill" /> RSS
            </Button>

            <Modal show={showModal} onHide={handleClose} centered contentClassName="bg-dark text-white">
                <Modal.Header className="border-secondary">
                    <Modal.Title>
                        <i className="bi bi-rss-fill me-2" />
                        RSS Feed
                    </Modal.Title>
                    <Button variant="close" className="btn btn-primary btn bg-danger" onClick={() => setShowModal(false)}></Button>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup>
                        <Form.Control value={rssUrl} readOnly className="bg-dark text-white border-secondary" />
                    </InputGroup>
                    {copyStatus && <div className="text-secondary small mt-2">{copyStatus}</div>}
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="outline-primary" onClick={handleCopy}>
                        Copy URL
                    </Button>
                    <Button as="a" href={rssUrl} target="_blank" rel="noreferrer" variant="primary">
                        Visit URL
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RssPopup;

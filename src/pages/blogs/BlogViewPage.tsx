import React, { useEffect, useState } from 'react';
import { Alert, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ServerConnector from '../../services/ServerConnector';

interface BlogData {
    _id: string;
    title: string;
    description: string;
    blogIdentifier: string;
    baseURL: string | null;
    pubDate: string;
    editDate: string;
    hidden: boolean;
}

const BlogViewPage: React.FC = () => {
    const { blogKey } = useParams<{ blogKey: string }>();
    const [blog, setBlog] = useState<BlogData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!blogKey) {
            setError('Missing blog key.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        const serverConnector = new ServerConnector();
        const encodedBlogIdentifier = encodeURIComponent(blogKey);
        serverConnector.fetchData(
            `https://api.oldmartijntje.nl/getData/blogs/${encodedBlogIdentifier}`,
            'GET',
            '{}',
            (response: any) => {
                setBlog(response.data || null);
                setIsLoading(false);
            },
            (fetchError: any) => {
                setError(fetchError?.message || 'Failed to load blog.');
                setIsLoading(false);
            }
        );
    }, [blogKey]);

    return (
        <Container className="py-5">
            <Link to="/" className="btn btn-outline-primary mb-3">Back Home</Link>

            {isLoading && (
                <div className="d-flex align-items-center gap-2 text-light">
                    <Spinner animation="border" size="sm" />
                    <span>Loading blog...</span>
                </div>
            )}

            {!isLoading && error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && blog && (
                <Card className="bg-dark text-white">
                    <Card.Body>
                        <Card.Title>{blog.title}</Card.Title>
                        <Card.Text className="text-secondary mb-0">
                            This is a default blog page. Full content rendering can be added later.
                        </Card.Text>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default BlogViewPage;
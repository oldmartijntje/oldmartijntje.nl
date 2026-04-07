import React, { useEffect, useState } from 'react';
import { Alert, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import RssPopup from '../../components/overlay/RssPopup';
import ServerConnector from '../../services/ServerConnector';

interface BlogData {
    _id: string;
    title: string;
    description: string;
    content: string;
    blogIdentifier: string;
    baseURL: string | null;
    pubDate: string;
    editDate: string;
    hidden: boolean;
}

const formatBlogDate = (dateValue: string) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString();
};

const BLOG_RSS_URL = 'https://api.oldmartijntje.nl/getData/blogs/rss.xml';

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
            <div className="d-flex flex-wrap gap-2 mb-3">
                <Link to="/" className="btn btn-outline-primary">Back Home</Link>
                <Link to="/blogs" className="btn btn-outline-secondary">View All Blogs</Link>
                <RssPopup rssUrl={BLOG_RSS_URL} />
            </div>

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
                        <Card.Title><h1>{blog.title}</h1></Card.Title>
                        <div className="text-secondary small mb-3">
                            Published {formatBlogDate(blog.pubDate)}
                        </div>
                        <div className="border-top border-secondary pt-3" style={{ minHeight: '60svh' }}>
                            <ReactMarkdown>{blog.content}</ReactMarkdown>
                        </div>
                        <div className="border-top border-secondary mt-4 pt-3 text-secondary small">
                            Edited {formatBlogDate(blog.editDate)}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default BlogViewPage;
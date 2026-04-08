import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import RssPopup from '../../components/overlay/RssPopup';
import StructuredDataScript from '../../components/overlay/StructuredDataScript';
import ServerConnector from '../../services/ServerConnector';
import { buildBlogArticleStructuredData, STRUCTURED_DATA_DEFAULTS } from '../../helpers/structuredData';

interface UserPageProps {
    userProfile?: any;
}

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
    views?: number;
}

const formatBlogDate = (dateValue: string) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString();
};

const BlogViewPage: React.FC<UserPageProps> = ({ userProfile }) => {
    const { blogKey } = useParams<{ blogKey: string }>();
    const location = useLocation();
    const [blog, setBlog] = useState<BlogData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const adminAccess = useMemo(() => {
        const params = new URLSearchParams(location.search);

        return {
            adminView: params.get('adminView') === 'true',
            sessionToken: params.get('sessionToken') || '',
        };
    }, [location.search]);

    useEffect(() => {
        if (!blogKey) {
            setError('Missing blog key.');
            setIsLoading(false);
            return;
        }

        const sessionToken = userProfile?.sessionToken || adminAccess.sessionToken;

        if (adminAccess.adminView && !sessionToken) {
            setIsLoading(true);
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');

        const serverConnector = new ServerConnector();
        const encodedBlogIdentifier = encodeURIComponent(blogKey);
        const queryParams: { [key: string]: string } = {};

        if (adminAccess.adminView && sessionToken) {
            queryParams.sessionToken = sessionToken;
            queryParams.hidden = "true";
        }

        const blogDataUrl = Object.keys(queryParams).length > 0
            ? ServerConnector.encodeQueryData(queryParams, `https://api.oldmartijntje.nl/getData/blogs/${encodedBlogIdentifier}`)
            : `https://api.oldmartijntje.nl/getData/blogs/${encodedBlogIdentifier}`;

        serverConnector.fetchData(
            blogDataUrl,
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
    }, [adminAccess.adminView, adminAccess.sessionToken, blogKey, userProfile?.sessionToken]);

    const blogStructuredData = useMemo(() => {
        if (!blog) {
            return null;
        }

        return buildBlogArticleStructuredData({
            title: blog.title,
            description: blog.description,
            content: blog.content,
            blogIdentifier: blog.blogIdentifier,
            pubDate: blog.pubDate,
            editDate: blog.editDate,
        });
    }, [blog]);

    return (
        <Container className="py-5">
            {blogStructuredData && <StructuredDataScript id="blog-article" data={blogStructuredData} />}
            <div className="d-flex flex-wrap gap-2 mb-3">
                <Link to="/" className="btn btn-outline-primary">Back Home</Link>
                <Link to="/blogs" className="btn btn-outline-secondary">View All Blogs</Link>
                <RssPopup rssUrl={STRUCTURED_DATA_DEFAULTS.rssUrl} />
            </div>

            {isLoading && (
                <div className="d-flex align-items-center gap-2 text-light">
                    <Spinner animation="border" size="sm" />
                    <span>Loading blog...</span>
                </div>
            )}

            {!isLoading && error && <Alert variant="danger">{error}</Alert>}
            <article>
                {!isLoading && !error && blog && (
                    <Card className="bg-dark text-white">
                        <Card.Body>
                            <Card.Title>
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                    <h1 className="mb-0">{blog.title}</h1>
                                    {blog.hidden && (
                                        <Badge bg="warning" text="dark">Hidden Blog</Badge>
                                    )}
                                </div>
                            </Card.Title>
                            <div className="text-secondary small mb-3">
                                Published {formatBlogDate(blog.pubDate)}
                                {typeof blog.views === 'number' && <span> · Views {blog.views}</span>}
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
            </article>
        </Container>
    );
};

export default BlogViewPage;
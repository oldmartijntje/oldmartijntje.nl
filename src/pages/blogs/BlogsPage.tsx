import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ServerConnector from '../../services/ServerConnector';

interface BlogListItem {
    _id: string;
    title: string;
    description: string;
    blogIdentifier: string;
    pubDate: string;
    editDate: string;
}

const BLOGS_PER_PAGE = 10;

const BlogsPage: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);

    const totalPages = Math.max(1, Math.ceil(totalBlogs / BLOGS_PER_PAGE));

    const fetchBlogs = (page: number) => {
        setIsLoading(true);
        setError('');

        const skip = (page - 1) * BLOGS_PER_PAGE;
        const url = ServerConnector.encodeQueryData(
            {
                limit: String(BLOGS_PER_PAGE),
                skip: String(skip),
            },
            'https://api.oldmartijntje.nl/getData/blogs'
        );

        const serverConnector = new ServerConnector();
        serverConnector.fetchData(
            url,
            'GET',
            '{}',
            (response: any) => {
                setBlogs(response.data || []);
                setTotalBlogs(response.pagination?.total || 0);
                setIsLoading(false);
            },
            (fetchError: any) => {
                setError(fetchError?.message || 'Failed to load blogs.');
                setIsLoading(false);
            }
        );
    };

    useEffect(() => {
        fetchBlogs(currentPage);
    }, [currentPage]);

    return (
        <Container className="py-5">
            <h1 className="text-light mb-4">Blogs</h1>

            {isLoading && (
                <div className="d-flex align-items-center gap-2 text-light mb-3">
                    <Spinner animation="border" size="sm" />
                    <span>Loading blogs...</span>
                </div>
            )}

            {!isLoading && error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && blogs.length === 0 && (
                <Alert variant="info">No blogs found.</Alert>
            )}

            {!isLoading && !error && blogs.map((blog) => (
                <Card className="mb-3 bg-dark text-white" key={blog._id}>
                    <Card.Body>
                        <Card.Title>{blog.title}</Card.Title>
                        <Card.Text>{blog.description}</Card.Text>
                        <Card.Text className="text-secondary mb-3">
                            Published: {new Date(blog.pubDate).toLocaleString()}
                        </Card.Text>
                        <Link
                            className="btn btn-outline-primary"
                            to={`/blogs/${encodeURIComponent(blog.blogIdentifier)}`}
                        >
                            Open Blog
                        </Link>
                    </Card.Body>
                </Card>
            ))}

            <div className="d-flex align-items-center gap-2 mt-4">
                <Button
                    variant="secondary"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => setCurrentPage((previousPage) => Math.max(1, previousPage - 1))}
                >
                    Previous
                </Button>
                <span className="text-light">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="secondary"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1))}
                >
                    Next
                </Button>
            </div>
        </Container>
    );
};

export default BlogsPage;
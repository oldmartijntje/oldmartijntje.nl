import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Navbar, Nav, Row } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';

interface UserPageProps {
    userProfile?: any;
}

interface BlogItem {
    _id: string;
    title: string;
    description: string;
    content?: string;
    blogIdentifier: string;
    baseURL: string | null;
    pubDate: string;
    editDate: string;
    hidden: boolean;
    views?: number;
}

interface BlogFormData {
    _id?: string;
    title: string;
    description: string;
    content: string;
    blogIdentifier: string;
    baseURL: string;
    pubDate: string;
    editDate: string;
    hidden: boolean;
}

const getDefaultBaseURL = () => {
    if (typeof window === 'undefined') return '/#/blogs/';
    return `${window.location.origin}/#/blogs/`;
};

const createEmptyFormState = (): BlogFormData => ({
    title: '',
    description: '',
    content: '',
    blogIdentifier: '',
    baseURL: getDefaultBaseURL(),
    pubDate: '',
    editDate: '',
    hidden: false,
});

const toDateInputValue = (isoValue: string) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fromDateInputValue = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString();
};

const BlogsEditorPage: React.FC<UserPageProps> = ({ userProfile }) => {
    const [blogs, setBlogs] = useState<BlogItem[]>([]);
    const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
    const [formData, setFormData] = useState<BlogFormData>(createEmptyFormState());
    const [useCustomEditDate, setUseCustomEditDate] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [limit, setLimit] = useState(getSearchFilters('blogsEditor_limit') || 50);
    const [skip, setSkip] = useState(getSearchFilters('blogsEditor_skip') || 0);
    const [searchFilter, setSearchFilterState] = useState(getSearchFilters('blogsEditor_search') || '');
    const [includeHidden, setIncludeHidden] = useState(getSearchFilters('blogsEditor_includeHidden') || true);
    const [totalCount, setTotalCount] = useState(0);

    const clearanceLevel = userProfile?.clearanceLevel || 0;
    const sessionToken = userProfile?.sessionToken || '';
    const canCreate = clearanceLevel >= 4;
    const canEditOrDelete = clearanceLevel >= 5;

    const buildBlogViewUrl = (blog: BlogItem) => {
        if (!blog.baseURL?.trim()) {
            return '';
        }

        const baseURL = blog.baseURL.trim().endsWith('/') ? blog.baseURL.trim() : `${blog.baseURL.trim()}/`;
        const blogUrl = `${baseURL}${encodeURIComponent(blog.blogIdentifier)}`;

        if (!sessionToken) {
            return blogUrl;
        }

        return ServerConnector.encodeQueryData({
            fromAdminDashboard: 'true',
            sessionToken,
        }, blogUrl);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = () => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const queryParams: { [key: string]: string } = {
            limit: String(limit),
            skip: String(skip),
        };

        if (includeHidden) {
            queryParams.hidden = 'true';
            queryParams.sessionToken = sessionToken;
        }

        const url = ServerConnector.encodeQueryData(queryParams, 'https://api.oldmartijntje.nl/getData/blogs');
        const serverConnector = new ServerConnector();
        serverConnector.fetchData(url, 'GET', '{}', (response: any) => {
            setBlogs(response.data || []);
            setTotalCount(response.pagination?.total || 0);
            setIsLoading(false);
        }, (error: any) => {
            setErrorMessage(error?.message || 'Failed to load blogs');
            setIsLoading(false);
        });
    };

    const persistFilterState = (nextSearch: string, nextHidden: boolean, nextLimit: number, nextSkip: number) => {
        setSearchFilters('blogsEditor_search', nextSearch);
        setSearchFilters('blogsEditor_includeHidden', nextHidden);
        setSearchFilters('blogsEditor_limit', nextLimit);
        setSearchFilters('blogsEditor_skip', nextSkip);
    };

    const setSearchFilter = (value: string) => {
        setSearchFilterState(value);
        persistFilterState(value, includeHidden, limit, skip);
    };

    const setHiddenFilter = (value: boolean) => {
        setIncludeHidden(value);
        persistFilterState(searchFilter, value, limit, skip);
    };

    const setLimitFilter = (value: number) => {
        setLimit(value);
        persistFilterState(searchFilter, includeHidden, value, skip);
    };

    const setSkipFilter = (value: number) => {
        setSkip(value);
        persistFilterState(searchFilter, includeHidden, limit, value);
    };

    const clearForm = () => {
        setEditingBlog(null);
        setFormData(createEmptyFormState());
        setUseCustomEditDate(false);
    };

    const handleEdit = (blog: BlogItem) => {
        setEditingBlog(blog);
        setSuccessMessage('');
        setErrorMessage('');
        setFormData({
            _id: blog._id,
            title: blog.title,
            description: blog.description,
            content: blog.content || '',
            blogIdentifier: blog.blogIdentifier,
            baseURL: blog.baseURL || '',
            pubDate: toDateInputValue(blog.pubDate),
            editDate: '',
            hidden: !!blog.hidden,
        });
        setUseCustomEditDate(false);

        const queryParams: { [key: string]: string } = {};
        if (includeHidden) {
            queryParams.hidden = 'true';
            queryParams.sessionToken = sessionToken;
        }

        const encodedId = encodeURIComponent(blog._id);
        const endpoint = `https://api.oldmartijntje.nl/getData/blogs/${encodedId}`;
        const url = Object.keys(queryParams).length > 0
            ? ServerConnector.encodeQueryData(queryParams, endpoint)
            : endpoint;

        const serverConnector = new ServerConnector();
        serverConnector.fetchData(url, 'GET', '{}', (response: any) => {
            const loadedBlog = response?.data;
            if (!loadedBlog) return;
            setFormData((previousFormData) => ({
                ...previousFormData,
                content: loadedBlog.content || previousFormData.content,
            }));
        }, () => {
            // Keep current values if loading full content fails.
        });
    };

    const doesBlogMatchSearch = (blog: BlogItem) => {
        if (!searchFilter.trim()) return true;
        const lowerSearch = searchFilter.toLowerCase();
        return (
            blog.title.toLowerCase().includes(lowerSearch) ||
            blog.description.toLowerCase().includes(lowerSearch) ||
            blog.blogIdentifier.toLowerCase().includes(lowerSearch) ||
            (blog.baseURL || '').toLowerCase().includes(lowerSearch) ||
            blog._id.toLowerCase().includes(lowerSearch)
        );
    };

    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => doesBlogMatchSearch(blog));
    }, [blogs, searchFilter]);

    const handleCreateOrUpdate = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!canCreate) {
            setErrorMessage('Your account does not have permission to create blogs.');
            return;
        }

        if (editingBlog && !canEditOrDelete) {
            setErrorMessage('Your account does not have permission to edit blogs.');
            return;
        }

        const endpoint = 'https://api.oldmartijntje.nl/getData/blogs';
        const method = editingBlog ? 'PUT' : 'POST';
        const payload: any = {
            sessionToken,
            title: formData.title,
            description: formData.description,
            content: formData.content,
            hidden: !!formData.hidden,
        };

        if (editingBlog) {
            payload._id = formData._id;
            if (formData.baseURL.trim()) {
                payload.baseURL = formData.baseURL.trim();
            } else {
                payload.baseURL = null;
            }

            if (formData.pubDate) {
                payload.pubDate = fromDateInputValue(formData.pubDate);
            }

            if (useCustomEditDate && formData.editDate) {
                payload.editDate = fromDateInputValue(formData.editDate);
            }
        } else {
            payload.blogIdentifier = formData.blogIdentifier.trim();
            payload.baseURL = formData.baseURL.trim() ? formData.baseURL.trim() : null;

            if (formData.pubDate) {
                payload.pubDate = fromDateInputValue(formData.pubDate);
            }

            if (useCustomEditDate && formData.editDate) {
                payload.editDate = fromDateInputValue(formData.editDate);
            }
        }

        const serverConnector = new ServerConnector();
        serverConnector.fetchData(endpoint, method, JSON.stringify(payload), (response: any) => {
            setSuccessMessage(response?.message || (editingBlog ? 'Blog updated successfully' : 'Blog created successfully'));
            clearForm();
            fetchBlogs();
        }, (error: any) => {
            setErrorMessage(error?.message || 'Failed to save blog');
        });
    };

    const handleDelete = (id: string) => {
        if (!canEditOrDelete) {
            setErrorMessage('Your account does not have permission to delete blogs.');
            return;
        }

        const deleteURL = ServerConnector.encodeQueryData({
            id,
            sessionToken,
        }, 'https://api.oldmartijntje.nl/getData/blogs');

        const serverConnector = new ServerConnector();
        serverConnector.fetchData(deleteURL, 'DELETE', '{}', (response: any) => {
            setErrorMessage('');
            setSuccessMessage(response?.message || 'Blog deleted successfully');
            fetchBlogs();
        }, (error: any) => {
            setErrorMessage(error?.message || 'Failed to delete blog');
        });
    };

    return (
        <Container fluid className="py-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: 'center' }}>
                <Nav className="ml-auto">
                    <Col className="flex">
                        <h1 className="text-center text-light inline"><AdminPathsPopup userProfile={userProfile} title="Blogs" /></h1>
                        <h1 className="text-center text-light inline" style={{ padding: '8px 0' }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>

            <Row className="mb-4">
                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">{editingBlog ? 'Edit Blog' : 'Create Blog'}</Card.Title>
                            <Form onSubmit={handleCreateOrUpdate}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Blog title"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Blog description"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Markdown-friendly blog content"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Blog Identifier</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.blogIdentifier}
                                        onChange={(e) => setFormData({ ...formData, blogIdentifier: e.target.value })}
                                        placeholder="my-blog-post"
                                        required
                                        disabled={!!editingBlog}
                                    />
                                    <Form.Text className="text-secondary">Lowercase letters, numbers and dashes only.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Base URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.baseURL}
                                        onChange={(e) => setFormData({ ...formData, baseURL: e.target.value })}
                                        placeholder="https://example.com/blogs/"
                                    />
                                    <Form.Text className="text-secondary">Leave empty to store null. Add a trailing / for RSS path-style links.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light">Publish Date</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.pubDate}
                                        onChange={(e) => setFormData({ ...formData, pubDate: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Use Custom Edit Date"
                                        checked={useCustomEditDate}
                                        onChange={(e) => {
                                            setUseCustomEditDate(e.target.checked);
                                            if (!e.target.checked) {
                                                setFormData({ ...formData, editDate: '' });
                                            }
                                        }}
                                        className="text-light"
                                    />
                                </Form.Group>

                                {useCustomEditDate && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Edit Date</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            value={formData.editDate}
                                            onChange={(e) => setFormData({ ...formData, editDate: e.target.value })}
                                        />
                                        <Form.Text className="text-secondary">Leave disabled to let the server set editDate automatically.</Form.Text>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Hidden"
                                        checked={formData.hidden}
                                        onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
                                        className="text-light"
                                    />
                                </Form.Group>

                                <div className="btn-group" role="group">
                                    <Button variant="primary" type="submit" disabled={!canCreate || (!!editingBlog && !canEditOrDelete)}>
                                        {editingBlog ? 'Update Blog' : 'Create Blog'}
                                    </Button>
                                    {(editingBlog || formData.title || formData.description || formData.content || formData.blogIdentifier || formData.baseURL || formData.pubDate || formData.editDate || formData.hidden || useCustomEditDate) && (
                                        <Button variant="secondary" onClick={clearForm}>
                                            {editingBlog ? 'Deselect Blog' : 'Clear'}
                                        </Button>
                                    )}
                                </div>

                                {errorMessage && <Alert className="mt-3 mb-0" variant="danger">{errorMessage}</Alert>}
                                {successMessage && <Alert className="mt-3 mb-0" variant="success">{successMessage}</Alert>}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="bg-dark">
                        <Card.Body>
                            <Card.Title className="text-light">Existing Blogs</Card.Title>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-light">Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Search by title, id, identifier, description or baseURL"
                                />
                            </Form.Group>

                            <Row className="g-2 mb-3">
                                <Col sm={4}>
                                    <Form.Label className="text-light">Limit</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        value={limit}
                                        onChange={(e) => setLimitFilter(Number(e.target.value) || 1)}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <Form.Label className="text-light">Skip</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={skip}
                                        onChange={(e) => setSkipFilter(Number(e.target.value) || 0)}
                                    />
                                </Col>
                                <Col sm={4} className="d-flex align-items-end">
                                    <Button variant="outline-light" className="w-100" onClick={fetchBlogs} disabled={isLoading}>
                                        {isLoading ? 'Loading...' : 'Refresh'}
                                    </Button>
                                </Col>
                            </Row>

                            <Button
                                as="a"
                                href="https://api.oldmartijntje.nl/getData/blogs/rss.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="info"
                                className="mb-3"
                            >
                                View RSS File
                            </Button>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    className="text-light"
                                    checked={includeHidden}
                                    onChange={(e) => setHiddenFilter(e.target.checked)}
                                    label="Include hidden blogs in query"
                                />
                            </Form.Group>

                            <p className="text-light">Showing {filteredBlogs.length} of {blogs.length} loaded blogs. Server total: {totalCount || 0}</p>

                            {filteredBlogs.map((blog) => (
                                <Card className="mb-2" key={blog._id}>
                                    <Card.Body className="card text-bg-dark">
                                        <Card.Text>
                                            <strong>Title:</strong> {blog.title}<br />
                                            <strong>Identifier:</strong> {blog.blogIdentifier}<br />
                                            <strong>ID:</strong> {blog._id}<br />
                                            <strong>Hidden:</strong> {blog.hidden ? 'Yes' : 'No'}<br />
                                            <strong>Views:</strong> {blog.views ?? 'n/a'}<br />
                                            <strong>Publish Date:</strong> {new Date(blog.pubDate).toLocaleString()}<br />
                                            <strong>Edit Date:</strong> {new Date(blog.editDate).toLocaleString()}<br />
                                            <strong>Base URL:</strong> {blog.baseURL || 'null'}<br />
                                            <strong>Description:</strong> {blog.description}
                                        </Card.Text>
                                        <div className="btn-group" role="group">
                                            {blog.baseURL && (
                                                <Button
                                                    as="a"
                                                    href={buildBlogViewUrl(blog)}
                                                    variant="info"
                                                >
                                                    View Blog
                                                </Button>
                                            )}
                                            <Button variant="secondary" onClick={() => handleEdit(blog)} disabled={!canEditOrDelete}>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDelete(blog._id)}
                                                disabled={!canEditOrDelete}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BlogsEditorPage;
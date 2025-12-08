import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container, Row, Col, Table, Alert, Spinner, Navbar, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ServerConnector from '../../services/ServerConnector';
import { getSearchFilters, setSearchFilters } from '../../helpers/localstorage';
import AdminPathsPopup from '../../components/buttons/adminSelectPaths';

interface UserPageProps {
    userProfile?: any;
}

interface SecurityFlag {
    _id: string;
    ipAddress: string;
    riskLevel: number;
    dateTime: string;
    description: string;
    fileName: string;
    userId: {
        _id: string;
        username: string;
    } | null;
    additionalData: any;
    resolved: boolean;
    __v: number;
}

interface SecurityFlagsResponse {
    success: boolean;
    data: SecurityFlag[];
    pagination: {
        limit: number;
        skip: number;
    };
    appliedFilters?: {
        descriptionFilter?: string;
        userFilter?: string;
        ipFilter?: string;
        fileFilter?: string;
        additionalDataFilter?: string;
        dateTimeFilter?: string;
    };
}

const SecurityFlagsPage: React.FC<UserPageProps> = ({ userProfile }) => {
    const [securityFlags, setSecurityFlags] = useState<SecurityFlag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Query parameters state - load from localStorage
    const [riskLevel, setRiskLevel] = useState<number | null>(getSearchFilters('securityFlags_riskLevel') || null);
    const [minRiskLevel, setMinRiskLevel] = useState<boolean>(getSearchFilters('securityFlags_minRiskLevel') || false);
    const [resolved, setResolved] = useState<boolean | null>(() => {
        const saved = getSearchFilters('securityFlags_resolved');
        return saved === '' ? null : saved === 'true';
    });
    const [limit, setLimit] = useState(getSearchFilters('securityFlags_limit') || 30);
    const [skip, setSkip] = useState(0);
    const [descriptionFilter, setDescriptionFilter] = useState(getSearchFilters('securityFlags_descriptionFilter') || '');
    const [userFilter, setUserFilter] = useState(getSearchFilters('securityFlags_userFilter') || '');
    const [ipFilter, setIpFilter] = useState(getSearchFilters('securityFlags_ipFilter') || '');
    const [fileFilter, setFileFilter] = useState(getSearchFilters('securityFlags_fileFilter') || '');
    const [additionalDataFilter, setAdditionalDataFilter] = useState(getSearchFilters('securityFlags_additionalDataFilter') || '');
    const [dateTimeFilter, setDateTimeFilter] = useState(getSearchFilters('securityFlags_dateTimeFilter') || '');

    // UI state - load from localStorage
    const [enableRiskLevel, setEnableRiskLevel] = useState(getSearchFilters('securityFlags_enableRiskLevel') || false);
    const [enableResolved, setEnableResolved] = useState(getSearchFilters('securityFlags_enableResolved') || false);
    const [enableDescriptionFilter, setEnableDescriptionFilter] = useState(getSearchFilters('securityFlags_enableDescriptionFilter') || false);
    const [enableUserFilter, setEnableUserFilter] = useState(getSearchFilters('securityFlags_enableUserFilter') || false);
    const [enableIpFilter, setEnableIpFilter] = useState(getSearchFilters('securityFlags_enableIpFilter') || false);
    const [enableFileFilter, setEnableFileFilter] = useState(getSearchFilters('securityFlags_enableFileFilter') || false);
    const [enableAdditionalDataFilter, setEnableAdditionalDataFilter] = useState(getSearchFilters('securityFlags_enableAdditionalDataFilter') || false);
    const [enableDateTimeFilter, setEnableDateTimeFilter] = useState(getSearchFilters('securityFlags_enableDateTimeFilter') || false);
    const [currentPage, setCurrentPage] = useState(1);
    const [resolvingFlags, setResolvingFlags] = useState<Set<string>>(new Set());
    const [appliedFilters, setAppliedFilters] = useState<any>(null);

    useEffect(() => {
        fetchSecurityFlags();
    }, []);

    useEffect(() => {
        fetchSecurityFlags();
    }, [skip, limit]);

    const fetchSecurityFlags = async () => {
        setLoading(true);
        setError('');

        try {
            const userData = ServerConnector.getUserData();
            if (!userData.sessionToken) {
                setError('No session token found. Please log in again.');
                setLoading(false);
                return;
            }

            // Build query parameters
            const queryParams: { [key: string]: string } = {
                sessionToken: userData.sessionToken,
                limit: limit.toString(),
                skip: skip.toString(),
            };

            if (enableRiskLevel && riskLevel !== null) {
                queryParams.riskLevel = riskLevel.toString();
                queryParams.minRiskLevel = minRiskLevel.toString();
            }

            if (enableResolved && resolved !== null) {
                queryParams.resolved = resolved.toString();
            }

            if (enableDescriptionFilter && descriptionFilter.trim()) {
                queryParams.descriptionFilter = descriptionFilter.trim();
            }

            if (enableUserFilter && userFilter.trim()) {
                queryParams.userFilter = userFilter.trim();
            }

            if (enableIpFilter && ipFilter.trim()) {
                queryParams.ipFilter = ipFilter.trim();
            }

            if (enableFileFilter && fileFilter.trim()) {
                queryParams.fileFilter = fileFilter.trim();
            }

            if (enableAdditionalDataFilter && additionalDataFilter.trim()) {
                queryParams.additionalDataFilter = additionalDataFilter.trim();
            }

            if (enableDateTimeFilter && dateTimeFilter.trim()) {
                queryParams.dateTimeFilter = dateTimeFilter.trim();
            }

            const url = ServerConnector.encodeQueryData(queryParams, 'https://api.oldmartijntje.nl/security-flags/');

            const serverConnector = new ServerConnector();

            // Disable caching for this request
            await serverConnector.fetchData(
                `${url}&_t=${Date.now()}`, // Add timestamp to prevent caching
                'GET',
                '{}',
                (response: SecurityFlagsResponse) => {
                    setSecurityFlags(response.data);
                    setAppliedFilters(response.appliedFilters || null);
                    setLoading(false);
                },
                (error: any) => {
                    setError(`Failed to fetch security flags: ${error.message || 'Unknown error'}`);
                    setLoading(false);
                }
            );
        } catch (err) {
            setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSkip(0);
        setCurrentPage(1);
        saveFiltersToStorage();
        fetchSecurityFlags();
    };

    const handlePageChange = (newPage: number) => {
        const newSkip = (newPage - 1) * limit;
        setSkip(newSkip);
        setCurrentPage(newPage);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getRiskLevelColor = (level: number) => {
        if (level <= 2) return 'success';
        if (level <= 4) return 'warning';
        return 'danger';
    };

    const saveFiltersToStorage = () => {
        setSearchFilters('securityFlags_riskLevel', riskLevel);
        setSearchFilters('securityFlags_minRiskLevel', minRiskLevel);
        setSearchFilters('securityFlags_resolved', resolved?.toString() || '');
        setSearchFilters('securityFlags_limit', limit);
        setSearchFilters('securityFlags_descriptionFilter', descriptionFilter);
        setSearchFilters('securityFlags_userFilter', userFilter);
        setSearchFilters('securityFlags_ipFilter', ipFilter);
        setSearchFilters('securityFlags_fileFilter', fileFilter);
        setSearchFilters('securityFlags_additionalDataFilter', additionalDataFilter);
        setSearchFilters('securityFlags_dateTimeFilter', dateTimeFilter);
        setSearchFilters('securityFlags_enableRiskLevel', enableRiskLevel);
        setSearchFilters('securityFlags_enableResolved', enableResolved);
        setSearchFilters('securityFlags_enableDescriptionFilter', enableDescriptionFilter);
        setSearchFilters('securityFlags_enableUserFilter', enableUserFilter);
        setSearchFilters('securityFlags_enableIpFilter', enableIpFilter);
        setSearchFilters('securityFlags_enableFileFilter', enableFileFilter);
        setSearchFilters('securityFlags_enableAdditionalDataFilter', enableAdditionalDataFilter);
        setSearchFilters('securityFlags_enableDateTimeFilter', enableDateTimeFilter);
    };

    const clearAllFilters = () => {
        setRiskLevel(null);
        setMinRiskLevel(false);
        setResolved(null);
        setLimit(30);
        setDescriptionFilter('');
        setUserFilter('');
        setIpFilter('');
        setFileFilter('');
        setAdditionalDataFilter('');
        setDateTimeFilter('');
        setEnableRiskLevel(false);
        setEnableResolved(false);
        setEnableDescriptionFilter(false);
        setEnableUserFilter(false);
        setEnableIpFilter(false);
        setEnableFileFilter(false);
        setEnableAdditionalDataFilter(false);
        setEnableDateTimeFilter(false);
        setSkip(0);
        setCurrentPage(1);

        // Clear from localStorage
        const filterKeys = [
            'securityFlags_riskLevel', 'securityFlags_minRiskLevel', 'securityFlags_resolved', 'securityFlags_limit',
            'securityFlags_descriptionFilter', 'securityFlags_userFilter', 'securityFlags_ipFilter',
            'securityFlags_fileFilter', 'securityFlags_additionalDataFilter', 'securityFlags_dateTimeFilter',
            'securityFlags_enableRiskLevel', 'securityFlags_enableResolved', 'securityFlags_enableDescriptionFilter',
            'securityFlags_enableUserFilter', 'securityFlags_enableIpFilter', 'securityFlags_enableFileFilter',
            'securityFlags_enableAdditionalDataFilter', 'securityFlags_enableDateTimeFilter'
        ];
        filterKeys.forEach(key => setSearchFilters(key, ''));
    }; const resolveFlag = async (flagId: string) => {
        try {
            const userData = ServerConnector.getUserData();
            if (!userData.sessionToken) {
                setError('No session token found. Please log in again.');
                return;
            }

            setResolvingFlags(prev => new Set(prev).add(flagId));

            const serverConnector = new ServerConnector();

            await serverConnector.fetchData(
                `https://api.oldmartijntje.nl/security-flags/${flagId}/resolve`,
                'PUT',
                JSON.stringify({ sessionToken: userData.sessionToken }),
                (response: any) => {
                    console.log('Flag resolved successfully:', response);
                    // Update the flag in the local state
                    setSecurityFlags(prev =>
                        prev.map(flag =>
                            flag._id === flagId
                                ? { ...flag, resolved: true }
                                : flag
                        )
                    );
                    setResolvingFlags(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(flagId);
                        return newSet;
                    });
                },
                (error: any) => {
                    setError(`Failed to resolve flag: ${error.message || 'Unknown error'}`);
                    setResolvingFlags(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(flagId);
                        return newSet;
                    });
                }
            );
        } catch (err) {
            setError(`Error resolving flag: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setResolvingFlags(prev => {
                const newSet = new Set(prev);
                newSet.delete(flagId);
                return newSet;
            });
        }
    };

    return (
        <Container fluid className="p-4">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm" style={{ padding: '8px 16px', justifyContent: "center" }}>
                <Nav className="ml-auto">
                    <Col className='flex'>
                        <h1 className="text-center text-light inline"><AdminPathsPopup userProfile={userProfile} title="Security-Flags"></AdminPathsPopup></h1>
                        <h1 className="text-center text-light inline" style={{ padding: "8px 0" }}>Manager</h1>
                    </Col>
                </Nav>
            </Navbar>

            {/* Search Filters */}
            <Card className="mb-4 bg-dark text-light border-secondary">
                <Card.Header className="bg-dark border-secondary">
                    <h5>Filters</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6} lg={3}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-risk-level"
                                    label="Filter by Risk Level"
                                    checked={enableRiskLevel}
                                    onChange={(e) => setEnableRiskLevel(e.target.checked)}
                                />
                                <Form.Control
                                    type="number"
                                    placeholder="Risk Level"
                                    value={riskLevel || ''}
                                    onChange={(e) => setRiskLevel(e.target.value ? parseInt(e.target.value) : null)}
                                    disabled={!enableRiskLevel}
                                    min="1"
                                    max="10"
                                    className={!enableRiskLevel ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="min-risk-level"
                                    label="Use as minimum risk level"
                                    checked={minRiskLevel}
                                    onChange={(e) => setMinRiskLevel(e.target.checked)}
                                    disabled={!enableRiskLevel}
                                    className={`mt-2 ${!enableRiskLevel ? 'opacity-50' : ''}`}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={3}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-resolved"
                                    label="Filter by Resolution Status"
                                    checked={enableResolved}
                                    onChange={(e) => setEnableResolved(e.target.checked)}
                                />
                                <Form.Select
                                    value={resolved === null ? '' : resolved.toString()}
                                    onChange={(e) => setResolved(e.target.value === '' ? null : e.target.value === 'true')}
                                    disabled={!enableResolved}
                                    className={!enableResolved ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                >
                                    <option value="">Select status</option>
                                    <option value="false">Unresolved</option>
                                    <option value="true">Resolved</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Limit</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(parseInt(e.target.value) || 30)}
                                    min="1"
                                    max="100"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Skip</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={skip}
                                    onChange={(e) => setSkip(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </Form.Group>
                        </Col>

                        <Col lg={2} className="d-flex align-items-end">
                            <div className="d-flex flex-column gap-2 w-100">
                                <Button
                                    variant="primary"
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-100"
                                    size="sm"
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={clearAllFilters}
                                    disabled={loading}
                                    className="w-100 mb-3"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {/* Additional Filters Row */}
                    <Row>
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-description-filter"
                                    label="Filter by Description"
                                    checked={enableDescriptionFilter}
                                    onChange={(e) => setEnableDescriptionFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Description contains..."
                                    value={descriptionFilter}
                                    onChange={(e) => setDescriptionFilter(e.target.value)}
                                    disabled={!enableDescriptionFilter}
                                    className={!enableDescriptionFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-user-filter"
                                    label="Filter by User"
                                    checked={enableUserFilter}
                                    onChange={(e) => setEnableUserFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Username contains..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    disabled={!enableUserFilter}
                                    className={!enableUserFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-ip-filter"
                                    label="Filter by IP Address"
                                    checked={enableIpFilter}
                                    onChange={(e) => setEnableIpFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="IP address contains..."
                                    value={ipFilter}
                                    onChange={(e) => setIpFilter(e.target.value)}
                                    disabled={!enableIpFilter}
                                    className={!enableIpFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-file-filter"
                                    label="Filter by File"
                                    checked={enableFileFilter}
                                    onChange={(e) => setEnableFileFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Filename contains..."
                                    value={fileFilter}
                                    onChange={(e) => setFileFilter(e.target.value)}
                                    disabled={!enableFileFilter}
                                    className={!enableFileFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-additional-data-filter"
                                    label="Filter by Additional Data"
                                    checked={enableAdditionalDataFilter}
                                    onChange={(e) => setEnableAdditionalDataFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Additional data contains..."
                                    value={additionalDataFilter}
                                    onChange={(e) => setAdditionalDataFilter(e.target.value)}
                                    disabled={!enableAdditionalDataFilter}
                                    className={!enableAdditionalDataFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="enable-datetime-filter"
                                    label="Filter by Date/Time"
                                    checked={enableDateTimeFilter}
                                    onChange={(e) => setEnableDateTimeFilter(e.target.checked)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Date/time contains..."
                                    value={dateTimeFilter}
                                    onChange={(e) => setDateTimeFilter(e.target.value)}
                                    disabled={!enableDateTimeFilter}
                                    className={!enableDateTimeFilter ? 'text-muted bg-dark border-secondary opacity-50' : ''}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Results Table */}
            <Card className="bg-dark text-light border-secondary">
                <Card.Header className="bg-dark border-secondary">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <h5>Security Flags ({securityFlags.length} results)</h5>
                            {appliedFilters && Object.keys(appliedFilters).length > 0 && (
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="applied-filters-tooltip">
                                            <strong>Applied Filters:</strong><br />
                                            {Object.entries(appliedFilters)
                                                .filter(([_, value]) => value && String(value).trim() !== '')
                                                .map(([key, value]) => (
                                                    <div key={key}>
                                                        {key.replace('Filter', '')}: {String(value)}
                                                    </div>
                                                ))
                                            }
                                        </Tooltip>
                                    }
                                >
                                    <span className="badge bg-info text-dark" style={{ cursor: 'pointer' }}>
                                        Filtered
                                    </span>
                                </OverlayTrigger>
                            )}
                        </div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={fetchSecurityFlags}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : securityFlags.length === 0 ? (
                        <div className="text-center py-4 text-light">
                            No security flags found matching the current filters.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>Date/Time</th>
                                        <th>Risk Level</th>
                                        <th>Description</th>
                                        <th>User</th>
                                        <th>IP Address</th>
                                        <th>File</th>
                                        <th>Status</th>
                                        <th>Additional Data</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {securityFlags.map((flag) => (
                                        <tr key={flag._id}>
                                            <td>
                                                <small>{formatDate(flag.dateTime)}</small>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${getRiskLevelColor(flag.riskLevel)}`}>
                                                    {flag.riskLevel}
                                                </span>
                                            </td>
                                            <td>{flag.description}</td>
                                            <td>
                                                {flag.userId ? (
                                                    <div>
                                                        <strong>{flag.userId.username}</strong>
                                                        <br />
                                                        <small className="text-light opacity-75">{flag.userId._id}</small>
                                                    </div>
                                                ) : (
                                                    <span className="text-light opacity-75">No user</span>
                                                )}
                                            </td>
                                            <td>
                                                <code>{flag.ipAddress}</code>
                                            </td>
                                            <td>
                                                <code>{flag.fileName}</code>
                                            </td>
                                            <td>
                                                <span className={`badge ${flag.resolved ? 'bg-success' : 'bg-danger'}`}>
                                                    {flag.resolved ? 'Resolved' : 'Unresolved'}
                                                </span>
                                            </td>
                                            <td>
                                                {flag.additionalData && Object.keys(flag.additionalData).length > 0 ? (
                                                    <details>
                                                        <summary>View Data</summary>
                                                        <pre className="mt-2 bg-dark text-light border border-secondary rounded p-2" style={{ fontSize: '0.8em', maxHeight: '200px', overflow: 'auto' }}>
                                                            {JSON.stringify(flag.additionalData, null, 2)}
                                                        </pre>
                                                    </details>
                                                ) : (
                                                    <span className="text-light opacity-75">No additional data</span>
                                                )}
                                            </td>
                                            <td>
                                                {!flag.resolved ? (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => resolveFlag(flag._id)}
                                                        disabled={resolvingFlags.has(flag._id)}
                                                    >
                                                        {resolvingFlags.has(flag._id) ? (
                                                            <Spinner animation="border" size="sm" />
                                                        ) : (
                                                            'Resolve'
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <span className="text-success">✓ Resolved</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination Controls - Show if there are results OR we're not on page 1 */}
                    {(securityFlags.length > 0 || currentPage > 1) && !loading && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="text-light opacity-75">
                                {securityFlags.length > 0 ? (
                                    <>Showing {skip + 1} to {skip + securityFlags.length} results</>
                                ) : (
                                    <>No results on page {currentPage}</>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || loading}
                                >
                                    Previous
                                </Button>

                                <span className="px-3 py-1 bg-secondary border-secondary text-light rounded">
                                    Page {currentPage}
                                </span>

                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={securityFlags.length < limit || loading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SecurityFlagsPage;
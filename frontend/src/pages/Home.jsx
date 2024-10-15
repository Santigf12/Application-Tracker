import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container, Divider, Grid, Header, Menu, Pagination, Search, Segment, Statistic, Table } from "semantic-ui-react";
import { getAllApplications } from "../features/applications/applicationsSlice";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //Applications array from Redux store
    const { applications, isLoading } = useSelector((state) => state.applications);

    // State for sorting
    const [sortedColumn, setSortedColumn] = useState('added');
    const [sortDirection, setSortDirection] = useState('descending');
    const [sortedApplications, setSortedApplications] = useState([]);

    // State for pagination
    const [activePage, setActivePage] = useState(1);

    // State for filtering by status
    const [filterValue, setFilterValue] = useState('');

    // New state for filtering by time frame
    const [timeFilter, setTimeFilter] = useState('');

    // State for search term and results
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        dispatch(getAllApplications());
    }, [dispatch]);

    useEffect(() => {
        // Sorting function
        const sorted = [...applications].sort((a, b) => {
            if (sortedColumn === 'added' || sortedColumn === 'applied') {
                const dateA = DateTime.fromFormat(a[sortedColumn], 'yyyy-MM-dd HH:mm:ss');
                const dateB = DateTime.fromFormat(b[sortedColumn], 'yyyy-MM-dd HH:mm:ss');
                return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
            } else {
                return sortDirection === 'ascending' ? a[sortedColumn].localeCompare(b[sortedColumn]) : b[sortedColumn].localeCompare(a[sortedColumn]);
            }
        });
        setSortedApplications(sorted);
    }, [applications, sortedColumn, sortDirection]);

    const handleSort = (column) => {
        if (sortedColumn === column) {
            setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
        } else {
            setSortedColumn(column);
            setSortDirection('ascending');
        }
    };

    const formatDates = (date) => {
        return DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss').toLocaleString(DateTime.DATE_FULL);
    };

    const isOverThreeWeeks = (date) => {
        if (date === null) { return false };
        const applicationDate = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss');
        const threeWeeksAgo = DateTime.now().minus({ weeks: 3 });
        return applicationDate < threeWeeksAgo;
    };

    // Time frame filter logic
    const filterByTimeFrame = (application) => {
        if (!application.applied) return true;  // Show if no applied date

        const appliedDate = DateTime.fromFormat(application.applied, 'yyyy-MM-dd HH:mm:ss');
        const now = DateTime.now();

        switch (timeFilter) {
            case 'week':
                return appliedDate >= now.minus({ weeks: 1 });
            case 'twoWeeks':
                return appliedDate >= now.minus({ weeks: 2 });
            case 'threeWeeks':
                return appliedDate >= now.minus({ weeks: 3 });
            case 'month':
                return appliedDate >= now.minus({ months: 1 });
            default:
                return true;
        }
    };

    const handlePageChange = (e, { activePage }) => {
        setActivePage(activePage);
    };

    const filteredApplications = sortedApplications
        .filter((application) => {
            if (filterValue === '') return true;
            return application.status === filterValue;
        }).filter(filterByTimeFrame)
    ;

    const itemsPerPage = 14;
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const applicationsToDisplay = filteredApplications.slice(startIndex, endIndex);

    const handleSearchChange = (e, { value }) => {
        setSearchTerm(value);
        setIsSearching(true);

        if (value.length > 0) {
            const filteredResults = applications
                .filter(app => app.company.toLowerCase().includes(value.toLowerCase()))
                .map(app => ({
                    title: app.title,
                    description: app.company,
                    key: app.id,
                    id: app.id
                }));
            setSearchResults(filteredResults);
        } else {
            setSearchResults([]);
        }
        setIsSearching(false);
    };

    const handleResultSelect = (e, { result }) => {
        navigate(`/application/${result.id}`);
    };
    
    return (
        <Container style={{ minWidth: '85%' }}>
            <Segment basic loading={isLoading}>
                <Header textAlign="center" as='h1'>Job Application Tracker</Header>
                <Grid columns={2}>
                    <Grid.Column width={3}>
                        <Segment>
                            <Header dividing as='h3'>Application Tools</Header>
                            <Search
                                placeholder="Search by Company"
                                onSearchChange={handleSearchChange}
                                value={searchTerm}
                                results={searchResults}
                                onResultSelect={handleResultSelect}
                                loading={isSearching}
                                aligned='left'
                            />
                            <Divider hidden style={{ margin: 0}} />
                            <Header as='h4'>Filter by Status</Header>
                            <Menu fluid secondary vertical pointing>
                                <Menu.Item name='All' active={filterValue === ''} onClick={() => setFilterValue('')}>All</Menu.Item>
                                <Menu.Item name='Bookmarked' active={filterValue === 'Bookmarked'} onClick={() => setFilterValue('Bookmarked')}>Bookmarked</Menu.Item>
                                <Menu.Item name='Applied' active={filterValue === 'Applied'} onClick={() => setFilterValue('Applied')}>Applied</Menu.Item>
                                <Menu.Item name='Assessment' active={filterValue === 'Assessment'} onClick={() => setFilterValue('Assessment')}>Assessment</Menu.Item>
                                <Menu.Item name='Interview' active={filterValue === 'Interview'} onClick={() => setFilterValue('Interview')}>Interview</Menu.Item>
                            </Menu>
                            <Header as='h4'>Filter by Time</Header>
                            <Menu fluid secondary vertical pointing>
                                <Menu.Item name='All' active={timeFilter === ''} onClick={() => setTimeFilter('')}>All</Menu.Item>
                                <Menu.Item name='A week ago' onClick={() => setTimeFilter('week')} active={timeFilter === 'week'}>A week ago</Menu.Item>
                                <Menu.Item name='Two weeks ago' onClick={() => setTimeFilter('twoWeeks')} active={timeFilter === 'twoWeeks'}>Two weeks ago</Menu.Item>
                                <Menu.Item name='Three weeks ago' onClick={() => setTimeFilter('threeWeeks')} active={timeFilter === 'threeWeeks'}>Three weeks ago</Menu.Item>
                                <Menu.Item name='A month ago' onClick={() => setTimeFilter('month')} active={timeFilter === 'month'}>A month ago</Menu.Item>
                            </Menu>
                            <Header dividing as='h3' style={{ marginBottom: 2 }}>Statistics</Header>
                            <Statistic.Group widths='1'>
                                <Statistic>
                                    <Statistic.Value>{applications.length}</Statistic.Value>
                                    <Statistic.Label>Total Applications</Statistic.Label>
                                </Statistic>
                                {
                                    applications.filter(app => app.status === 'Applied').length > 0 &&
                                    <Statistic>
                                        <Statistic.Value>{applications.filter(app => app.status === 'Applied').length}</Statistic.Value>
                                        <Statistic.Label>Applied</Statistic.Label>
                                    </Statistic>
                                }
                                {
                                    applications.filter(app => app.status === 'Assessment').length > 0 &&
                                    <Statistic>
                                        <Statistic.Value>{applications.filter(app => app.status === 'Assessment').length}</Statistic.Value>
                                        <Statistic.Label>Assessment</Statistic.Label>
                                    </Statistic>
                                }
                                {
                                    applications.filter(app => app.status === 'Interview').length > 0 &&
                                    <Statistic>
                                        <Statistic.Value>{applications.filter(app => app.status === 'Interview').length}</Statistic.Value>
                                        <Statistic.Label>Interview</Statistic.Label>
                                    </Statistic>
                                }
                                {
                                    applications.filter(app => app.status === 'Offer').length > 0 &&
                                    <Statistic>
                                        <Statistic.Value>{applications.filter(app => app.status === 'Offer').length}</Statistic.Value>
                                        <Statistic.Label>Offer</Statistic.Label>
                                    </Statistic>
                                }
                            </Statistic.Group>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        <Segment>
                            <Grid columns={3}>
                                <Grid.Row>
                                    <Grid.Column >
                                        <Button fluid color='blue' size="medium" onClick={() => navigate('/create')}>Add Job</Button>
                                    </Grid.Column>
                                    <Grid.Column >
                                        <Button fluid color='green' size="medium">Edit Resume</Button>
                                    </Grid.Column>
                                    <Grid.Column >
                                        <Button fluid color='orange' size="medium">See Hidden Application</Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                        <Segment>
                            <Pagination
                                boundaryRange={0}
                                activePage={activePage}
                                onPageChange={handlePageChange}
                                siblingRange={1}
                                totalPages={totalPages}
                                ellipsisItem={null}
                                firstItem={null}
                                lastItem={null}
                                fluid
                            />
                        </Segment>
                        <Segment>
                            <Table celled selectable sortable>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'title' ? sortDirection : null}
                                            onClick={() => handleSort('title')}
                                        >
                                            Job Title
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'company' ? sortDirection : null}
                                            onClick={() => handleSort('company')}
                                        >
                                            Company
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'location' ? sortDirection : null}
                                            onClick={() => handleSort('location')}
                                        >
                                            Location
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'added' ? sortDirection : null}
                                            onClick={() => handleSort('added')}
                                        >
                                            Added
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'applied' ? sortDirection : null}
                                            onClick={() => handleSort('applied')}
                                        >
                                            Applied
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            sorted={sortedColumn === 'status' ? sortDirection : null}
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {
                                        applicationsToDisplay.map((application) => (
                                            <Table.Row key={application.id} onClick={() => navigate(`/application/${application.id}`)} warning={isOverThreeWeeks(application.applied ? application.applied : null)}>
                                                <Table.Cell>{application.title}</Table.Cell>
                                                <Table.Cell>{application.company}</Table.Cell>
                                                <Table.Cell>{application.location}</Table.Cell>
                                                <Table.Cell>{formatDates(application.added)}</Table.Cell>
                                                <Table.Cell>{application.applied ? formatDates(application.applied) : 'N/A'}</Table.Cell>
                                                <Table.Cell>{application.status}</Table.Cell>
                                            </Table.Row>
                                        ))
                                    }
                                </Table.Body>
                            </Table>
                        </Segment>

                    </Grid.Column>
                </Grid>
            </Segment>
        </Container>
    );
}

export default Home;

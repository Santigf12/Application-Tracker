import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Grid, Header, Pagination, Search, Segment, Table } from "semantic-ui-react";
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
    const itemsPerPage = 12;
    const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);

    // State for filtering by status
    const [filterValue, setFilterValue] = useState('');

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

    const handlePageChange = (e, { activePage }) => {
        setActivePage(activePage);
    };

    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const applicationsToDisplay = sortedApplications.filter((application) => {
        if (filterValue === '') {
            return true;
        }
        return application.status === filterValue;
    }).slice(startIndex, endIndex);

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
        <Container style={{ marginTop: '7em', minWidth: '70%'}}>
            <Segment basic loading={isLoading}>
                <Header textAlign="center" as='h1'>Job Application Tracker</Header>
                
                <Segment>
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column >
                                <Search
                                    fluid
                                    placeholder="Search Jobs"
                                    onSearchChange={handleSearchChange}
                                    value={searchTerm}
                                    results={searchResults}
                                    onResultSelect={handleResultSelect}
                                    loading={isSearching}
                                    aligned='left'
                                />
                            </Grid.Column>
                            <Grid.Column >
                                <Dropdown placeholder='Filter By' 
                                    fluid 
                                    selection 
                                    clearable
                                    value={filterValue}
                                    onChange={(e, { value }) => setFilterValue(value)}
                                    options={[
                                    { key: '1', text: 'Applied', value: 'Applied' },
                                    { key: '2', text: 'Assessment', value: 'Assessment' },
                                    { key: '3', text: 'Interview', value: 'Interview' },
                                    { key: '4', text: 'Offer', value: 'Offer' },
                                    { key: '5', text: 'Rejected', value: 'Rejected' },
                                ]} />
                            </Grid.Column>
                            <Grid.Column >
                                <Button fluid color='blue' size="medium" onClick={() => navigate('/create')}>Add Job</Button>
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
            </Segment>
        </Container>
    );
}

export default Home;

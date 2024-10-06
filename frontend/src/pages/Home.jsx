import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Grid, Header, Search, Segment, Table } from "semantic-ui-react";
import { getAllApplications } from "../features/applications/applicationsSlice";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { applications, isLoading } = useSelector((state) => state.applications);

    const [sortedColumn, setSortedColumn] = useState('added');
    const [sortDirection, setSortDirection] = useState('descending');
    const [sortedApplications, setSortedApplications] = useState([]);

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

    return (
        <Container style={{ marginTop: '7em', minWidth: '70%' }}>
            <Segment basic loading={isLoading}>
                <Header textAlign="center" as='h1'>Job Application Tracker</Header>
                
                <Segment>
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column >
                                <Search fluid placeholder="Search Jobs"/>
                            </Grid.Column>
                            <Grid.Column >
                                <Dropdown placeholder='Filter By' fluid selection clearable options={[
                                    { key: '1', text: 'All', value: 'all' },
                                    { key: '2', text: 'Applied', value: 'applied' },
                                    { key: '3', text: 'Interviewed', value: 'interviewed' },
                                    { key: '4', text: 'Rejected', value: 'rejected' },
                                    { key: '5', text: 'Offered', value: 'offered' }
                                ]} />
                            </Grid.Column>
                            <Grid.Column >
                                <Button fluid color='blue' size="medium" onClick={() => navigate('/create')}>Add Job</Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
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
                                sortedApplications.map((application) => (
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

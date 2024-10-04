import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Grid, Header, Input, Search, Segment, Table } from "semantic-ui-react";
import { getAllApplications } from "../features/applications/applicationsSlice";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { applications, isLoading } = useSelector((state) => state.applications);

    useEffect(() => {
        dispatch(getAllApplications());
    }, [dispatch]);


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
                    <Table celled selectable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Job Title</Table.HeaderCell>
                                <Table.HeaderCell>Company</Table.HeaderCell>
                                <Table.HeaderCell>Location</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                applications.map((application) => (
                                    <Table.Row key={application.id} onClick={() => navigate(`/application/${application.id}`)}>
                                        <Table.Cell>{application.title}</Table.Cell>
                                        <Table.Cell>{application.company}</Table.Cell>
                                        <Table.Cell>{application.location}</Table.Cell>
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

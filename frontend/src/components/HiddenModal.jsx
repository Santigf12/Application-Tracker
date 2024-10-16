import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Divider, Modal, Table } from 'semantic-ui-react';
import { getAllApplications } from "../features/applications/applicationsSlice";

const HiddenModal = ({open, onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { applications } = useSelector((state) => state.applications);

    const [sortedColumn, setSortedColumn] = useState('added');
    const [sortDirection, setSortDirection] = useState('descending');
    const [sortedApplications, setSortedApplications] = useState([]);


    useEffect(() => {
        dispatch(getAllApplications());
    }, []);

    // Filter applications that are either Rejected or Archived
    const applicationsToDisplay = applications.filter((application) => application.status === 'Rejected' || application.status === 'Archived');
    
    useEffect(() => {
        // Sorting function
        const sorted = applicationsToDisplay.sort((a, b) => {
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

    return (
        <Modal onClose={onClose}  open={open} size="large">
            <Modal.Header>Hidden Applications</Modal.Header>
            <Modal.Content>
                <Modal.Description>
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
                                            <Table.Row key={application.id} onClick={() => navigate(`/application/${application.id}`)}>
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
                </Modal.Description>
            </Modal.Content>
        </Modal>
    );

}

export default HiddenModal;
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button, Container, Divider, Dropdown, Form, Grid, Header, Icon, Popup, Rail, Segment, Step } from "semantic-ui-react";
import CoverModal from '../components/CoverModal';
import { deleteApplication, getApplicationById, getCoverLetter, updateApplication } from "../features/applications/applicationsSlice";

// Utility function to format and parse date
const formatDateTime = (date, time) => {
    return date && time ? DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm').toFormat('yyyy-MM-dd HH:mm:ss') : null;
};

const AppDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { application, isLoading } = useSelector((state) => state.applications);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        url: "",
        location: "",
        length: "",
        posting: "",
        status: "Bookmarked",  // Default to Bookmarked
        coverletter: ""
    });

    const [editMode, setEditMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [dateAdded, setDateAdded] = useState("");
    const [timeAdded, setTimeAdded] = useState("");
    const [dateApplied, setDateApplied] = useState("");
    const [timeApplied, setTimeApplied] = useState("");

    useEffect(() => {
        dispatch(getApplicationById(id));
        dispatch(getCoverLetter(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (application) {
            setFormData({
                title: application.title || "",
                company: application.company || "",
                url: application.url || "",
                location: application.location || "",
                length: application.length || "",
                posting: application.posting || "",
                status: application.status || "Bookmarked",
                coverletter: application.coverletter || ""
            });

            if (application?.added) {
                const addedDate = DateTime.fromFormat(application.added, 'yyyy-MM-dd HH:mm:ss');
                setDateAdded(addedDate.toFormat('yyyy-MM-dd'));
                setTimeAdded(addedDate.toFormat('HH:mm'));
            }
    
            if (application?.applied) {
                const appliedDate = DateTime.fromFormat(application.applied, 'yyyy-MM-dd HH:mm:ss');
                setDateApplied(appliedDate.toFormat('yyyy-MM-dd'));
                setTimeApplied(appliedDate.toFormat('HH:mm'));
            }
        }
    }, [application]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }, []);

    const handleDateChange = useCallback((e, { name, value }) => {
        if (name === 'dateadded') {
            setDateAdded(value);
        } else if (name === 'dateapplied') {
            setDateApplied(value);
        }
    }, []);

    const handleTimeChange = useCallback((e, { name, value }) => {
        if (name === 'timeadded') {
            setTimeAdded(value);
        } else if (name === 'timeapplied') {
            setTimeApplied(value);
        }
    }, []);

    const handleFormSubmit = useCallback(async () => {
        try {
            const added = formatDateTime(dateAdded, timeAdded);
            const applied = formatDateTime(dateApplied, timeApplied);
            const updatedFormData = { ...formData, added, applied };

            await dispatch(updateApplication({ id, application: updatedFormData })).unwrap();
            setEditMode(false);
            toast.success("Application updated successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }, [dateAdded, timeAdded, dateApplied, timeApplied, formData, id, dispatch]);

    const handleDelete = useCallback(async () => {
        try {
            await dispatch(deleteApplication(id)).unwrap();
            navigate("/");
            toast.success("Application deleted successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }, [id, dispatch, navigate]);

    const statusToStepMap = useMemo(() => ({
        Bookmarked: 0,
        Applied: 1,
        Assessment: 2,
        Interview: 3,
        Offer: 4,
    }), []);

    const handleStepClick = (status) => {
        if (editMode) {
            setFormData(prevData => ({ ...prevData, status }));
    
            if (status === "Applied") {
                const appliedDate = DateTime.local();
                setDateApplied(appliedDate.toFormat('yyyy-MM-dd'));
                setTimeApplied(appliedDate.toFormat('HH:mm'));
            }
        }
    };
    
    const stepOptions = ["Bookmarked", "Applied", "Assessment", "Interview", "Offer"];
    const currentStepIndex = useMemo(() => statusToStepMap[formData.status] || 0, [formData.status, statusToStepMap]);

    return (
        <Container style={{minWidth: '90%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>
                    Application Dashboard
                    <Header.Subheader>
                        <Link to="/"><Icon name="arrow left" />Back to Applications</Link>
                    </Header.Subheader>
                </Header>
                <Grid columns={2} stackable>
                    <Grid.Column width={3}>
                        <Segment>
                            <Segment>
                                <Header as='h3' dividing textAlign='center'>Actions</Header>
                                <Button.Group fluid size='large' vertical>
                                    <Button color={editMode ? 'black' : 'blue'} onClick={() => setEditMode(!editMode)} icon labelPosition='left'>
                                        <Icon name={editMode ? 'cancel' : 'edit'} />
                                        {editMode ? 'Cancel' : 'Edit'}
                                    </Button>
                                    {editMode && <Button color='orange' onClick={handleFormSubmit} icon labelPosition='left'>
                                        <Icon name='save' />
                                        Save</Button>}
                                </Button.Group>
                                <Divider hidden style={{ margin: 5 }} />
                                {formData.coverletter ? (
                                    <Button fluid color='green' size='large' disabled={editMode} onClick={() => setModalOpen(true)} icon labelPosition='left'>
                                        <Icon name='file alternate' />
                                        View Cover Letter</Button>
                                ) : (
                                    <Button fluid color='orange' size='large' disabled={editMode} onClick={() => setModalOpen(true)} icon labelPosition='left'>
                                        <Icon name='add' />
                                        Add Cover Letter</Button>
                                )}
                                <Divider hidden style={{ margin: 5 }} />
                                <Button color="red" fluid size='large' icon labelPosition='left' onClick={handleDelete}>
                                    <Icon name="trash" />
                                    Delete
                                </Button>
                            </Segment>
                            <Divider />
                            <Segment>
                                <Header as='h3' dividing textAlign='center'>
                                    Useful Links
                                    <Header.Subheader>Click to copy the link to clipboard</Header.Subheader>
                                </Header>
                                <Button fluid color='blue' icon labelPosition='left' onClick={() => window.open(formData.url, "_blank")}>
                                    <Icon name='linkify' />
                                    Posting URL
                                </Button>
                                <Divider hidden style={{ margin: 5 }} />
                                {/* Add linkedin personal link to clipboard to copy it once the button is clicked */}
                                <Button fluid color='linkedin' icon labelPosition='left' onClick={() => navigator.clipboard.writeText('https://www.linkedin.com/in/santiago-f-b50079219/')}>
                                    <Icon name='linkedin' />
                                    LinkedIn
                                </Button>
                                <Divider hidden style={{ margin: 5 }} />
                                <Button fluid toggle color='black' icon labelPosition='left' onClick={() => navigator.clipboard.writeText('https://github.com/Santigf12')}>
                                    <Icon name='github' />
                                    GitHub
                                </Button>
                                <Divider hidden style={{ margin: 5 }} />
                                <Button fluid color='teal' icon labelPosition='left' onClick={() => navigator.clipboard.writeText('https://santigf12.github.io/Portfolio/')}>
                                    <Icon name='user' />
                                    Portfolio
                                </Button>
                                <Divider hidden style={{ margin: 5 }} />
                                <Button fluid color='orange' icon labelPosition='left' onClick={() => navigator.clipboard.writeText('santiago.fuentes@ucalgary.ca')}>
                                    <Icon name='mail' />
                                    School Email
                                </Button>
                                <Divider hidden style={{ margin: 5 }} />
                                <Button fluid color='green' icon labelPosition='left' onClick={() => navigator.clipboard.writeText('fuentes.santiago@outlook.com')}>
                                    <Icon name='mail' />
                                    Personal Email
                                </Button>
                            </Segment>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        <Segment>
                            <Step.Group fluid size="small">
                                {stepOptions.map((status, index) => (
                                    <Step
                                        key={status}
                                        active={currentStepIndex === index}
                                        onClick={() => handleStepClick(status)}
                                        disabled={!editMode}
                                    >
                                        <Icon name={status === "Bookmarked" ? "bookmark" :
                                            status === "Applied" ? "paper plane" :
                                                status === "Assessment" ? "clipboard check" :
                                                    status === "Interview" ? "user" : "trophy"} />
                                        <Step.Content>
                                            <Step.Title>{status}</Step.Title>
                                        </Step.Content>
                                    </Step>
                                ))}
                            </Step.Group>
                        </Segment>
                        <Segment>
                            <Form size="large" loading={isLoading} onSubmit={handleFormSubmit}>
                                <Form.Group widths='equal'>
                                    <Form.Input
                                        fluid
                                        label='Date Added'
                                        name="dateadded"
                                        value={dateAdded}
                                        onChange={handleDateChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Input
                                        fluid
                                        label='Time Added'
                                        name="timeadded"
                                        value={timeAdded}
                                        onChange={handleTimeChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Input
                                        fluid
                                        label='Date Applied'
                                        name="dateapplied"
                                        value={dateApplied}
                                        onChange={handleDateChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Input
                                        fluid
                                        label='Time Applied'
                                        name="timeapplied"
                                        value={timeApplied}
                                        onChange={handleTimeChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Dropdown
                                        fluid
                                        selection
                                        label='Status'
                                        options={[
                                            { key: "Bookmarked", text: "Bookmarked", value: "Bookmarked" },
                                            { key: "Applied", text: "Applied", value: "Applied" },
                                            { key: "Assessment", text: "Assessment", value: "Assessment" },
                                            { key: "Interview", text: "Interview", value: "Interview" },
                                            { key: "Offer", text: "Offer", value: "Offer" },
                                            { key: "Rejected", text: "Rejected", value: "Rejected" },
                                            { key: "Archived", text: "Archived", value: "Archived" },
                                        ]}
                                        value={formData.status}
                                        onChange={(e, { value }) => setFormData(prevData => ({ ...prevData, status: value }))}
                                        readOnly={!editMode}
                                        disabled={!editMode}
                                    />
                                </Form.Group>
                            </Form>
                        </Segment>
                        <Segment>
                            <Form size="large" loading={isLoading} onSubmit={handleFormSubmit}>
                                <Form.Group widths='equal'>
                                    <Form.Input
                                        fluid
                                        label='Job Title'
                                        placeholder='Job Title'
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Input
                                        fluid
                                        label='Company'
                                        placeholder='Company'
                                        name="company"
                                        required
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Input
                                        fluid
                                        title='Click to open the posting URL'
                                        label='Posting URL'
                                        placeholder='Posting URL'
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                        onClick={() => {
                                            if (!editMode && formData.url) {
                                                window.open(formData.url, "_blank");
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Input
                                        fluid
                                        label='Location'
                                        placeholder='Location'
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                    <Form.Input
                                        fluid
                                        label='Length'
                                        placeholder='Length'
                                        name="length"
                                        required
                                        value={formData.length}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.TextArea
                                        label='Job description'
                                        placeholder='Add a description of the job'
                                        name="posting"
                                        required
                                        value={formData.posting}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                        style={{ minHeight: 400 }}
                                    />
                                </Form.Group>
                            </Form>
                        </Segment>
                        <CoverModal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            company={formData.company}
                            posting={formData.posting}
                        />
                    </Grid.Column>
                </Grid>
            </Segment>
        </Container>
    );
};

export default AppDashboard;
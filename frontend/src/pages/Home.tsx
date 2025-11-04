import { LightFilter, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, DatePicker, Descriptions, Radio, Row, Space, Tag, Tooltip, Typography } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { DateTime } from 'luxon';
import { Key, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { AppDispatch, RootState } from "../app/store";
import { Application, getAllApplications, updateApplication } from "../features/applications/applicationsSlice";

const provinceMap: Record<string, string> = {
    AB: "Alberta",
    BC: "British Columbia",
    MB: "Manitoba",
    NB: "New Brunswick",
    NL: "Newfoundland and Labrador",
    NS: "Nova Scotia",
    NT: "Northwest Territories",
    NU: "Nunavut",
    ON: "Ontario",
    PE: "Prince Edward Island",
    QC: "Quebec",
    SK: "Saskatchewan",
    YT: "Yukon",
    Remote: "Remote", // Adding Remote as an option
};


const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { applications, isLoading } = useSelector((state: RootState) => state.applications);

    const [selectedTab, setSelectedTab] = useState<string>("default");
    const [searchCompany, setSearchCompany] = useState<string>("");
    const [appliedDateRange, setAppliedDateRange] = useState<[string | null, string | null]>([null, null]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [multiSelectValue, setMultiSelectValue] = useState<string | undefined>(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

    // Get the current page from the URL, default to 1
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() }); // Update URL
    }

    useEffect(() => {
        dispatch(getAllApplications());
    }, [dispatch]);

    const formatDates = (date: string) => {
        if (!date) {
            return "";
        }
        return DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss').toLocaleString(DateTime.DATE_FULL);
    };

    const getFilteredApplications = () => {
        let filteredApps = applications;

        // Apply menu tab filtering
        if (selectedTab === "default") {
            filteredApps = filteredApps.filter(app => app.status !== "Archived" && app.status !== "Rejected");
        } else {
            filteredApps = filteredApps.filter(app => app.status === selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1));
        }

        // Apply search filtering on company name
        if (searchCompany.trim() !== "") {
            filteredApps = filteredApps.filter(app => app.company.toLowerCase().includes(searchCompany.toLowerCase()));
        }

        // Apply applied date range filter
        if (appliedDateRange[0] && appliedDateRange[1]) {
            const [start, end] = appliedDateRange.map(date => DateTime.fromISO(date!));
            filteredApps = filteredApps.filter(app => {
                const appliedDate = DateTime.fromFormat(app.applied, 'yyyy-MM-dd HH:mm:ss');
                return appliedDate >= start && appliedDate <= end;
            });
        }

        return filteredApps;
    };

    //function to generate provice array for filters, based on applications location data
    const generateProvinceArray = (applications: { location: string }[]) => {
        // Create a Set to store unique province abbreviations from applications
        const availableProvinces = new Set(
            applications.flatMap(app => app.location.split(', ').map(loc => loc.trim()))
        );

        // Filter provinceMap to include only those present in availableProvinces
        return Object.entries(provinceMap)
            .filter(([abbr]) => availableProvinces.has(abbr))
            .map(([abbr, name]) => ({
                text: name,
                value: abbr
            }));
    };


    const calculateDaysSinceApplied = (appliedDateStr: string | null): string => {
        if (!appliedDateStr) { return "Not Applied"; }

        const appliedDate = DateTime.fromFormat(appliedDateStr, 'yyyy-MM-dd HH:mm:ss');
        const currentDate = DateTime.now();
        const diff = Math.round(currentDate.diff(appliedDate, 'days').days);

        // Return the difference in days i.e 1 day ago, 2 days ago, etc.

        if (diff === 1) {
            return `${diff} day ago`;
        } else if (diff > 1) {
            return `${diff} days ago`;
        } else {
            return "Today";
        }
    };

    const columns = [
        {
            title: "Job Title",
            dataIndex: "title",
            key: "title",
            sorter: (a: { title: string; }, b: { title: any; }) => a.title.localeCompare(b.title),
        },
        {
            title: "Company",
            dataIndex: "company",
            key: "company",
            sorter: (a: { company: string; }, b: { company: any; }) => a.company.localeCompare(b.company),
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            filters: generateProvinceArray(applications),
            onFilter: (value: any, record: any) => record.location.includes(value as string),
            sorter: (a: { location: string; }, b: { location: any; }) => a.location.localeCompare(b.location),
        },
        {
            title: "Added",
            dataIndex: "added",
            key: "added",
            search: false,
            sorter: (a: { added: string; }, b: { added: any; }) => a.added.localeCompare(b.added),
            render: (_: any, record: { added: string; }) => <Typography.Text>{formatDates(record.added)}</Typography.Text>,
        },
        {
            title: "Applied",
            dataIndex: "applied",
            key: "applied",
            search: false,
            sorter: (a: { applied: string | null; }, b: { applied: string | null; }) => {
                if (!a.applied && !b.applied) return 0; // Both are null
                if (!a.applied) return 1; // Null values go last
                if (!b.applied) return -1; // Null values go last

                return a.applied.localeCompare(b.applied);
            },
            render: (_: any, record: { applied: string | null; }) => (
                <Typography.Text>
                    {record.applied ? formatDates(record.applied) : "Not Applied"}
                </Typography.Text>
            ),
            defaultSortOrder: 'descend' as SortOrder,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            search: false,
            render: (_: any, record: { status: string; }) => {
                const colorMap: Record<string, string> = {
                    "Bookmarked": "geekblue",
                    "Applied": "blue",
                    "Rejected": "red",
                    "Archived": "grey",
                    "Assessment": "purple",
                    "Interview": "orange",
                    "Offer": "green",
                };
                return <Tag bordered={false} color={colorMap[record.status] || "default"} style={{ width: '100%', textAlign: 'center' }}>{record.status}</Tag>;
            },
        },
        {
            title: "Application Age",
            key: "daysSinceApplied",
            search: false,
            render: (_: any, record: { applied: string; }) => <Typography.Text>{calculateDaysSinceApplied(record.applied)}</Typography.Text>,
            sorter: (a: { applied: string; }, b: { applied: string; }) =>
                DateTime.fromFormat(a.applied, 'yyyy-MM-dd HH:mm:ss')
                    .diff(DateTime.fromFormat(b.applied, 'yyyy-MM-dd HH:mm:ss'))
                    .as('days'),
        },
    ];

    const renderStatusBadge = (status: string, active: boolean) => {

        let num = 0
        if (status === "Default") {
            num = applications.filter((application) => application.status !== "Archived" && application.status !== "Rejected").length;
        } else {
            num = applications.filter((application) => application.status === status).length;
        }

        return <Badge count={num}
            style={{
                marginBlockStart: -2,
                marginInlineStart: 4,
                color: active ? '#1890FF' : '#999',
                backgroundColor: active ? '#E6F7FF' : '#eee',
            }}
        />;
    };

    const handleMultiSelect = async (selectedRows: Application[], status: string) => {
        if (selectedRows.length === 0) return;
    
        try {
            for (const record of selectedRows) {
                await dispatch(updateApplication({ id: record.id as string, application: { ...record, status } })).unwrap();
            }
            console.log(`Successfully updated ${selectedRows.length} applications to status: ${status}`);

        } catch (error) {
            console.error("Error updating applications:", error);
        } finally {
            dispatch(getAllApplications());
            setSelectedRowKeys([]);
        }
    };
    
    return (
        <Row gutter={[16, 0]} style={{ minHeight: "100%" }}>
            <Col flex="auto">
                <Card bordered={true} style={{ minHeight: 50, width: '100%', textAlign: "center" }}>
                    <ProTable<Application>
                        columns={columns}
                        dataSource={getFilteredApplications()}
                        loading={isLoading}
                        search={false}
                        rowKey="id"
                        size='small'
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys),
                            columnTitle: 'Select',    
                        }}
                        tableAlertRender={({ selectedRows }) => {
                            return (
                                <Space style={{ display: 'flex', alignContent: 'left', justifyContent: 'left' }}>
                                    <Button loading={isLoading} type="default" size='middle' onClick={() => handleMultiSelect(selectedRows, multiSelectValue || "Applied")}>Set Status</Button>
                                    <Radio.Group
                                        options={[
                                            { label: 'Applied', value: 'Applied' },
                                            { label: 'Assessment', value: 'Assessment' },
                                            { label: 'Interview', value: 'Interview' },
                                            { label: 'Offer', value: 'Offer' },
                                            { label: 'Rejected', value: 'Rejected' },
                                            { label: 'Archived', value: 'Archived' },
                                        ]}
                                        optionType="button"
                                        buttonStyle="solid"
                                        size="middle"
                                        defaultValue={selectedRows.length > 0 ? selectedRows[0].status : undefined}
                                        onChange={(e) => setMultiSelectValue(e.target.value)}
                                    />
                                    
                                </Space>
                            );
                        }}
                        pagination={{
                            pageSize: 14,
                            position: ['topLeft'],
                            current: currentPage,
                            onChange: handlePageChange,
                            style: { marginBottom: 15, marginTop: 0 },
                        }}
                        onRow={(record) => {
                            return {
                                onClick: (event) => {
                                    const target = event.target as HTMLElement;
                                    const isInsideSelectionColumn = target.closest(".ant-table-selection-column");
                        
                                    if (!isInsideSelectionColumn) {
                                        navigate(`/application/${record.id}?page=${currentPage}`);
                                    }
                                },
                            };
                        }}
                        
                        toolbar={{
                            search: {
                                placeholder: 'Search Company',
                                onSearch: (searchValue: string) => setSearchCompany(searchValue),
                                allowClear: true,
                            },
                            filter: (
                                <LightFilter>
                                    <DatePicker.RangePicker
                                        variant='outlined'
                                        style={{ width: '100%' }}
                                        onChange={(_, dateStrings) => {
                                            if (dateStrings[0] && dateStrings[1]) {
                                                setAppliedDateRange(dateStrings as [string, string]);
                                            } else {
                                                setAppliedDateRange([null, null]);
                                            }
                                        }}
                                    />
                                </LightFilter>
                            ),
                            menu: {
                                type: 'tab',
                                activeKey: selectedTab, // Active tab tracking
                                onChange: (key: Key | undefined) => setSelectedTab(key as string),
                                items: [
                                    { label: <Tooltip title="Excludes Rejected and Archived applications.">Default{renderStatusBadge("Default", selectedTab === "default")}</Tooltip>, key: 'default' },
                                    { label: <Tooltip title="Shows only rejected applications.">Rejected{renderStatusBadge("Rejected", selectedTab === "rejected")}</Tooltip>, key: 'rejected' },
                                    { label: <Tooltip title="Shows only archived applications.">Archived{renderStatusBadge("Archived", selectedTab === "archived")}</Tooltip>, key: 'archived' },
                                ],
                            }
                        }}
                        options={{
                            reload: () => dispatch(getAllApplications()),
                            density: false,
                            fullScreen: false,
                            setting: false,
                        }}

                        ghost={true}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default Home;



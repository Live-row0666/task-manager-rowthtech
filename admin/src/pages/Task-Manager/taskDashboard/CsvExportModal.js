import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects } from '../../../redux/actions';
import ToastHandle from '../../../constants/toaster/toaster';

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    // Define the columns we want to include in the CSV
    const columns = [
        { key: 'summary', header: 'Task Summary' },
        { key: 'project.name', header: 'Project' },
        { key: 'milestone.title', header: 'Milestone' },
        { key: 'sprint.sprintName', header: 'Sprint' },
        { key: 'status', header: 'Status' },
        { key: 'qastatus', header: 'QA Status' },
        { key: 'priority', header: 'Priority' },
        { key: 'assignee.name', header: 'Assignee' },
        { key: 'startDate', header: 'Start Date' },
        { key: 'dueDate', header: 'Due Date' },
        { key: 'estimatedTime', header: 'Estimated Hours' },
        { key: 'timeSpent', header: 'Time Spent' },
        { key: 'description', header: 'Description' }
    ];


    // Create header row
    const header = columns.map(col => `"${col.header}"`).join(',');

    // Helper function to get nested property values
    const getNestedValue = (obj, path) => {
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : '', obj);
    };

    // Format date fields
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    // Format description (remove HTML tags)
    const formatDescription = (html) => {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    // Format time spent in hh:mm:ss format
    const formatTimeSpent = (ms) => {
        if (!ms) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // Create data rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = '';

            // Handle special cases
            if (col.key === 'startDate' || col.key === 'dueDate') {
                value = formatDate(getNestedValue(item, col.key));
            } else if (col.key === 'description') {
                value = formatDescription(getNestedValue(item, col.key));
            } else if (col.key === 'timeSpent') {
                value = formatTimeSpent(getNestedValue(item, col.key));
            } else {
                value = getNestedValue(item, col.key);
            }

            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    }).join('\n');

    return `${header}\n${rows}`;
};

const CsvExportModal = ({
    show,
    onHide,
    projectId,
    assigneeId
}) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const projects = useSelector((state) => state?.getProject?.data?.data);

    const [csvLoading, setCsvLoading] = useState(false);
    const [csvData, setCsvData] = useState({
        project: null,
        startDate: '',
        endDate: '',
        milestone: null,
        sprint: null
    });

    const [milestones, setMilestones] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);
    const [sprintsLoading, setSprintsLoading] = useState(false);

    // Set initial project when modal opens
    useEffect(() => {
        if (show && projectId && projects?.length > 0) {
            const selectedProject = projects.find(p => p._id === projectId);
            if (selectedProject) {
                setCsvData(prev => ({
                    ...prev,
                    project: { value: selectedProject._id, label: selectedProject.name }
                }));
            }
        }
    }, [show, projectId, projects]);

    const handleCsvChange = (field, value) => {
        setCsvData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Load projects when modal opens
    useEffect(() => {
        if (show) {
            dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, ...(store?.Auth?.user?.role === 'QA' && { userId: store?.Auth?.user?.id }) }));
        }
    }, [show, dispatch]);
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    // Load milestones when project changes
    useEffect(() => {
        if (csvData.project?.value) {
            const fetchMilestones = async () => {
                setMilestonesLoading(true);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/milestone`, {
                        params: { project: csvData.project.value, isActive: true }
                    });
                    setMilestones(response.data.data || []);
                    // Clear milestone and sprint when project changes
                    if (csvData.milestone) {
                        setCsvData(prev => ({
                            ...prev,
                            milestone: null,
                            sprint: null
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching milestones:', error);
                    ToastHandle('error', 'Failed to load milestones');
                } finally {
                    setMilestonesLoading(false);
                }
            };
            fetchMilestones();
        } else {
            setMilestones([]);
        }
    }, [csvData.project]);

    // Load sprints when milestone is selected
    useEffect(() => {
        if (csvData.milestone) {
            const fetchSprints = async () => {
                setSprintsLoading(true);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/sprint`, {
                        params: { milestone: csvData.milestone.value, isActive: true }
                    });
                    setSprints(response.data.data || []);
                } catch (error) {
                    console.error('Error fetching sprints:', error);
                    ToastHandle('error', 'Failed to load sprints');
                } finally {
                    setSprintsLoading(false);
                }
            };
            fetchSprints();
        } else {
            setSprints([]);
        }
    }, [csvData.milestone]);

    const handleCsvDownload = async (e) => {
        e.preventDefault();
        if (!csvData.startDate || !csvData.endDate) {
            ToastHandle('error', 'Please select both start and end dates');
            return;
        }

        if (!csvData.project) {
            ToastHandle('error', 'Please select a project');
            return;
        }

        setCsvLoading(true);
        try {
            const params = {
                project: csvData.project.value,
                startDate: csvData.startDate,
                endDate: csvData.endDate,
                assignee: assigneeId || '',
                limit: 2000
            };

            if (csvData.milestone) {
                params.milestone = csvData.milestone.value;
            }

            if (csvData.sprint) {
                params.sprint = csvData.sprint.value;
            }

            // Get task data from API
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/v1/admin/task`, {
                params
            });

            // Check if we have data
            if (!response.data?.data || response.data.data.length === 0) {
                ToastHandle('info', 'No tasks found for the selected criteria');
                setCsvLoading(false);
                return;
            }

            // Convert JSON data to CSV
            const csvContent = convertToCSV(response.data.data);

            // Create a download link and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tasks-${csvData.project.label}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            ToastHandle('success', 'CSV downloaded successfully');
            onHide();
        } catch (error) {
            console.error('CSV download error:', error);
            ToastHandle('error', 'Failed to download CSV. Please try again.');
        } finally {
            setCsvLoading(false);
        }
    };

    const milestoneOptions = milestones.map(milestone => ({
        value: milestone._id,
        label: milestone.title
    }));

    const sprintOptions = sprints.map(sprint => ({
        value: sprint._id,
        label: sprint.sprintName
    }));

    const handleClose = () => {
        setCsvData({
            project: null,
            startDate: '',
            endDate: '',
            milestone: null,
            sprint: null
        });
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="md"
        >
            <Modal.Header className="py-2">
                <Modal.Title className="fs-5">Export Tasks CSV</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleCsvDownload}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Project <span className="text-danger">*</span></label>
                        <Select
                            value={csvData.project}
                            onChange={(option) => {
                                handleCsvChange('project', option);
                                // Reset milestone and sprint when project changes
                                handleCsvChange('milestone', null);
                                handleCsvChange('sprint', null);
                            }}
                            options={projects?.map(project => ({
                                value: project?._id,
                                label: project?.name
                            })) || []}
                            onInputChange={(inputValue) => {
                                if (inputValue !== '') {
                                    dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, search: inputValue, ...(store?.Auth?.user?.role === 'QA' && { userId: store?.Auth?.user?.id }) }));
                                }
                            }}
                            placeholder="Select Project"
                            isClearable
                            isSearchable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Milestone</label>
                        <Select
                            value={csvData.milestone}
                            onChange={(option) => {
                                handleCsvChange('milestone', option);
                                handleCsvChange('sprint', null);
                            }}
                            options={milestoneOptions}
                            placeholder="All Milestones"
                            isClearable
                            isSearchable
                            isDisabled={!csvData.project}
                            isLoading={milestonesLoading}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {!csvData.project &&
                            <small className="text-muted">Select a project first</small>
                        }
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Sprint</label>
                        <Select
                            value={csvData.sprint}
                            onChange={(option) => handleCsvChange('sprint', option)}
                            options={sprintOptions}
                            placeholder="All Sprints"
                            isClearable
                            isSearchable
                            isDisabled={!csvData.milestone}
                            isLoading={sprintsLoading}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {!csvData.milestone &&
                            <small className="text-muted">Select a milestone first</small>
                        }
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold small">Start Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={csvData.startDate}
                                onChange={(e) => handleCsvChange('startDate', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold small">End Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={csvData.endDate}
                                onChange={(e) => handleCsvChange('endDate', e.target.value)}
                                min={csvData.startDate}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                            style={{ padding: '4px 12px', fontSize: '11px' }}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-dark text-white fw-semibold ms-1 d-flex align-items-center gap-1"
                            style={{ padding: '4px 12px', fontSize: '11px' }}
                            disabled={csvLoading}
                        >
                            {csvLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-download"></i>
                                    <span>Download CSV</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default CsvExportModal;
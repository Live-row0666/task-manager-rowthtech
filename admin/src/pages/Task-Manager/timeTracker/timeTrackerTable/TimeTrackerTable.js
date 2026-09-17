import React, { useEffect, useState } from 'react';
import { Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getUserRecordAction } from '../../../../redux/timeTracker/action';
import { useSelector, useDispatch } from 'react-redux';
import MainLoader from '../../../../constants/Loader/loader';
import { getAllUsers } from '../../../../redux/actions';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TimeTrackerTable.css';

const TimeTrackerTable = () => {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedUserOption, setSelectedUserOption] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [expandedProjects, setExpandedProjects] = useState({});
    const { control } = useForm();

    const users = store?.getAllUsers?.data?.data;
    const userRecords = store?.getUserRecordReducer?.data?.data;
    const loading = store?.getUserRecordReducer?.loading;
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    useEffect(() => {
        dispatch(getAllUsers({ userType: selectedDepartment }));
    }, [dispatch]);

    useEffect(() => {
        const params = {
            userId: selectedUser || '',
            startDate: startDate ? startDate.toISOString().split('T')[0] : '',
            endDate: endDate ? endDate.toISOString().split('T')[0] : '',
            projectType: selectedDepartment
        };
        dispatch(getUserRecordAction(params));
    }, [dispatch, selectedUser, startDate, endDate]);

    const formatTime = (milliseconds) => {
        let seconds = Math.floor(milliseconds / 1000);
        let hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        let minutes = Math.floor(seconds / 60);
        seconds %= 60;
        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');
        return `${hours}hours ${minutes}minutes ${seconds}seconds`;
    };

    return (
        <Card className="shadow-sm border-0 time-tracker-card h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center p-2 border-bottom">
                {/* <h5 className="mb-0 fw-bold text-primary">Time Tracking Dashboard</h5> */}
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-funnel-fill text-primary me-2"></i>
                        <span className="text-muted small fw-bold">Filters:</span>
                    </div>
                    <div style={{ width: '220px' }}>
                        <Select
                            value={selectedUserOption}
                            options={[
                                { value: '', label: 'All Users' },
                                ...(users?.map(user => ({
                                    value: user._id,
                                    label: user.name || ''
                                })) || [])
                            ]}
                            onChange={(option) => {
                                setSelectedUser(option?.value || '');
                                setSelectedUserOption(option);
                            }}
                            onInputChange={(inputValue) => {
                                if (typeof inputValue === 'string' && inputValue) {
                                    dispatch(getAllUsers({ search: inputValue }))
                                }
                            }}
                            placeholder="Select user"
                            isClearable
                            isSearchable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    minHeight: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    border: '1px solid #ced4da',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        border: '1px solid #80bdff'
                                    }
                                }),
                                valueContainer: (provided) => ({
                                    ...provided,
                                    height: '32px',
                                    padding: '0 6px'
                                }),
                                input: (provided) => ({
                                    ...provided,
                                    margin: '0',
                                    padding: '0'
                                }),
                                indicatorsContainer: (provided) => ({
                                    ...provided,
                                    height: '32px'
                                })
                            }}
                            filterOption={(option, inputValue) => {
                                if (!inputValue || !option.label) return true;
                                return option.label.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                        />
                    </div>
                    <div className="input-group d-flex" style={{ width: 'auto', maxWidth: '200px' }}>
                        {/* <span className="input-group-text py-0 px-2 bg-light">
                                            <i className="bi bi-calendar3 text-muted small"></i>
                                        </span> */}
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            placeholderText="Start date"
                            className="form-control py-1 px-2 rounded-1"
                            dateFormat="yyyy-MM-dd"
                            wrapperClassName="date-picker-wrapper"
                            popperPlacement="bottom-start"
                        />
                    </div>
                    <div className="input-group" style={{ width: 'auto', maxWidth: '160px' }}>
                        {/* <span className="input-group-text py-0 px-2 bg-light">
                                            <i className="bi bi-calendar3 text-muted small"></i>
                                        </span> */}
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            placeholderText="End date"
                            className="form-control py-1 px-2 rounded-1"
                            dateFormat="yyyy-MM-dd"
                            minDate={startDate}
                            wrapperClassName="date-picker-wrapper"
                            popperPlacement="bottom-start"
                        />
                    </div>
                </div>
                <div>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip>Refresh data</Tooltip>}
                    >
                        <Button
                            variant="outline-dark"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            className="me-1"
                            onClick={() => {
                                const params = {
                                    userId: selectedUser || '',
                                    startDate: startDate ? startDate.toISOString().split('T')[0] : '',
                                    endDate: endDate ? endDate.toISOString().split('T')[0] : ''
                                };
                                dispatch(getUserRecordAction(params));
                            }}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </Button>
                    </OverlayTrigger>
                </div>
            </Card.Header>
            <Card.Body className='p-0 d-flex flex-column flex-grow-1'>
                <div className='flex-grow-1'>
                    {loading ? (
                        <MainLoader />
                    ) : (
                        <>
                            <div className="records-container px-2 py-2 mt-2" style={{ height: 'calc(87vh - 120px)', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                                {userRecords?.length > 0 ?
                                    userRecords?.map((record, index) => (
                                        <div key={index} className="record-card p-3 mb-2 bg-white rounded shadow-sm border">
                                            <div className="row align-items-center mb-2">
                                                <div className="col-12 col-sm-6">
                                                    <h6 className="mb-0 fw-bold text-dark">{record.userName}</h6>
                                                    <small className="text-muted">{record.designation}</small>
                                                </div>
                                                <div className="col-12 col-sm-6 text-sm-end">
                                                    <span className="badge rounded-2 px-2 py-1" style={{ background: 'linear-gradient(45deg, #313A46, #4a5568)' }}>                                                       <i className="bi bi-clock me-1"></i>
                                                        {/* <i className="bi bi-clock me-1"></i> */}
                                                        {record.totalHours} hrs
                                                        {/* {record.totalMinutes}m {record.totalSeconds}s */}
                                                    </span>
                                                </div>
                                            </div>

                                            {record.projects?.filter(project => project?.projectName && project.projectName.trim() !== '').map((project, pIndex) => {
                                                const projectKey = `${record.userName}-${pIndex}`;
                                                const isExpanded = expandedProjects[projectKey] || false;

                                                return (
                                                    <div key={pIndex} className="project-section mb-2 p-2 bg-light rounded border-start border-3 border-primary">
                                                        <div
                                                            className="d-flex justify-content-between align-items-center px-1 cursor-pointer"
                                                            onClick={() => setExpandedProjects(prev => ({
                                                                ...prev,
                                                                [projectKey]: !isExpanded
                                                            }))}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <i className={`bi ${isExpanded ? 'bi-folder2-open' : 'bi-folder'} me-2 text-info`}></i>
                                                                <span className="fw-bold">{project?.projectName}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <span className="badge bg-light text-dark border p-1 me-2">
                                                                    {project.hours} hrs
                                                                    {/* {project.minutes}m {project.seconds}s */}
                                                                </span>
                                                                <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`}></i>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="tasks-container mt-2">
                                                                {project.tasks?.map((task, tIndex) => (
                                                                    <div key={tIndex} className="task-item p-2 mb-1 bg-white rounded shadow-sm">
                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                                            <div className="d-flex align-items-center" style={{ maxWidth: '75%' }}>
                                                                                <i className="bi bi-check2-square me-2 text-success"></i>
                                                                                <span className="text-truncate">{task.taskSummary}</span>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <span className="badge bg-primary rounded-2 p-1">{task.entries} entries</span>
                                                                                <span className="badge bg-light text-dark border p-1">
                                                                                    {task.hours} hrs
                                                                                    {/* {task.minutes}m {task.seconds}s */}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                    :
                                    <div className="empty-state d-flex flex-column align-items-center justify-content-center py-5 my-5">
                                        <div className="empty-state-icon bg-light p-3 rounded-circle mb-3">
                                            <i className="bi bi-calendar-x fs-2 text-muted"></i>
                                        </div>
                                        <h6 className="text-muted">No time tracking data found</h6>
                                        <p className="text-muted small">Try adjusting your filters or selecting a different date range</p>
                                    </div>
                                }
                            </div>
                        </>
                    )}
                </div>
            </Card.Body>
            <Card.Footer className="bg-white py-2 px-3 border-top d-flex justify-content-between align-items-center mt-auto">
                <small className="text-muted">Showing {userRecords?.length || 0} records</small>
                {/* <div>
                    <Button variant="outline-dark" style={{ padding: '4px 16px', fontSize: '11px' }} className="me-2">
                        <i className="bi bi-printer me-1"></i> Print
                    </Button>
                    <Button variant="outline-dark" style={{ padding: '4px 16px', fontSize: '11px' }}>
                        <i className="bi bi-file-earmark-excel me-1"></i> Export
                    </Button>
                </div> */}
            </Card.Footer>
        </Card>
    );
};

export default TimeTrackerTable;
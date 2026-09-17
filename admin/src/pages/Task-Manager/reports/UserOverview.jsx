import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { Accordion, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { VscPreview } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import Select from 'react-select';
import { useDispatch } from "react-redux";
import { getSingleSprint } from "../../../redux/sprint/action";
import { getsingleMileStone } from "../../../redux/milestone/action";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../taskDashboard/datepicker-styles.css';

const UserOverview = ({ startDate, endDate, employeeId, onMonthChange }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const store = useSelector(state => state);

    const [currentMonth, setCurrentMonth] = useState(moment(startDate || new Date()));
    const [overviewData, setOverviewData] = useState([]);
    const [overviewLoading, setOverviewLoading] = useState(false);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'To Do': { bg: '#6c757d', text: 'white' },
            'In Progress': { bg: '#0dcaf0', text: 'dark' },
            'Testing': { bg: '#ffc107', text: 'dark' },
            'On Hold': { bg: '#fd7e14', text: 'white' },
            'Done': { bg: '#198754', text: 'white' }
        };

        const config = statusConfig[status] || { bg: '#6c757d', text: 'white' };
        return (
            <span className={`badge bg-${config.text === 'dark' ? 'warning' : ''}`}
                style={{ backgroundColor: config.bg, color: config.text, fontSize: '10px', padding: '4px 8px' }}>
                {status || '-'}
            </span>
        );
    }

    const fetchUserOverview = async () => {
        setOverviewLoading(true);
        try {
            const dateFrom = (startDate || currentMonth.clone().startOf('month').toDate()).toISOString();
            const dateTo = (endDate || currentMonth.clone().endOf('month').toDate()).toISOString();
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/user-overview?employeeId=${employeeId || ''}&dateFrom=${dateFrom}&dateTo=${dateTo}`);
            if (response.data.status === 200) {
                setOverviewData(response.data.projects);
            }
        } catch (error) {
            console.log(error, 'Error fetching User Overview');
        } finally {
            setOverviewLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchUserOverview();
        }
    }, [employeeId]);

    useEffect(() => {
        if (employeeId && (startDate || endDate)) {
            fetchUserOverview();
        }
    }, [startDate, endDate]);

    if (!employeeId) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                    <i className="uil uil-user-circle" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                    <h5 className="mt-3 text-muted">Please select an employee to view overview</h5>
                </div>
            </div>
        );
    }

    const handleTaskPreview = (taskId, projectId) => {
        navigate(
            `/dashboard/taskDashboard?${encodeURIComponent('overviewTaskId')}=${encodeURIComponent(taskId)}&${encodeURIComponent('overviewProjectId')}=${encodeURIComponent(projectId)}`
        );
    }

    return (
        <>
            <style>
                {`.overview-accordion-header .accordion-button{
            background-color: #d9dfe285;
            padding: 12px 16px;
            margin-bottom: 0px;
            }
          .accordion-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  /* hide scrollbar but keep scroll functional */
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE and Edge */
}

.accordion-container::-webkit-scrollbar {
  display: none;               /* Chrome, Safari, Opera */
}

            .accordion-body {
                max-height: 50vh;
                padding:0;
            }
           .table-scroll-container {
  max-height: 50vh;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #6c757d9b #f1f1f1;
}



            .table-scroll-container thead th {
                position: sticky;
                top: 0;
                z-index: 10;
                background-color: #212529;
            }`}
            </style>
            <div className="d-flex justify-content-between align-items-center mb-2 px-0">
                <button
                    className="month-nav d-flex align-items-center"
                    onClick={() => {
                        const newMonth = currentMonth.clone().subtract(1, 'month');
                        setCurrentMonth(newMonth);
                        onMonthChange?.(newMonth);
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                >
                    <i className="uil uil-angle-left me-1"></i>
                    {`Previous`}
                </button>
                <h6 className="mb-0 fw-bold text-center" style={{ fontSize: '14px' }}>
                    {currentMonth.format('MMMM YYYY')}
                </h6>
                <button
                    className="month-nav d-flex align-items-center"
                    onClick={() => {
                        const newMonth = currentMonth.clone().add(1, 'month');
                        setCurrentMonth(newMonth);
                        onMonthChange?.(newMonth);
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}>
                    {`Next`}
                    <i className="uil uil-angle-right ms-1"></i>
                </button>
            </div>
            <div>
                {overviewLoading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <Spinner />
                    </div>
                ) : overviewData?.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="text-center">
                            <i className="uil uil-exclamation-circle" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                            <h5 className="mt-3 text-muted">No data available</h5>
                        </div>
                    </div>
                ) : (
                    <div className="accordion-container">
                        <Accordion defaultActiveKey="0" flush>
                            {overviewData?.map((data, index) => (
                                <Accordion.Item className="mb-2" eventKey={index} key={index}>
                                    <Accordion.Header
                                        onClick={() => {
                                            dispatch(getsingleMileStone({ id: data?.tasks?.[0]?.projectId, isActive: true, skip: 1 }));
                                        }}
                                        className="overview-accordion-header">
                                        <h6 className="mb-0 fw-bold text-center" style={{ fontSize: '14px' }}>
                                            {data?.projectName} {data?.totalProjectHours ? ` (${data?.totalProjectHours} Hrs)` : ''}
                                        </h6>
                                    </Accordion.Header>
                                    <Accordion.Body className="py-0">
                                        <div className="table-scroll-container">
                                            <Table striped className="mb-0 table-hover" style={{ fontSize: '11px', width: '100%', tableLayout: 'fixed' }}>
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th className='fw-bold'>Date</th>
                                                        <th className='fw-bold' colSpan={2}>Task Title</th>
                                                        <th className='fw-bold'>Start Time</th>
                                                        <th className='fw-bold'>End Time</th>
                                                        <th className='fw-bold' colSpan={2}>Estimated Hours</th>
                                                        <th className='fw-bold'>Total Hours</th>
                                                        <th className='fw-bold'>Status</th>
                                                        <th className='fw-bold'>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data?.tasks?.map((task, taskIndex) => (
                                                        <tr key={taskIndex}>
                                                            <td>{task?.date}</td>
                                                            <td colSpan={2}>
                                                                {task?.taskTitle?.length > 40 ? (
                                                                    <OverlayTrigger
                                                                        placement="top"
                                                                        overlay={<Tooltip>{task?.taskTitle}</Tooltip>}
                                                                    >
                                                                        <span className="cursor-pointer">{task?.taskTitle?.substring(0, 40)}...</span>
                                                                    </OverlayTrigger>
                                                                ) : task?.taskTitle}
                                                            </td>
                                                            <td>{task?.startTime ? moment(task?.startTime).format("hh:mm A") : 'N/A'}</td>
                                                            <td>{task?.endTime ? moment(task?.endTime).format("hh:mm A") : 'N/A'}</td>
                                                            <td colSpan={2}>{task?.estimatedHours || '-'}</td>
                                                            <td>{task?.totalLoggedTimeHours || 'N/A'}</td>
                                                            <td>
                                                                {getStatusBadge(task?.taskStatus)}
                                                            </td>
                                                            <td>
                                                                <button onClick={() => handleTaskPreview(task?.taskId, data?._id)} className="btn btn-sm btn-outline-primary">
                                                                    <VscPreview />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>
                )}
            </div>
        </>
    )
}

export default UserOverview;
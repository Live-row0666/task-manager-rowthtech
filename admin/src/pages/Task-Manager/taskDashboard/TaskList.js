import moment from 'moment'
import React, { useState } from 'react'
import { Container, Form, Table } from 'react-bootstrap'
import './TaskList.css'
import MainLoader from '../../../constants/Loader/loader'
import { useSelector } from 'react-redux'
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas'

const TaskListView = () => {
    const store = useSelector((state) => state);
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data;
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [showOffCanvas, setShowOffCanvas] = useState(false);

    const getShortSummaryHTML = (summary) => {
        if (!summary) return '';
        const words = summary.split(' ');
        const shortText = words.slice(0, 3).join(' ');
        return words.length > 3 ? `${shortText}...` : shortText;
    }
    return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    {store?.getSigleSprintTask?.loading ? (
                        <MainLoader />
                    ) : getSingleSprintTask?.length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <h5 className="text-muted">No Tasks Found</h5>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                                <thead className="table-dark">
                                    <tr>
                                        {/* <th className='fw-bold fs-6 text-start' style={{ width: '3%' }}>#</th> */}
                                        <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Summary</th>
                                        {/* <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Description</th> */}
                                        <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>Milestone</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>Sprint</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '10%' }}>Assignee</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '8%' }}>Start Date</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '8%' }}>End Date</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Priority</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Task Status</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>QA Status</th>
                                        <th className='fw-bold fs-6 text-start text-nowrap' style={{ width: '10%' }}>Estimated Time</th>
                                    </tr>
                                </thead>
                            </Table>
                            <div style={{ overflowY: 'auto', height: '74vh', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                                    <thead style={{ visibility: 'collapse' }}>
                                        <tr>
                                            {/* <th style={{ width: '3%' }}>#</th> */}
                                            <th style={{ width: '15%' }}>Summary</th>
                                            {/* <th style={{ width: '15%' }}>Description</th> */}
                                            <th style={{ width: '12%' }}>Milestone</th>
                                            <th style={{ width: '12%' }}>Sprint</th>
                                            <th style={{ width: '10%' }}>Assignee</th>
                                            <th style={{ width: '8%' }}>Priority</th>
                                            <th style={{ width: '8%' }}>Start Date</th>
                                            <th style={{ width: '8%' }}>End Date</th>
                                            <th style={{ width: '8%' }}>Task Status</th>
                                            <th style={{ width: '8%' }}>QA Status</th>
                                            <th className='text-nowrap' style={{ width: '10%' }}>Estimated Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {store?.Auth?.user?.role === 'Marketing' ?
                                            getSingleSprintTask?.filter((data) => data?.isSeoTask)?.length === 0 ?
                                                <tr>
                                                    <td colSpan={10} className='d-flex align-items-center justify-content-center py-5'>No Tasks Found    </td>
                                                </tr>
                                                :
                                                getSingleSprintTask?.filter((data) => data?.isSeoTask)?.map((item, index) => (
                                                    <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {item?.summary ? (
                                                                <>
                                                                    {item.summary.replace(/<[^>]+>/g, '').split(' ').slice(0, 3).join(' ')}
                                                                    {item.summary.split(' ').length > 3 && '...'}
                                                                    {item.summary.replace(/<[^>]+>/g, '').length > 20 && (
                                                                        <i
                                                                            className="mdi mdi-information-outline text-primary"
                                                                            style={{ fontSize: '14px', cursor: 'pointer' }}
                                                                            onClick={() => {
                                                                                setSelectedDescription(item.summary || 'No description');
                                                                                setSelectedTitle('Task summary');
                                                                                setShowOffCanvas(true);
                                                                            }}
                                                                        ></i>
                                                                    )}
                                                                </>
                                                            ) : 'N/A'}                                                </td>
                                                        <DescriptionOffCanvas
                                                            show={showOffCanvas}
                                                            onHide={() => setShowOffCanvas(false)}
                                                            description={selectedDescription}
                                                            title={selectedTitle}
                                                        />
                                                        {/* <td className="text-start" style={{ fontSize: '12px' }}>
                                                    {item?.description ?
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: getShortSummaryHTML(item?.description),
                                                            }}
                                                        />
                                                        :
                                                        'N/A'
                                                    }
                                                </td> */}

                                                        <td className="text-start" title={item?.milestone?.title} style={{ fontSize: '12px' }}>
                                                            {item?.milestone?.title ?
                                                                item?.milestone?.title?.length > 25 ? item?.milestone?.title?.slice(0, 24) + '...' : item?.milestone?.title
                                                                :
                                                                'N/A'
                                                            }
                                                        </td>
                                                        <td className="text-start" title={item?.sprint?.sprintName} style={{ fontSize: '12px' }}>
                                                            {item?.sprint?.sprintName ?
                                                                item?.sprint?.sprintName?.length > 25 ? item?.sprint?.sprintName?.slice(0, 24) + '...' : item?.sprint?.sprintName
                                                                :
                                                                'N/A'
                                                            }
                                                        </td>

                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {item?.assignee?.name}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.startDate ? moment.utc(item?.startDate).format("DD/MM/YYYY") : 'N/A'}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.dueDate ? moment.utc(item?.dueDate).format("DD/MM/YYYY") : 'N/A'}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.priority === 'Critical' ? 'bg-danger-subtle text-danger' :
                                                                item?.priority === 'High' ? 'bg-danger-subtle text-danger' :
                                                                    item?.priority === 'Medium' ? 'bg-warning-subtle text-warning' :
                                                                        'bg-success-subtle text-success'
                                                                }`} style={{
                                                                    fontSize: '10px',
                                                                    width: '100%'
                                                                }}>
                                                                {item?.priority}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.status === 'Completed' ? 'bg-success-subtle text-success' :
                                                                item?.status === 'In Progress' ? 'bg-warning-subtle text-warning' :
                                                                    item?.status === 'To Do' ? 'bg-info-subtle text-info' :
                                                                        'bg-secondary-subtle text-secondary'}`} style={{
                                                                            fontSize: '10px',
                                                                            width: '100%'
                                                                        }}>
                                                                {item?.status || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.qastatus === 'Approved' ? 'bg-success-subtle text-success' :
                                                                item?.qastatus === 'Rejected' ? 'bg-danger-subtle text-danger' :
                                                                    item?.qastatus === 'In Progress' ? 'bg-warning-subtle text-warning' :
                                                                        'bg-secondary-subtle text-secondary'}`} style={{
                                                                            fontSize: '10px',
                                                                            width: '100%'
                                                                        }}>
                                                                {item?.qastatus || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.estimatedTime ? item?.estimatedTime + ' hrs' : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            :
                                            getSingleSprintTask?.length === 0 ?
                                                <tr>
                                                    <td colSpan={10} className='d-flex align-items-center justify-content-center py-5'>No Tasks Found    </td>
                                                </tr>
                                                :
                                                getSingleSprintTask?.map((item, index) => (
                                                    <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                        {/* <td className="text-start fw-bold" style={{ fontSize: '12px' }}>
                                                    {index + 1}
                                                </td> */}
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {item?.summary ? (
                                                                <>
                                                                    {item.summary.replace(/<[^>]+>/g, '').split(' ').slice(0, 3).join(' ')}
                                                                    {item.summary.split(' ').length > 3 && '...'}
                                                                    {item.summary.replace(/<[^>]+>/g, '').length > 20 && (
                                                                        <i
                                                                            className="mdi mdi-information-outline text-primary"
                                                                            style={{ fontSize: '14px', cursor: 'pointer' }}
                                                                            onClick={() => {
                                                                                setSelectedDescription(item.summary || 'No description');
                                                                                setSelectedTitle('Task summary');
                                                                                setShowOffCanvas(true);
                                                                            }}
                                                                        ></i>
                                                                    )}
                                                                </>
                                                            ) : 'N/A'}                                                </td>
                                                        <DescriptionOffCanvas
                                                            show={showOffCanvas}
                                                            onHide={() => setShowOffCanvas(false)}
                                                            description={selectedDescription}
                                                            title={selectedTitle}
                                                        />
                                                        {/* <td className="text-start" style={{ fontSize: '12px' }}>
                                                    {item?.description ?
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: getShortSummaryHTML(item?.description),
                                                            }}
                                                        />
                                                        :
                                                        'N/A'
                                                    }
                                                </td> */}

                                                        <td className="text-start" title={item?.milestone?.title} style={{ fontSize: '12px' }}>
                                                            {item?.milestone?.title ?
                                                                item?.milestone?.title?.length > 25 ? item?.milestone?.title?.slice(0, 24) + '...' : item?.milestone?.title
                                                                :
                                                                'N/A'
                                                            }
                                                        </td>
                                                        <td className="text-start" title={item?.sprint?.sprintName} style={{ fontSize: '12px' }}>
                                                            {item?.sprint?.sprintName ?
                                                                item?.sprint?.sprintName?.length > 25 ? item?.sprint?.sprintName?.slice(0, 24) + '...' : item?.sprint?.sprintName
                                                                :
                                                                'N/A'
                                                            }
                                                        </td>

                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {item?.assignee?.name}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.startDate ? moment.utc(item?.startDate).format("DD/MM/YYYY") : 'N/A'}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.dueDate ? moment.utc(item?.dueDate).format("DD/MM/YYYY") : 'N/A'}
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.priority === 'Critical' ? 'bg-danger-subtle text-danger' :
                                                                item?.priority === 'High' ? 'bg-danger-subtle text-danger' :
                                                                    item?.priority === 'Medium' ? 'bg-warning-subtle text-warning' :
                                                                        'bg-success-subtle text-success'
                                                                }`} style={{
                                                                    fontSize: '10px',
                                                                    width: '100%'
                                                                }}>
                                                                {item?.priority}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.status === 'Completed' ? 'bg-success-subtle text-success' :
                                                                item?.status === 'In Progress' ? 'bg-warning-subtle text-warning' :
                                                                    item?.status === 'To Do' ? 'bg-info-subtle text-info' :
                                                                        'bg-secondary-subtle text-secondary'}`} style={{
                                                                            fontSize: '10px',
                                                                            width: '100%'
                                                                        }}>
                                                                {item?.status || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className={`badge py-1 ${item?.qastatus === 'Approved' ? 'bg-success-subtle text-success' :
                                                                item?.qastatus === 'Rejected' ? 'bg-danger-subtle text-danger' :
                                                                    item?.qastatus === 'In Progress' ? 'bg-warning-subtle text-warning' :
                                                                        'bg-secondary-subtle text-secondary'}`} style={{
                                                                            fontSize: '10px',
                                                                            width: '100%'
                                                                        }}>
                                                                {item?.qastatus || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            {item?.estimatedTime ? item?.estimatedTime + ' hrs' : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TaskListView
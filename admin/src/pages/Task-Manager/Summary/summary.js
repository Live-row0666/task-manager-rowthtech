import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getPriorityGraphAction, getTaskSummmaryDetail, getTaskWeekCountAction } from '../../../redux/Summary/action';
import { getHistoryAction } from '../../../redux/task/action';
import { getAllTask } from '../../../redux/actions';
import Chart from 'react-apexcharts';
import { ProgressBar } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { PieChart } from '@mui/x-charts/PieChart';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Summary = () => {
    const { projectId, milestoneId, spriteId } = useParams();
    const dispatch = useDispatch();
    const store = useSelector((state) => state);

    const successHandle = store?.getTaskSummaryReducer;
    const BarGraphHandel = store?.getPriorityGraphReducer;
    const lastWeekCount = store?.getTaskWeekCountReducer?.data?.response;
    const [taskCount, setTaskCount] = useState(null);
    const [historyResponse, setHistoryResponse] = useState(null);
    const statusCount = store?.getAllTaskReducer?.data?.Response;
    const [data, setData] = useState([]);
    // const [barGraphData, setBarGraphData] = useState();
    useEffect(() => {
        if (successHandle?.data?.status === 200) {
            setData(successHandle?.data?.response);
        }
    }, [successHandle]);
    useEffect(() => {
        const taskTotalCount = store?.getTaskSummaryReducer?.data.response;
        if (taskTotalCount) {
            setTaskCount(taskTotalCount);
        }
    }, [store?.getTaskSummaryReducer?.data.response]);


    useEffect(() => {
        const historyData = store?.getHistoryReducer?.data?.response;
        if (historyData) {
            setHistoryResponse(historyData);
        }
    }, [store?.getHistoryReducer?.data?.response]);

    const priorityData = store?.getPriorityGraphReducer?.data?.response;


    useEffect(() => {
        dispatch(getTaskWeekCountAction({ sprintId: spriteId }));
        dispatch(getTaskSummmaryDetail({ sprintId: spriteId }));
        dispatch(getHistoryAction({ sprintId: spriteId }));
        dispatch(getPriorityGraphAction({ sprintId: spriteId }));
        dispatch(getAllTask({ sprintId: spriteId, searchString: '' }));
    }, [dispatch]);

    const apexDonutOpts = {
        chart: {
            height: 340,
            type: 'donut',
        },
        labels: data && data.length > 0 ? data.map((ele, i) => {
            return ele.name;
        }) : [],
        colors: ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00'],
        legend: {
            show: false,
        },
        responsive: [
            {
                breakpoint: 376,
                options: {
                    chart: {
                        width: 250,
                        height: 250,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        ],
    };
    //end
    // graph chart
    const options = {
        chart: {
            type: 'bar',
        },
        plotOptions: {
            bar: {
                horizontal: false,
                endingShape: 'rounded',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: priorityData && priorityData.length > 0 ? priorityData.map((ele, ind) => ele?.name) : [],
        },
        colors: ['#727cf5', '#0acf97', '#fa5c7c'],
    };

    const series = [
        {
            name: 'Count',
            data: priorityData && priorityData.length > 0 ? priorityData.map((ele, ind) => ele?.count) : [],
        },
    ];

    return (
        <>
            <div className="p-1" style={{ backgroundColor: '#f8f9fa',  }}>
                <div className="container-fluid" style={{height:'60vh'}}>
                    {/* Header */}
                    <div className="mb-1">
                        <h5 className="fw-bold text-dark mb-0">Project Summary</h5>
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Overview of your project performance and metrics</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="row g-1 mb-2">
                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm h-100 bg-white">
                                <div className="card-body p-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-success bg-opacity-10 p-1 rounded-2">
                                                <i className="bi bi-check-lg text-success" style={{ fontSize: '1rem' }} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                            <h5 className="text-dark mb-0 fw-bold">
                                                {lastWeekCount?.doneCount || '0'}
                                            </h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Tasks Completed</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>Last 7 days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm h-100 bg-white">
                                <div className="card-body p-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                                                <i className="bi bi-pencil-fill text-primary" style={{ fontSize: '1rem' }} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                            <h5 className="text-dark mb-0 fw-bold">
                                                {lastWeekCount?.updatedCount || '0'}
                                            </h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Tasks Updated</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>Last 7 days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm h-100 bg-white">
                                <div className="card-body p-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-info bg-opacity-10 p-1 rounded-2">
                                                <i className="bi bi-plus-lg text-info" style={{ fontSize: '1rem' }} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                            <h5 className="text-dark mb-0 fw-bold">
                                                {lastWeekCount?.createdCount || '0'}
                                            </h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Tasks Added</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>Last 7 days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm h-100 bg-white">
                                <div className="card-body p-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-warning bg-opacity-10 p-1 rounded-2">
                                                <i className="bi bi-calendar-week text-warning" style={{ fontSize: '1rem' }} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-2">
                                            <h5 className="text-dark mb-0 fw-bold">
                                                {lastWeekCount?.dueCount || '0'}
                                            </h5>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Tasks Due</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>Last 7 days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Charts Section */}
                    <div className="row g-1 mb-2">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 pb-0">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary bg-opacity-10 p-1 rounded">
                                                <i className="bi bi-pie-chart-fill text-primary" style={{ fontSize: '0.8rem' }}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-1">
                                            <h6 className="card-title mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Task Status Overview</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Distribution of tasks by status</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-1">
                                    <PieChart
                                        series={[
                                            {
                                                data: [
                                                    { id: 6, value: `${statusCount?.todoCount || 0}`, label: `Todo: ${statusCount?.todoCount || 0}` },
                                                    { id: 7, value: `${statusCount?.inProgressCount || 0}`, label: `In Progress: ${statusCount?.inProgressCount || 0}` },
                                                    { id: 8, value: `${statusCount?.testingCount || 0}`, label: `Testing: ${statusCount?.testingCount || 0}` },
                                                    { id: 9, value: `${statusCount?.doneCount || 0}`, label: `Done: ${statusCount?.doneCount || 0}` },
                                                    { id: 10, value: `${statusCount?.holdCount || 0}`, label: `Hold: ${statusCount?.holdCount || 0}` },
                                                ],
                                                highlightScope: { faded: 'global', highlighted: 'item' },
                                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                            },
                                        ]}
                                        height={180}
                                        slotProps={{
                                            legend: {
                                                labelStyle: {
                                                    fontSize: 10,
                                                },
                                                itemMarkWidth: 6,
                                                itemMarkHeight: 6,
                                                markGap: 6,
                                                itemGap: 8,
                                            },
                                        }}
                                        sx={{
                                            '& .MuiChartsLegend-mark': {
                                                borderRadius: '50%',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 pb-0">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-success bg-opacity-10 p-1 rounded">
                                                <i className="bi bi-activity text-success" style={{ fontSize: '0.8rem' }}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-1">
                                            <h6 className="card-title mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Recent Activity</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Latest project updates and changes</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-1">
                                    <div className="activity-feed" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                        {historyResponse && historyResponse.length > 0 ? historyResponse.map((item, index) => (
                                            <div key={index} className="d-flex align-items-start mb-1 pb-1 border-bottom border-light">
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip id={`tooltip-${index}`}>
                                                            {item?.userId?.firstName} {item?.userId?.lastName}
                                                        </Tooltip>
                                                    }>
                                                    <div className="flex-shrink-0">
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.7rem', fontWeight: '600' }}>
                                                            {item?.userId?.firstName?.charAt(0)?.toUpperCase()}
                                                            {item?.userId?.lastName?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </OverlayTrigger>
                                                <div className="flex-grow-1 ms-2">
                                                    <p className="mb-0 text-dark" style={{ fontSize: '0.75rem' }}>
                                                        <span className="fw-semibold">{item?.userId?.firstName} {item?.userId?.lastName}</span>
                                                        <span className="text-muted ms-1">{item?.userActivity}</span>
                                                    </p>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>{item?.createdAt}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-2">
                                                <i className="bi bi-inbox text-muted" style={{ fontSize: '1.2rem' }}></i>
                                                <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>No recent activity</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    {/* Priority Chart */}
                    {/* <div className="row g-1">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-0 pb-0">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-warning bg-opacity-10 p-1 rounded">
                                                <i className="bi bi-bar-chart-fill text-warning" style={{ fontSize: '0.8rem' }}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-1">
                                            <h6 className="card-title mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Priority Breakdown</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Task distribution by priority levels</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-1">
                                    <Chart options={options} series={series} type="bar" height={220} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 pb-0">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-info bg-opacity-10 p-1 rounded">
                                                <i className="bi bi-speedometer2 text-info" style={{ fontSize: '0.8rem' }}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-1">
                                            <h6 className="card-title mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Quick Stats</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Key performance indicators</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-1">
                                    <div className="d-flex flex-column gap-1">
                                        <div className="d-flex justify-content-between align-items-center p-1 bg-light rounded">
                                            <div>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Total Tasks</p>
                                                <h6 className="mb-0 fw-bold text-dark">
                                                    {(statusCount?.todoCount || 0) + (statusCount?.inProgressCount || 0) + (statusCount?.testingCount || 0) + (statusCount?.doneCount || 0) + (statusCount?.holdCount || 0)}
                                                </h6>
                                            </div>
                                            <i className="bi bi-list-task text-primary" style={{ fontSize: '1rem' }}></i>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-1 bg-light rounded">
                                            <div>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Completion Rate</p>
                                                <h6 className="mb-0 fw-bold text-success">
                                                    {((statusCount?.doneCount || 0) / Math.max(1, (statusCount?.todoCount || 0) + (statusCount?.inProgressCount || 0) + (statusCount?.testingCount || 0) + (statusCount?.doneCount || 0) + (statusCount?.holdCount || 0)) * 100).toFixed(1)}%
                                                </h6>
                                            </div>
                                            <i className="bi bi-check-circle text-success" style={{ fontSize: '1rem' }}></i>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-1 bg-light rounded">
                                            <div>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>In Progress</p>
                                                <h6 className="mb-0 fw-bold text-info">{statusCount?.inProgressCount || 0}</h6>
                                            </div>
                                            <i className="bi bi-clock text-info" style={{ fontSize: '1rem' }}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
            </div>
        </>
    );
};

export default Summary;

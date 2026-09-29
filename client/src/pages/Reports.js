import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard } from '../redux/actions';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import './Dashboard.css';

const Reports = () => {
    const dispatch = useDispatch();
    const { dashboard, loading } = useSelector((state) => ({
        dashboard: state.Auth.dashboard,
        loading: state.Auth.loading,
    }));

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    const summary = dashboard?.summary || {};
    const project = dashboard?.project || {};

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="reports" />

            <main className="dash-main">
                <CommonHeader title="Project Reports" />

                <div className="overview-heading-row mb-4">
                    <div className="overview-title-section">
                        <h3>Project Performance & Analytics Report</h3>
                        <p>Detailed breakdown of project deliverables, milestone progress, and task statistics.</p>
                    </div>

                    <div>
                        <button className="btn btn-primary px-3 py-2 fw-semibold" onClick={handlePrint}>
                            <i className="bi bi-printer me-2"></i> Print / Export Report
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <span className="text-muted small fw-bold text-uppercase">Project Status</span>
                            <h4 className="fw-bold text-primary mt-1 mb-0">{project.projectStatus || 'Ongoing'}</h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <span className="text-muted small fw-bold text-uppercase">Overall Completion</span>
                            <h4 className="fw-bold text-success mt-1 mb-0">{summary.overallProgress || 0}%</h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <span className="text-muted small fw-bold text-uppercase">Milestones Delivered</span>
                            <h4 className="fw-bold text-purple mt-1 mb-0">{summary.completedMilestones || 0} / {summary.totalMilestones || 0}</h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <span className="text-muted small fw-bold text-uppercase">Tasks Closed</span>
                            <h4 className="fw-bold text-info mt-1 mb-0">{summary.completedTasks || 0} / {summary.totalTasks || 0}</h4>
                        </div>
                    </div>
                </div>

                {/* Milestones Breakdown Report Table */}
                <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
                    <h5 className="fw-bold mb-3">Milestones Detailed Status</h5>
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Milestone Title</th>
                                    <th>Start Date</th>
                                    <th>Estimated Delivery</th>
                                    <th>Tasks Status</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard?.milestones?.length > 0 ? (
                                    dashboard.milestones.map((m, idx) => (
                                        <tr key={m._id || idx}>
                                            <td>{idx + 1}</td>
                                            <td className="fw-semibold">{m.title || m.name}</td>
                                            <td>{m.startDate ? new Date(m.startDate).toLocaleDateString('en-GB') : '-'}</td>
                                            <td>{m.completionDate ? new Date(m.completionDate).toLocaleDateString('en-GB') : '-'}</td>
                                            <td>{m.completedTasks || 0} of {m.totalTasks || 0} completed</td>
                                            <td style={{ width: '180px' }}>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div
                                                        className={`progress-bar ${m.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}
                                                        style={{ width: `${m.progress || (m.status === 'Completed' ? 100 : 0)}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${m.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">No milestone report data found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;

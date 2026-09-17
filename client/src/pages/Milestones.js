import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboard, getClientMilestonesAction, logoutUser } from '../redux/actions';
import Logo from '../assets/images/logo/rowthtech.svg';
import moment from 'moment';
import './Milestones.css';
import Select from 'react-select';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
const filterSelectStyles = {

    control: (base) => ({

        ...base,

        minHeight: "34px",

        height: "34px",

        borderRadius: "6px",

        border: "1px solid #E5E7EB",

        boxShadow: "none",

        "&:hover":{

            borderColor:"#D1D5DB"
        }

    }),

    valueContainer:(base)=>({

        ...base,

        height:"34px",

        padding:"0 10px",

        fontSize:"12px"

    }),

    indicatorsContainer:(base)=>({

        ...base,

        height:"34px"

    }),

    placeholder:(base)=>({

        ...base,

        fontSize:"12px",

        color:"#9CA3AF"

    }),

    singleValue:(base)=>({

        ...base,

        fontSize:"12px"

    })

};
const Milestones = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, dashboard, clientMilestones, clientMilestonesLoading } = useSelector(s => ({
        user:                   s.Auth.user,
        dashboard:              s.Auth.dashboard,
        clientMilestones:       s.Auth.clientMilestones || [],
        clientMilestonesLoading: s.Auth.clientMilestonesLoading,
    }));

    const name     = user?.username || 'Client';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const [selProject, setSelProject] = useState('');
    const [search,     setSearch]     = useState('');

    useEffect(() => { dispatch(getDashboard()); }, [dispatch]);

    // Auto-select first project when projects load
  

    useEffect(() => {
        if (selProject) dispatch(getClientMilestonesAction(selProject, true));
    }, [selProject, dispatch]);

    const projects = useMemo(() => dashboard?.projects || [], [dashboard]);
const projectOptions = projects.map((p) => ({
    value: p._id,
    label: p.name,
}));

      useEffect(() => {
        if (projects.length > 0 && !selProject) {
            setSelProject(projects[0]._id);
        }
    }, [projects]);
    const filtered = useMemo(() => {
        if (!search.trim()) return clientMilestones;
        return clientMilestones.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()));
    }, [clientMilestones, search]);

    const daysLeft = end => end ? moment(end).diff(moment(), 'days') : null;

    const statusConfig = {
        'Not Started': { bg: '#f1f3f5', color: '#6c757d', border: '#dee2e6' },
        'In Progress':  { bg: '#e7f3ff', color: '#0d6efd', border: '#b6d4fe' },
        'Completed':    { bg: '#e8f5e9', color: '#198754', border: '#a5d6a7' },
        'Delayed':      { bg: '#fff3cd', color: '#856404', border: '#ffe083' },
    };

    const priorityConfig = {
        High:     { bg: 'rgba(220,53,69,0.1)',  color: '#dc3545' },
        Medium:   { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
        Low:      { bg: 'rgba(25,135,84,0.1)',  color: '#198754' },
    };

    return (
        <div className="dashboard-wrapper">
             <CommonSidebar active="milestones" />
            <main className="dash-main">
                 <CommonHeader title="Milestones" />

             <div className="ms-content">

    <div className="card shadow-sm border-0">

        {/* Card Header */}
   <div className="card-header bg-white border-0 py-2 mb-3">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

     <div className="task-filter-bar">

    <div className="filter-item">
        <Select
            value={
                projectOptions.find(
                    option => option.value === selProject
                ) || null
            }
            onChange={(selected) =>
                setSelProject(selected ? selected.value : "")
            }
            options={projectOptions}
            placeholder="Select Project"
            isClearable
            styles={filterSelectStyles}
        />
    </div>
{/* 
    <div className="filter-item">
        <Select
            options={milestoneOptions}
            placeholder="Select Milestone"
            isClearable
            styles={filterSelectStyles}
        />
    </div> */}

    <div className="search-box">

        <i className="bi bi-search"></i>

        <input
            type="text"
            placeholder="Search milestones..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
        />

    </div>

</div>

    </div>
</div>
        {/* Card Body */}

        <div className="card-body p-0">

            {!selProject ? (
                <div className="ms-empty">
                    <i className="bi bi-flag ms-empty-icon d-block"></i>
                    <p>Select a project to view its milestones</p>
                </div>
            ) : clientMilestonesLoading ? (
                <div className="ms-loading">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="ms-empty">
                    <i className="bi bi-inbox ms-empty-icon d-block"></i>
                    <p>No milestones found</p>
                </div>
            ) : (
               <div className="project-table-card">

    <div className="table-responsive project-table-wrapper">

        <table className="project-table">

            <thead>
                <tr>
                    <th style={{width:"60px"}}>#</th>
                    <th>Milestone Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th className="text-center">Days Left</th>
                    <th className="text-center">Priority</th>
                    <th className="text-center">Status</th>
                </tr>
            </thead>

            <tbody>

                {filtered.map((m, idx) => {

                    const days = daysLeft(m.completionDate);

                    const taskUrl =
                        `/dashboard/milestone-tasks/${m._id}?projectId=${selProject}&mName=${encodeURIComponent(
                            m.title
                        )}&pName=${encodeURIComponent(
                            projects.find(p => p._id === selProject)?.name || ""
                        )}`;

                    return (

                        <tr
                            key={m._id}
                            className="project-row"
                            onClick={() => navigate(taskUrl)}
                        >

                            <td className="project-index">

                                {idx + 1}

                            </td>

                            <td>

                                <div className="project-name">

                                    {m.title}

                                </div>

                            </td>

                            <td>

                                {m.startDate
                                    ? moment.utc(m.startDate).format("DD MMM YYYY")
                                    : "N/A"}

                            </td>

                            <td>

                                {m.completionDate
                                    ? moment.utc(m.completionDate).format("DD MMM YYYY")
                                    : "N/A"}

                            </td>

                            <td className="text-center">

                                {days !== null && (

                                    <span
                                        className={`days-pill ${
                                            days < 0
                                                ? "danger"
                                                : days <= 3
                                                ? "warning"
                                                : "success"
                                        }`}
                                    >

                                        {days < 0
                                            ? `${Math.abs(days)}d overdue`
                                            : `${days}d left`}

                                    </span>

                                )}

                            </td>

                            <td className="text-center">

                                <span
                                    className={`priority-pill ${m.priority.toLowerCase()}`}
                                >

                                    {m.priority}

                                </span>

                            </td>

                            <td className="text-center">

                                <span
                                    className={`status-pill ${m.status
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                >

                                    {m.status}

                                </span>

                            </td>

                        </tr>

                    );

                })}

            </tbody>

        </table>

    </div>

</div>
            )}

        </div>

    </div>

</div>
            </main>
        </div>
    );
};

export default Milestones;

import React, { useState, useEffect, useRef } from 'react';
import { Card, ButtonGroup, Form, Button, Row, Col } from 'react-bootstrap';
import EmployeesTable from './EmployeesTable';
import MonthlyTable from './MonthlyTable';
import AllProjectsTable from './AllProjectsTable';
import ProjectTable from './ProjectTable';
import TeamsTable from './TeamsTable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../taskDashboard/datepicker-styles.css';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, set } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { getAllProjects, getAllUsers } from '../../../redux/actions';
import UserOverview from './UserOverview';
import { useSearchParams } from 'react-router-dom';

const Reports = () => {
  const dispatch = useDispatch();
  const { control, reset } = useForm();
  const store = useSelector((state) => state);
  const [searchParams] = useSearchParams();
  const overviewId = searchParams.get('overviewId');

  const [activeTab, setActiveTab] = useState(() => {
    return store?.Auth?.user?.role === 'Sales' ? 'employees' : overviewId ? 'overview' : (localStorage.getItem('reportsActiveTab') || 'employees');
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');

  const [tabFilters, setTabFilters] = useState({
    employees: { projectId: null, employeeId: null },
    monthly: { employeeId: null },
    teams: { projectId: null },
    overview: { employeeId: overviewId || null }
  });

  const projects = store?.getProject?.data?.data;
  const users = store?.getAllUsers?.data?.data;
  const employeesTableRef = useRef();
  const monthlyTableRef = useRef();
  const allProjectsTableRef = useRef();
  const projectTableRef = useRef();
  const teamsTableRef = useRef();
  const selectedDepartment = localStorage.getItem('selectedDepartment');

  useEffect(() => {
    if (overviewId && users?.length > 0) {
      setActiveTab('overview');
      setTabFilters(prev => ({
        ...prev,
        overview: { employeeId: overviewId }
      }));
    }
  }, [overviewId, users]);

  useEffect(() => {
    dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, ...(store?.Auth?.user?.role === 'QA' && { userId: store?.Auth?.user?.id }) }));
    dispatch(getAllUsers({ userType: selectedDepartment, ...(overviewId && { limit: 1000 }) }));
  }, [dispatch]);

  const getEmployeesAssignees = () => {
    if (tabFilters.employees.projectId) {
      const project = projects?.find(p => p._id === tabFilters.employees.projectId);
      return project?.team || [];
    }
    return users || [];
  };

  const updateTabFilter = (tab, key, value) => {
    setTabFilters(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: value }
    }));
  };

  useEffect(() => {
    const today = new Date();

    switch (activeTab) {
      case 'employees':
        setStartDate(subDays(today, 10));
        setEndDate(today);
        break;
      case 'monthly':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'allProjects':
        setStartDate(startOfYear(today));
        setEndDate(endOfYear(today));
        break;
      case 'project':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        if (!selectedProject && projects?.length > 0) {
          setSelectedProject(projects[0]._id);
        }
        break;
      case 'teams':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'overview':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      default:
        setStartDate(null);
        setEndDate(null);
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [activeTab, projects, selectedProject, isInitialLoad, overviewId]);

  const renderDatePicker = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <div className="d-flex gap-2">
            <div className='projectSelector' style={{ width: '180px' }}>
              <Select
                key="employees-project"
                value={tabFilters.employees.projectId && projects?.length > 0 ?
                  { value: tabFilters.employees.projectId, label: projects.find(p => p._id === tabFilters.employees.projectId)?.name } : null}
                options={projects?.map(project => ({
                  value: project?._id,
                  label: project?.name
                })) || []}
                onChange={(option) => {
                  updateTabFilter('employees', 'projectId', option?.value || null);
                  updateTabFilter('employees', 'employeeId', null);
                }}
                onInputChange={(e) => {
                  dispatch(getAllProjects({ search: e, status: true, projectType: selectedDepartment, projectStatus: '', skip: 1 }));
                }}
                placeholder="Select Project"
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '0 8px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '30px'
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
            <div className='assigneeSelector' style={{ width: '180px' }}>
              <Select
                key="employees-assignee"
                value={tabFilters.employees.employeeId && getEmployeesAssignees()?.length > 0 ?
                  { value: tabFilters.employees.employeeId, label: getEmployeesAssignees().find(u => u._id === tabFilters.employees.employeeId)?.name } : null}
                options={getEmployeesAssignees()?.map(user => ({
                  value: user?._id,
                  label: user?.name
                })) || []}
                onChange={(option) => {
                  updateTabFilter('employees', 'employeeId', option?.value || null);
                }}
                onInputChange={(e) => {
                  dispatch(getAllUsers({ search: e, userType: selectedDepartment }));
                }}
                placeholder="Select Employee"
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '0 8px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '30px'
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
            <div className="position-relative" style={{ width: '180px' }}>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  const [start, end] = update;
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="form-control"
                placeholderText="Select date range"
                popperProps={{ strategy: "fixed" }}
                popperPlacement="bottom"
                popperClassName="date-picker-popper"
                wrapperClassName="date-picker-wrapper"
                wrapperStyle={{
                  width: '100%',
                  height: '30px'
                }}
                calendarClassName="border-0 shadow"
                customInput={
                  <input
                    style={{
                      height: '30px',
                      padding: '0.375rem 0.75rem',
                      paddingRight: '15px',
                      cursor: 'pointer'
                    }}
                  />
                }
              />
              {(startDate || endDate) && (
                <span
                  className="p-0"
                  style={{
                    position: 'absolute',
                    right: '2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  title="Clear dates"
                >
                  <i className="uil uil-times text-danger" />
                </span>
              )}
            </div>
          </div>
        );
      case 'allProjects':
        return (
          <div className="position-relative">
          </div>
        );
      case 'monthly':
        return (
          <div className="d-flex gap-2">
            <div className='assigneeSelector' style={{ width: '180px' }}>
              <Select
                key="monthly-assignee"
                value={tabFilters.monthly.employeeId && users?.length > 0 ?
                  { value: tabFilters.monthly.employeeId, label: users.find(u => u._id === tabFilters.monthly.employeeId)?.name } : null}
                options={users?.map(user => ({
                  value: user?._id,
                  label: user?.name
                })) || []}
                onChange={(option) => {
                  updateTabFilter('monthly', 'employeeId', option?.value || null);
                }}
                onInputChange={(e) => {
                  dispatch(getAllUsers({ search: e, userType: selectedDepartment }));
                }}
                placeholder="Select Employee"
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '0 8px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '30px'
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
          </div>
        );
      case 'project':
        return (
          <Form.Group>
            <Form.Select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ height: '30px', padding: '0.375rem 0.75rem', fontSize: '11px', width: '100%' }}
              className='form-control'
            >
              <option value="">Choose a project...</option>
              {projects?.map((project) => (
                <option key={project?._id} value={project?._id}>
                  {project?.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case 'teams':
        return (
          <div className="d-flex gap-2">
            <div className='projectSelector' style={{ width: '180px' }}>
              <Select
                key="teams-project"
                value={tabFilters.teams.projectId && projects?.length > 0 ?
                  { value: tabFilters.teams.projectId, label: projects.find(p => p._id === tabFilters.teams.projectId)?.name } : null}
                options={projects?.map(project => ({
                  value: project?._id,
                  label: project?.name
                })) || []}
                onChange={(option) => {
                  updateTabFilter('teams', 'projectId', option?.value || null);
                }}
                onInputChange={(e) => {
                  dispatch(getAllProjects({ search: e, status: true, projectType: selectedDepartment, projectStatus: '', skip: 1 }));
                }}
                placeholder="Select Project"
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '0 8px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '30px'
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
          </div>
        );
      case 'overview':
        const selectedUser = users?.find(u => u._id === tabFilters.overview.employeeId);
        return (
          <div className="d-flex gap-2">
            <div className='assigneeSelector' style={{ width: '180px' }}>
              <Select
                key="overview-assignee"
                value={selectedUser ? { value: selectedUser._id, label: selectedUser.name } : null}
                options={users?.map(user => ({
                  value: user?._id,
                  label: user?.name
                })) || []}
                onChange={(option) => {
                  updateTabFilter('overview', 'employeeId', option?.value || null);
                }}
                onInputChange={(e) => {
                  dispatch(getAllUsers({ search: e, userType: selectedDepartment }));
                }}
                placeholder="Select Employee"
                isSearchable
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '0 8px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '30px'
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownloadCSV = () => {
    switch (activeTab) {
      case 'employees':
        employeesTableRef.current?.downloadCSV();
        break;
      case 'monthly':
        monthlyTableRef.current?.downloadCSV();
        break;
      case 'allProjects':
        allProjectsTableRef.current?.downloadCSV();
        break;
      case 'project':
        projectTableRef.current?.downloadCSV();
        break;
      case 'teams':
        teamsTableRef.current?.downloadCSV();
        break;
      default:
        break;
    }
  };


  const isDownloadDisabled = () => {
    if (activeTab === 'project' && !selectedProject) return true;
    if (['employees', 'allProjects', 'teams'].includes(activeTab) && (!startDate || !endDate)) return true;
    if (activeTab === 'monthly' && !startDate) return true;
    return false;
  };
  return (
    <div className="reports-container">
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex flex-column p-2">
          <Row className="row mb-1">
            {store?.Auth?.user?.role === "Sales" ?
              <Col sm={6} className="">
                <ButtonGroup className="report-tabs">
                  <button
                    className={`btn btn-sm ${activeTab === 'employees' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('employees');
                      localStorage.setItem('reportsActiveTab', 'employees');
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-users-alt me-1"></i> {`Employees`}
                  </button>
                </ButtonGroup>
              </Col>
              :
              <Col sm={6} className="">
                <ButtonGroup className="report-tabs">
                  <button
                    className={`btn btn-sm ${activeTab === 'employees' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('employees');
                      localStorage.setItem('reportsActiveTab', 'employees');
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-users-alt me-1"></i> {`Employees`}
                  </button>
                  <button
                    className={`btn btn-sm ${activeTab === 'monthly' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('monthly');
                      localStorage.setItem('reportsActiveTab', 'monthly');
                      const today = new Date();
                      setStartDate(startOfMonth(today));
                      setEndDate(endOfMonth(today));
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-calendar-alt me-1"></i> {`Monthly`}
                  </button>
                  <button
                    className={`btn btn-sm ${activeTab === 'allProjects' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('allProjects');
                      localStorage.setItem('reportsActiveTab', 'allProjects');
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-files-landscapes me-1"></i> {`All Projects`}
                  </button>
                  <button
                    className={`btn btn-sm ${activeTab === 'project' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('project');
                      localStorage.setItem('reportsActiveTab', 'project');
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-clipboard-notes me-1"></i> {`Project`}
                  </button>
                  {selectedDepartment !== "Marketing" && (
                    <button
                      className={`btn btn-sm ${activeTab === 'teams' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        setActiveTab('teams');
                        localStorage.setItem('reportsActiveTab', 'teams');
                      }}
                      style={{ padding: '4px 12px', fontSize: '11px' }}
                    >
                      <i className="uil uil-users-alt me-1"></i> {`Teams`}
                    </button>
                  )}
                  <button
                    className={`btn btn-sm ${activeTab === 'overview' ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setActiveTab('overview');
                      localStorage.setItem('reportsActiveTab', 'overview');
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    <i className="uil uil-users-alt me-1"></i> {`User Overview`}
                  </button>
                </ButtonGroup>
              </Col>
            }
            <Col sm={6} className="d-flex justify-content-end align-items-center gap-2">
              <div className="date-picker-container" >
                {renderDatePicker()}
              </div>
              <Button
                size="sm"
                className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                style={{ padding: '4px 12px', fontSize: '11px' }}
                onClick={handleDownloadCSV}
                disabled={isDownloadDisabled()}
              >
                <i className="uil uil-download-alt"></i>
              </Button>
            </Col>
          </Row>
          <div className="report-content flex-grow-1 overflow-auto">
            {activeTab === 'employees' && <EmployeesTable ref={employeesTableRef} startDate={startDate} endDate={endDate} projectId={tabFilters.employees.projectId} employeeId={tabFilters.employees.employeeId} />}
            {activeTab === 'monthly' && <MonthlyTable ref={monthlyTableRef} startDate={startDate} endDate={endDate} employeeId={tabFilters.monthly.employeeId} onMonthChange={(newMonth) => {
              setStartDate(newMonth.clone().startOf('month').toDate());
              setEndDate(newMonth.clone().endOf('month').toDate());
            }} />}
            {activeTab === 'allProjects' && <AllProjectsTable ref={allProjectsTableRef} startDate={startDate} endDate={endDate} onDateChange={(newStartDate, newEndDate) => {
              setStartDate(newStartDate);
              setEndDate(newEndDate);
            }} />}
            {activeTab === 'project' && <ProjectTable ref={projectTableRef} startDate={startDate} endDate={endDate} selectedProject={selectedProject} />}
            {activeTab === 'teams' && <TeamsTable ref={teamsTableRef} projectId={tabFilters.teams.projectId} />}
            {activeTab === 'overview' && <UserOverview employeeId={tabFilters.overview.employeeId} startDate={startDate} endDate={endDate} onMonthChange={(newMonth) => {
              setStartDate(newMonth.clone().startOf('month').toDate());
              setEndDate(newMonth.clone().endOf('month').toDate());
            }} />}
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .reports-container {
          height: calc(100vh - 80px);
        }
        .report-tabs .btn {
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
        }
        .report-content {
          min-height: 300px;
          background-color: #f8f9fa;
          border-radius: 0.25rem;
          padding: 0.5rem;
        }
        .date-picker-container :global(.form-control) {
          height: 32px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default Reports;

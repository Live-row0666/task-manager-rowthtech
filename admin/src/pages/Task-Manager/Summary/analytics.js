import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Table } from 'react-bootstrap';
import axios from 'axios';
import MainLoader from '../../../constants/Loader/loader';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [projectProgress, setProjectProgress] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(2025);
  const selectedDepartment = localStorage.getItem('selectedDepartment');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      let startDate, endDate;

      if (selectedMonth === 'all') {
        startDate = `${selectedYear}-01-01`;
        endDate = `${selectedYear}-12-31`;
      } else {
        const month = parseInt(selectedMonth);
        const daysInMonth = new Date(selectedYear, month, 0).getDate();
        startDate = `${selectedYear}-${month.toString().padStart(2, '0')}-01`;
        endDate = `${selectedYear}-${month.toString().padStart(2, '0')}-${daysInMonth}`;
      }

      const [overviewRes, projectRes, productivityRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/dashboard/overview?projectType=${selectedDepartment}&userType=${selectedDepartment}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/dashboard/project-progress?projectType=${selectedDepartment}&userType=${selectedDepartment}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/dashboard/productivity?startDate=${startDate}&endDate=${endDate}&projectType=${selectedDepartment}`)
      ]);

      setDashboardData(overviewRes.data.data);
      setProjectProgress(projectRes.data.data);
      setProductivity(productivityRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLoader />;

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Done': 'success',
      'In Progress': 'primary',
      'To Do': 'secondary',
      'Testing': 'info',
      'On Hold': 'warning'
    };
    return colors[status] || 'secondary';
  };

  // Chart data
  const tasksByStatusData = {
    labels: dashboardData?.tasksByStatus?.map(item => item._id) || [],
    datasets: [{
      data: dashboardData?.tasksByStatus?.map(item => item.count) || [],
      backgroundColor: ['#28a745', '#007bff', '#6c757d', '#17a2b8', '#ffc107'],
      borderWidth: 0,
      cutout: '78%'
    }]
  };

  const productivityData = {
    labels: productivity?.map(() => '') || [],
    datasets: [{
      label: 'Total Hours',
      data: productivity?.map(user => user.totalHours) || [],
      backgroundColor: '#4280d1d8',
    }]
  };

  const handleBarClick = (event, elements) => {
    if (!elements.length) return;
    const { index } = elements[0];
    const clickedItem = productivity?.[index];
    if (clickedItem) {
      navigate(`/dashboard/reports?overviewId=${clickedItem.userId}`);
    }
  };

  return (
    <div className="p-2" style={{ height: '87vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
      {/* Overview Cards */}
      <Row className="mb-3">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-1">
                <i className="fas fa-project-diagram" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">{dashboardData?.overview?.totalProjects}</h5>
              <small className="text-muted">Total Projects</small>
              <div><small className="text-success">{dashboardData?.overview?.activeProjects} active</small></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-1">
                <i className="fas fa-tasks" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">{dashboardData?.overview?.totalTasks}</h5>
              <small className="text-muted">Total Tasks</small>
              <div><small className="text-success">{dashboardData?.overview?.completedTasks} completed</small></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-1">
                <i className="fas fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">{dashboardData?.overview?.completedTasks}</h5>
              <small className="text-muted">Completed Tasks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-1">
                <i className="fas fa-users" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">{dashboardData?.overview?.totalUsers}</h5>
              <small className="text-muted">Total Users</small>
              <div><small className="text-success">{dashboardData?.overview?.activeUsers} active</small></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-1">
                <i className="fas fa-percentage" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">{Math.round((dashboardData?.overview?.completedTasks / dashboardData?.overview?.totalTasks) * 100) || 0}%</h5>
              <small className="text-muted">Completion Rate</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-secondary mb-1">
                <i className="fas fa-chart-line" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="my-0 fw-bold">
                {(() => {
                  const total = productivity?.reduce((sum, user) => sum + user.totalHours, 0) || 0;
                  if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M h`;
                  if (total >= 1000) return `${(total / 1000).toFixed(1)}K h`;
                  return `${total.toFixed(1)}h`;
                })()}
              </h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0 fw-bold">Tasks by Status</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                {dashboardData?.tasksByStatus?.length ?
                  <Doughnut
                    data={tasksByStatusData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'right' }
                      }
                    }}
                  />
                  :
                  <div className='d-flex justify-content-center align-items-center h-100'>
                    No data found
                  </div>
                }
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Team Productivity (Hours)</h6>
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 11 }, (_, i) => 2025 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </Card.Header>
            <Card.Body className='pt-1'>
              <div style={{ height: '250px' }}>
                <Bar
                  data={productivityData}
                  options={{
                    maintainAspectRatio: false,
                    onClick: handleBarClick,
                    scales: {
                      x: {
                        display: true, // Show X axis to allow proper spacing
                        ticks: {
                          autoSkip: false,
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          title: function (context) {
                            const index = context[0].dataIndex;
                            return productivity?.[index]?.userName || '';
                          },
                          label: function (context) {
                            return `Total Hours: ${context.parsed.y}h`;
                          }
                        }
                      },
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Project Progress */}
      <Row className="mb-3">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0 fw-bold">Project Progress</h6>
            </Card.Header>
            <Card.Body className='pt-0 pb-2'>
              <Row className='g-2'>
                {projectProgress?.map((project, index) => (
                  <Col md={3} key={index} className="">
                    <div className="p-2 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{project.name}</span>
                        <span style={{ fontSize: '12px' }} className="text-muted">{Math.round(project.progress)}%</span>
                      </div>
                      <ProgressBar
                        variant={getProgressColor(project.progress)}
                        now={project.progress}
                        style={{ height: '6px' }}
                      />
                      <div className="mt-1">
                        <small className="text-muted">{project.completedTasks}/{project.totalTasks} tasks</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Team Productivity Table */}
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Team Productivity (Hours)</h6>
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 11 }, (_, i) => 2025 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </Card.Header>
            <Card.Body className="p-0 px-3" style={{ height: '50vh' }}>
              <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                <Table className="mb-0" style={{ fontSize: '12px' }}>
                  <thead className="table-dark border-0 sticky-top">
                    <tr>
                      <th className="text-start">User</th>
                      <th className="text-start">Email</th>
                      <th className="text-center">Entries</th>
                      <th className="text-center">Total Hours</th>
                      {/* <th className="text-center">Billable Hours</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {productivity?.map((user, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <span className="text-white fw-bold" style={{ fontSize: '10px' }}>
                                {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <span>{user.userName}</span>
                          </div>
                        </td>
                        <td className="text-start">{user.userEmail}</td>
                        <td className="text-center">
                          <Badge style={{ width: '2vw', padding: '6px', fontSize: '10px' }} bg="secondary">{user.totalEntries}</Badge>
                        </td>
                        <td className="text-center">
                          <span className="fw-bold text-primary">{user.totalHours}h</span>
                        </td>
                        {/* <td className="text-center">
                          <span className="fw-bold text-success">{user.billableHours}h</span>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;

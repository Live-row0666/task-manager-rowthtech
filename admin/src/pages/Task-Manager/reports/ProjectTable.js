import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'react-bootstrap';

const ProjectTable = forwardRef(({ startDate, endDate, selectedProject, onDateChange }, ref) => {
  const [projectData, setProjectData] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment(startDate || new Date()));
  const leftScrollRef = React.useRef();
  const rightScrollRef = React.useRef();
  const headerScrollRef = React.useRef();
  const selectedDepartment = localStorage.getItem('selectedDepartment');

  const handleVerticalScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = scrollTop;
      rightScrollRef.current.scrollTop = scrollTop;
    }
  };

  const handleHorizontalScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    if (headerScrollRef.current && headerScrollRef.current !== e.target) {
      headerScrollRef.current.scrollLeft = scrollLeft;
    }
    if (rightScrollRef.current && rightScrollRef.current !== e.target) {
      rightScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  const fetchProjectTeamData = async () => {
    if (!selectedProject) return;

    const dateFrom = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
    const dateTo = currentMonth.clone().endOf('month').format('YYYY-MM-DD');

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/reports/project-team?projectId=${selectedProject}&dateFrom=${dateFrom}&dateTo=${dateTo}&projectType=${selectedDepartment}`);

      if (response?.data?.status === 200) {
        setProjectData(response?.data?.data || []);
        setProjectInfo(response?.data?.project || null);
        setDateRange(response?.data?.dateRange || { from: dateFrom, to: dateTo });
      }
    } catch (error) {
      console.error(error, 'Error fetching the project team report');
      setProjectData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDaysArray = () => {
    if (!dateRange.from || !dateRange.to) return [];

    const start = moment(dateRange.from);
    const end = moment(dateRange.to);
    const days = [];

    while (start.isSameOrBefore(end)) {
      days.push(start.format('YYYY-MM-DD'));
      start.add(1, 'day');
    }

    return days;
  };

  const downloadCSV = () => {
    if (!projectData?.length) return;

    const daysArray = generateDaysArray();
    const headers = ['Employee Name', ...daysArray.map(day => moment(day).format('DD-MMM')), 'Total Hours'];

    const csvData = projectData.map(emp => {
      const row = [emp?.employeeName || ''];
      daysArray.forEach(day => {
        const dayData = emp?.dailyHours?.find(d => d?.date === day);
        row.push(dayData?.hours || 0);
      });
      row.push(emp?.totalHours || 0);
      return row;
    });

    const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-team-${projectInfo?.name || 'report'}-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    downloadCSV
  }));

  const navigateMonth = (direction) => {
    const newMonth = currentMonth.clone().add(direction, 'month');
    setCurrentMonth(newMonth);
    onDateChange?.(newMonth.clone().startOf('month').toDate(), newMonth.clone().endOf('month').toDate());
  };

  useEffect(() => {
    if (startDate && !currentMonth.isSame(moment(startDate), 'month')) {
      setCurrentMonth(moment(startDate));
    }
  }, [startDate]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectTeamData();
    }
  }, [selectedProject, currentMonth]);

  const daysArray = generateDaysArray();

  const getHoursForDate = (dailyHours, date) => {
    const dayData = dailyHours?.find(d => d?.date === date);
    return dayData?.hours || 0;
  };

  return (
    <div className="project-table-container">
      {/* Month Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-0">
        <button
          className="month-nav d-flex align-items-center"
          onClick={() => navigateMonth(-1)}
          style={{ padding: '4px 12px', fontSize: '11px' }}        >
          <i className="uil uil-angle-left me-1"></i>
          {`Previous`}
        </button>
        <h6 className="mb-0 fw-bold text-center" style={{ fontSize: '14px' }}>
          {currentMonth.format('MMMM YYYY')}
        </h6>
        <button
          className="month-nav d-flex align-items-center"
          onClick={() => navigateMonth(1)}
          style={{ padding: '4px 12px', fontSize: '11px' }}        >
          {`Next`}
          <i className="uil uil-angle-right ms-1"></i>
        </button>
      </div>
      <style>{`
        .project-table-container ::-webkit-scrollbar {
          display: none;
        }
        .project-table-container table {
          border-collapse: collapse;
        }
        .project-table-container th,
        .project-table-container td {
          border: 1px solid #dee2e6 !important;
        }
        .project-table-container tbody tr:nth-child(even) {
          background-color: #f8f9fa !important;
        }
        .project-table-container tbody tr:nth-child(odd) {
          background-color: #ffffff !important;
        }
        .project-table-container tbody tr:hover {
          background-color: #e3f2fd !important;
          transition: background-color 0.2s ease;
        }
      `}</style>
      {/* Fixed Headers */}
      <div className="d-flex" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}>
        <div style={{ minWidth: '250px', borderRight: '2px solid #dee2e6' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px' }}>
            <thead className="table-dark">
              <tr>
                <th className='fw-bold' style={{ minWidth: '150px' }}>{`Employee Name`}</th>
                <th className='fw-bold' style={{ minWidth: '100px' }}>{`Total Hours`}</th>
              </tr>
            </thead>
          </Table>
        </div>
        <div ref={headerScrollRef} onScroll={handleHorizontalScroll} style={{ flex: 1, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px', minWidth: `${daysArray.length * 80}px` }}>
            <thead className="table-dark">
              <tr>
                {daysArray.map(day => (
                  <th className='fw-bold' key={day} style={{ minWidth: '80px', textAlign: 'center' }}>{moment(day).format('DD')}</th>
                ))}
              </tr>
            </thead>
          </Table>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="d-flex" style={{ maxHeight: '82vh' }}>
        <div ref={leftScrollRef} onScroll={handleVerticalScroll} style={{ minWidth: '250px', borderRight: '2px solid #dee2e6', maxHeight: '82vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px' }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={2} className='text-center py-5 fw-bold fs-5'>Please select a project</td>
                </tr>
              ) : projectData?.length === 0 ? (
                <tr>
                  <td colSpan={2} className='text-center py-5 fw-bold fs-5'>No Data Found</td>
                </tr>
              ) : (
                projectData?.map((employee, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    <td style={{ minWidth: '150px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee?.employeeName || 'N/A'}>{employee?.employeeName || 'N/A'}</td>
                    <td style={{ minWidth: '100px' }}>{employee?.totalHours || 0}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div ref={rightScrollRef} onScroll={(e) => { handleVerticalScroll(e); handleHorizontalScroll(e); }} style={{ flex: 1, overflowX: 'auto', maxHeight: '82vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px', minWidth: `${daysArray.length * 80}px` }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={daysArray.length} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={daysArray.length} className='text-center py-5 fw-bold fs-5'>Please select a project</td>
                </tr>
              ) : projectData?.length === 0 ? (
                <tr>
                  <td colSpan={daysArray.length} className='text-center py-5 fw-bold fs-5'>No Data Found</td>
                </tr>
              ) : (
                projectData?.map((employee, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    {daysArray.map(day => (
                      <td key={day} className="text-center" style={{ minWidth: '80px' }}>
                        {getHoursForDate(employee?.dailyHours, day) || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
});

export default ProjectTable;
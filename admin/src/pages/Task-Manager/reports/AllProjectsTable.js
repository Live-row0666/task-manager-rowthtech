import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'react-bootstrap';

const AllProjectsTable = forwardRef(({ startDate, endDate, onDateChange }, ref) => {
  const [projectsData, setProjectsData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());
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

  const fetchProjectsData = async (fromDate, toDate) => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    try {
      const dateFrom = moment(fromDate).format('YYYY-MM-DD');
      const dateTo = moment(toDate).format('YYYY-MM-DD');

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/reports/project-daily?dateFrom=${dateFrom}&dateTo=${dateTo}&projectType=${selectedDepartment}`);

      if (response?.data?.status === 200) {
        setProjectsData(response?.data?.data || []);
        setDateRange(response?.data?.dateRange || { from: dateFrom, to: dateTo });
      }
    } catch (error) {
      console.error(error, 'Error fetching the projects report');
      setProjectsData([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = moment(currentMonth).add(direction, 'month');
    setCurrentMonth(newMonth);
    const monthStart = newMonth.clone().startOf('month');
    const monthEnd = newMonth.clone().endOf('month');
    fetchProjectsData(monthStart, monthEnd);
    onDateChange?.(monthStart.toDate(), monthEnd.toDate());
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
    if (!projectsData?.length) return;

    const daysArray = generateDaysArray();
    const headers = ['Project Name', ...daysArray.map(day => moment(day).format('DD-MMM')), 'Total Hours'];

    const csvData = projectsData.map(project => {
      const row = [project?.projectName || ''];
      daysArray.forEach(day => {
        const dayData = project?.dailyHours?.find(d => d?.date === day);
        row.push(dayData?.hours || 0);
      });
      row.push(project?.totalHours || 0);
      return row;
    });

    const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-daily-summary-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    downloadCSV
  }));

  useEffect(() => {
    // Always load current month data on component mount
    const monthStart = currentMonth.clone().startOf('month');
    const monthEnd = currentMonth.clone().endOf('month');
    fetchProjectsData(monthStart, monthEnd);
  }, []);

  const daysArray = generateDaysArray();

  const getHoursForDate = (dailyHours, date) => {
    const dayData = dailyHours?.find(d => d?.date === date);
    return dayData?.hours || 0;
  };

  return (
    <div className="projects-table-container">
      {/* Month Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-0">
        <button
          className=" month-nav d-flex align-items-center"
          onClick={() => navigateMonth(-1)}
          style={{ padding: '4px 12px', fontSize: '11px' }}>
          <i className="uil uil-angle-left me-1"></i>
          {`Previous`}
        </button>
        <h6 className="mb-0 fw-bold text-center" style={{ fontSize: '14px' }}>
          {currentMonth.format('MMMM YYYY')}
        </h6>
        <button
          className="month-nav d-flex align-items-center"
          onClick={() => navigateMonth(1)}
          style={{ padding: '4px 12px', fontSize: '11px' }}>
          {`Next`}
          <i className="uil uil-angle-right ms-1"></i>
        </button>
      </div>
      <style>{`
        .projects-table-container ::-webkit-scrollbar {
          display: none;
        }
        .projects-table-container table {
          border-collapse: collapse;
        }
        .projects-table-container th,
        .projects-table-container td {
          border: 1px solid #dee2e6 !important;
        }
        .projects-table-container tbody tr:nth-child(even) {
          background-color: #f8f9fa !important;
        }
        .projects-table-container tbody tr:nth-child(odd) {
          background-color: #ffffff !important;
        }
        .projects-table-container tbody tr:hover {
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
                <th className='fw-bold text-start' style={{ minWidth: '150px' }}>{`Project Name`}</th>
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
      <div className="d-flex" style={{ maxHeight: '80vh' }}>
        <div ref={leftScrollRef} onScroll={handleVerticalScroll} style={{ minWidth: '250px', borderRight: '2px solid #dee2e6', maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px' }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">{`Loading...`}</span>
                    </div>
                  </td>
                </tr>
              ) : projectsData?.length === 0 ? (
                <tr>
                  <td colSpan={2} className='text-center py-5 fw-bold fs-5'>{`No Data Found`}</td>
                </tr>
              ) : (
                projectsData?.map((project, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    <td
                      style={{ minWidth: '150px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={project?.projectName || 'N/A'}
                      className='text-start'
                    >{project?.projectName || 'N/A'}</td>
                    <td style={{ minWidth: '100px' }}>{project?.totalHours || 0}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div ref={rightScrollRef} onScroll={(e) => { handleVerticalScroll(e); handleHorizontalScroll(e); }} style={{ flex: 1, overflowX: 'auto', maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px', minWidth: `${daysArray.length * 80}px` }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={daysArray.length} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">{`Loading...`}</span>
                    </div>
                  </td>
                </tr>
              ) : projectsData?.length === 0 ? (
                <tr>
                  <td colSpan={daysArray.length} className='text-center py-5 fw-bold fs-5'>{`No Data Found`}</td>
                </tr>
              ) : (
                projectsData?.map((project, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    {daysArray.map(day => (
                      <td key={day} className="text-center" style={{ minWidth: '80px' }}>
                        {getHoursForDate(project?.dailyHours, day) || '-'}
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

export default AllProjectsTable;
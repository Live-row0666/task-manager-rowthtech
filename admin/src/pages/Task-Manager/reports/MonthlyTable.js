import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'react-bootstrap';

const MonthlyTable = forwardRef(({ startDate, employeeId, onMonthChange }, ref) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(31);
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

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const month = currentMonth.format('YYYY-MM');

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/reports/monthly-summary?month=${month}&employeeId=${employeeId || ''}&projectType=${selectedDepartment}`);

      if (response?.data?.status === 200) {
        setMonthlyData(response?.data?.data || []);
        setDaysInMonth(response?.data?.daysInMonth || 31);
      }
    } catch (error) {
      console.error(error, 'Error fetching the Monthly report');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!monthlyData?.length) return;

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const headers = ['Employee Name', 'Total Hours', ...daysArray.map(day => `Day ${day}`)];

    const csvData = monthlyData.map(emp => {
      const row = [emp?.employeeName || '', emp?.totalMonthHours || 0];
      daysArray.forEach(day => {
        const dayData = emp?.dailyHours?.find(d => d?.day === day);
        row.push(dayData?.hours || 0);
      });
      return row;
    });

    const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-summary-${moment(startDate).format('YYYY-MM')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    downloadCSV
  }));

  useEffect(() => {
    if (startDate) setCurrentMonth(moment(startDate));
  }, [startDate]);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth, employeeId]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getHoursForDay = (dailyHours, day) => {
    const dayData = dailyHours?.find(d => d?.day === day);
    return dayData?.hours || 0;
  };

  return (
    <div className="monthly-table-container">
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
          style={{ padding: '4px 12px', fontSize: '11px' }}        >
          {`Next`}
          <i className="uil uil-angle-right ms-1"></i>
        </button>
      </div>
      <style>{`
        .monthly-table-container ::-webkit-scrollbar {
          display: none;
        }
        .monthly-table-container table {
          table-layout: fixed;
        }
        .monthly-table-container th,
        .monthly-table-container td {
          padding: 8px !important;
          border: 1px solid #dee2e6 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .monthly-table-container tbody tr:nth-child(even) {
          background-color: #f8f9fa !important;
        }
        .monthly-table-container tbody tr:nth-child(odd) {
          background-color: #ffffff !important;
        }
        .monthly-table-container tbody tr:hover {
          background-color: #e3f2fd !important;
          transition: background-color 0.2s ease;
        }
      `}</style>
      {/* Fixed Headers */}
      <div className="d-flex" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}>
        <div style={{ width: '250px', borderRight: '2px solid #dee2e6' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px', width: '250px' }}>
            <thead className="table-dark">
              <tr>
                <th className='fw-bold' style={{ width: '150px' }}>Employee Name</th>
                <th className='fw-bold' style={{ width: '100px' }}>Total Hours</th>
              </tr>
            </thead>
          </Table>
        </div>
        <div ref={headerScrollRef} onScroll={handleHorizontalScroll} style={{ flex: 1, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px', width: `${daysInMonth * 60}px` }}>
            <thead className="table-dark">
              <tr>
                {daysArray.map(day => (
                  <th className='fw-bold' key={day} style={{ width: '60px', textAlign: 'center' }}>{day}</th>
                ))}
              </tr>
            </thead>
          </Table>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="d-flex" style={{ maxHeight: '83vh' }}>
        <div ref={leftScrollRef} onScroll={handleVerticalScroll} style={{ width: '250px', borderRight: '2px solid #dee2e6', maxHeight: '83vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-sm" style={{ fontSize: '11px', width: '250px' }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : monthlyData?.length === 0 ? (
                <tr>
                  <td colSpan={2} className='text-center py-5 fw-bold fs-5'>No Data Found</td>
                </tr>
              ) : (
                monthlyData?.map((employee, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    <td style={{ width: '150px' }}>{employee?.employeeName || 'N/A'}</td>
                    <td style={{ width: '100px' }}>{employee?.totalMonthHours || 0}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div ref={rightScrollRef} onScroll={(e) => { handleVerticalScroll(e); handleHorizontalScroll(e); }} style={{ flex: 1, overflowX: 'auto', maxHeight: '83vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', msOverflowStyle: 'none' }}>
          <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px', width: `${daysInMonth * 60}px` }}>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={daysInMonth} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : monthlyData?.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth} className='text-center py-5 fw-bold fs-5'>No Data Found</td>
                </tr>
              ) : (
                monthlyData?.map((employee, index) => (
                  <tr key={index} className="align-middle" data-row-index={index}>
                    {daysArray?.map(day => (
                      <td key={day} className="text-center" style={{ width: '60px' }}>
                        {getHoursForDay(employee?.dailyHours, day) || '-'}
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

export default MonthlyTable;
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'react-bootstrap';

const EmployeesTable = forwardRef(({ startDate, endDate, projectId, employeeId }, ref) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedDepartment = localStorage.getItem('selectedDepartment');
  const fetchEmployeeData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const dateFrom = moment(startDate).format('YYYY-MM-DD');
      const dateTo = moment(endDate).format('YYYY-MM-DD');

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/reports/employee-daily?dateFrom=${dateFrom}&dateTo=${dateTo}&projectId=${projectId || ''}&employeeId=${employeeId || ''}&projectType=${selectedDepartment}`);

      if (response?.data?.status === 200) {
        setEmployeeData(response?.data?.data || []);
      }
    } catch (error) {
      console.error(error, 'Error fetching the employee report');
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!employeeData?.length) return;

    const headers = ['Date', 'Employee Name', 'Designation', 'Task Title', 'Project Name', 'Start Time', 'End Time', 'Total Hours', 'Task Status'];

    const csvData = employeeData.map(emp => [
      emp?.date || '',
      emp?.employeeName || '',
      emp?.designation ?
        emp.designation === 'Backend + Devops' ? 'Backend + Devops' :
          emp.designation.toLowerCase().includes('backend') ? 'Backend' :
            emp.designation.toLowerCase().includes('frontend') ? 'Frontend' :
              emp.designation === 'Graphic Designer' ? 'UI/UX' :
                emp.designation === 'Flutter Developer' ? 'Mobile Developer' :
                  emp.designation
        : 'N/A',
      emp?.taskTitle || '',
      emp?.projectName || '',
      emp?.startTime ? moment(emp.startTime).format('HH:mm') : '',
      emp?.endTime ? moment(emp.endTime).format('HH:mm') : '',
      // emp?.breakTimeHours || 0,
      emp?.totalLoggedTimeHours || 0,
      emp?.taskStatus || ''
    ]);

    const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-daily-logs-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    downloadCSV
  }));

  useEffect(() => {
    fetchEmployeeData();
  }, [startDate, endDate, projectId, employeeId]);

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Done: 'bg-primary-subtle text-primary',
      Testing: 'bg-warning-subtle text-warning',
      'In Progress': 'bg-success-subtle text-success',
      closed: 'bg-secondary-subtle text-dark'
    };
    return `badge ${badgeClasses[status] || 'bg-light text-dark'}`;
  };
  const formatHours = (decimalHours, type = 'label') => {
    // If input is invalid or '-'
    if (!decimalHours || decimalHours === '-' || isNaN(decimalHours)) {
      const minutes = Math.round((parseFloat(decimalHours) || 0) * 60);
      return `${minutes}m`;
    }

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    if (hours <= 0) return `${minutes}m`;

    if (type === 'label') return `${hours}h ${minutes}m`;
    if (type === 'time') return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} hrs`;
    return `${hours}h ${minutes}m`;
  };



  return (
    <div>
      <div className="table-responsive" style={{ overflowY: 'auto', maxHeight: '82vh', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
        <Table className="mb-0 table-hover" style={{ fontSize: '11px', width: '100%', tableLayout: 'fixed' }}>
          <thead className="table-dark sticky-top">
            <tr>
              <th className='fw-bold' style={{ width: '13%' }}>Date</th>
              <th className='fw-bold' style={{ width: '13%' }}>Employee Name</th>
              <th className='fw-bold' style={{ width: '12%' }}>Designation</th>
              <th className='fw-bold' style={{ width: '22%' }}>Task Title</th>
              <th className='fw-bold' style={{ width: '15%' }}>Project Name</th>
              {/* <th className='fw-bold' style={{ width: '7%' }}>Start Time</th> */}
              {/* <th className='fw-bold' style={{ width: '7%' }}>End Time</th> */}
              <th className='fw-bold' style={{ width: '8%' }}>Estimated Time</th>
              <th className='fw-bold' style={{ width: '7%' }}>Total Hours</th>
              <th className='fw-bold' style={{ width: '10%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : employeeData?.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-5 fw-bold fs-5">No data found</td>
              </tr>
            ) : (
              employeeData?.map((employee, index) => (
                <tr key={index} className="align-middle">
                  <td>{employee?.date ? moment(employee?.date).format('DD-MM-YYYY') : 'N/A'}</td>
                  <td className="text-truncate" title={employee?.employeeName}>{employee?.employeeName || 'N/A'}</td>
                  <td title={employee?.designation} className='text-truncate'>
                    {employee?.designation ?
                      employee.designation === 'Backend + Devops' ? 'Backend + Devops' :
                        employee.designation.toLowerCase().includes('backend') ? 'Backend' :
                          employee.designation.toLowerCase().includes('frontend') ? 'Frontend' :
                            employee.designation === 'Graphic Designer' ? 'UI/UX' :
                              employee.designation === 'Flutter Developer' ? 'Mobile Developer' :
                                employee.designation
                      : 'N/A'}
                  </td>
                  <td className="text-truncate">{employee?.taskTitle || 'N/A'}</td>

                  <td className="text-truncate">{employee?.projectName || 'N/A'}</td>
                  {/* <td className="text-truncate">{employee?.startTime ? moment(employee?.startTime).format("hh:mm A") : 'N/A'}</td>
                  <td className="text-truncate">{employee?.endTime ? moment(employee?.endTime).format("hh:mm A") : 'N/A'}</td> */}
                  <td className="text-truncate">
                    {formatHours(employee?.estimatedHours, 'label')}
                  </td>
                  <td className="text-truncate">
                    {formatHours(employee?.totalLoggedTimeHours, 'label')}
                  </td>
                  <td className="text-truncate">
                    <span className={`${getStatusBadge(employee?.taskStatus)} text-capitalize`} style={{ width: '4vw', padding: '6px', fontSize: '10px' }}>
                      {(employee?.taskStatus).replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
});

export default EmployeesTable;
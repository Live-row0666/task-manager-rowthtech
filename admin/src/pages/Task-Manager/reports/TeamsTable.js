import React, { useState, useImperativeHandle, useEffect } from "react";
import { Table } from "react-bootstrap";
import moment from "moment";
import axios from "axios";



const TeamsTable = React.forwardRef(({ projectId }, ref) => {
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState({ projects: [], teamMembers: [], summary: {} });
  const selectedDepartment = localStorage.getItem('selectedDepartment');

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/team-project-tracker?projectId=${projectId || ''}&projectType=${selectedDepartment}`);

      if (response?.data?.status === 200) {
        setTeamData(response?.data?.data || { projects: [], teamMembers: [], summary: {} });
      }
    } catch (error) {
      console.error(error, 'Error fetching the project team report');
      setTeamData({ projects: [], teamMembers: [], summary: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [projectId]);

  const getTeamInfo = (memberId) => {
    const member = teamData.teamMembers?.find(m => m._id === memberId);
    if (!member) return null;

    const teamColors = {
      'mobileTeam': 'warning',
      'backendTeam': 'primary',
      'webTeam': 'info',
      'uiDesigner': 'success',
      'general': 'secondary'
    };

    const teamNames = {
      'mobileTeam': 'Mobile Team',
      'backendTeam': 'Backend Team',
      'webTeam': 'Web Team',
      'uiDesigner': 'UI Designer',
      'general': 'General'
    };

    return {
      name: teamNames[member.teamCategory] || 'General',
      color: teamColors[member.teamCategory] || 'secondary'
    };
  };

  const downloadCSV = () => {
    const headers = ['Project', ...(teamData.teamMembers?.map(m => m.name) || [])];
    const csvData = (teamData.projects || []).map(project => [
      project.name,
      ...(teamData.teamMembers || []).map(member =>
        project.teamMembers?.includes(member._id) ? 'Yes' : 'No'
      )
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams-report-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    downloadCSV
  }));



  const teamColors = {
    'mobileTeam': 'warning',
    'backendTeam': 'primary',
    'webTeam': 'info',
    'uiDesigner': 'success',
    'general': 'secondary'
  };

  return (
    <div>
      {/* Main Table */}
      <div className="table-responsive" style={{ overflowY: 'auto', maxHeight: '84vh', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
        <Table className="mb-0 table-hover" style={{ fontSize: '11px', width: '100%' }}>
          <thead className="sticky-top">
            <tr>
              <th className="fw-bold text-white" style={{
                minWidth: '120px',
                position: 'sticky',
                left: 0,
                zIndex: 10,
                backgroundColor: '#313A46',
                borderRight: '2px solid  rgba(255,255,255,0.2)'
              }}>
                <div>
                  <i className="uil uil-users-alt me-1"></i>
                  <span className="text-center">Teams</span>
                </div>
              </th>
              {Object.entries(teamData?.summary?.teamCategories || {}).map(([teamName, count]) => {
                const teamDisplayNames = {
                  'mobileTeam': 'Mobile Team',
                  'backendTeam': 'Backend Team',
                  'webTeam': 'Web Team',
                  'uiDesigner': 'UI Designer',
                  'general': 'QA'
                };
                return (
                  <th
                    key={teamName}
                    colSpan={count}
                    className="fw-bold text-center text-white"
                    style={{
                      backgroundColor: `var(--bs-${teamColors[teamName] || 'secondary'})`,
                      borderLeft: '1px solid rgba(255,255,255,0.2)',
                      borderRight: '1px solid rgba(255,255,255,0.2)',
                      padding: '12px 8px'
                    }}
                  >
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <div className="d-flex align-items-center">
                        <i className="uil uil-users-alt me-1"></i>
                        <span style={{ whiteSpace: 'nowrap' }}>{teamDisplayNames[teamName] || 'General'}</span>
                        <span className="ms-1 bg-light text-primary px-1 rounded-circle">{count}</span>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
            <tr>
              <th className="fw-bold text-white" style={{
                position: 'sticky',
                left: 0,
                zIndex: 10,
                backgroundColor: '#313A46',
                borderRight: '2px solid rgba(255,255,255,0.2)'
              }}>
                <i className="uil uil-user-square me-1"></i>
                Team Members
              </th>
              {Object.entries(teamData?.summary?.teamCategories || {}).map(([teamName]) => {
                const teamMembers = (teamData.teamMembers || []).filter(member => member.teamCategory === teamName);
                return teamMembers.map((member) => (
                  <th
                    key={member._id}
                    className="fw-bold text-center border-start border-end border-light"
                    style={{
                      minWidth: '80px',
                      backgroundColor: `var(--bs-${teamColors[teamName] || 'secondary'})`,
                      color: 'white',
                      textOrientation: 'mixed',
                      borderColor: 'rgba(255,255,255,0.2) !important'
                    }}
                  >
                    <div>
                      {member.name}
                    </div>
                  </th>
                ));
              }).flat()}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={(teamData.teamMembers?.length || 0) + 1} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : (teamData.projects || []).length === 0 ? (
              <tr>
                <td colSpan={(teamData.teamMembers?.length || 0) + 1} className="text-center py-5 fw-bold fs-5">No data found</td>
              </tr>
            ) : (
              teamData?.projects?.map((project, index) => {
                return (
                  <tr key={project._id} className={`align-middle ${index % 2 === 0 ? 'table-light' : ''}`}>
                    <td
                      className="fw-semibold text-truncate"
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                        borderRight: '2px solid #dee2e6'
                      }}
                      title={project?.name}
                    >
                      <i className="uil uil-file-alt me-1 text-muted"></i>
                      {project?.name}
                    </td>
                    {Object.entries(teamData?.summary?.teamCategories || {}).map(([teamName]) => {
                      const teamMembers = (teamData.teamMembers || []).filter(member => member.teamCategory === teamName);
                      return teamMembers.map((member) => {
                        const isAssigned = project.team?.includes(member._id);
                        return (
                          <td
                            key={`${project._id}-${member._id}`}
                            className="text-center border-start border-end "
                            style={{
                              backgroundColor: 'white',
                              borderColor: '#e9ecef',
                            }}
                          >
                            {isAssigned ? (
                              <i className={`uil uil-check-circle text-${teamColors[member.teamCategory] || 'secondary'}`} style={{ fontSize: '18px' }} title={`${member.name} assigned to ${project.name}`}></i>
                            ) : (
                              <i className="uil uil-minus-circle text-dark" style={{ fontSize: '16px', opacity: 0.1 }}></i>
                            )}
                          </td>
                        );
                      });
                    }).flat()}
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
});

export default TeamsTable;

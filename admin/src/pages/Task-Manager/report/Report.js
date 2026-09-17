import { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { getAllReports } from '../../../redux/report/action'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@mui/material/Pagination';

function Report() {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const [skip, setSkip] = useState(1);
    const userReport = store?.getReport?.data?.userProjects;
    useEffect(() => {
        dispatch(getAllReports({ skip: 1 }));
    }, [dispatch])
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getAllReports({ skip: value }));
    };
    return (
        <div className='bg-white' style={{ height: '100vh', overflowY: 'auto' }}>
            <div className="row">
                <div className="col-12 d-flex align-items-center justify-content-center">
                    <h4 className="header-title py-1 my-2  heading_data page_headings">Users Report</h4>
                </div>
                <div className="col-12">
                    <table className="table">
                        <thead>
                            <tr className='text-start'>
                                <th className='fw-bold'>#</th>
                                <th className='fw-bold'>Assignee Name</th>
                                <th className='fw-bold'>Designation</th>
                                <th className='fw-bold'>Tech Stack</th>
                                <th className='fw-bold'>Project</th>
                                <th className='fw-bold'>Project 2</th>
                                <th className='fw-bold'>Project 3</th>
                                <th className='fw-bold'>Project Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userReport?.map((report, index) => {
                                return (
                                    <tr className='text-start' key={index}>
                                        <td className='fw-bold'>{index + 1}</td>
                                        <td>{report?.User_First_Name ? report.User_First_Name.charAt(0).toUpperCase() + report?.User_First_Name?.slice(1) : 'N/A'} {report?.User_Last_Name ? report.User_Last_Name.charAt(0).toUpperCase() + report?.User_Last_Name?.slice(1) : ' '}</td>
                                        <td>{report?.Designation || 'N/A'}</td>
                                        <td>{report?.Technology}</td>
                                        <td>{report?.projects?.[0]?.projectName}</td>
                                        <td>{report?.projects?.[1]?.projectName || 'N/A'}</td>
                                        <td>{report?.projects?.[2]?.projectName || 'N/A'}</td>
                                        <td>{report?.projects?.[0]?.projectType}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="col-12 d-flex justify-content-end">
                    <Pagination
                        defaultPage={skip}
                        className='my-2 mx-2'
                        count={store?.getProject?.data?.totalPages}
                        color="primary"
                        variant="outlined"
                        onChange={handlePaginationChange}
                    />
                </div>
            </div>
        </div >
    );
}

export default Report;

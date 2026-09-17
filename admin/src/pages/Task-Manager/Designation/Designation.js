import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import DesignationModal from './DesignationModal';
import axios from 'axios';

const Designation = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editData, setEditData] = useState();
    const [designationSearch, setDesignationSearch] = useState('');
    const [status, setStatus] = useState(true);
    const [designationData, setDesignationData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchDesignations = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/admin/designation?status=${status}&search=${designationSearch}&page=${currentPage}`);
            if (response.status === 200) {
                setDesignationData(response?.data?.data?.designations);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, [status, designationSearch, currentPage]);

    // Callback function to refetch data after successful create/edit
    const handleDesignationChange = () => {
        fetchDesignations();
    };

    const handleCreate = () => {
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };

    const handleUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };

    const closeUpdateModal = () => {
        setOpenEditModal(false);
    };

    const handleActive = (val) => {
        setStatus(val);
        setCurrentPage(1);
    };

    const truncateText = (text, maxLength = 25) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <>
            <div>
                <Card className='' style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}>
                    <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="mb-0">
                            <div className="d-flex justify-content-end align-items-center mb-2">
                                {/* <div className="d-flex align-items-center gap-3">
                                    <h5 className="mb-0 fw-bold">Designations</h5>
                                </div> */}
                                <div className="d-flex align-items-center gap-1">
                                    {/* Designation search input with clear (cross) icon */}
                                    <div style={{ position: 'relative', width: '10vw' }}>
                                        <input
                                            type="text"
                                            style={{ padding: '4px 22px 4px 8px', fontSize: '11px', width: '100%' }}
                                            className='form-control'
                                            placeholder="Search designations..."
                                            value={typeof designationSearch !== 'undefined' ? designationSearch : ''}
                                            onChange={e => {
                                                setDesignationSearch(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                        {designationSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDesignationSearch('');
                                                    setCurrentPage(1);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#888'
                                                }}
                                                aria-label="Clear search"
                                            >
                                                &#10005;
                                            </button>
                                        )}
                                    </div>
                                    <select style={{ padding: '4px 16px', fontSize: '11px', width: '7vw' }} className='form-select' onChange={(e) => {
                                        if (e.target.value === 'Active') {
                                            handleActive(true);
                                        } else {
                                            handleActive(false);
                                        }
                                    }}>
                                        {['Active', 'Inactive']?.map((data, index) => (
                                            <option key={index} value={data}>{data}</option>
                                        ))}
                                    </select>
                                    <button className="btn text-nowrap bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleCreate()}>
                                        Add Designation
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <h5 className="text-muted">Loading...</h5>
                                </div>
                            ) : (!Array.isArray(designationData) || designationData.length === 0) ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <h5 className="text-muted">No Data Found</h5>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ height: '83vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                                    <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%', minWidth: '800px' }}>
                                        <thead className="table-dark sticky-top">
                                            <tr>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '80px' }}>S.No.</th>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '200px' }}>Name</th>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '300px' }}>Description</th>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '100px' }}>Status</th>
                                                <th className='fw-bold fs-6 text-center' style={{ width: '120px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {designationData?.map((ele, ind) => {
                                                return (
                                                    <tr className="align-middle" key={ele._id} style={{ transition: 'all 0.2s ease' }}>
                                                        <td className='text-start' style={{ width: '80px' }}>{ind + 1}</td>
                                                        <td className="text-start" style={{ fontSize: '12px', width: '200px', wordWrap: 'break-word' }}>
                                                            <span className="namelink text-dark fw-semibold text-capitalize">
                                                                {truncateText(ele?.name, 25)}
                                                            </span>
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px', width: '300px', wordWrap: 'break-word' }}>
                                                            <span className="text-muted" title={ele?.description}>
                                                                {truncateText(ele?.description, 40)}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ width: '100px' }}>
                                                            <span className={`badge py-1 ${ele?.isActive ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px', width: '3vw' }}>
                                                                {ele?.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ width: '120px' }}>
                                                            <div className='d-flex justify-content-center gap-1'>
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                    onClick={() => handleUpdate(ele)}>
                                                                    <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                <DesignationModal
                    modal={openModal}
                    closeModal={closeModal}
                    onSuccess={handleDesignationChange}
                />
                <DesignationModal
                    modal={openEditModal}
                    closeModal={closeUpdateModal}
                    editData={editData}
                    onSuccess={handleDesignationChange}
                />
            </div>
        </>
    );
};

export default Designation;
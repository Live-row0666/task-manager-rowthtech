import React, { useState, useEffect } from 'react';
// import { getDocumenetsSiteAdminActions } from '../../../redux/actions';

import { getAllUsers } from '../../../redux/user/action';
import { useSelector, useDispatch } from 'react-redux';

const Pagination = ({ totalRecords, handlePageChange, skip, currentPage }) => {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAllUsers({ page: 1 }));
    }, []);
    const totalPages = Math.ceil(totalRecords / 10);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const renderPageNumbers = () => {
        const visiblePages = 5;
        const maxPages = Math.min(visiblePages, totalPages);

        const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        const endPage = Math.min(startPage + maxPages - 1, totalPages);

        return pageNumbers?.slice(startPage - 1, endPage).map((number) => (
            <button
                key={number}
                className={`btn ${number === currentPage ? 'btn-dark' : 'btn-outline-dark'} mx-1`}
                onClick={() => handlePageChange(number)}>
                {number}
            </button>
        ));
    };

    return (
        <>
            <div className="row pb-3">
                <div className="col-2 mt-2">
                    <span className="ms-2 border p-1 ms-3">Total Records: {totalRecords}</span>
                </div>
                <div className="col-10">
                    <div className="d-flex justify-content-end align-items-center">
                        <div className="d-flex align-items-center me-3">
                            <button
                                className="btn btn-outline-dark mr-2"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}>
                                Previous
                            </button>
                            {renderPageNumbers()}
                            <button
                                className="btn btn-outline-dark ml-2"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Pagination;

import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getAllTechnology } from '../../../../redux/technology/action';
import Create from '../../Technology/modal/create';

const TechnologyModalWrapper = ({ show, onHide, onTechnologyAdded }) => {
    const dispatch = useDispatch();
    
    // Refresh technologies list when modal is shown
    useEffect(() => {
        if (show) {
            dispatch(getAllTechnology({ status: true }));
        }
    }, [show, dispatch]);

    const handleClose = (action) => {
        if (action === 'render' && typeof onTechnologyAdded === 'function') {
            onTechnologyAdded();
        }
        onHide();
    };

    return (
        <Create 
            modal={show} 
            closeModal={handleClose} 
        />
    );
};

export default TechnologyModalWrapper;
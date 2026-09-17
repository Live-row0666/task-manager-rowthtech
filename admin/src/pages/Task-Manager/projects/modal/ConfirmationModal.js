import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message }) => {
    return (
        <Modal show={show} onHide={onHide} top size="md">
            <Modal.Header className='py-2' >
                <Modal.Title className='fs-5 text-black fw-semibold'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className="btn btn-outline-secondary fw-semibold"
                    style={{ padding: '4px 16px', fontSize: '11px' }}
                    onClick={onHide}
                >
                    Cancel
                </button>
                <button
                    className="btn bg-dark text-white fw-semibold"
                    style={{ padding: '4px 16px', fontSize: '11px' }}
                    onClick={onConfirm}>
                    Confirm
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
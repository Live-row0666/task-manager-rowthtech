import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeletionModal = ({ show, onHide, onConfirm, item = 'item', isLoading = false }) => {

    return (
        <Modal show={show} onHide={onHide} size="md" centered>
            <Modal.Header className='text-center'>
                <Modal.Title className='text-center'>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center py-4 fs-5'>Are you sure you want to delete the selected <strong>{item}</strong>?</Modal.Body>
            <Modal.Footer>
                <Button disabled={isLoading} className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                    style={{ padding: '4px 12px', fontSize: '11px' }} onClick={onHide}>
                    Cancel
                </Button>
                <Button disabled={isLoading} className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                    style={{ padding: '4px 12px', fontSize: '11px' }} onClick={onConfirm}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeletionModal;
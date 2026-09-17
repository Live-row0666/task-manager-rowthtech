import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmText = "Continue", cancelText = "Cancel" }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                    style={{ padding: '4px 12px', fontSize: '11px' }} onClick={onHide}>
                    {cancelText}
                </Button>
                <Button className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                    style={{ padding: '4px 12px', fontSize: '11px' }} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
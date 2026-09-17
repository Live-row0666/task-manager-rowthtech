import React from "react";
import { Modal, Row, Col, Button, CloseButton } from 'react-bootstrap';

const MainDeleteModel = (props) => {
    const { deleteModel, onHide, comfimDelete } = props
    return (<>
        <Modal show={deleteModel}
            onHide={onHide}
        >
            <Row>
                <Col lg={12} className="text-end mt-1 ">
                    <CloseButton
                        className="pe-2"
                    onClick={() => {
                        onHide();
                    }}
                    />
                </Col>
            </Row>

            <Modal.Body>Are you sure you want to delete this User</Modal.Body>
            <Modal.Footer>
                <Button className=" web_button " variant="primary"
                    onClick={comfimDelete}
                >
                    Yes
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        onHide()
                    }}
                >
                    No
                </Button>
            </Modal.Footer>
        </Modal></>)
}

export default MainDeleteModel;
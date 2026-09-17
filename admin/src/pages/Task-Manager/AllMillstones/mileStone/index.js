import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ListGroup, Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getMileStoneById } from '../../../../redux/milestone/action';
import Create from './Sprint/Create';
import moment from 'moment';
import "../../projects/milestone/milstone.css"
import { getSingleSprint } from './../../../../redux/sprint/action';
import MainLoader from '../../../../constants/Loader/loader';
const MileStone = () => {
    const { id } = useParams();
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const [data, setData] = useState();
    const [render, setRender] = useState(false);
    const [openModal, SetOpenModal] = useState(false);
    const successHandle = store?.getMileStone;
    const GetAllSingleSprintData = store?.getAllSingleSprints?.data?.Response;
    const handleCreate = () => {
        SetOpenModal(true);
    };
    const CloseModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        SetOpenModal(false);
    };
    useEffect(() => {
        dispatch(getMileStoneById(id));
        dispatch(getSingleSprint(id));
    }, [render]);

    useEffect(() => {
        if (successHandle?.data?.status == 200) {
            setData(successHandle?.data?.data);
        }
    }, [successHandle]);

    return (
        <>
            <Row>
                <Col className="text-end mt-2 " lg={12}>
                    <Button
                        onClick={handleCreate}
                        variant="info"
                        type="submit"
                        className="btn fs-5  text-white p-1   web_button">
                        Create Sprint
                    </Button>
                </Col>
            </Row>
            {successHandle?.loading ? (<MainLoader />) : (
                <Row>
                    <Col lg={4}>
                        <Row>
                            <Col className="text-center" lg={12}>
                                <h4> MileStone</h4>
                            </Col>

                            <ListGroup as="ol" numbered style={{ marginLeft: '20px', position: 'sticky' }}>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b> MileStone Title : </b>
                                            <i>{data?.title}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>Description : </b>
                                            <i>{data?.description}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>Start Date : </b>
                                            <i>{moment(data?.startDate).format('L')}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>End Date : </b>
                                            <i>{moment(data?.completion_date).format('L')}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>

                            </ListGroup>
                        </Row>
                    </Col>
                    <Col className="mx-auto" lg={7}>
                        <Row>
                            <Col className="text-center" lg={12}>
                                {' '}
                                <h4>Sprints</h4>
                            </Col>
                            <Col className="" lg={12}>
                                <Table>
                                    <thead className=" btom_Line_hide">
                                        <tr>
                                            <th>Sprint Name</th>
                                            <th>Sprint Description</th>
                                            <th>Sprint Start Date</th>
                                            <th>Sprint End Date</th>
                                        </tr>
                                        {GetAllSingleSprintData?.map((item, index) =>
                                            <tr>
                                                <td>{item?.sprintName}</td>
                                                <td>{item?.sprintDesc}</td>

                                                <td>  {moment(item?.startDate).format('L')}</td>
                                                <td>{moment(item?.endDate).format('L')}</td>
                                            </tr>
                                        )}
                                    </thead>
                                </Table>
                            </Col>
                        </Row>
                    </Col>

                </Row>
            )}
            <Create modal={openModal} CloseModal={CloseModal} id={id} data={data} />
        </>
    );
};

export default MileStone;

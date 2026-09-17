import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ListGroup, Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getSprintById } from '../../../../redux/sprint/action';
import Create from './Task/Create';
import moment from 'moment';
import { getsingleSprintTask } from '../../../../redux/task/action';
import MainLoader from '../../../../constants/Loader/loader';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
const Sprint = () => {
    const { id } = useParams();
    const [skip, setSkip] = useState(1);
    const store = useSelector((state) => state);
    const [openModal, SetOpenModal] = useState(false);
    const dispatch = useDispatch();
    const [render, setRender] = useState(false);
    const getSingleSprintList = store?.getSingleSprint?.data?.data;
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.Response;
    const loaderhandel = store?.getSigleSprintTask;
    const handleCreate = () => {
        SetOpenModal(true);
    };
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getsingleSprintTask({ id: id, skip: value }));
    };
    const CloseModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        SetOpenModal(false);
    };
    useEffect(() => {
        dispatch(getSprintById(id));
        dispatch(getsingleSprintTask({ id: id, skip: 1 }));
    }, [render]);

    return (
        <>
            <Row>
                <Col className="text-end mt-2 " lg={12}>
                    <Button
                        onClick={handleCreate}
                        variant="info"
                        type="submit"
                        className="btn fs-5  text-white p-1   web_button">
                        Create Task
                    </Button>
                </Col>
            </Row>
            {loaderhandel.loading ? (
                <MainLoader />
            ) : (
                <Row>
                    <Col lg={4}>
                        <Row>
                            <Col className="text-center" lg={12}>
                                <h4> Sprint</h4>
                            </Col>
                            <ListGroup as="ol" numbered style={{ marginLeft: '20px', position: 'sticky' }}>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b> Spri : </b>
                                            <i>{getSingleSprintList?.sprintName}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>Description : </b>
                                            <i>{getSingleSprintList?.sprintDesc}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>Start Date : </b>
                                            <i>{moment(getSingleSprintList?.startDate).format('L')}</i>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="">
                                            <b>End Date : </b>
                                            <i>{moment(getSingleSprintList?.endDate).format('L')}</i>
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
                                <h4>Tasks</h4>
                            </Col>
                            <Col className="" lg={12}>
                                <Table>
                                    <thead className=" btom_Line_hide">
                                        <tr>
                                            <th>#</th>
                                            <th> Task Name</th>
                                            <th> Description</th>
                                            <th> Start Date</th>
                                            <th> End Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSingleSprintTask?.map((item, index) => (
                                            <tr>
                                                <td>{index + 1}</td>
                                                <td>{item?.task_name}</td>
                                                <td>{item?.task_summery}</td>
                                                <td> {moment(item?.createdAt).format('L')}</td>
                                                <td>{moment(item?.due_date).format('L')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={12} className="d-flex justify-content-end my-3 pe-4 position-absolute bottom-0">
                                {store?.getSigleSprintTask?.data?.totalPages > 0 && (
                                    <Stack spacing={2}>
                                        <Pagination
                                            defaultPage={skip}
                                            count={store?.getSigleSprintTask?.data?.totalPages}
                                            color="primary"
                                            variant="outlined"
                                            onChange={handlePaginationChange}
                                        />
                                    </Stack>
                                )}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}

            <Create modal={openModal} CloseModal={CloseModal} data={getSingleSprintList} />
        </>
    );
};

export default Sprint;

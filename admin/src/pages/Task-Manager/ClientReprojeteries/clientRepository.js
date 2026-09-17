import { React, useEffect } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjectsName } from '../../../redux/actions';
import { Link } from 'react-router-dom';
import MainLoader from '../../../constants/Loader/loader';
const ClientRepository = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const data = store?.getProjectNameReducer;

    return (
        <>
            <Card>
                <Card.Body>
                    <Row>
                        <Col lg={12} className="text-center">
                            <h4>All Projects</h4>
                        </Col>
                    </Row>
                    {data?.loading ? (
                        <MainLoader />
                    ) : (
                        <Row>
                            <Col lg={12}>
                                <div className="projects_info">
                                    {data?.data?.response?.map((ele, ind) => (
                                        <p
                                            style={{
                                                border: '2px solid gray',
                                                borderRadius: '4px',
                                                padding: '41px',
                                                margin: '1rem',
                                            }}>
                                            <Link to={`/dashboard/clientRepository/uploadData/projectId=/${ele?._id}`}>
                                                {ele?.projectName}
                                            </Link>
                                        </p>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default ClientRepository;

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col } from 'react-bootstrap';
import Create from './modal/create';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getuploadProjectDetailAction } from '../../../redux/clientRepository/action';
import image from '../../../../src/assets/images/photo.png';
import csv from '../../../../src/assets/images/csv.png';
import pdf from '../../../../src/assets/images/pdf.png';
import zip from '../../../../src/assets/images/zip.png';
import excel from '../../../../src/assets/images/msexcel.png';
import powerPoint from '../../../../src/assets/images/powerpoint.png';
import Word from '../../../../src/assets/images/word.png';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import MainLoader from '../../../constants/Loader/loader';
const Upload = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [openModal, SetOpenModal] = useState(false);
    const [render, setRender] = useState(false);
    const store = useSelector((state) => state);
    const [skip, setSkip] = useState(1);
    const getUploadedData = store?.getuploadProjectDetailReducer;
    const handleUpload = () => {
        SetOpenModal(true);
    };
    const closeModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        SetOpenModal(false);
    };
    useEffect(() => {
        dispatch(getuploadProjectDetailAction({ skip: skip, projectId: projectId }));
    }, [render]);
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getuploadProjectDetailAction({ skip: value, projectId: projectId }));
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <div className="col-12 d-flex align-items-center justify-content-center pe-0">
                        <Button className="web_button" variant="info" onClick={handleUpload}>
                            Upload
                            <span className="ms-1">
                                <i class="bi bi-arrow-down-circle"></i>
                            </span>
                        </Button>
                    </div>
                    <Row>
                        <Col lg={12}>
                            {getUploadedData?.loading ? (
                                <MainLoader />
                            ) : (
                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> File Name</th>
                                            <th> File</th>
                                            <th>Download</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getUploadedData?.data?.response?.map((ele, ind) => (
                                            <tr>
                                                <td>{(skip - 1) * 10 + ind + 1}</td>
                                                <td>{ele?.fileName}</td>
                                                <td className="d-flex align-items-center justify-content-center">
                                                    <div style={{ width: '3rem' }}>
                                                        {ele?.attachmentType == 'application/x-zip-compressed' ? (
                                                            <img style={{ width: '66%' }} src={zip} />
                                                        ) : '' ||
                                                            ele?.attachmentType == 'image/png' ||
                                                            ele?.attachmentType == 'image/jpeg' ||
                                                            ele?.attachmentType == 'image/webp' ? (
                                                            <img style={{ width: '66%' }} src={image} />
                                                        ) : '' || ele?.attachmentType == 'text/csv' ? (
                                                            <img style={{ width: '66%' }} src={csv} />
                                                        ) : '' || ele?.attachmentType == 'application/pdf' ? (
                                                            <img style={{ width: '66%' }} src={pdf} />
                                                        ) : '' ||
                                                            ele?.attachmentType ==
                                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? (
                                                            <img style={{ width: '66%' }} src={excel} />
                                                        ) : '' ||
                                                            ele?.attachmentType == 'application/vnd.ms-powerpoint' ? (
                                                            <img style={{ width: '66%' }} src={powerPoint} />
                                                        ) : '' || ele?.attachmentType == 'application/msword' ? (
                                                            <img style={{ width: '66%' }} src={Word} />
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <a href={ele?.attachment} download target="_blank">
                                                        <i className="mdi mdi-download m-0 p-0 cp font-20"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12} className="d-flex justify-content-end mt-3">
                            {store?.getuploadProjectDetailReducer?.data?.totalPages > 0 && (
                                <Stack spacing={2}>
                                    <Pagination
                                        defaultPage={skip}
                                        count={store?.getuploadProjectDetailReducer?.data?.totalPages}
                                        color="primary"
                                        variant="outlined"
                                        onChange={handlePaginationChange}
                                    />
                                </Stack>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Create modal={openModal} closemodal={closeModal} />
        </>
    );
};

export default Upload;

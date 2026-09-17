import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Modal, Row, Col, Form, Button } from 'react-bootstrap';
import { useTheme } from '@mui/material/styles';
import { useForm } from "react-hook-form";
import DatePicker from 'react-datepicker';
import { useState } from 'react';
import { getAllUsers } from '../../../../redux/actions';
import ToastHandle from '../../../../constants/toaster/toaster';
import { getUserRecord } from '../../../../redux/timeTracker/action';
import Multiselect from 'multiselect-react-dropdown';
import { CSVLink } from "react-csv";

const FilterModal = ({ showFilter, closeFilter, setfilterModal }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [selectedValues, setSelectedValues] = useState([]);
    const [userId, setUserId] = useState(null);
    const [filterPayload, setfilterPayload] = useState();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const users = store?.getAllUsers?.data?.response;
    const successHandle = store?.getUserRecordReducer;

    const today = new Date();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const handleStartDate = (date) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (date < threeMonthsAgo) {
            ToastHandle('error', 'Only past three months data is available.');
            return;
        }

        setStartDate(date);
    };

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const handleEndDate = (date) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (date < threeMonthsAgo) {
            ToastHandle('error', 'Please select a date within the past three months.');
            return;
        }
        setEndDate(date);
    };

    const onSubmit = (e) => {
        setIsSubmitted(true); // Set form submission state to true
        let body = {
            startTime: startDate,
            endTime: endDate,
            userId: userId
        };
        if (startDate !== '' && endDate !== '') {
            dispatch(getUserRecord(body));
        }
    };

    const onSelect = (selectedList, selectedItem) => {
        setUserId(selectedItem.id); // Set the selected userId
    };

    const options = users?.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`
    }));

    const usersData = store?.getUserRecordReducer?.data?.data;

    const handleClose = () => {
        setfilterModal(false);
        closeFilter();
        reset();
    };

    // Function to convert milliseconds to HH:MM:SS format
    const formatTime = (milliseconds) => {
        // Convert milliseconds to seconds
        let seconds = Math.floor(milliseconds / 1000);

        // Calculate hours, minutes, and remaining seconds
        let hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        let minutes = Math.floor(seconds / 60);
        seconds %= 60;

        // Format hours, minutes, and seconds with leading zeros if necessary
        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');

        // Return the formatted time string
        return `${hours}hours,${minutes}minutes,${seconds}seconds`;
    };

    let mainCsvData = [];
    let totalTimeCsvData = [];

    if (Array.isArray(usersData)) {
        mainCsvData = usersData.map(data => ({
            [`Username`]: data?.assigneeId?.firstName + ' ' + data?.assigneeId?.lastName,
            [`Task name`]: data?.summary,
            [`Project name`]: data?.projectId?.projectName ? data?.projectId?.projectName : '',
            [`Expected hrs`]: data?.expectedHours,
            [`Added to in-progress`]: data?.inProgressDate || 'Not added yet',
            [`Done Date`]: data?.doneDate || 'Not completed yet',
            [`Time Taken`]: formatTime(data?.timeTracker) || 'Not started yet',
        }));

        const totalTime = store?.getusersDataReducer?.data?.totalTime;
        if (totalTime !== undefined) {
        }
        // Add total time row to total time CSV data
        totalTimeCsvData.push({
            [`Total Time`]: totalTime
        });
    }

    // Concatenate main data and total time CSV data
    const csvData = mainCsvData.concat(totalTimeCsvData);

    return (
        <Modal show={showFilter} onHide={handleClose} size="md" centered>
            <Modal.Header className="d-flex justify-content-between align-items-center">
                <Modal.Title className="modal_titles m-0">Export User Data</Modal.Title>
                <Button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={handleClose}
                    aria-label="Close"
                    style={{
                        backgroundColor: 'transparent',
                        filter: 'none',
                        WebkitFilter: 'none',
                    }}
                ></Button>
            </Modal.Header>
            <Modal.Body className="pt-3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="mb-3">
                        <Col sm={12}>
                            <Multiselect
                                options={options}
                                selectedValues={selectedValues}
                                onSelect={onSelect}
                                displayValue="name"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col lg={6}>
                            <Form.Group controlId="startDate">
                                <Form.Label>
                                    Start Date <span className="text-danger">*</span>
                                </Form.Label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleStartDate}
                                    placeholderText="mm-dd-yyyy"
                                    className="form-control add_width_input"
                                />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group controlId="endDate">
                                <Form.Label>
                                    End Date <span className="text-danger">*</span>
                                </Form.Label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={handleEndDate}
                                    placeholderText="mm-dd-yyyy"
                                    minDate={startDate}
                                    disabled={!startDate}
                                    className="form-control add_width_input"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-4 text-end">
                        <Col>
                            {isSubmitted ? (
                                <CSVLink
                                    data={csvData}
                                    filename="userReport.csv"

                                    className="btn bg-dark text-white fw-2 shadow-none fw-bold px-3 py-1 rounded"
                                >
                                    Download
                                </CSVLink>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="dark"
                                    className="btn  shadow-none fw-bold px-3 py-1 rounded"
                                    disabled={isSubmitted}
                                >
                                    Export
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default FilterModal;

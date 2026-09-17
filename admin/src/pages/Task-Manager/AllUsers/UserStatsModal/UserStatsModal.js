
import React, { useState, useEffect } from "react";
import {
    Offcanvas,
    Button,
    Row,
    Col,
    Spinner,
    Table
} from "react-bootstrap";
import moment from "moment";
import { getUserStats } from "../../../../redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import "./UserStatsModal.css";
import { FaExclamationTriangle } from "react-icons/fa";
const UserStatsDrawer = ({ show, onHide, userId, initialDate }) => {

    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };
    const dispatch = useDispatch()
    const currentYear = moment().format("YYYY");

    const months = [
        { label: "Jan", value: `${currentYear}-01` },
        { label: "Feb", value: `${currentYear}-02` },
        { label: "Mar", value: `${currentYear}-03` },
        { label: "Apr", value: `${currentYear}-04` },
        { label: "May", value: `${currentYear}-05` },
        { label: "Jun", value: `${currentYear}-06` },
        { label: "Jul", value: `${currentYear}-07` },
        { label: "Aug", value: `${currentYear}-08` },
        { label: "Sep", value: `${currentYear}-09` },
        { label: "Oct", value: `${currentYear}-10` },
        { label: "Nov", value: `${currentYear}-11` },
        { label: "Dec", value: `${currentYear}-12` },
    ];
    const [selectedMonth, setSelectedMonth] = useState(
        moment().format("YYYY-MM")
    );



    const { loading, userStats, error } = useSelector(
        (state) => state.Auth
    );

    const userData = userStats?.user;
    const attendanceList = userStats?.attendanceList || [];
    const statsData = userStats?.stats;



    useEffect(() => {
        if (show && userId) {
            dispatch(
                getUserStats(userId, selectedMonth)
            );
        }
    }, [show, userId, selectedMonth, dispatch]);

    const getInitials = (name) => {

        if (!name) return "";

        return name
            .split(" ")
            .map((item) => item[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    };
    const isTaskOverdue = (productiveTime, estimatedHours) => {
        if (!productiveTime || !estimatedHours) return false;

        const [hh, mm, ss] = productiveTime.split(":").map(Number);

        const productiveSeconds = hh * 3600 + mm * 60 + ss;
        const estimatedSeconds = estimatedHours * 3600;

        return productiveSeconds > estimatedSeconds;
    };

    return (

        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            scroll
            backdrop
            style={{
                width: "1200px",
                maxWidth: "100%"
            }}
        >

            <Offcanvas.Header closeButton>

                <Offcanvas.Title
                    className="fw-bold"
                >
                    Employee Work Analytics
                </Offcanvas.Title>

            </Offcanvas.Header>

            <Offcanvas.Body
                className="bg-light"
            >

                {
                    loading ?

                        <div className="text-center py-5">

                            <Spinner animation="border" />

                        </div>

                        :

                        error ?

                            <div className="alert alert-danger">

                                {error}

                            </div>

                            :

                            userData &&

                            <>

                                <div className="card shadow-sm border-0 mb-3">

                                    <div className="card-body">

                                        <Row>

                                            <Col
                                                md={2}
                                                className="text-center"
                                            >

                                                <div className="user-avatar mx-auto">
                                                    {getInitials(userData.name)}
                                                </div>

                                            </Col>

                                            <Col md={10}>

                                                <h4 className="mb-1">

                                                    {userData.name}

                                                </h4>

                                                <p className="mb-1 text-muted">

                                                    {userData.email}

                                                </p>

                                                <div className="d-flex flex-wrap gap-3">

                                                    <span>

                                                        <strong>Role :</strong>{" "}

                                                        {userData.role?.name}

                                                    </span>

                                                    <span>

                                                        <strong>Designation :</strong>{" "}

                                                        {userData.designation}

                                                    </span>

                                                    <span>

                                                        <strong>Joined :</strong>{" "}

                                                        {
                                                            userData.joinedDate
                                                                ? moment(userData.joinedDate).format("DD MMM YYYY")
                                                                : "-"
                                                        }

                                                    </span>

                                                </div>

                                            </Col>

                                        </Row>
                                        <div className="d-flex flex-wrap mt-3" style={{ gap: "10px" }}>
                                            {months.map((month) => {
                                                const isSelected = selectedMonth === month.value;

                                                return (
                                                    <Button
                                                        key={month.value}
                                                        size="sm"
                                                        onClick={() => setSelectedMonth(month.value)}
                                                        style={{
                                                            backgroundColor: isSelected
                                                                ? "rgba(var(--bs-dark-rgb), var(--bs-bg-opacity))"
                                                                : "#fff",
                                                            border: "1px solid rgba(var(--bs-dark-rgb), var(--bs-bg-opacity))",
                                                            color: isSelected
                                                                ? "#fff"
                                                                : "rgba(var(--bs-dark-rgb), var(--bs-bg-opacity))",
                                                            minWidth: "55px",
                                                            fontWeight: "600",
                                                            transition: "0.3s ease",
                                                        }}
                                                    >
                                                        {month.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>




                                <div className="card shadow-sm border-0">

                                    <div className="card-body">

                                        <div className="d-flex justify-content-between align-items-center mb-2">

                                            <h5 className="fw-bold mb-0">
                                                Monthly Attendance
                                            </h5>

                                            <span className="badge days-badge">
                                                {attendanceList.length} Days
                                            </span>

                                        </div>

                                        <Table
                                            striped
                                            hover
                                            bordered
                                            responsive
                                            className="align-middle"
                                        >

                                            <thead className="table-light">

                                                <tr>

                                                    <th style={{ minWidth: "120px" }}>
                                                        Date
                                                    </th>



                                                    <th style={{ minWidth: "130px" }}>
                                                        Working Hours
                                                    </th>

                                                    <th style={{ minWidth: "140px" }}>
                                                        Productive Hours
                                                    </th>

                                                    <th style={{ minWidth: "120px" }}>
                                                        Idle Hours
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {attendanceList.length > 0 ? (

                                                    attendanceList.map((day, index) => (
                                                        <React.Fragment key={index}>

                                                            <tr>

                                                                <td>

                                                                    <div
                                                                        className="d-flex align-items-center"
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            gap: "10px"
                                                                        }}
                                                                        onClick={() => toggleRow(index)}
                                                                    >

                                                                        {expandedRow === index
                                                                            ? <FaChevronDown size={14} />
                                                                            : <FaChevronRight size={14} />}

                                                                        {moment(day.date).format("DD MMM YYYY")}

                                                                    </div>

                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className="badge bg-success py-1"
                                                                        style={{ fontSize: "14px", fontWeight: "600" }}
                                                                    >
                                                                        {day.totalWorkingHours}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <span className="badge productive-badge">
                                                                        {day.totalProductiveHours}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className="badge bg-warning text-dark py-1"
                                                                        style={{ fontSize: "14px", fontWeight: "600" }}
                                                                    >
                                                                        {day.totalIdleHours}
                                                                    </span>
                                                                </td>

                                                            </tr>

                                                            {expandedRow === index && (

                                                                <tr>
                                                                    <td colSpan={4} className="bg-light p-3">

                                                                        {/* Attendance Card */}
                                                                        <div className="card shadow-sm border-0 mb-3">

                                                                            <div className="card-body">

                                                                                {/* Attendance */}


                                                                                <div className="row fw-bold border-bottom ">

                                                                                    <div className="col-2">#</div>
                                                                                    <div className="col-5">Check In</div>
                                                                                    <div className="col-5">Check Out</div>

                                                                                </div>

                                                                                {day.sessions?.map((session, index) => (

                                                                                    <div
                                                                                        key={index}
                                                                                        className="row align-items-center py-2 border-bottom"
                                                                                    >

                                                                                        <div className="col-2">
                                                                                            {index + 1}
                                                                                        </div>

                                                                                        <div className="col-5">
                                                                                            {moment(session.loginTime).format("hh:mm:ss A")}
                                                                                        </div>

                                                                                        <div className="col-5">
                                                                                            {session.logoutTime ? (
                                                                                                moment(session.logoutTime).format("hh:mm:ss A")
                                                                                            ) : (
                                                                                                <span className="badge bg-success">
                                                                                                    -
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                    </div>

                                                                                ))}



                                                                                {/* Task Details */}

                                                                                <div className="d-flex justify-content-between align-items-center mt-2 mb-1">

                                                                                    <h5 className="fw-bold mb-0">
                                                                                        Task Details
                                                                                    </h5>

                                                                                    <span className="badge task-count-badge">
                                                                                        {day.tasks?.length || 0} Task(s)
                                                                                    </span>

                                                                                </div>

                                                                                {day.tasks?.length ? (

                                                                                    day.tasks.map((task) => (

                                                                                        <div
                                                                                            key={task._id}
                                                                                            className="border rounded p-2 mb-2 bg-light"
                                                                                        >

                                                                                            <div className="row align-items-center">

                                                                                                <div className="col-md-4">
                                                                                                    <small className="text-muted">Task</small>
                                                                                                    <div className="fw-semibold">
                                                                                                        {task.taskName}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="col-md-2">
                                                                                                    <small className="text-muted">Project</small>
                                                                                                    <div>{task.project}</div>
                                                                                                </div>

                                                                                                <div className="col-md-2">
                                                                                                    <small className="text-muted">Status</small>
                                                                                                    <div>
                                                                                                        <span className="badge bg-info">
                                                                                                            {task.status}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="col-md-2">
                                                                                                    <small className="text-muted">Priority</small>
                                                                                                    <div>
                                                                                                        <span className="badge bg-danger">
                                                                                                            {task.priority}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="col-md-2 text-center">
                                                                                                    <small className="text-muted d-block text-center">
                                                                                                        Productive
                                                                                                    </small>

                                                                                                    <div className="d-inline-flex align-items-center gap-1">
                                                                                                        <span>{task.productiveTime}</span>

                                                                                                        {isTaskOverdue(task.productiveTime, task.estimatedTime) && (
                                                                                                            <FaExclamationTriangle
                                                                                                                className="text-danger"
                                                                                                                size={15}
                                                                                                                title="Exceeded estimated time"
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                            </div>

                                                                                        </div>

                                                                                    ))

                                                                                ) : (

                                                                                    <div className="text-center text-muted py-3">
                                                                                        No Tasks Found
                                                                                    </div>

                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    </td>
                                                                </tr>

                                                            )}

                                                        </React.Fragment>
                                                    ))

                                                ) : (

                                                    <tr>

                                                        <td
                                                            colSpan={5}
                                                            className="text-center py-5"
                                                        >

                                                            <img
                                                                src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
                                                                alt="No Data"
                                                                width="70"
                                                                className="mb-3"
                                                            />

                                                            <h6 className="text-muted">
                                                                No attendance found for this month
                                                            </h6>

                                                        </td>

                                                    </tr>

                                                )
                                                }

                                            </tbody>

                                        </Table>

                                    </div>

                                </div>



                            </>

                }

            </Offcanvas.Body>

        </Offcanvas>

    );

};

export default UserStatsDrawer;
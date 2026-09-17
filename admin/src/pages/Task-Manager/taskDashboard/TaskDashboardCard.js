import React from 'react'

const TaskCard = ({ item, index, closeModal, progressTimeLoading, isInProgressColumn, timeTrackingData, onTaskDelete }) => {
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState();
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDetailPage, setOpenDetailPage] = useState(false);
    const [detailData, setDetailData] = useState();
    const [isHovered, setIsHovered] = useState(false);
    const store = useSelector((state) => state);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formattedTime = timeTrackingData?.elapsedTime ? formatTime(timeTrackingData.elapsedTime) : '00:00:00';

    const deleteResponse = store?.deleteTask?.data?.status;
    const dispatch = useDispatch();

    const deleteData = (id) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const handelUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };

    const closeupdatemodal = (val) => {
        closeModal('render');
        setOpenEditModal(false);
    };

    const handleDetailPage = (data) => {
        setOpenDetailPage(true);
        setDetailData(data);
        dispatch(getComment({ taskId: data?.id }));
        dispatch(getBugs({ taskId: data?.id, type: "Bug" }));
        dispatch(getSubTask({ taskId: data?.id, type: "SubTask" }));
        dispatch(gettaskId(data?.id));
    };

    const closeDetailPage = () => {
        setOpenDetailPage(false);
    };

    useEffect(() => {
        if (deleteResponse === "200" && deleteResponse !== undefined) {
            onTaskDelete(item.id);
        }
    }, [deleteResponse]);



    return (
        <>
            <TaskCardContainer
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <TaskInformation
                    priority={item?.priority}
                    onClick={() => handleDetailPage(item)}
                    className="cursor-pointer"
                    title={item?.assignee?.name}
                >
                    <div className="d-flex justify-content-between align-items-start my-0">
                        <div className='d-flex align-items-center gap-1'>
                            <PriorityBadge priority={item?.priority}>
                                {item?.priority || 'No Priority'}
                            </PriorityBadge>
                            {item?.dueDate && (
                                <div>
                                    {moment(item?.dueDate).isBefore(moment()) &&
                                        (item?.status === 'In Progress' || item?.status === 'To Do' || item?.status === 'Testing') ? (
                                        <span
                                            className="text-danger"
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.5rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: 'rgba(220, 53, 69, 0.1)',
                                                color: '#dc3545'
                                            }}
                                        >
                                            Overdue
                                        </span>) : (
                                        <></>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='d-flex gap-2 align-items-center'>
                            {isInProgressColumn && (
                                <div className="">
                                    {progressTimeLoading ? (
                                        <div className="bg-light rounded animate-pulse" ></div>
                                    ) : (
                                        <span className="fw-bold text-info" style={{ fontSize: '0.7rem' }}>
                                            {formattedTime}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="dropdown">
                                <button
                                    className="border-0 bg-transparent p-0 py-0 rounded-circle"
                                    type="button"
                                    id={`dropdownMenuButton-${item.id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    aria-label="Actions"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <i className="bi bi-three-dots-vertical fs-5 text-muted"></i>
                                </button>
                                <DropdownMenu
                                    className="dropdown-menu dropdown-menu-end"
                                    aria-labelledby={`dropdownMenuButton-${item.id}`}
                                >
                                    <li>
                                        <DropdownItem onClick={(e) => { e.stopPropagation(); handelUpdate(item); }}>
                                            <i className="uil-edit-alt"></i>
                                            <span>Edit Task</span>
                                        </DropdownItem>
                                    </li>
                                    <li>
                                        <DropdownItem
                                            danger
                                            onClick={(e) => { e.stopPropagation(); deleteData(item?.id); }}
                                        >
                                            <i className="mdi mdi-delete"></i>
                                            <span>Delete</span>
                                        </DropdownItem>
                                    </li>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="my-0">
                        <span className="fw-semibold text-black my-0" style={{ fontSize: '0.76rem' }}>
                            {item?.summary}
                        </span>
                        {/* <p className="text-muted small my-0 ">
                            {item?.projects?.projectName}
                        </p>
                        <p className="text-muted small my-0 ">
                            {item?.description ?
                                (item?.description?.length > 60 ?
                                    `${item?.description?.slice(0, 59)}...` :
                                    item.description)
                                : ''}
                        </p> */}
                    </div>

                    <div className="d-flex justify-content-between pt-1 border-top align-items-center">
                        <small className="text-black" style={{ fontSize: '0.7rem' }}>
                            Assignee:
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {item?.assignee?.name}
                        </small>
                    </div>
                </TaskInformation>
            </TaskCardContainer>

            {/* Delete Confirmation Modal */}
            <Modal
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setDeleteModal(false)}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        // onClick={() => handleYes()}
                        className="px-4"
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Pagesaddtask
                className="d-none"
                showModal={openEditModal}
                closeModal={closeupdatemodal}
                setShowModal={setOpenEditModal}
                editData={editData}
            />
        </>
    );
};
export default TaskDashboardCard
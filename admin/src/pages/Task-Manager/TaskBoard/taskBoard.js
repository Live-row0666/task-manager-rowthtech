import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Boards from '../board/board';
import Summary from '../Summary/summary';
import TaskList from '../TaskList/list';
import ProjectPreview from '../projects/Projectpreview';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getAllTaskStatusesAction, getProjectsById, getsingleSprintTask } from '../../../redux/actions';
import NewStatusModal from './NewStatusModal';
import { TiPlus } from 'react-icons/ti';

const TaskBoard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const store = useSelector((state) => state);

    const { projectId, milestoneId, spriteId } = useParams();
    const [connectComponent, setConnectComponent] = useState(store?.Auth?.user?.role === 'Seo Manager' ? 'List' : 'Board');
    const [createStatusModal, setCreateStatusModal] = useState(false);

    const createResponse = store?.createTaskReducer?.data?.status;
    const updateResponse = store?.UpdateTaskReducer?.data?.status;

    const connectComponentCheck = (type) => {
        setConnectComponent(type);
    };

    const closeStatusModal = () => {
        setCreateStatusModal(false);
    };

    useEffect(() => {
        dispatch(getProjectsById({ id: projectId }))
    }, [projectId])

    useEffect(() => {
        dispatch(getAllTaskStatusesAction({ projectId }));
        dispatch(getsingleSprintTask({
            sprint: spriteId,
            taskStatus: 1,
            activeStatus: true,
            skip: 1,
            projectId,
            milestone: milestoneId
        }));
    }, [dispatch, projectId, spriteId, milestoneId]);

    useEffect(() => {
        if (createResponse === 201 || updateResponse === 200) {
            dispatch(getsingleSprintTask({
                sprint: spriteId,
                taskStatus: 1,
                activeStatus: true,
                skip: 1,
                projectId,
                milestone: milestoneId
            }));
        }
    }, [createResponse, updateResponse, dispatch, spriteId, projectId, milestoneId]);
    return (
        <>
            <div>
                <div className="card">
                    <div className="card-body px-2 pt-2">
                        <div className="row">
                            <div className="col-12 mb-2">
                                <ProjectPreview closed={true} />
                            </div>
                        </div>
                        <div className="d-flex align-items-center justifi-content-between w-100 mb-2">
                            <div className="d-flex w-50 align-items-center">
                                <button
                                    className="btn btn-outline-secondary fw-semibold d-flex align-items-center gap-1 rounded-0 me-2"
                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                    onClick={() => navigate(-1)}
                                >
                                    <i className="mdi mdi-arrow-left" style={{ fontSize: '11px' }}></i>
                                    Back
                                </button>
                                {store?.Auth?.user?.role === 'Seo Manager' ?
                                    <></>
                                    :
                                    <>
                                        <button
                                            className={`btn fw-semibold px-2 rounded-0 ${connectComponent === 'Summary' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => connectComponentCheck('Summary')}
                                        >
                                            Summary
                                        </button>
                                        <button
                                            className={`btn fw-semibold px-2 rounded-0 ${connectComponent === 'List' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => connectComponentCheck('List')}
                                        >
                                            List
                                        </button>
                                        <button
                                            className={`btn fw-semibold px-2 rounded-0 ${connectComponent === 'Board' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => connectComponentCheck('Board')}
                                        >
                                            Board
                                        </button>
                                    </>
                                }
                            </div>
                            {store?.Auth?.user?.role !== 'Seo Manager' && <div className='w-50 d-flex justify-content-end'>
                                {connectComponent === 'Board' && (
                                    <button
                                        onClick={() => setCreateStatusModal(true)}
                                        className={`btn fw-semibold px-2 rounded-0 bg-dark text-white d-flex align-items-center gap-1`}
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                    >
                                        <TiPlus style={{ fontSize: '12px' }} /> Status
                                    </button>
                                )}
                                <NewStatusModal show={createStatusModal} closeModal={closeStatusModal} />
                            </div>}

                        </div>
                        <div>
                            {connectComponent === 'Board' ? (
                                <Boards connectComponentCheck={connectComponentCheck} />
                            ) : connectComponent === 'Summary' ? (
                                <Summary connectComponentCheck={connectComponentCheck} />
                            ) : connectComponent === 'List' ? (
                                <TaskList connectComponentCheck={connectComponentCheck} />
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskBoard;

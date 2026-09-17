import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useDispatch } from 'react-redux';
import { getProjectsById, updateProject } from '../../../../redux/projects/action';
import AddDependencyModal from './AddDependencyModal';
import { useSelector } from 'react-redux';
import Spinner from '../../../../components/Spinner';

const DependenciesModal = ({ show, onHide, projectData }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [dependencies, setDependencies] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editData, setEditData] = useState(null);
    const dependenciesList = store?.getProjectById?.data?.data;

    useEffect(() => {
        if (projectData?._id) {
            dispatch(getProjectsById({ id: projectData?._id }));
        }
    }, [projectData?._id]);

    useEffect(() => {
        if (dependenciesList?.dependencies) {
            setDependencies(dependenciesList.dependencies);
        } else {
            setDependencies([]);
        }
    }, [dependenciesList]);

    useEffect(() => {
        if (!show) {
            setError('');
        }
    }, [show]);

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditIndex(null);
        setEditData(null);
    };

    const handleDeleteDependency = async (index) => {
        setIsSubmitting(true);
        const updatedDependencies = dependencies.filter((_, i) => i !== index);
        const body = { dependencies: updatedDependencies };
        await dispatch(updateProject({ body, projectId: projectData._id }));
        await dispatch(getProjectsById({ id: projectData?._id }));
        setIsSubmitting(false);
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" className={`${showAddModal ? `d-none` : ``}`}>
            <Modal.Header className='py-2' >
                <Modal.Title className="text-black fs-5 fw-bold">
                    Dependencies - {projectData?.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-2 scroll-container" style={{ height: '70vh' }}>
                <div className="mb-1">
                    <h6 className="text-secondary d-flex justify-content-between align-items-center fs-5 mb-2 border-bottom pb-1">
                        <div>
                            <i className="fas fa-project-diagram me-2"></i>{`Dependencies`}
                            <i
                                onClick={() => {
                                    setEditData(null);
                                    setEditIndex(null);
                                    setShowAddModal(true);
                                }}
                                className="bi bi-plus-circle cp text-info ms-2"
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                        {dependencies?.length > 0 && (
                            !copied ? (
                                <i
                                    onClick={async () => {
                                        const tableRows = dependencies.map(dep => {
                                            const notesText = dep.notes?.replace(/<[^>]*>/g, '') || '-';
                                            const filesLinks = dep.documents?.map(doc => `<a href="${doc.url}" target="_blank">${doc.name}</a>`).join('<br>') || '-';
                                            return `<tr><td>${dep.name}</td><td>${dep.rtl ? '✓' : '-'}</td><td>${dep.client ? '✓' : '-'}</td><td>${dep.status}</td><td>${notesText}</td><td>${filesLinks}</td></tr>`;
                                        }).join('');
                                        const htmlTable = `<table border="1" style="width:100%; table-layout:fixed;"><colgroup><col style="width:20%"><col style="width:8%"><col style="width:8%"><col style="width:12%"><col style="width:32%"><col style="width:20%"></colgroup><thead><tr><th>Name</th><th>RTL</th><th>Client</th><th>Status</th><th>Notes</th><th>Files</th></tr></thead><tbody>${tableRows}</tbody></table>`;

                                        const textData = dependencies.map(dep => {
                                            const notesText = dep.notes?.replace(/<[^>]*>/g, '') || '-';
                                            const filesText = dep.documents?.map(doc => doc.name).join(', ') || '-';
                                            return `${dep.name}\t${dep.rtl ? '✓' : '-'}\t${dep.client ? '✓' : '-'}\t${dep.status}\t${notesText}\t${filesText}`;
                                        }).join('\n');
                                        const textTable = `Name\tRTL\tClient\tStatus\tNotes\tFiles\n${textData}`;

                                        await navigator.clipboard.write([
                                            new ClipboardItem({
                                                'text/html': new Blob([htmlTable], { type: 'text/html' }),
                                                'text/plain': new Blob([textTable], { type: 'text/plain' })
                                            })
                                        ]);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="bi bi-copy cp text-primary ms-2"
                                    style={{ cursor: 'pointer' }}
                                    title="Copy table data"
                                />
                            ) : (
                                <span className="text-success ms-2" style={{ fontSize: '12px' }}>Copied!</span>
                            )
                        )}
                    </h6>
                    {store?.getProjectById?.loading ?
                        <div style={{ height: '30vh' }} className='d-flex justify-content-center align-items-center'>
                            <Spinner />
                        </div>

                        :
                        dependencies?.length > 0 && (
                            <div className="table-responsive invisible-scroll-y" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <table className="table table-bordered table-sm mb-0" style={{ tableLayout: 'fixed' }}>
                                    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                        <tr style={{ fontSize: '10px' }}>
                                            <th style={{ padding: '4px 6px', width: '20%' }}>Name</th>
                                            <th style={{ padding: '4px 6px', width: '10%' }}>Provider</th>
                                            <th style={{ padding: '4px 6px', width: '8%' }}>Status</th>
                                            <th style={{ padding: '4px 6px', width: '15%' }}>Links</th>
                                            <th style={{ padding: '4px 6px', width: '20%' }}>Notes</th>
                                            <th style={{ padding: '4px 6px', width: '15%' }}>Files</th>
                                            <th style={{ padding: '4px 6px', width: '5%' }}>Cost</th>
                                            <th style={{ padding: '4px 6px', width: '7%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dependencies?.map((dependency, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: '4px 6px' }}>
                                                    <small>{dependency.name}</small>
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    <small>{dependency.provider || 'N/A'}</small>
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    <small>{dependency.status}</small>
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    {dependency.links?.length > 0 ? (
                                                        <small>
                                                            {dependency.links.map((link, i) => (
                                                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="d-block text-truncate" title={link}>
                                                                    {i + 1}. Link
                                                                </a>
                                                            ))}
                                                        </small>
                                                    ) : (
                                                        <small>N/A</small>
                                                    )}
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    <small dangerouslySetInnerHTML={{ __html: dependency.notes ? (dependency.notes.substring(0, 50) + (dependency.notes.length > 50 ? '...' : '')) : 'N/A' }} />
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    {dependency.documents?.length > 0 ? (
                                                        <small>
                                                            {dependency.documents.map((doc, i) => (
                                                                <a title={doc.name} key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="d-block text-truncate">
                                                                    {i + 1}. {doc.name}
                                                                </a>
                                                            ))}
                                                        </small>
                                                    ) : (
                                                        <small>N/A</small>
                                                    )}
                                                </td>
                                                <td style={{ padding: '4px 6px' }}>
                                                    <small>{dependency.costInvolved ? `$${dependency.cost || 0}` : 'N/A'}</small>
                                                </td>
                                                <td className="text-center d-flex" style={{ padding: '4px 6px' }}>
                                                    <i
                                                        onClick={() => {
                                                            setEditData(dependency);
                                                            setEditIndex(index);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="bi bi-pencil text-primary cp me-2"
                                                        style={{ cursor: 'pointer' }}
                                                        title="Edit"
                                                    />
                                                    <i
                                                        onClick={() => handleDeleteDependency(index)}
                                                        className="bi bi-trash text-danger cp"
                                                        style={{ cursor: 'pointer' }}
                                                        title="Delete"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    {dependencies.length === 0 && (
                        <div className="text-center text-muted py-3">
                            No dependencies added yet. Click the + icon to add one.
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    className="btn btn-outline-secondary fw-semibold"
                    style={{ padding: '4px 16px', fontSize: '11px' }}
                    onClick={onHide}
                    disabled={isSubmitting}
                >
                    Close
                </button>
            </Modal.Footer>
            <AddDependencyModal
                show={showAddModal}
                onHide={handleCloseModal}
                projectData={projectData}
                dependencies={dependenciesList?.dependencies || []}
                editData={editData}
                editIndex={editIndex}
            />
        </Modal>
    );
};

export default DependenciesModal;
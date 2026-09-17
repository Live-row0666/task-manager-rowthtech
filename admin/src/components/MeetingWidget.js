import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getMeetingsByProject } from '../redux/actions';

const MeetingWidget = ({ projectId }) => {
    const dispatch = useDispatch();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchMeetings();
        }
    }, [projectId]);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            dispatch(getMeetingsByProject(projectId));
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            scheduled: 'primary',
            completed: 'success',
            cancelled: 'danger',
            rescheduled: 'warning'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const upcomingMeetings = meetings.filter(meeting => 
        new Date(meeting.startDateTime) > new Date() && meeting.status === 'scheduled'
    ).slice(0, 3);

    return (
        <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Upcoming Meetings</h6>
                <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/meetings'}
                >
                    View All
                </Button>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : upcomingMeetings.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                        {upcomingMeetings.map((meeting) => (
                            <div key={meeting._id} className="border-bottom pb-2">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="mb-1 text-truncate" style={{ fontSize: '14px' }}>
                                            {meeting.title}
                                        </h6>
                                        <small className="text-muted">
                                            {formatDateTime(meeting.startDateTime)}
                                        </small>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        {getStatusBadge(meeting.status)}
                                        {meeting.meetingType === 'recurring' && (
                                            <Badge bg="info" style={{ fontSize: '10px' }}>
                                                Recurring
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted">
                        <i className="mdi mdi-calendar-blank" style={{ fontSize: '24px' }}></i>
                        <p className="mb-0 mt-2">No upcoming meetings</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default MeetingWidget;
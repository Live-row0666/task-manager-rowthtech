import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { scheduleOutlookMeeting, createClientMeetingData } from '../utils/outlookCalendar';
import ToastHandle from '../constants/toaster/toaster';

const ScheduleMeetingModal = ({ show, onHide, client }) => {
    const [meetingData, setMeetingData] = useState({
        subject: `Meeting with ${client?.name || client?.companyName || ''}`,
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: 60,
        location: '',
        additionalAttendees: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMeetingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleScheduleMeeting = () => {
        try {
            // Combine date and time
            const startDateTime = new Date(`${meetingData.startDate}T${meetingData.startTime}`);
            
            // Parse additional attendees
            const additionalAttendees = meetingData.additionalAttendees
                .split(',')
                .map(email => email.trim())
                .filter(email => email);

            // Create meeting data
            const eventData = createClientMeetingData(client, {
                duration: parseInt(meetingData.duration),
                startTime: startDateTime,
                subject: meetingData.subject,
                location: meetingData.location,
                additionalAttendees
            });

            // Add custom notes to body
            if (meetingData.notes) {
                eventData.body += `\n\nNotes:\n${meetingData.notes}`;
            }

            // Schedule the meeting
            scheduleOutlookMeeting(eventData);
            
            ToastHandle('success', 'Opening Outlook calendar...');
            onHide();
        } catch (error) {
            ToastHandle('error', 'Failed to schedule meeting');
            console.error('Meeting scheduling error:', error);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Schedule Meeting - {client?.name || client?.companyName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meeting Subject</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="subject"
                                    value={meetingData.subject}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={meetingData.startDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="startTime"
                                    value={meetingData.startTime}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Duration (min)</Form.Label>
                                <Form.Select
                                    name="duration"
                                    value={meetingData.duration}
                                    onChange={handleInputChange}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={meetingData.location}
                                    onChange={handleInputChange}
                                    placeholder="Meeting room, address, or online meeting link"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Additional Attendees</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="additionalAttendees"
                                    value={meetingData.additionalAttendees}
                                    onChange={handleInputChange}
                                    placeholder="email1@example.com, email2@example.com"
                                />
                                <Form.Text className="text-muted">
                                    Client emails will be added automatically. Separate multiple emails with commas.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meeting Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={meetingData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional notes or agenda items"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleScheduleMeeting}>
                    Schedule in Outlook
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleMeetingModal;
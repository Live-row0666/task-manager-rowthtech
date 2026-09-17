/**
 * Utility functions for Outlook Calendar integration
 */

/**
 * Generate Outlook calendar deep link
 * @param {Object} eventData - Event details
 * @param {string} eventData.subject - Meeting subject
 * @param {Date|string} eventData.startDateTime - Start date and time
 * @param {Date|string} eventData.endDateTime - End date and time
 * @param {string} eventData.body - Meeting description/body
 * @param {string} eventData.location - Meeting location
 * @param {string|Array} eventData.attendees - Email addresses of attendees
 * @returns {string} Outlook calendar URL
 */
export const generateOutlookCalendarLink = (eventData) => {
    const {
        subject = '',
        startDateTime,
        endDateTime,
        body = '',
        location = '',
        attendees = []
    } = eventData;

    // Convert dates to ISO string format
    const startDt = new Date(startDateTime).toISOString();
    const endDt = new Date(endDateTime).toISOString();
    
    // Handle attendees - convert array to comma-separated string
    const attendeeList = Array.isArray(attendees) ? attendees.join(';') : attendees;

    // Build the URL parameters for Outlook Web App
    const params = new URLSearchParams({
        subject: subject,
        startdt: startDt,
        enddt: endDt,
        body: body,
        location: location,
        to: attendeeList
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Open Outlook calendar with event details
 * @param {Object} eventData - Event details
 */
export const scheduleOutlookMeeting = (eventData) => {
    const url = generateOutlookCalendarLink(eventData);
    window.open(url, '_blank');
};

/**
 * Generate meeting data for client discussion
 * @param {Object} client - Client data
 * @param {Object} options - Additional meeting options
 * @returns {Object} Meeting event data
 */
export const createClientMeetingData = (client, options = {}) => {
    const {
        duration = 60, // minutes
        startTime = new Date(),
        subject = `Meeting with ${client.name || client.companyName}`,
        location = '',
        additionalAttendees = []
    } = options;

    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    // Get client emails
    const clientEmails = Array.isArray(client.email) ? client.email : [client.email].filter(Boolean);
    
    return {
        subject,
        startDateTime: startTime,
        endDateTime: endTime,
        body: `Meeting scheduled with ${client.companyName || client.name}\n\nClient Details:\n- Name: ${client.name}\n- Company: ${client.companyName}\n- Contact: ${Array.isArray(client.contact) ? client.contact.join(', ') : client.contact}`,
        location,
        attendees: [...clientEmails, ...additionalAttendees]
    };
};
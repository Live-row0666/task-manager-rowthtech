import React from 'react';

const Attachments = ({ attachments = [] }) => {
    return (
        <div className="attachments">
            <h6>Attachments</h6>
            {attachments.length > 0 ? (
                <ul>
                    {attachments.map((attachment, index) => (
                        <li key={index}>{attachment.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No attachments</p>
            )}
        </div>
    );
};

export default Attachments;
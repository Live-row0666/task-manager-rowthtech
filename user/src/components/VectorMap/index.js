import React from 'react';

const VectorMap = ({ options = {}, ...props }) => {
    return (
        <div className="vector-map" {...props}>
            <p>Vector Map Component</p>
        </div>
    );
};

const WorldVectorMap = ({ options = {}, ...props }) => {
    return (
        <div className="world-vector-map" {...props}>
            <p>World Vector Map Component</p>
        </div>
    );
};

export default VectorMap;
export { WorldVectorMap };
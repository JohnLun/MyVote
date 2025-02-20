import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PollGraph from './PollGraph';
import './PollDetailsFlip.css';

const PollDetailsFlip = forwardRef(({ poll }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const graphRef = React.useRef();

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Expose captureGraph method to parent component
    useImperativeHandle(ref, () => ({
        captureGraph: () => {
            if (graphRef.current && graphRef.current.captureGraph) {
                return graphRef.current.captureGraph();
            }
            return null;
        }
    }));

    return (
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <PollGraph ref={graphRef} poll={poll} />
                    <i className="flip-icon fas fa-sync-alt"></i>
                </div>
                <div className="flip-card-back hide-in-pdf">
                    <p>{poll.description}</p>
                    <i className="flip-icon fas fa-sync-alt"></i>
                </div>
            </div>
        </div>
    );
});

export default PollDetailsFlip;

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PollGraph from './PollGraph';
import './PollDetailsFlip.css';
import { HiArrowUturnRight } from "react-icons/hi2";
import { HiArrowUturnLeft } from "react-icons/hi2";


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
                    <div className="chart-container">
                        <PollGraph ref={graphRef} poll={poll} />
                    </div>
                    {/* <i className="flip-icon fas fa-sync-alt"></i> */}
                    <HiArrowUturnRight className="flip-icon fas fa-sync-alt" />
                </div>
                <div className="flip-card-back hide-in-pdf">
                    <p>{poll?.description}</p>
                    {/* <i className="flip-icon fas fa-sync-alt"></i> */}
                    <HiArrowUturnLeft className="flip-icon fas fa-sync-alt" />
                </div>
            </div>
        </div>
    );
});

export default PollDetailsFlip;

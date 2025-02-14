import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from "react-qr-code";
import { toast } from 'react-toastify';
import './PollLinkPage.css';

const PollLinkPage = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const pollUrl = `${window.location.origin}/poll/${pollId}`;

    const handleGoToPoll = () => {
        navigate(`/poll/${pollId}`);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(pollUrl)
            .then(() => {
                toast.success('Poll link copied to clipboard!', {autoClose: 3000})
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="poll-link-page">
            <h2>Poll Created Successfully!</h2>
            <h4>Share this QR code:</h4>
            <div className="qr-code">
                <QRCode value={pollUrl} />
            </div>
            <p>Your poll ID is: {pollId}</p>
            <button className="go-poll-btn" onClick={handleGoToPoll}>Go to Poll</button>
            <button className="copy-poll-btn" onClick={handleCopyLink}>Copy Poll Link</button>
            
        </div>
    );
};

export default PollLinkPage;
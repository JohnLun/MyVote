import { FaCheck } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { useUser } from "../contexts/UserContext"; 
import './Suggestion.css';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function Suggestion({ suggestion }) {
    const navigate = useNavigate();
    const { suggestions, setSuggestions } = useUser(); // Get setSuggestions from context

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";


    const handleNavigate = () => {
        navigate(`/poll/${suggestion.pollId}`);
    }

    const handleDeny = async () => {
        const response = await fetch(`${API_BASE_URL}/api/suggestion/${suggestion.suggestionId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            setSuggestions(prevSuggestions =>
                prevSuggestions.filter(s => s.suggestionId !== suggestion.suggestionId)
            );
        }
    };

    const handleAccept = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/poll/suggestion`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    suggestionId: suggestion.suggestionId,
                    userId: suggestion.userId,
                    suggestionName: suggestion.suggestionName,
                    pollId: suggestion.pollId,
                    pollName: suggestion.pollName
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to accept suggestion. Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Suggestion accepted:", data);

            const deleteResponse = await fetch(`${API_BASE_URL}/api/suggestion/${suggestion.suggestionId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete suggestion. Status: ${deleteResponse.status}`);
            }
    
            console.log("Suggestion deleted successfully");
    
            // Update local state to remove the accepted suggestion
            setSuggestions((prev) => prev.filter((s) => s.suggestionId !== suggestion.suggestionId));
            
            toast.success("Choice added! Click to see changes", {
                autoClose: 3000,
                onClick: () => {
                    toast.dismiss();
                    navigate(`/poll/${suggestion.pollId}`);
                },
                style: { cursor: "pointer" }
            })
            
    
        } catch (error) {
            console.error("Error accepting suggestion:", error);
        }
    };

    return (
        <div
            className="suggestion-card"
            
        >
            <div onClick={handleNavigate}>
                <h4 className="suggestion-card-title card-title">
                    Poll Title: <b>{suggestion.pollName}</b>
                </h4>
                <p className="suggestion-card-text card-text">
                    Suggestion: <u>{suggestion.suggestionName}</u>
                </p>
            </div>
            <div className="suggestion-card-buttons">
                <button className="deny-icon" onClick={handleDeny}>
                    <FaTimes />
                </button>
                <button className="accept-icon" onClick={handleAccept}>
                    <FaCheck />
                </button>
            </div>
            
        </div>
    );
}

export default Suggestion;

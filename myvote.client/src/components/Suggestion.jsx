import { FaCheck, FaTimes } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import "./Suggestion.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Suggestion({ suggestion, removeSuggestion }) {
    const navigate = useNavigate();
    const { setSuggestions } = useUser();

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    const handleNavigate = () => {
        navigate(`/poll/${suggestion.pollId}`);
    };

    const handleDeny = async () => {
        removeSuggestion(suggestion.suggestionId, "deny"); // Trigger exit animation
        setTimeout(async () => {
            await fetch(`${API_BASE_URL}/api/suggestion/${suggestion.suggestionId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            setSuggestions((prev) => prev.filter((s) => s.suggestionId !== suggestion.suggestionId));
        }, 500);
    };

    const handleAccept = async () => {
        try {
            removeSuggestion(suggestion.suggestionId, "accept"); // Trigger exit animation

            const patch = await fetch(`${API_BASE_URL}/api/poll/suggestion`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    suggestionId: suggestion.suggestionId,
                    userId: suggestion.userId,
                    suggestionName: suggestion.suggestionName,
                    pollId: suggestion.pollId,
                    pollName: suggestion.pollName,
                }),
            });

            const del = await fetch(`${API_BASE_URL}/api/suggestion/${suggestion.suggestionId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            setTimeout(() => {
                setSuggestions((prev) => prev.filter((s) => s.suggestionId !== suggestion.suggestionId));
            }, 500);

            if (patch.ok) {
                toast.success("Choice added! Click to see changes", {
                    autoClose: 3000,
                    onClick: () => {
                        toast.dismiss();
                        navigate(`/poll/${suggestion.pollId}`);
                    },
                    style: { cursor: "pointer" },
                });
            } else {
                toast.error("Poll no longer exists", {
                    autoClose: 3000,
                    onClick: () => {
                        toast.dismiss();
                    },
                    style: { cursor: "pointer" },
                })
            }
            
        } catch (error) {
            console.error("Error accepting suggestion:", error);
        }
    };

    return (
        <div className="suggestion-card">
            <div onClick={handleNavigate}>
                <h4 className="suggestion-card-title">
                    Poll Title: <b>{suggestion.pollName}</b>
                </h4>
                <p>
                    Suggestion: <u className="suggestion-card-text">{suggestion.suggestionName}</u>
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

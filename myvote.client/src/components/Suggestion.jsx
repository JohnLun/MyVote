import { FaCheck } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { useUser } from "../contexts/UserContext"; 

function Suggestion({ suggestion }) {
    const { suggestions, setSuggestions } = useUser(); // Get setSuggestions from context

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    const handleDeny = async () => {
        const response = await fetch(`${API_BASE_URL}/api/suggestion/${suggestion.suggestionId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            // Update state by filtering out the deleted suggestion
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
    
            // Update local state to remove the accepted suggestion
            setSuggestions((prev) => prev.filter((s) => s.suggestionId !== suggestion.suggestionId));
    
        } catch (error) {
            console.error("Error accepting suggestion:", error);
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="card-title">
                        Suggestion for {suggestion.pollName}
                    </h5>
                    <p className="card-text">
                        Suggestion: {suggestion.suggestionName}
                    </p>
                </div>
                <div>
                    <button className="deny-icon" onClick={handleDeny}>
                        <FaTimes />
                    </button>
                    <button className="accept-icon" onClick={handleAccept}>
                        <FaCheck />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Suggestion;

import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";

function NotifsPage () {
    const { suggestions } = useUser(); 
    useEffect(() => {
        console.log(suggestions);
    },[suggestions]);
    
    return (
        <div className="container mt-4">
            <h2>Notifications</h2>
            <div className="row">
                {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                        <div key={suggestion.suggestionId} className="col-md-6">
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
                                        <button className="btn btn-danger me-2">
                                            ❌
                                        </button>
                                        <button className="btn btn-success">
                                            ✅
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No suggestions yet.</p>
                )}
            </div>
        </div>
    );
}

export default NotifsPage;
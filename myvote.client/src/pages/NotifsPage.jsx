import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import  Suggestion from "../components/Suggestion";
import './NotifsPage.css';

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
                            <Suggestion suggestion={suggestion}></Suggestion>
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
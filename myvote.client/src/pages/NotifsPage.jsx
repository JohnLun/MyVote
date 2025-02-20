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
        <>
            <h2>Notifications</h2>
            <div className="noti-container"> 
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                            <div key={suggestion.suggestionId} className="noti-column">
                                <Suggestion suggestion={suggestion} />
                            </div>
                        ))
                    ) : (
                        <p className="noti-empty-message">No suggestions yet.</p>
                    )}
            </div>
        </>
        
    );
}

export default NotifsPage;
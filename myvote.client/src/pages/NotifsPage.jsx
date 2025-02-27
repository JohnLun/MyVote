import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import Suggestion from "../components/Suggestion";
import { AnimatePresence, motion } from "framer-motion";
import "./NotifsPage.css";

function NotifsPage() {
    const { suggestions } = useUser();
    const [animatedSuggestions, setAnimatedSuggestions] = useState(suggestions);

    useEffect(() => {
        setAnimatedSuggestions(suggestions); // Keep suggestions in sync
    }, [suggestions]);

    const removeSuggestion = (id, action) => {
        setAnimatedSuggestions((prev) =>
            prev.map((s) =>
                s.suggestionId === id ? { ...s, exitDirection: action === "deny" ? -1 : 1 } : s
            )
        );

        setTimeout(() => {
            // Update state after animation completes
            setAnimatedSuggestions((prev) => prev.filter((s) => s.suggestionId !== id));
        }, 500);
    };

    return (
        <>
            <h2 className="noti-header">Notifications</h2>
            <div className="noti-container">
                <AnimatePresence>
                    {animatedSuggestions.length > 0 ? (
                        animatedSuggestions.map((suggestion) => (
                            <motion.div
                                key={suggestion.suggestionId}
                                className="noti-column"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    x: suggestion.exitDirection === -1 ? "-100vw" : "100vw",
                                    opacity: 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <Suggestion suggestion={suggestion} removeSuggestion={removeSuggestion} />
                            </motion.div>
                        ))
                    ) : (
                        <p className="noti-empty-message">No suggestions yet.</p>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

export default NotifsPage;

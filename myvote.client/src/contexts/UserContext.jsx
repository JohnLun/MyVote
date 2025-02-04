import { createContext, useContext, useEffect, useState } from "react";

const API_BASE_URL = window.location.hostname === "localhost"
    ? "https://localhost:7054/api"
    : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        console.log("Checking cookies:", document.cookie);

        fetch(`${API_BASE_URL}/track`, {
            method: "GET",
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            setUserId(data.userId);
        })
        .catch(error => console.error("Error tracking user:", error));
    }, []);

    return (
        <UserContext.Provider value={{ userId }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
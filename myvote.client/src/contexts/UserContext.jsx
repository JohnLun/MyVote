import { createContext, useContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = window.location.hostname === "localhost"
    ? "https://localhost:7054"
    : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [connection, setConnection] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        console.log("Checking cookies:", document.cookie);

        fetch(`${API_BASE_URL}/api/track`, {
            method: "GET",
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.userId);
            setUserId(data.userId);
        })
        .catch(error => console.error("Error tracking user:", error));
    }, []);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/globalHub`, {
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);

        const fetchSuggestions = async () => {
            if (userId) {
                const response = await fetch(`${API_BASE_URL}/api/suggestions/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
    
                if (!response.ok) throw new Error(`Failed to fetch poll data. Status: ${response.status}`);
    
                const data = await response.json();
                setSuggestions(data);
            }
        };

        fetchSuggestions();

        newConnection.start()
            .then(() => {
                console.log("Ready to receive suggestions");

                newConnection.on("ReceiveWriteInOption", (optionDto) => {
                    if (optionDto.userId == userId) {
                        toast.success(`Received suggestion for Poll #${optionDto.pollId}!`, 
                            {
                                autoClose: 3000,
                                onClick: () => navigate('/notifications'),
                                style: { cursor: "pointer" }
                            });
                        setSuggestions(prevSuggestions => [
                            ...prevSuggestions,
                            optionDto
                        ])
                    }
                });

                console.log("Listener added");
            })
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            newConnection.stop();
        };
    }, [userId]);

    return (
        <UserContext.Provider value={{ userId, connection, suggestions, setSuggestions }}>
            {children}
        </UserContext.Provider>
    );

};


export const useUser = () => useContext(UserContext);
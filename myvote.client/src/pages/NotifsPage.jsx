import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";

function NotifsPage () {
    const { suggestions } = useUser(); 
    useEffect(() => {
        console.log(suggestions);
    },[suggestions]);
    
    return (
        <>

        </>
    );
}

export default NotifsPage;
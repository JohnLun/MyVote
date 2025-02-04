import LandingPage from "./pages/LandingPage";
import { UserProvider } from './contexts/UserContext';


function App() {

    return (
        <UserProvider>
            <LandingPage></LandingPage>
        </UserProvider>
        
    );
    
}

export default App;
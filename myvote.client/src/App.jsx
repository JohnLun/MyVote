import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import  CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import Home from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import PollLinkPage from './pages/PollLinkPage';
import Header from './components/Header';


function App() {

    return (
        
           <Router>
                <UserProvider>
                    <div className="main-container">
                        <Header />
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/createpoll" element={<CreatePoll />} />
                                <Route path="/poll/:pollId" element={<PollDetails />} />
                                <Route path="/user" element={<UserProfile />} />
                                <Route path="/poll-link/:pollId" element={<PollLinkPage />} />
                            </Routes>
                        </div>
                    </div>
                </UserProvider>
            </Router>
        
        
    );
    
}

export default App;
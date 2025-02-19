import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from './contexts/UserContext';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import Home from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import PollLinkPage from './pages/PollLinkPage';
import Header from './components/Header';
import 'react-toastify/dist/ReactToastify.css';
import NotifsPage from './pages/NotifsPage';

function App() {
    return (
        <Router>
            <UserProvider>
                <ToastContainer position="top-right" autoClose={3000} /> {/* Ensures it stays mounted */}
                <div className="main-container">
                    <Header />
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/createpoll" element={<CreatePoll />} />
                            <Route path="/poll/:pollId" element={<PollDetails />} />
                            <Route path="/user" element={<UserProfile />} />
                            <Route path="/poll-link/:pollId" element={<PollLinkPage />} />
                            <Route path="/notifications" element={<NotifsPage/>} />
                        </Routes>
                    </div>
                </div>
            </UserProvider>
        </Router>
    );
}

export default App;

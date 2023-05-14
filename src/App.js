import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './pages/signup/Signup';
import Mypage from './pages/mypage/mypage';
import UserProfile from './pages/userprofile/UserProfile';
import Login from './pages/login/Login.js';
import Home from './pages/home/Home';
import Message from './pages/message/Message';
import MessageDetail from './pages/message/MessageDetails';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/message" element={<Message />} />
          <Route path="/message-details/:messageId" element={<MessageDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

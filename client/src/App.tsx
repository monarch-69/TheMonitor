import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from './components/Home.tsx';
import SignIn from './components/SignIn.tsx';
import SignUp from './components/SignUp.tsx';

import './App.css'

function App()
{
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </Router>
    )
}

export default App;

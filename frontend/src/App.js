import React, { useState, useEffect } from 'react';
import Login from './compo/login';
import Register from './compo/Register';
import Home from './compo/Home';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const username = localStorage.getItem('username');
            const token = localStorage.getItem('token');
            
            if (username && token) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    if (isAuthenticated) {
        return <Home setIsAuthenticated={setIsAuthenticated} />;
    }

    if (isRegistering) {
        return <Register setIsRegistering={setIsRegistering} />;
    }

    return <Login setIsAuthenticated={setIsAuthenticated} setIsRegistering={setIsRegistering} />;
}

export default App;
// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link, useLocation } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import axios from 'axios';
// import './Login.css';

// const isTokenValid = (token) => {
//     if (!token) return false;
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return payload.exp * 1000 > Date.now();
//     } catch (e) {
//         return false;
//     }
// };

// const Login = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [formData, setFormData] = useState({ email: '', password: '' });
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     useEffect(() => {
//         const checkAuth = async () => {
//             const token = localStorage.getItem('token');
//             if (token && isTokenValid(token)) {
//                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//                 try {
//                     await axios.get('http://localhost:4345/api/auth/profile');
//                     navigate('/profile');
//                     return;
//                 } catch (error) {
//                     localStorage.removeItem('token');
//                     localStorage.removeItem('user');
//                     delete axios.defaults.headers.common['Authorization'];
//                 }
//             }
//             setIsLoading(false);
//         };

//         checkAuth();

//         if (location.state?.message) {
//             setSuccessMessage(location.state.message);
//         }
//     }, [location, navigate]);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         setError('');
//     };

//     const togglePasswordVisibility = (e) => {
//         e.preventDefault();
//         setShowPassword(!showPassword);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');
//         setSuccessMessage('');
        
//         try {
//             const response = await axios.post('http://localhost:4345/api/auth/login', formData);
//             if (response.data.token) {
//                 localStorage.setItem('token', response.data.token);
//                 if (response.data.user) {
//                     localStorage.setItem('user', JSON.stringify(response.data.user));
//                 }
//                 axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//                 navigate('/profile');
//             } else {
//                 setError('Login failed: No authentication token received');
//             }
//         } catch (error) {
//             console.error('Login error:', error);
//             setError(
//                 error.response?.data?.message || 
//                 'Login failed. Please check your credentials and try again.'
//             );
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (isLoading) {
//         return <div className="loading-container">Loading...</div>;
//     }

//     return (
//         <div className="login-container">
//             <div className="form-wrapper">
//                 <h2 className="form-title">Sign in to your account</h2>
//                 <form onSubmit={handleSubmit} className="login-form">
//                     {error && <div className="error-message">{error}</div>}
//                     {successMessage && <div className="success-message">{successMessage}</div>}

//                     <div className="form-group">
//                         <label htmlFor="email">Email address:</label>
//                         <input
//                             id="email"
//                             name="email"
//                             type="email"
//                             required
//                             placeholder="Enter your email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             className="form-input"
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label htmlFor="password">Password:</label>
//                         <div className="password-input">
//                             <input
//                                 id="password"
//                                 name="password"
//                                 type={showPassword ? "text" : "password"}
//                                 required
//                                 placeholder="Enter your password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                             />
//                             <button
//                                 type="button"
//                                 onClick={togglePasswordVisibility}
//                                 className="toggle-password"
//                             >
//                                 {showPassword ? (
//                                     <EyeOff size={20} />
//                                 ) : (
//                                     <Eye size={20} />
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     <button type="submit" className="submit-button">
//                         {isLoading ? 'Signing in...' : 'Sign in'}
//                     </button>

//                     <div className="link-group">
//                         <p>Don't have an account? <Link to="/register">Register here</Link></p>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (e) {
        return false;
    }
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token && isTokenValid(token)) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    await axios.get('http://localhost:4345/api/auth/profile');
                    navigate('/profile');
                    return;
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setIsLoading(false);
        };

        checkAuth();

        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const togglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const response = await axios.post('http://localhost:4345/api/auth/login', formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                navigate('/profile');
            } else {
                setError('Login failed: No authentication token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(
                error.response?.data?.message || 
                'Login failed. Please check your credentials and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="login-container">
            <div className="form-wrapper">
                <h2 className="form-title">Sign in to your account</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email address:</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <div className="password-input">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="toggle-password"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-button">
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="link-group">
                        <p>Don't have an account? <Link to="/register">Register here</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
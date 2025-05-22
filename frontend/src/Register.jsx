import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        contactNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCaptchaChange = (token) => {
        console.log('Captcha value:', token);
        setCaptchaToken(token);
    };

    const handleCaptchaExpired = () => {
        console.log('Captcha expired');
        setCaptchaToken(null);
    };

    const handleCaptchaError = (error) => {
        console.error('Captcha error:', error);
        setError('Error loading CAPTCHA. Please refresh the page.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!captchaToken) {
                setError('Please complete the CAPTCHA verification');
                setIsLoading(false);
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setIsLoading(false);
                return;
            }

            if (!formData.email.endsWith('@iiit.ac.in')) {
                setError('Only IIIT email addresses are allowed');
                setIsLoading(false);
                return;
            }

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                age: parseInt(formData.age),
                contactNumber: formData.contactNumber,
                password: formData.password,
                captchaToken: captchaToken
            };

            console.log('Sending registration request with payload:', {
                ...payload,
                password: '[HIDDEN]'
            });

            const response = await axios.post('http://localhost:4345/api/auth/register', payload);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                navigate('/profile');
            } else {
                navigate('/login', { 
                    state: { 
                        message: 'Registration successful! Please login with your credentials.' 
                    }
                });
            }
        } catch (error) {
            console.error('Registration error:', error);

            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setCaptchaToken(null);
            }

            setError(
                error.response?.data?.message || 
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="form-wrapper">
                <h2 className="form-title">Create your account</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    {error && <div className="error-message">{error}</div>}
                    <input
                        type="text"
                        name="firstName"
                        required
                        className="form-input"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="lastName"
                        required
                        className="form-input"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email"
                        required
                        className="form-input"
                        placeholder="Email address (@iiit.ac.in)"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="age"
                        required
                        className="form-input"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleChange}
                    />
                    <input
                        type="tel"
                        name="contactNumber"
                        required
                        className="form-input"
                        placeholder="Contact Number"
                        value={formData.contactNumber}
                        onChange={handleChange}
                    />

                    <div className="password-field">
                        <label htmlFor="password">Password:</label>
                        <div className="password-input">
                            <input
                                id="password"
                                name="password"
                                type={passwordVisible ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="toggle-password"
                            >
                                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="password-field">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <div className="password-input">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={confirmPasswordVisible ? "text" : "password"}
                                required
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                className="toggle-password"
                            >
                                {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>


                    <div className="captcha-container">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6LeIe0QrAAAAAH9zz53friumYqbtap0R_D0srX43"
                            onChange={handleCaptchaChange}
                            onExpired={handleCaptchaExpired}
                            onError={handleCaptchaError}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !captchaToken}
                        className={`submit-button ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;

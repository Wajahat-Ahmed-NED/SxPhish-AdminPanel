import React, { useEffect, useState } from 'react';
import { FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = ({ setShowSidebar, setShowNavbar, isLoggedIn, setIsLoggedIn }) => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setShowSidebar(false);
    setShowNavbar(false);

    return () => {
      setShowSidebar(true);
      setShowNavbar(true);
    };
  }, [setShowSidebar, setShowNavbar]);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        username: username,
        password: password,
      });
      console.log('Login response:', response.data);
      if (response.data.success) {
        setIsLoggedIn(true);
        setLoginError('');
        navigate('/Users');
      } else {
        setIsLoggedIn(false);
        setLoginError('Incorrect username or password. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('An error occurred during login. Please try again.');
    }
};

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginError('');
  };

  return isLoggedIn ? (
    <div>
      <p>Welcome, {username}!</p>
      <button onClick={handleLogout}>Logout</button>
      {/* ... existing authenticated content ... */}
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <div className="text-gray-200 bg-secondary-dark-bg rounded-lg p-8 lg:ml-4">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaSignInAlt className="mr-3" /> Login
        </h2>
        {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <label className="hidden">Username</label>
            <FaUser className="absolute left-2 top-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white pl-10"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4 relative">
            <label className="hidden">Password</label>
            <FaLock className="absolute left-2 top-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 p-2 w-full rounded-md bg-gray-700 text-white pl-10"
              placeholder="Enter your password"
            />
            {showPassword ? (
              <FaEyeSlash
                className="absolute right-2 top-5 cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaEye
                className="absolute right-2 top-5 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-main-bg text-black p-2 rounded-md hover:bg-black hover:text-white"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;

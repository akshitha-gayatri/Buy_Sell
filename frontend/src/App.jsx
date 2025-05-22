import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
      const originalRequest = error.config;
      
      if (error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
              const response = await axios.post('/api/auth/refresh-token');
              const { token } = response.data;
              
              localStorage.setItem('token', token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              return axios(originalRequest);
          } catch (error) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              return Promise.reject(error);
          }
      }
      
      return Promise.reject(error);
  }
);
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

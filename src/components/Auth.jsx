import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    
    // Faux 800ms loading delay for dramatic effect
    setTimeout(() => {
      localStorage.setItem('lifeos_auth', 'true');
      
      if (!isLogin) {
        localStorage.setItem('lifeos_onboarded', 'false');
        onAuthSuccess(false);
        navigate('/onboarding');
      } else {
        const hasOnboarded = localStorage.getItem('lifeos_onboarded') === 'true';
        onAuthSuccess(hasOnboarded);
        navigate(hasOnboarded ? '/dashboard' : '/onboarding');
      }
    }, 800);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-blob blob-1" />
      <div className="auth-bg-blob blob-2" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">L</div>
          <h1>LifeOS</h1>
          <p>{isLogin ? 'Welcome back to your operating system' : 'Initialize your new operating system'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input type="text" className="auth-input" placeholder="Arjun" required={!isLogin} />
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="you@protocol.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Master Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? <span className="auth-loader" /> : (isLogin ? 'Boot System' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? "Don't have an instance?" : "Already have an instance?"}
          <button className="auth-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

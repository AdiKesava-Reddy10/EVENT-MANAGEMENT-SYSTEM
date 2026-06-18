import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

const API_BASE = '/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleAuthStep, setGoogleAuthStep] = useState(0); // 0: hidden, 1: email, 2: password
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // If token is invalid or expired, log out automatically
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          alert('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { username, password } = e.target.elements;
    
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username: username.value,
        password: password.value
      });
      
      const userData = res.data;
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      setUser(userData);
    } catch (err) {
      const errMsg = err.response?.data;
      setAuthError(typeof errMsg === 'string' ? errMsg : (errMsg?.message || 'Login failed. Please check your credentials.'));
    }
  };

  const handleSignupRequest = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { username, password, fullName, email } = e.target.elements;
    
    const data = {
      username: username.value,
      password: password.value,
      fullName: fullName.value,
      email: email.value
    };

    try {
      await axios.post(`${API_BASE}/auth/signup/request-otp`, { email: data.email });
      setSignupData(data);
      setShowOtpInput(true);
      alert('OTP sent to your email!');
    } catch (err) {
      const errMsg = err.response?.data;
      setAuthError(typeof errMsg === 'string' ? errMsg : (errMsg?.message || 'Failed to send OTP.'));
    }
  };

  const handleSignupVerify = async (e) => {
    e.preventDefault();
    setAuthError('');
    const otp = e.target.elements.otp.value;
    
    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        ...signupData,
        otp
      });
      setIsLogin(true);
      setShowOtpInput(false);
      setSignupData(null);
      alert('Registration successful! Please login.');
    } catch (err) {
      const errMsg = err.response?.data;
      setAuthError(typeof errMsg === 'string' ? errMsg : (errMsg?.message || 'Registration failed.'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const simulateGoogleLogin = () => {
    setGoogleAuthStep(1);
    setGoogleEmail('');
    setGooglePassword('');
    setGoogleError('');
  };

  const handleGoogleNext = () => {
    if (!googleEmail.includes('@')) {
      setGoogleError('Enter a valid email address');
      return;
    }
    setGoogleError('');
    setGoogleAuthStep(2);
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setGoogleError('');
    setIsGoogleLoading(true);

    try {
      // Mock Google login by trying to login/auto-signup via the new endpoint
      try {
        const res = await axios.post(`${API_BASE}/auth/google-login`, {
          email: googleEmail,
          password: googlePassword
        });
        const userData = res.data;
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setUser(userData);
        setGoogleAuthStep(0);
      } catch (loginErr) {
        if (loginErr.response?.status === 401 || loginErr.response?.status === 403) {
           setGoogleError('Wrong password. Try again.');
        } else {
           setGoogleError('Authentication failed. Please try again.');
        }
      }
    } catch (err) {
      setGoogleError('Network error. Please check your connection.');
    }
    setIsGoogleLoading(false);
  };

  const [showLandingPage, setShowLandingPage] = useState(true);

  if (loading) return <div className="loading">Loading...</div>;

  if (showLandingPage && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
        {/* Navbar */}
        <header className="glass-morphism" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(135deg, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CampusEvents</h2>
          </div>
          <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={() => setShowLandingPage(false)}>Sign In</button>
        </header>

        {/* Hero Section */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div className="animate-in" style={{ maxWidth: '800px', zIndex: 10 }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', background: 'hsla(258, 90%, 66%, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px', border: '1px solid hsla(258, 90%, 66%, 0.3)' }}>
              Next-Generation Event Management
            </div>
            <h1 style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
              The Future of <span style={{ color: 'var(--primary)' }}>Smart Campus</span> Events
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Experience a unified platform featuring an intelligent notification system, robust database layer, and comprehensive reporting analytics.
            </p>
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowLandingPage(false)}>
              Get Started Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid-3 animate-in" style={{ marginTop: '80px', maxWidth: '1200px', width: '100%', gap: '32px', animationDelay: '0.2s' }}>
            <div className="card glass-morphism" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'hsla(326, 100%, 60%, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Reporting Analytics Module</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>Gain deep insights into event attendance, popular departments, and engagement rates with our powerful visualization dashboard.</p>
            </div>
            
            <div className="card glass-morphism" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'hsla(258, 90%, 66%, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Notification System</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>Keep students engaged with automated email alerts, real-time OTP verification, and instant event announcements.</p>
            </div>

            <div className="card glass-morphism" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'hsla(180, 100%, 40%, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tertiary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Robust Database Layer</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>Powered by Spring Data JPA and relational architecture, ensuring absolute data integrity and lightning-fast query performance.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="card glass-morphism animate-in" style={{ width: '400px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
            {isLogin ? 'Welcome Back' : (showOtpInput ? 'Enter OTP' : 'Join Us')}
          </h1>
          
          {showOtpInput && !isLogin ? (
            <form onSubmit={handleSignupVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input name="otp" placeholder="Enter 6-digit OTP" required />
              {authError && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{authError}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                Verify & Register
              </button>
              <button type="button" onClick={() => setShowOtpInput(false)} style={{ padding: '12px', background: 'transparent', color: 'white', border: '1px solid var(--border)' }}>
                Back
              </button>
            </form>
          ) : (
            <form onSubmit={isLogin ? handleLogin : handleSignupRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input name="username" placeholder="Username" required />
              {!isLogin && <input name="fullName" placeholder="Full Name" required />}
              {!isLogin && <input name="email" type="email" placeholder="Email" required />}
              <input name="password" type="password" placeholder="Password" required />
              
              {authError && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{authError}</p>}
              
              <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                {isLogin ? 'Login' : 'Sign Up'}
              </button>

              <div className="social-login-divider">
                <span>or</span>
              </div>

              <button type="button" className="btn-google" onClick={simulateGoogleLogin} disabled={isGoogleLoading}>
                {isGoogleLoading ? (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div className="spinner"></div> Connecting to Google...
                   </span>
                ) : (
                   <>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     Continue with Google
                   </>
                )}
              </button>
            </form>
          )}
          
          {!showOtpInput && (
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={() => setIsLogin(!isLogin)} 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
          )}
        </div>

        {/* Mock Google Login Flow Modal */}
        {googleAuthStep > 0 && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div className="card glass-morphism" style={{ width: '400px', padding: '40px', position: 'relative', background: '#fff', color: '#202124' }}>
              <button onClick={() => setGoogleAuthStep(0)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: '#5f6368', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 400, marginTop: '16px', marginBottom: '8px', color: '#202124' }}>
                  {googleAuthStep === 1 ? 'Sign in' : 'Welcome'}
                </h2>
                <p style={{ color: '#202124', fontSize: '1rem', margin: 0 }}>
                  {googleAuthStep === 1 ? 'to continue to CampusEvents' : googleEmail}
                </p>
              </div>

              {googleAuthStep === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input 
                    type="email" 
                    placeholder="Email or phone" 
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    style={{ padding: '14px', borderRadius: '4px', border: '1px solid #dadce0', background: 'transparent', color: '#202124', fontSize: '1rem' }} 
                  />
                  {googleError && <p style={{ color: '#d93025', fontSize: '0.85rem', margin: 0 }}>{googleError}</p>}
                  <p style={{ color: '#1a73e8', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>Forgot email?</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#1a73e8', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>Create account</p>
                    <button 
                      onClick={handleGoogleNext}
                      style={{ background: '#1a73e8', color: 'white', padding: '10px 24px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    style={{ padding: '14px', borderRadius: '4px', border: '1px solid #dadce0', background: 'transparent', color: '#202124', fontSize: '1rem' }} 
                    autoFocus
                  />
                  {googleError && <p style={{ color: '#d93025', fontSize: '0.85rem', margin: 0 }}>{googleError}</p>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#1a73e8', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>Forgot password?</p>
                    <button 
                      type="submit"
                      disabled={isGoogleLoading}
                      style={{ background: '#1a73e8', color: 'white', padding: '10px 24px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                      {isGoogleLoading ? <div className="spinner" style={{ borderTopColor: '#fff', width: '14px', height: '14px', borderWidth: '2px' }}></div> : null}
                      Next
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;

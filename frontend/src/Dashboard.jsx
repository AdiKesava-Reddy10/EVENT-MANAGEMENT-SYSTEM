import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  Bell,
  MessageCircle,
  X,
  MapPin,
  CloudLightning,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Users,
  Award,
  FileText
} from 'lucide-react';

const API_BASE = '/api';

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stats, setStats] = useState(null);
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: 'Hi! I am the Smart Campus Assistant. Ask me about event timings, registration, or available events.' }]);
  const [chatInput, setChatInput] = useState('');

  // Weather state
  const [weatherData, setWeatherData] = useState({});

  const isAdmin = user.role === 'ROLE_ADMIN';

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome!', message: 'Thanks for joining Smart Campus Events.', time: 'Just now', unread: true },
    { id: 2, title: 'Upcoming Event', message: 'AI Workshop starts tomorrow at 10 AM.', time: '2 hours ago', unread: true }
  ]);

  // Teams state
  const [teams, setTeams] = useState([
    { id: 1, name: 'CyberKnights', event: 'Hackathon 2026', skills: ['Python', 'React'], slots: 2, members: 3 },
    { id: 2, name: 'Design Gurus', event: 'UI/UX Challenge', skills: ['Figma', 'CSS'], slots: 1, members: 2 }
  ]);

  // Scanner state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerLoaded, setScannerLoaded] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Load scanner library dynamically
  useEffect(() => {
    if (isAdmin && !document.getElementById('html5-qrcode-script')) {
      const script = document.createElement('script');
      script.id = 'html5-qrcode-script';
      script.src = 'https://unpkg.com/html5-qrcode';
      script.onload = () => setScannerLoaded(true);
      document.body.appendChild(script);
    } else if (isAdmin) {
      setScannerLoaded(true);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'dashboard' || activeSection === 'events' || activeSection === 'adminControls') {
        const params = new URLSearchParams();
        if (searchKeyword) params.append('keyword', searchKeyword);
        if (filterDate) params.append('date', filterDate);
        if (filterDept) params.append('department', filterDept);
        if (filterType) params.append('type', filterType);
        
        const res = await axios.get(`${API_BASE}/events?${params.toString()}`);
        setEvents(res.data);
      }
      if (!isAdmin) {
        const regRes = await axios.get(`${API_BASE}/registrations`);
        setMyRegistrations(regRes.data);
      }
      if (isAdmin && activeSection === 'dashboard') {
        const statRes = await axios.get(`${API_BASE}/admin/statistics`);
        setStats(statRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchKeyword, filterDate, filterDept, filterType, activeSection]);

  const fetchWeather = async (location, eventId) => {
    // Simple mock weather fetch based on location to avoid requiring API keys for OpenWeather
    // In production, use real geocoding and a weather API
    try {
      // Mocking weather data for demonstration
      const mockWeather = {
        temp: Math.floor(Math.random() * 15) + 20, // 20-35 C
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)]
      };
      setWeatherData(prev => ({ ...prev, [eventId]: mockWeather }));
    } catch (err) {
      console.error("Weather fetch error", err);
    }
  };

  useEffect(() => {
    if (activeSection === 'events') {
      events.forEach(event => {
        if (!weatherData[event.id]) fetchWeather(event.location, event.id);
      });
    }
  }, [events, activeSection]);

  const handleRegisterClick = (eventId) => {
    setRegisteringEventId(eventId);
    setShowRegModal(true);
  };

  // Chatbot logic
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');

    // First check for campus-specific rules
    const lowerInput = chatInput.toLowerCase();
    let reply = "";
    let isCampusQuestion = false;
    
    if (lowerInput.includes('timing') || lowerInput.includes('time')) {
      reply = "Event timings are usually specified in the event details. Most events happen between 9 AM and 5 PM.";
      isCampusQuestion = true;
    } else if (lowerInput.includes('delete') || lowerInput.includes('cancel')) {
      reply = "You can cancel or delete your registration by going to the 'My Registrations' tab and clicking the 'Cancel' button next to the event.";
      isCampusQuestion = true;
    } else if (lowerInput.includes('register') || lowerInput.includes('registration')) {
      reply = "You can register by going to the Events tab and clicking 'Register Now'.";
      isCampusQuestion = true;
    } else if (lowerInput.includes('admin') || lowerInput.includes('control')) {
      reply = "Admin controls allow administrators to Add, Edit, and Delete events. You can access these under the 'Admin Controls' tab if you have admin privileges.";
      isCampusQuestion = true;
    } else if (lowerInput.includes('management') || lowerInput.includes('manage')) {
      reply = "Event management features include viewing upcoming events, filtering by date or department, and managing your registrations.";
      isCampusQuestion = true;
    } else if (lowerInput.includes('available events') || lowerInput.includes('events')) {
      reply = "Check out the Events tab on your dashboard to see all upcoming campus events!";
      isCampusQuestion = true;
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      reply = "Hello there! How can I help you today?";
      isCampusQuestion = true;
    }

    if (isCampusQuestion) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      }, 500);
    } else {
      // If not a campus rule, use Gemini API for ANY type of question
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          reply = "I see you're asking a general question! To enable my advanced AI to answer ANY question, please add your free VITE_GEMINI_API_KEY to your .env file.";
        } else {
          // Add a loading indicator message
          setChatMessages(prev => [...prev, { sender: 'bot', text: "Thinking...", isTemp: true }]);
          
          const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            contents: [{ parts: [{ text: `You are a helpful, friendly assistant integrated into a university Event Management System. Please provide a concise answer to this query: ${chatInput}` }] }]
          });
          
          reply = response.data.candidates[0].content.parts[0].text;
          
          // Remove the loading indicator and add the real reply
          setChatMessages(prev => [...prev.filter(m => !m.isTemp), { sender: 'bot', text: reply }]);
          return; // Exit early since we already updated state
        }
      } catch (err) {
        console.error("Gemini API Error:", err);
        reply = "Sorry, my AI brain had a slight glitch while trying to answer that. Could you ask again?";
      }
      setChatMessages(prev => [...prev.filter(m => !m.isTemp), { sender: 'bot', text: reply }]);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await axios.post(`${API_BASE}/registrations/register/${registeringEventId}`, data);
      alert('Registered successfully!');
      setShowRegModal(false);
      setRegisteringEventId(null);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data;
      alert(typeof errMsg === 'string' ? errMsg : (errMsg?.message || 'Failed to register'));
    }
  };

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await axios.delete(`${API_BASE}/registrations/${regId}`);
      fetchData();
    } catch (err) {
      alert('Failed to cancel');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/events/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = Object.fromEntries(formData.entries());
    
    try {
      if (editingEvent) {
        await axios.put(`${API_BASE}/admin/events/${editingEvent.id}`, eventData);
      } else {
        await axios.post(`${API_BASE}/admin/events`, eventData);
      }
      setShowModal(false);
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      alert('Failed to save event');
    }
  };

  const renderDashboardOverview = () => (
    <div className="animate-in">
      <h2 style={{ marginBottom: '24px' }}>Welcome back, {user.fullName}!</h2>
      {isAdmin && stats ? (
        <>
          <div className="grid-3">
            <div className="card glass-morphism stat-card">
              <span className="text-muted">Total Events</span>
              <span className="stat-value">{stats.totalEvents}</span>
            </div>
            <div className="card glass-morphism stat-card">
              <span className="text-muted">Total Registrations</span>
              <span className="stat-value">{stats.totalRegistrations}</span>
            </div>
            <div className="card glass-morphism stat-card">
              <span className="navbar-badge badge-admin">Top Event</span>
              <span className="stat-value" style={{ fontSize: '1.2rem', marginTop: '10px' }}>{stats.topEventName}</span>
            </div>
          </div>
          
          <div className="card glass-morphism" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
               Reporting Analytics Module
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">Registration Fulfillment</span>
                  <span style={{ fontWeight: 600 }}>{stats.totalEvents > 0 ? Math.min(100, Math.round((stats.totalRegistrations / (stats.totalEvents * 50)) * 100)) : 0}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--bg-dark)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.totalEvents > 0 ? Math.min(100, (stats.totalRegistrations / (stats.totalEvents * 50)) * 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 1s ease-out' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">Event Completion Rate</span>
                  <span style={{ fontWeight: 600 }}>85%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--bg-dark)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--tertiary), var(--success))', transition: 'width 1s ease-out' }}></div>
                </div>
              </div>
            </div>
            
            {/* Visual Analytics - Bar Chart */}
            <h4 style={{ marginTop: '32px', marginBottom: '16px' }}>Registrations per Event</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '150px', borderBottom: '1px solid var(--border)' }}>
              {events.slice(0, 5).map(event => {
                 const count = stats.totalRegistrations > 0 ? Math.floor(Math.random() * 20) + 5 : 0; // Mock count
                 const heightPercentage = Math.min(100, (count / 25) * 100);
                 return (
                   <div key={`chart-${event.id}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                     <div style={{ width: '100%', height: `${heightPercentage}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.8, minHeight: '10px' }}></div>
                     <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{event.title}</span>
                   </div>
                 )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="grid-3">
          <div className="card glass-morphism stat-card">
            <span className="text-muted">Total Events</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <div className="card glass-morphism stat-card">
            <span className="text-muted">Available slots</span>
            <span className="stat-value">42</span>
          </div>
          <div className="card glass-morphism stat-card">
            <span className="navbar-badge badge-student">Upcoming</span>
            <span className="stat-value">5</span>
          </div>
        </div>
      )}
      
      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Recent Events</h3>
      <div className="card glass-morphism">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 5).map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td><span className="badge badge-student">{event.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getRecommendedEvents = () => {
    if (events.length === 0) return [];
    
    // Simulated User Interests (In a real app, this would be fetched from user profile)
    const userInterests = ['AI', 'Coding', 'Design', 'Data Science', 'Tech'];
    
    // Extract types of past registrations for similarity matching
    const pastTypes = myRegistrations.map(reg => reg.event.type.toLowerCase());
    
    const scoredEvents = events.map(event => {
      let score = 0;
      const typeLower = event.type.toLowerCase();
      const descLower = event.description.toLowerCase();
      const titleLower = event.title.toLowerCase();
      let matchReason = '';
      
      // Rule 1: Matches explicit user interests
      userInterests.forEach(interest => {
        const interestLower = interest.toLowerCase();
        if (typeLower.includes(interestLower) || descLower.includes(interestLower) || titleLower.includes(interestLower)) {
          score += 3;
          if (!matchReason) matchReason = `Matches your interest in ${interest}`;
        }
      });
      
      // Rule 2: Similarity matching with past registrations
      if (pastTypes.includes(typeLower)) {
        score += 2;
        if (!matchReason) matchReason = 'Because you attended similar events';
      }
      
      // Rule 3: Simulated Popularity / Trending
      if (event.id % 3 === 0) {
        score += 1;
        if (!matchReason) matchReason = 'Trending on Campus';
      }
      
      // Filter out events the user is already registered for
      const isRegistered = myRegistrations.some(reg => reg.event.id === event.id);
      if (isRegistered) score = -1; 
      
      return { ...event, score, matchReason: matchReason || 'Recommended for you' };
    });
    
    // Sort by score and take top 3
    return scoredEvents.filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const renderEvents = () => {
    const recommended = getRecommendedEvents();
    
    return (
    <div className="animate-in">
      {!isAdmin && recommended.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Recommended for You
          </h2>
          <div className="grid-3">
            {recommended.map(event => (
              <div key={`rec-${event.id}`} className="card glass-morphism" style={{ border: '1px solid hsla(258, 90%, 66%, 0.3)', background: 'linear-gradient(145deg, hsla(258, 90%, 66%, 0.05) 0%, transparent 100%)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '-32px', background: 'var(--primary)', color: 'white', padding: '4px 40px', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                  {event.score >= 4 ? 'Best Match' : 'Trending'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="badge badge-student" style={{ width: 'fit-content' }}>{event.type}</span>
                  <h3 style={{ margin: 0, paddingRight: '20px' }}>{event.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{event.description}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, fontStyle: 'italic', marginBottom: '8px' }}>
                     ✨ {event.matchReason}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                    <span>📅 {event.date}</span>
                  </div>
                  <button className="btn-primary" onClick={() => handleRegisterClick(event.id)} style={{ marginTop: '8px', padding: '8px' }}>
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{isAdmin ? 'All Events' : 'Available Events'}</h2>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditingEvent(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Plus size={20} /> Add Event
          </button>
        )}
      </div>

      <div className="filters-container" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <input type="text" placeholder="Department" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <input type="text" placeholder="Event Type" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <button onClick={() => { setFilterDate(''); setFilterDept(''); setFilterType(''); setSearchKeyword(''); }} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}>Clear Filters</button>
      </div>

      <div className="grid-3">
        {events.map(event => (
          <div key={event.id} className="card glass-morphism animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="badge badge-student">{event.type}</span>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Edit size={18} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => { setEditingEvent(event); setShowModal(true); }} />
                  <Trash2 size={18} className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteEvent(event.id)} />
                </div>
              )}
            </div>
            <h3 style={{ margin: 0 }}>{event.title}</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{event.description}</p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <span>📅 {event.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {event.location}
              </span>
            </div>
            
            {/* Weather Widget */}
            {weatherData[event.id] && (
              <div style={{ background: 'var(--bg-dark)', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudLightning size={16} className="text-primary" />
                <span>Weather: {weatherData[event.id].temp}°C, {weatherData[event.id].condition}</span>
              </div>
            )}
            
            {/* Google Map Embedded Iframe */}
            <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden' }}>
               <iframe 
                 title={`map-${event.id}`}
                 width="100%" 
                 height="120" 
                 frameBorder="0" 
                 style={{ border: 0 }}
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} 
                 allowFullScreen
               ></iframe>
            </div>

            {!isAdmin && (
              <button 
                className="btn-primary" 
                onClick={() => handleRegisterClick(event.id)}
                style={{ marginTop: '12px', padding: '8px' }}
              >
                Register Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    );
  };

  const renderMyRegistrations = () => (
    <div className="animate-in">
      <h2 style={{ marginBottom: '24px' }}>My Registrations</h2>
      <div className="card glass-morphism">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myRegistrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.event.title}</td>
                <td>{reg.event.date}</td>
                <td>{reg.event.location}</td>
                <td>
                  <span className={`badge ${reg.attended ? 'badge-admin' : 'badge-student'}`}>
                    {reg.attended ? 'Attended' : 'Confirmed'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {reg.qrToken && (
                      <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block' }}>
                        <button style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                           <QrCode size={20} color="var(--primary)" />
                        </button>
                        <div className="tooltip-content" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '8px', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', marginBottom: '8px' }}>
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reg.qrToken}`} alt="QR Ticket" style={{ width: '100px', height: '100px' }} />
                           <div style={{ fontSize: '0.7rem', color: 'black', textAlign: 'center', marginTop: '4px' }}>Scan for entry</div>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => handleCancelRegistration(reg.id)}
                      style={{ background: 'transparent', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {myRegistrations.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  You haven't registered for any events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Team Formation</h2>
        <button className="btn-primary" onClick={() => alert("Create Team feature coming soon!")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Plus size={20} /> Create Team
        </button>
      </div>
      <div className="grid-3">
        {teams.map(team => (
          <div key={team.id} className="card glass-morphism animate-in">
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge badge-student" style={{ background: 'rgba(50, 200, 150, 0.2)', color: '#32c896' }}>{team.event}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{team.slots} slots left</span>
             </div>
             <h3 style={{ margin: '12px 0 4px 0' }}>{team.name}</h3>
             <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{team.members} members currently</p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {team.skills.map(skill => (
                   <span key={skill} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-dark)', color: 'white' }}>{skill}</span>
                ))}
             </div>
             <button className="btn-primary" onClick={() => alert(`Request sent to join ${team.name}`)} style={{ width: '100%', padding: '8px' }}>Request to Join</button>
          </div>
        ))}
      </div>
    </div>
  );

  const handleDownloadCertificate = async (regId, eventTitle) => {
    try {
      const response = await axios.get(`${API_BASE}/certificates/download/${regId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${eventTitle.replace(/\\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download certificate. Make sure the event is completed.');
    }
  };

  const renderCertificates = () => {
    const completedRegs = myRegistrations.filter(reg => new Date(reg.event.date) < new Date() || reg.attended);
    
    return (
      <div className="animate-in">
        <h2 style={{ marginBottom: '24px' }}>My Certificates</h2>
        {completedRegs.length === 0 ? (
           <div className="card glass-morphism" style={{ textAlign: 'center', padding: '40px' }}>
              <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <p className="text-muted">You haven't completed any events yet. Check-in to an event to unlock your certificate!</p>
           </div>
        ) : (
           <div className="grid-3">
              {completedRegs.map(reg => (
                 <div key={`cert-${reg.id}`} className="card glass-morphism" style={{ position: 'relative', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--primary)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                    <Award size={40} color="var(--secondary)" style={{ marginBottom: '16px' }} />
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Certificate of Completion</h4>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>{reg.event.title}</h2>
                    <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Presented to</p>
                    <h3 style={{ margin: '0 0 24px 0', color: 'var(--primary)' }}>{user.fullName || user.username}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Date: {reg.event.date}<br/>ID: CERT-{reg.qrToken?.substring(0, 8) || 'XXXX'}</p>
                    <button onClick={() => handleDownloadCertificate(reg.id, reg.event.title)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px' }}>
                       <FileText size={16} /> Download PDF
                    </button>
                 </div>
              ))}
           </div>
        )}
      </div>
    );
  };

  const handleSendNotification = (eventTitle) => {
    alert(`Email alerts successfully sent to all students registered for "${eventTitle}"!`);
  };

  const renderAdminControls = () => (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Admin Event Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => setShowScannerModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--secondary)' }}>
            <QrCode size={20} /> Scan Tickets
          </button>
          <button className="btn-primary" onClick={() => { setEditingEvent(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Plus size={20} /> Add New Event
          </button>
        </div>
      </div>
      
      <div className="filters-container" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <input type="text" placeholder="Department" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <input type="text" placeholder="Event Type" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
        <button onClick={() => { setFilterDate(''); setFilterDept(''); setFilterType(''); setSearchKeyword(''); }} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}>Clear Filters</button>
      </div>
      <div className="card glass-morphism">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td><span className="badge badge-student">{event.type}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleSendNotification(event.title)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Send Email Alert">
                      <Bell size={18} />
                    </button>
                    <Edit size={18} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => { setEditingEvent(event); setShowModal(true); }} title="Edit Event" />
                    <Trash2 size={18} className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteEvent(event.id)} title="Delete Event" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside className="sidebar glass-morphism">
        <div style={{ padding: '0 16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
             <Calendar style={{ margin: 'auto' }} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>CampusEvents</h2>
        </div>
        
        <div 
          className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <LayoutDashboard size={20} /> Dashboard
        </div>
        <div 
          className={`sidebar-item ${activeSection === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSection('events')}
          style={{ cursor: 'pointer' }}
        >
          <Calendar size={20} /> Events
        </div>
        {!isAdmin && (
          <>
            <div 
              className={`sidebar-item ${activeSection === 'registrations' ? 'active' : ''}`}
              onClick={() => setActiveSection('registrations')}
              style={{ cursor: 'pointer' }}
            >
              <UserCheck size={20} /> My Registrations
            </div>
            <div 
              className={`sidebar-item ${activeSection === 'teams' ? 'active' : ''}`}
              onClick={() => setActiveSection('teams')}
              style={{ cursor: 'pointer' }}
            >
              <Users size={20} /> Find Teams
            </div>
            <div 
              className={`sidebar-item ${activeSection === 'certificates' ? 'active' : ''}`}
              onClick={() => setActiveSection('certificates')}
              style={{ cursor: 'pointer' }}
            >
              <Award size={20} /> My Certificates
            </div>
          </>
        )}
        {isAdmin && (
          <div 
            className={`sidebar-item ${activeSection === 'adminControls' ? 'active' : ''}`}
            onClick={() => setActiveSection('adminControls')}
            style={{ cursor: 'pointer' }}
          >
            <Settings size={20} /> Admin Controls
          </div>
        )}
        
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div className="sidebar-item" onClick={onLogout} style={{ cursor: 'pointer', color: 'var(--danger)' }}>
            <LogOut size={20} /> Logout
          </div>
        </div>
      </aside>

      <div style={{ flex: 1 }}>
        {/* Navbar */}
        <header className="navbar glass-morphism">
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', width: '300px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ background: 'none', border: 'none', padding: 0, width: '100%' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ position: 'relative' }}>
               <Bell size={20} style={{ cursor: 'pointer', color: notifications.some(n=>n.unread) ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setShowNotifications(!showNotifications)} />
               {notifications.some(n=>n.unread) && <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: 'var(--danger)', borderRadius: '50%' }}></div>}
               
               {/* Notification Dropdown */}
               {showNotifications && (
                 <div className="card glass-morphism animate-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '300px', padding: '0', zIndex: 50, overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <h4 style={{ margin: 0 }}>Notifications</h4>
                       <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setNotifications(n => n.map(x => ({...x, unread: false})))}>Mark all read</span>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                       {notifications.map(n => (
                          <div key={n.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: n.unread ? 'rgba(157, 78, 221, 0.05)' : 'transparent' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong>{n.title}</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                             </div>
                             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</p>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }} className="profile-btn" onClick={() => setShowProfileModal(true)}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{user.fullName || user.username}</div>
                  <div className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>{isAdmin ? 'Admin' : 'Student'}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                   {(user.fullName || user.username).charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* Dynamic Section Rendering */}
        <main className="main-content">
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>
          ) : (
            <>
              {activeSection === 'dashboard' && renderDashboardOverview()}
              {activeSection === 'events' && renderEvents()}
              {activeSection === 'registrations' && renderMyRegistrations()}
              {activeSection === 'teams' && renderTeams()}
              {activeSection === 'certificates' && renderCertificates()}
              {activeSection === 'adminControls' && renderAdminControls()}
            </>
          )}
        </main>
      </div>

      {/* QR Scanner Modal */}
      {showScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="card glass-morphism animate-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
             <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><QrCode size={24} color="var(--primary)" /> Ticket Scanner</h3>
                <button onClick={() => { setShowScannerModal(false); setScanResult(null); }} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
             </div>

             <div style={{ width: '100%', background: 'var(--bg-dark)', borderRadius: '12px', padding: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {!scannerLoaded ? (
                  <p>Loading scanner module...</p>
                ) : scanResult ? (
                  <div className="animate-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                     {scanResult.success ? (
                        <>
                           <CheckCircle size={64} color="var(--success)" />
                           <h2 style={{ color: 'var(--success)', margin: 0 }}>Valid Ticket!</h2>
                           <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', width: '100%' }}>
                              <p style={{ margin: '0 0 8px 0' }}><strong>Student:</strong> {scanResult.studentName}</p>
                              <p style={{ margin: '0' }}><strong>Event:</strong> {scanResult.eventName}</p>
                           </div>
                           <p className="text-muted">Attendance has been recorded.</p>
                        </>
                     ) : (
                        <>
                           <AlertTriangle size={64} color="var(--danger)" />
                           <h2 style={{ color: 'var(--danger)', margin: 0 }}>Invalid Scan</h2>
                           <p>{scanResult.message}</p>
                        </>
                     )}
                     <button className="btn-primary" onClick={() => setScanResult(null)} style={{ marginTop: '16px', padding: '10px 24px' }}>Scan Next Ticket</button>
                  </div>
                ) : (
                  <>
                     <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' }}></div>
                     <p className="text-muted" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9rem' }}>Position the QR code within the frame.</p>
                     
                     {/* Manual simulation fallback for demo environments where camera may be blocked */}
                     <div style={{ marginTop: '24px', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '8px' }}>Or enter token manually (Demo fallback)</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <input id="manual-token" placeholder="Enter QR Token" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }} />
                           <button className="btn-primary" onClick={async () => {
                              const token = document.getElementById('manual-token').value;
                              if (!token) return;
                              try {
                                 const res = await axios.post(`${API_BASE}/registrations/scan?token=${token}`);
                                 setScanResult({ success: true, ...res.data });
                              } catch (err) {
                                 setScanResult({ success: false, message: err.response?.data?.message || 'Invalid or fake ticket' });
                              }
                           }}>Verify</button>
                        </div>
                     </div>
                  </>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Initialize Scanner when modal opens */}
      {showScannerModal && scannerLoaded && !scanResult && (
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              try {
                if (window.html5QrCodeScanner) window.html5QrCodeScanner.clear();
                window.html5QrCodeScanner = new window.Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
                window.html5QrCodeScanner.render((decodedText, decodedResult) => {
                   window.html5QrCodeScanner.clear();
                   // Call our React handler via an exposed window function or event
                   window.handleQRScan(decodedText);
                }, (error) => {});
              } catch (e) {}
            }, 100);
          `
        }} />
      )}
      
      {/* Expose handleQRScan to global window for the inline script to call */}
      {useEffect(() => {
         window.handleQRScan = async (token) => {
            try {
               const res = await axios.post(`${API_BASE}/registrations/scan?token=${token}`);
               setScanResult({ success: true, ...res.data });
            } catch (err) {
               setScanResult({ success: false, message: err.response?.data?.message || 'Invalid or fake ticket' });
            }
         };
         return () => { delete window.handleQRScan; };
      }, [])}

      {/* Modal for Add/Edit Event */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card glass-morphism animate-in" style={{ width: '100%', maxWidth: '600px' }}>
             <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
             <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <input name="title" placeholder="Event Title" defaultValue={editingEvent?.title} required />
                <textarea name="description" placeholder="Description" rows="3" defaultValue={editingEvent?.description} required></textarea>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="date" type="date" defaultValue={editingEvent?.date} required />
                  <input name="location" placeholder="Location" defaultValue={editingEvent?.location} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="type" placeholder="Type (e.g. Workshop)" defaultValue={editingEvent?.type} required />
                  <input name="department" placeholder="Department" defaultValue={editingEvent?.department} required />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'white', padding: '10px 20px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Save Event</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal for Registering for an Event */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card glass-morphism animate-in" style={{ width: '100%', maxWidth: '400px' }}>
             <h3>Register for Event</h3>
             <p className="text-muted" style={{ marginBottom: '20px' }}>Please confirm your details to register.</p>
             <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input name="studentName" placeholder="Full Name" defaultValue={user.fullName || user.username} required />
                <input name="studentEmail" type="email" placeholder="Email Address" defaultValue={user.email || `${user.username}@example.com`} required />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowRegModal(false)} style={{ background: 'transparent', color: 'white', padding: '10px 20px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Confirm Registration</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Chatbot Widget */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {isChatOpen && (
          <div className="card glass-morphism animate-in" style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--primary)' }}>
            <div style={{ background: 'var(--primary)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'white' }}>Campus Assistant</h4>
              <X size={18} color="white" style={{ cursor: 'pointer' }} onClick={() => setIsChatOpen(false)} />
            </div>
            
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '0.9rem'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..." 
                style={{ flex: 1, border: 'none', padding: '12px', background: 'var(--bg-dark)', borderRadius: 0 }}
              />
              <button type="submit" style={{ background: 'var(--primary)', border: 'none', padding: '0 16px', color: 'white', cursor: 'pointer' }}>Send</button>
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card glass-morphism animate-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', position: 'relative' }}>
             <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
             
             <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                 {(user.fullName || user.username).charAt(0).toUpperCase()}
             </div>
             
             <h2 style={{ margin: '0 0 8px 0' }}>{user.fullName || user.username}</h2>
             <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`} style={{ marginBottom: '24px' }}>{isAdmin ? 'Administrator' : 'Student'}</span>
             
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Username</span>
                  <span style={{ fontWeight: 500 }}>{user.username}</span>
                </div>
                {user.email && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-muted">Email</span>
                    <span style={{ fontWeight: 500 }}>{user.email}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Role</span>
                  <span style={{ fontWeight: 500 }}>{user.role.replace('ROLE_', '')}</span>
                </div>
             </div>
             
             <button 
                className="btn-primary" 
                onClick={onLogout} 
                style={{ width: '100%', marginTop: '24px', padding: '12px', background: 'var(--danger)', boxShadow: '0 4px 12px rgba(255, 50, 50, 0.2)' }}
             >
                Sign Out
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from './api';
import { socket } from './socket';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const scrollRef = useRef();
  const selectedContactRef = useRef(selectedContact);

  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiClient.get('/api/auth/userinfo');
        if (res.data.id) {
          setUser(res.data);
          socket.connect();
          fetchRecentContacts();
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      if (selectedContactRef.current) refreshMessages(selectedContactRef.current);
    }, 1000);
    const contactInterval = setInterval(() => {
      if (user && !isSearching) {
        showAll ? fetchAllContacts() : fetchRecentContacts();
      }
    }, 3000);
    return () => { clearInterval(msgInterval); clearInterval(contactInterval); };
  }, [user, showAll, isSearching]);

  const refreshMessages = async (contact) => {
    try {
      const res = await apiClient.post('/api/messages/get-messages', { id: contact.value || contact._id });
      if (res.data.messages?.length !== messages.length) setMessages(res.data.messages || []);
    } catch (e) {}
  };

  const handleAuth = async (isLogin) => {
    try {
      const path = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await apiClient.post(path, { email, password: pass });
      setUser(res.data.user);
      socket.connect();
      fetchRecentContacts();
    } catch (e) { alert("Auth Error"); }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
      setUser(null);
      window.location.reload();
    } catch (e) { setUser(null); window.location.reload(); }
  };

  const updateProfile = async () => {
    if (!firstName || !lastName) return alert("Fill name fields");
    try {
      const res = await apiClient.post('/api/auth/update-profile', { firstName, lastName });
      setUser(res.data);
      alert("Name updated!");
    } catch (e) { alert("Error"); }
  };

  const handleSearch = async () => {
    if (!searchTerm) { setIsSearching(false); setShowAll(false); return fetchRecentContacts(); }
    try {
      setIsSearching(true);
      setShowAll(false);
      const res = await apiClient.post('/api/contacts/search', { searchTerm });
      setContacts(res.data.contacts || []);
    } catch (e) {}
  };

  const fetchAllContacts = async () => {
    try {
      const res = await apiClient.get('/api/contacts/all-contacts');
      const data = res.data.contacts || [];
      setContacts(data);
      updateTopBarName(data);
    } catch (e) {}
  };

  const fetchRecentContacts = async () => {
    try {
      const res = await apiClient.get('/api/contacts/get-contacts-for-list');
      const data = res.data.contacts || [];
      setContacts(data);
      updateTopBarName(data);
    } catch (e) {}
  };

  const updateTopBarName = (newList) => {
    if (selectedContactRef.current) {
      const updated = newList.find(c => (c.value || c._id) === (selectedContactRef.current.value || selectedContactRef.current._id));
      if (updated) setSelectedContact(updated);
    }
  };

  const handleToggle = () => {
    if (isSearching || showAll) {
      fetchRecentContacts();
      setIsSearching(false);
      setShowAll(false);
    } else {
      fetchAllContacts();
      setShowAll(true);
      setIsSearching(false);
    }
  };

  const deleteChat = async () => {
    const dmId = selectedContact?.value || selectedContact?._id;
    if (!dmId || !window.confirm("Delete history?")) return;
    try {
      await apiClient.delete(`/api/contacts/delete-dm/${dmId}`);
      setMessages([]);
      setSelectedContact(null);
      setIsSearching(false);
      fetchRecentContacts();
      setShowAll(false);
    } catch (e) {}
  };

  const fetchMessages = async (contact) => {
    setSelectedContact(contact);
    try {
      const res = await apiClient.post('/api/messages/get-messages', { id: contact.value || contact._id });
      setMessages(res.data.messages || []);
    } catch (e) { setMessages([]); }
  };

  const sendMsg = () => {
    const rId = selectedContact?.value || selectedContact?._id;
    if (!newMsg.trim() || !rId || !user?.id) return;
    socket.emit("sendMessage", { sender: user.id, recipient: rId, content: newMsg, messageType: "text" });
    setNewMsg('');
  };

  const getDisplayName = (c) => {
    if (!c) return "";
    if (c.firstName && c.firstName !== 'undefined' && c.firstName.length > 0) return `${c.firstName} ${c.lastName || ''}`;
    if (c.label && !c.label.toLowerCase().includes('undefined')) return c.label;
    return c.email || "User";
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center' }}>Messenger</h2>
          <input style={{ width: '100%', marginBottom: '10px', padding: '10px', boxSizing: 'border-box' }} placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input style={{ width: '100%', marginBottom: '20px', padding: '10px', boxSizing: 'border-box' }} type="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
          <button style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }} onClick={() => handleAuth(true)}>Login</button>
          <button style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'none', border: '1px solid #ddd' }} onClick={() => handleAuth(false)}>Sign Up</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '320px', borderRight: '1px solid #ddd', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
          <div style={{fontSize: '11px', color: '#888', marginBottom: '4px'}}>Email: {user.email}</div>
          <div style={{fontSize: '13px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px'}}>Display Name: {getDisplayName(user)}</div>
          <div style={{display: 'flex', gap: '4px', marginBottom: '10px'}}>
            <input placeholder="First" style={{width: '65px'}} onChange={e => setFirstName(e.target.value)} />
            <input placeholder="Last" style={{width: '65px'}} onChange={e => setLastName(e.target.value)} />
            <button onClick={updateProfile} style={{fontSize: '10px', flex: 1}}>Update</button>
          </div>
          <div style={{display: 'flex', gap: '4px'}}>
            <input placeholder="Search..." style={{flex: 1}} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} style={{fontSize: '11px'}}>Search</button>
          </div>
          <button onClick={handleToggle} style={{ width: '100%', marginTop: '10px', fontSize: '12px', padding: '8px', background: (isSearching || showAll) ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            {isSearching ? "✖ Clear Search" : (showAll ? "⬅ Hide All" : "👥 Show All Contacts")}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(c => (
            <div key={c.value || c._id} onClick={() => fetchMessages(c)} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee', background: (selectedContact?.value === c.value || selectedContact?._id === c._id) ? '#e7f3ff' : 'transparent' }}>
              <div style={{fontWeight: '500'}}>{getDisplayName(c)}</div>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} style={{padding: '15px', background: '#fff', border: 'none', color: '#dc3545', borderTop: '1px solid #ddd', fontWeight: 'bold'}}>Logout</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selectedContact ? (
          <>
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{fontWeight: 'bold'}}>{getDisplayName(selectedContact)}</span>
              <button onClick={deleteChat} style={{fontSize: '10px', color: 'red', border: '1px solid red', padding: '4px 8px', borderRadius: '4px'}}>Delete History</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f0f2f5' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: (m.sender === user.id || m.sender?._id === user.id) ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '15px', background: (m.sender === user.id || m.sender?._id === user.id) ? '#007bff' : '#fff', color: (m.sender === user.id || m.sender?._id === user.id) ? 'white' : '#000', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex' }}>
              <input value={newMsg} onKeyPress={e => e.key === 'Enter' && sendMsg()} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', marginRight: '10px' }} placeholder="Message..." />
              <button onClick={sendMsg} style={{ padding: '10px 25px', background: '#007bff', color: 'white', border: 'none', borderRadius: '25px', fontWeight: 'bold' }}>Send</button>
            </div>
          </>
        ) : <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#adb5bd' }}>Select a user</div>}
      </div>
    </div>
  );
}
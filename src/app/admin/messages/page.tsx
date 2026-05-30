"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getConversations, getOrCreateConversation, subscribeToMessages, sendMessage, markConversationRead, ChatMessage, Conversation } from '@/lib/db';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Send, User as UserIcon, MessageCircle, Search } from 'lucide-react';

export default function AdminMessagesPage() {
  const { appUser } = useAuth();
  const [contacts, setContacts] = useState<{id: string, name: string, role: string, email: string}[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<{id: string, name: string, role: string, email: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeContact, setActiveContact] = useState<{id: string, name: string, role: string} | null>(null);
  
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appUser) return;
    
    // Load ALL users for Admin
    const loadContacts = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const allUsers = snap.docs
          .map(d => ({ id: d.id, name: d.data().displayName || 'User', role: d.data().role, email: d.data().email }))
          .filter(u => u.id !== appUser.uid); // Exclude self
        
        setContacts(allUsers);
        setFilteredContacts(allUsers);
      } catch (err) {
        console.error(err);
      }
    };
    
    loadContacts();
  }, [appUser]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredContacts(contacts.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, contacts]);

  useEffect(() => {
    let unsub: any = null;
    if (appUser && activeContact) {
      const initChat = async () => {
        const convId = await getOrCreateConversation(appUser.uid, appUser.role, activeContact.id, activeContact.role);
        setActiveConvId(convId);
        await markConversationRead(convId, appUser.uid);
        
        unsub = subscribeToMessages(convId, (msgs) => {
          setMessages(msgs);
          markConversationRead(convId, appUser.uid);
        });
      };
      initChat();
    }
    return () => { if (unsub) unsub(); };
  }, [activeContact, appUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !appUser || !activeContact) return;
    
    const text = inputText.trim();
    setInputText('');
    await sendMessage(activeConvId, appUser.uid, text, activeContact.id);
  };

  if (!appUser) return null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      {/* Sidebar: Contacts */}
      <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={20} color="#1e293b" /> Platform Chat
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users..." 
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredContacts.map(contact => {
            const isSelected = activeContact?.id === contact.id;
            return (
              <div 
                key={contact.id} 
                onClick={() => setActiveContact(contact)}
                style={{ 
                  padding: '1rem 1.5rem', 
                  borderBottom: '1px solid #f1f5f9', 
                  cursor: 'pointer', 
                  background: isSelected ? '#f1f5f9' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isSelected ? '#1e293b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : '#64748b' }}>
                  <UserIcon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{contact.role}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredContacts.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        {activeContact ? (
          <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <UserIcon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{activeContact.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{activeContact.role}</div>
              </div>
            </div>
            
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 'auto', marginBottom: 'auto' }}>
                  <MessageCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                  Send a message to start the conversation!
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === appUser.uid;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '0.875rem 1.25rem', 
                      borderRadius: '1rem',
                      background: isMe ? '#1e293b' : '#fff',
                      color: isMe ? '#fff' : '#0f172a',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      borderBottomRightRadius: isMe ? '0.25rem' : '1rem',
                      borderBottomLeftRadius: isMe ? '1rem' : '0.25rem',
                      boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{msg.text}</div>
                      <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8', textAlign: 'right', marginTop: '0.25rem' }}>
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ padding: '1.5rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '2rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
                <button type="submit" disabled={!inputText.trim()} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                  <Send size={20} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <MessageCircle size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Select a user</h3>
            <p style={{ fontSize: '0.9rem' }}>Choose a user from the sidebar to view chat history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

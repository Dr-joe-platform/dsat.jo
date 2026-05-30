"use client";
import React, { useState, useEffect } from 'react';
import { getSupportTickets, updateSupportTicket, SupportTicket, addNotification } from '@/lib/db';
import { Search, MessageSquare, CheckCircle, Clock, User, Mail, Send, AlertCircle } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'answered' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !selectedTicket.id) return;
    
    setReplying(true);
    try {
      await updateSupportTicket(selectedTicket.id, {
        status: 'answered',
        replyMessage: replyText,
        repliedAt: new Date()
      });
      
      // Notify the user in-app
      await addNotification({
        userId: selectedTicket.userId,
        type: 'system',
        title: 'Support Reply',
        message: `Admin replied to your ticket: "${selectedTicket.subject}"`,
        isRead: false,
        link: '/dashboard/support'
      });
      
      // Update local state
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'answered', replyMessage: replyText, repliedAt: new Date() } : t));
      setSelectedTicket(prev => prev ? { ...prev, status: 'answered', replyMessage: replyText, repliedAt: new Date() } : null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setReplying(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await updateSupportTicket(ticketId, { status: 'resolved' });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
    } catch (err) {
      console.error('Failed to resolve ticket', err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (searchTerm && !t.subject.toLowerCase().includes(searchTerm.toLowerCase()) && !t.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      
      {/* Left side: Ticket List */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header & Filters */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Support Tickets</h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {['all', 'new', 'answered', 'resolved'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
                  background: filter === f ? '#0f172a' : '#e2e8f0',
                  color: filter === f ? '#fff' : '#475569',
                  border: 'none', transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by subject or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Ticket List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <CheckCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No tickets found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{ 
                    padding: '1rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedTicket?.id === ticket.id ? '#eff6ff' : '#fff',
                    border: `1px solid ${selectedTicket?.id === ticket.id ? '#bfdbfe' : '#e2e8f0'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{ticket.subject}</h3>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase',
                      background: ticket.status === 'new' ? '#fee2e2' : ticket.status === 'answered' ? '#fef3c7' : '#dcfce3',
                      color: ticket.status === 'new' ? '#dc2626' : ticket.status === 'answered' ? '#d97706' : '#16a34a'
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Ticket Details & Reply */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedTicket ? (
          <>
            {/* Ticket Info */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{selectedTicket.subject}</h2>
                {selectedTicket.status !== 'resolved' && (
                  <button 
                    onClick={() => handleResolve(selectedTicket.id!)}
                    style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={14} /> Mark Resolved
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                  <User size={16} /> <span style={{ fontWeight: '600' }}>{selectedTicket.userName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                  <Mail size={16} /> <a href={`mailto:${selectedTicket.userEmail}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{selectedTicket.userEmail}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <Clock size={16} /> <span>{new Date(selectedTicket.createdAt?.seconds * 1000 || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc' }}>
              {/* User Message */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', color: '#64748b' }}>
                  {selectedTicket.userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ background: '#fff', padding: '1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', flex: 1 }}>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Admin Reply */}
              {selectedTicket.replyMessage && (
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row-reverse' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', color: '#fff' }}>
                    DS
                  </div>
                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '1rem 0 1rem 1rem', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.6', flex: 1 }}>
                    {selectedTicket.replyMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Input */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
              {selectedTicket.status === 'resolved' ? (
                <div style={{ textAlign: 'center', color: '#16a34a', fontSize: '0.9rem', fontWeight: '600', padding: '1rem', background: '#dcfce3', borderRadius: '0.5rem' }}>
                  This ticket is resolved.
                </div>
              ) : (
                <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply here... (This will be sent to the student)"
                    rows={4}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      disabled={replying || !replyText.trim()}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: (replying || !replyText.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (replying || !replyText.trim()) ? 0.6 : 1 }}
                    >
                      <Send size={16} /> {replying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <MessageSquare size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Select a ticket to view details</p>
          </div>
        )}
      </div>

    </div>
  );
}

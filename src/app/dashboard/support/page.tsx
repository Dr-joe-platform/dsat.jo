"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createSupportTicket, getUserSupportTickets, SupportTicket } from '@/lib/db';
import { Send, MessageCircle, Mail, ChevronDown, ChevronUp, LifeBuoy, Zap, ShieldQuestion } from 'lucide-react';

const faqs = [
  { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot password?' to receive a reset link via email." },
  { q: "How do test credits work?", a: "Each new test costs 1 credit. Retaking a test costs 0.5 credits. Credits reset monthly based on your plan." },
  { q: "Can I change my subscription plan?", a: "Yes! Go to Settings → Subscription to upgrade or downgrade your plan at any time." },
  { q: "How is the AI study plan generated?", a: "Our AI analyzes your performance across all questions, identifying weak domains and skill gaps, then generates a personalized weekly study schedule." },
  { q: "Are the questions officially from College Board?", a: "Our questions are carefully crafted by expert tutors to perfectly mimic the style, difficulty, and format of the official Digital SAT." },
];

export default function SupportPage() {
  const { appUser } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (appUser) {
      getUserSupportTickets(appUser.uid).then(setTickets);
    }
  }, [appUser]);

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    setFormStatus('sending');
    try {
      await createSupportTicket({
        userId: appUser.uid,
        userEmail: appUser.email || 'No email',
        userName: appUser.displayName || appUser.email || 'Unknown User',
        subject,
        message
      });
      setFormStatus('sent');
      setSubject('');
      setMessage('');
      if (appUser) {
        getUserSupportTickets(appUser.uid).then(setTickets);
      }
    } catch (err) {
      console.error(err);
      setFormStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
        borderRadius: '1.5rem', 
        padding: '3rem', 
        color: '#fff', 
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
      }}>
        <LifeBuoy size={160} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: '-20px', top: '-20px', transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>How can we help you?</h1>
          <p style={{ fontSize: '1.1rem', color: '#e0e7ff', maxWidth: '500px' }}>Our support team is always ready to answer your questions and help you get the most out of DSAT.JO.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: FAQ & Contact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { icon: Send, label: 'Telegram', desc: 'Fastest response', link: '#', color: '#2CA5E0', bg: '#E8F4FD' },
              { icon: Mail, label: 'Email Us', desc: 'support@dsat.jo', link: 'mailto:support@dsat.jo', color: '#4f46e5', bg: '#e0e7ff' },
              { icon: MessageCircle, label: 'Discord', desc: 'Community help', link: '#', color: '#5865F2', bg: '#EEF0FF' },
            ].map((item, i) => (
              <a key={i} href={item.link} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: '#fff', borderRadius: '1rem', padding: '1.5rem 1rem', textAlign: 'center', 
                  border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: item.color }}>
                    <item.icon size={24} />
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.label}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.desc}</div>
                </div>
              </a>
            ))}
          </div>

          {/* FAQ Section */}
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '8px', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                <ShieldQuestion size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Frequently Asked Questions</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden', transition: 'all 0.3s' }}>
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{ 
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '1.25rem', background: isOpen ? '#f8fafc' : '#fff', border: 'none', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: isOpen ? '#1e3a8a' : '#334155', fontSize: '0.95rem' }}>{faq.q}</span>
                      {isOpen ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1.25rem 1.25rem', background: '#f8fafc', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#e0e7ff', padding: '0.5rem', borderRadius: '8px', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
              <Zap size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Send a Message</h2>
          </div>

          {formStatus === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '60px', height: '60px', background: '#dcfce3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#16a34a' }}>
                <Send size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Message Sent!</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>We&apos;ll get back to you to your email within 24 hours.</p>
              <button 
                onClick={() => setFormStatus('idle')}
                style={{ marginTop: '1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMsg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} required type="text" placeholder="What do you need help with?" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} placeholder="Describe your issue in detail..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              {formStatus === 'error' && (
                <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>Failed to send message. Please try again.</div>
              )}
              <button 
                disabled={formStatus === 'sending'}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: formStatus === 'sending' ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: formStatus === 'sending' ? 0.7 : 1 }}
              >
                {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Past Tickets Section */}
      {tickets.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Your Support Tickets</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map(ticket => (
              <div key={ticket.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>{ticket.subject}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: ticket.status === 'answered' ? '#dcfce3' : ticket.status === 'resolved' ? '#f1f5f9' : '#fef3c7',
                    color: ticket.status === 'answered' ? '#16a34a' : ticket.status === 'resolved' ? '#475569' : '#d97706'
                  }}>
                    {ticket.status.toUpperCase()}
                  </div>
                </div>
                
                <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                  {ticket.message}
                </div>

                {ticket.replyMessage && (
                  <div style={{ background: '#eff6ff', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#1e3a8a', fontWeight: '700', fontSize: '0.85rem' }}>
                      <LifeBuoy size={16} /> Admin Reply
                    </div>
                    <div style={{ color: '#1e3a8a', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {ticket.replyMessage}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

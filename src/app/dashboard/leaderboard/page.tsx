"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, BookOpen, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getLeaderboard, LeaderboardEntry } from '@/lib/db';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { appUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50).then(e => { setEntries(e); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const myRank = entries.findIndex(e => e.uid === appUser?.uid) + 1;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>Global Leaderboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Top students ranked by mastery points</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : entries.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Trophy size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>No rankings yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Complete tests to appear on the leaderboard!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PODIUM for Top 3 */}
          {top3.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginTop: '1rem', marginBottom: '1rem', height: '240px' }}>
              {/* Rank 2 (Silver) */}
              {top3[1] && <PodiumStep entry={top3[1]} rank={2} />}
              
              {/* Rank 1 (Gold) */}
              {top3[0] && <PodiumStep entry={top3[0]} rank={1} />}
              
              {/* Rank 3 (Bronze) */}
              {top3[2] && <PodiumStep entry={top3[2]} rank={3} />}
            </div>
          )}

          {/* List for Rank 4+ */}
          {rest.length > 0 && (
            <motion.div 
              initial="hidden" animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fff', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
            >
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isMe = entry.uid === appUser?.uid;
                return (
                  <motion.div 
                    key={entry.uid}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem',
                      background: isMe ? '#f0f4ff' : '#fff',
                      border: `1px solid ${isMe ? '#c7d2fe' : '#f1f5f9'}`,
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s ease',
                      cursor: 'default'
                    }}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ width: '28px', textAlign: 'center', fontWeight: '800', color: '#94a3b8', fontSize: '0.9rem' }}>{rank}</div>
                    
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.875rem', flexShrink: 0 }}>
                      {entry.displayName?.[0]?.toUpperCase() ?? 'S'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: isMe ? '#4338ca' : '#0f172a', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.displayName} {isMe && <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>(You)</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BookOpen size={10} /> {entry.tests} tests</span>
                        {entry.streak > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Flame size={10} color="#f97316" /> {entry.streak} streak</span>}
                        <span>🏅 {entry.badges} badges</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{entry.points.toLocaleString()}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>POINTS</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Sticky My Rank Banner */}
          {myRank > 3 && (
            <motion.div 
              initial={{ y: 50, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'fixed', bottom: '2rem', left: '50%',
                width: 'calc(100% - 2rem)', maxWidth: '600px',
                padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 50
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8' }}>#{myRank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Your Current Rank</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{entries[myRank - 1]?.points ?? 0} points · Keep practicing to reach the podium!</div>
              </div>
              <Flame size={24} color="#f59e0b" fill="#f59e0b" />
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}

// Sub-component for Podium
function PodiumStep({ entry, rank }: { entry: LeaderboardEntry, rank: number }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const height = isFirst ? 160 : isSecond ? 120 : 90;
  
  const bg = isFirst ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
           : isSecond ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' 
           : 'linear-gradient(135deg, #b45309, #d97706)';
           
  const glow = isFirst ? '0 10px 30px rgba(245, 158, 11, 0.4)' 
             : isSecond ? '0 10px 25px rgba(148, 163, 184, 0.3)' 
             : '0 10px 20px rgba(180, 83, 9, 0.3)';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: 'spring', stiffness: 100 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', maxWidth: '120px' }}
    >
      {/* Avatar & Crown */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        {isFirst && (
          <motion.div 
            initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.5, type: 'spring' }}
            style={{ position: 'absolute', top: '-28px', left: '50%', x: "-50%", color: '#f59e0b' }}
          >
            <Crown size={36} fill="#f59e0b" />
          </motion.div>
        )}
        <div style={{ 
          width: isFirst ? '64px' : '52px', height: isFirst ? '64px' : '52px', 
          borderRadius: '50%', background: '#fff', border: `3px solid ${isFirst ? '#f59e0b' : isSecond ? '#cbd5e1' : '#d97706'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: '#0f172a', fontWeight: '800', fontSize: isFirst ? '1.5rem' : '1.25rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          {entry.displayName?.[0]?.toUpperCase() ?? 'S'}
        </div>
      </div>
      
      {/* Name & Points */}
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px', margin: '0 auto' }}>
          {entry.displayName}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : '#d97706' }}>
          {entry.points.toLocaleString()} pts
        </div>
      </div>

      {/* Block */}
      <div style={{ 
        width: '100%', height: `${height}px`, background: bg, 
        borderRadius: '0.75rem 0.75rem 0 0', boxShadow: glow,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem',
        color: '#fff', fontWeight: '900', fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {rank}
      </div>
    </motion.div>
  );
}

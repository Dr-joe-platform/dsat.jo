"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, getAllUsers, AppUser, AdminTestBank, getAllMiniQuizzes, MiniQuiz } from '@/lib/db';
import TestAccessControl from '@/components/TestAccessControl';

export default function AdminTestAccessPage() {
  const { appUser } = useAuth();
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [miniQuizzes, setMiniQuizzes] = useState<MiniQuiz[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTests, allQuizzes, allUsers] = await Promise.all([
        getTestBanks(appUser?.uid, 'admin'),
        getAllMiniQuizzes(),
        getAllUsers(),
      ]);
      setTests(allTests);
      setMiniQuizzes(allQuizzes);
      setStudents(allUsers.filter(u => u.role === 'student'));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <TestAccessControl 
      tests={tests} 
      miniQuizzes={miniQuizzes}
      students={students} 
      loading={loading} 
      onAccessUpdated={loadData} 
    />
  );
}

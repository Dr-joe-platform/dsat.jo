"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, getTeacherStudents, AppUser, AdminTestBank, getMiniQuizzes, MiniQuiz } from '@/lib/db';
import TestAccessControl from '@/components/TestAccessControl';

export default function TestAccessPage() {
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
      const [myTests, myQuizzes, subjectStudents] = await Promise.all([
        getTestBanks(appUser?.uid, appUser?.role, appUser?.teacherSubject),
        getMiniQuizzes(appUser!.uid),
        getTeacherStudents(appUser!.uid, appUser?.teacherSubject),
      ]);
      setTests(myTests);
      setMiniQuizzes(myQuizzes);
      setStudents(subjectStudents);
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

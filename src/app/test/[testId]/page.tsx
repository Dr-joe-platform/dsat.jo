"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AIExamCharacter from '@/components/AIExamCharacter';
import {
  Eye, EyeOff, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight,
  Grid3X3, X, AlertTriangle, Calculator, Flag, ChevronDown, ChevronUp,
  FileText, MoreHorizontal, Check, Loader2, LayoutTemplate, Maximize, Minimize,
  TrendingUp, ArrowLeft
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ALL_TEST_QUESTIONS, DSATQuestion, DSATModule } from '@/lib/questions-data';
import { getAllAvailableQuestions } from '@/lib/questions-pool';
import { useAuth } from '@/lib/auth-context';
import { saveTestResult, addNotification, updateUserStats, getUserStats, completeAssignment, addBookmark, removeBookmark, getUserResults } from '@/lib/db';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { motion } from 'framer-motion';
import AnnotatableText, { HighlightAnnotation, LATEX_DELIMITERS } from '@/components/AnnotatableText';
import { Edit2, Clock, BookOpen, Sparkles } from 'lucide-react';
import WhiteboardStep from '@/components/WhiteboardStep';

// ──────────────────────────────────────────────
// Bluebook-accurate module timing (minutes)
const MODULE_TIME: Record<string, number> = {
  M1: 32,
  M2H: 32,
  M2E: 32,
  MATH_M1: 35,
  MATH_M2H: 35,
  MATH_M2E: 35,
};

type Phase = 'intro' | 'testing' | 'break' | 'results' | 'review';

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const { appUser } = useAuth();

  // ── Test data ──
  const [testData, setTestData] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(true);
  const [moduleKey, setModuleKey] = useState<keyof DSATModule>('M1');
  const [phase, setPhase] = useState<Phase>('intro');
  const [annotations, setAnnotations] = useState<Record<string, HighlightAnnotation[]>>({});
  const isMath = testData?.subject === 'Math' || (moduleKey || '').includes('MATH');

  useEffect(() => {
    const fetchTest = async () => {
      setLoadingTest(true);

      if (testId === 'question_bank') {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const diffs = params.get('difficulty') ? params.get('difficulty')!.split(',') : [];
        const limitParam = params.get('limit');
        const timeParam = params.get('time');
        const titleParam = params.get('title');
        
        let pool = await getAllAvailableQuestions(appUser?.uid, appUser?.subject);

        if (diffs.length > 0) {
           pool = pool.filter(q => diffs.includes(q.difficulty));
        }

        const topics = params.get('topic') ? params.get('topic')!.split(',') : [];
        if (topics.length > 0) {
           pool = pool.filter(q => 
             topics.includes(q._subject || '') || 
             topics.includes(q.skill || '') || 
             topics.includes(q.domain || '')
           );
        }
        
        const statusParam = params.get('status');
        if (statusParam && appUser?.uid) {
           const statuses = statusParam.split(',');
           try {
             const userRes = await getUserResults(appUser.uid);
             const answeredSet = new Set<string>();
             const incorrectSet = new Set<string>();
             
             userRes.forEach(r => {
               Object.keys(r.answers || {}).forEach(qId => answeredSet.add(qId));
               (r.wrongQuestionIds || []).forEach(qId => incorrectSet.add(qId));
             });
             
             const correctSet = new Set<string>();
             answeredSet.forEach(qId => {
               if (!incorrectSet.has(qId)) correctSet.add(qId);
             });
             
             pool = pool.filter(q => {
               const isUnanswered = !answeredSet.has(q.id);
               const isCorrect = correctSet.has(q.id);
               const isIncorrect = incorrectSet.has(q.id);
               
               if (statuses.includes('Unanswered') && isUnanswered) return true;
               if (statuses.includes('Correct') && isCorrect) return true;
               if (statuses.includes('Incorrect') && isIncorrect) return true;
               return false;
             });
           } catch (err) {
             console.error("Error fetching results for status filter:", err);
           }
        }

        pool.sort(() => Math.random() - 0.5);

        let selected = [];
        let timeMin = 35;

        if (limitParam && timeParam) {
           selected = pool.slice(0, parseInt(limitParam) || 10);
           timeMin = parseInt(timeParam) || 10;
        } else if (mode === 'blitz') {
           selected = pool.slice(0, 10);
           timeMin = 8;
        } else {
           selected = pool.slice(0, 20);
           timeMin = 30;
        }

        if (selected.length === 0) {
           selected = pool.slice(0, limitParam ? parseInt(limitParam) : 10);
        }

        const sessionName = titleParam || (mode === 'blitz' ? 'Blitz Challenge' : 'Custom Practice Session');

        setTestData({
          id: 'question_bank_session',
          name: sessionName,
          M1: selected,
          M2H: [],
          M2E: [],
          customTime: timeMin
        });
      } else if (testId === 'ai-generated') {
        const params = new URLSearchParams(window.location.search);
        const topic = params.get('topic') || 'Mixed Practice';
        const subject = params.get('subject') || '';
        const limitParam = params.get('q') || '5';
        
        let pool = await getAllAvailableQuestions(appUser?.uid, appUser?.subject);

        if (subject && subject !== 'Mixed') {
           const isMath = subject.toLowerCase().includes('math');
           pool = pool.filter(q => (q.skill && q.skill.toLowerCase().includes('math')) === isMath || (q.domain && q.domain.toLowerCase().includes('math')) === isMath);
        }

        const topicLower = topic.toLowerCase();
        let filteredPool = pool.filter(q => 
          (q.skill && q.skill.toLowerCase().includes(topicLower)) || 
          (q.domain && q.domain.toLowerCase().includes(topicLower))
        );

        if (filteredPool.length === 0) {
          filteredPool = pool;
        }

        filteredPool.sort(() => Math.random() - 0.5);

        const selected = filteredPool.slice(0, parseInt(limitParam) || 5);

        if (selected.length > 0) {
          setTestData({
            id: 'ai-generated',
            name: `Practice: ${topic}`,
            M1: selected,
            M2H: [],
            M2E: [],
            customTime: Math.max(5, selected.length * 2),
            subject: subject === 'Math' ? 'Math' : 'Reading & Writing'
          });
        } else {
          alert('No questions found for this topic. Please try another.');
          router.push('/dashboard/study-plan');
        }
      } else if (ALL_TEST_QUESTIONS[testId as keyof typeof ALL_TEST_QUESTIONS]) {
        setTestData(ALL_TEST_QUESTIONS[testId as keyof typeof ALL_TEST_QUESTIONS]);
      } else {
        try {
          const { getTestById, getMiniQuizById } = await import('@/lib/db');
          const doc = await getTestById(testId as string);
          
          if (doc && (doc as any).content) {
            const parsed = JSON.parse((doc as any).content);
            const isFullTest = (doc as any).subject === 'Full';
            const m1: any[] = [];
            const m2h: any[] = [];
            const mathM1: any[] = [];
            const mathM2h: any[] = [];
            parsed.forEach((q: any) => {
              let cleanQuestion = q.question || '';
              cleanQuestion = cleanQuestion.replace(/!\[.*?\]\((.*?)\)/g, '').trim();
              cleanQuestion = cleanQuestion.replace(/\[.*?\]\((.*?)\)/g, '').trim();
              cleanQuestion = cleanQuestion.replace(/(https?:\/\/[^\s]+)/g, '').trim();

              const formattedQ = {
                id: q.id || `custom-${Math.random()}`,
                domain: q.domain || '',
                skill: q.skill || '',
                text: cleanQuestion,
                passage: q.passage || null,
                imageUrl: q.imageUrl || q.image || null,
                question: cleanQuestion,
                options: q.options && q.options.length > 0 ? q.options : undefined,
                correctAnswer: q.correctAnswer || (q.options ? ['A','B','C','D'][q.answer || 0] : ''),
                explanation: q.explanation || '',
                type: (q.type === 'MCQ' || q.type === 'MC') ? 'MC' : (q.options && q.options.length > 0 ? 'MC' : 'SPR')
              };
              
              if (isFullTest) {
                if (q.module === 'M1') m1.push(formattedQ);
                else if (q.module === 'M2H' || q.module === 'M2E' || q.module === 'M2') m2h.push(formattedQ);
                else if (q.module === 'MATH_M1') mathM1.push(formattedQ);
                else if (q.module === 'MATH_M2H' || q.module === 'MATH_M2') mathM2h.push(formattedQ);
                else m1.push(formattedQ); // Fallback
              } else {
                if (String(q.module).includes('1') || String(q.module).toUpperCase().includes('M1')) m1.push(formattedQ);
                else if (String(q.module).includes('2') || String(q.module).toUpperCase().includes('M2')) m2h.push(formattedQ);
                else m1.push(formattedQ);
              }
            });

            if (!isFullTest && m2h.length === 0 && m1.length >= 4) {
               const half = Math.ceil(m1.length / 2);
               m2h.push(...m1.splice(half));
            }

            const cfg = (doc as any).modulesConfig;
            if (cfg) {
              if (cfg.M1?.questions) m1.splice(cfg.M1.questions);
              if (cfg.M2?.questions) m2h.splice(cfg.M2.questions);
              if (cfg.MATH_M1?.questions) mathM1.splice(cfg.MATH_M1.questions);
              if (cfg.MATH_M2?.questions) mathM2h.splice(cfg.MATH_M2.questions);
            }

            const finalTestData: any = {
              id: testId,
              name: (doc as any).name,
              subject: isFullTest ? 'Full' : (doc as any).subject,
              M1: m1,
              M2H: m2h,
              M2E: m2h,
              modulesConfig: cfg
            };
            
            if (isFullTest) {
              finalTestData.MATH_M1 = mathM1;
              finalTestData.MATH_M2H = mathM2h;
              finalTestData.MATH_M2E = mathM2h;
            } else if (m2h.length === 0) {
              finalTestData.customTime = Math.max(10, m1.length * 2);
            }

            setTestData(finalTestData);
          } else {
            // Check if it's a mini quiz
            const miniDoc = await getMiniQuizById(testId as string);
            if (miniDoc && miniDoc.questions) {
              const m1 = miniDoc.questions.map((q, i) => ({
                id: `mini-${testId}-${i}`,
                domain: '',
                skill: '',
                text: q.question,
                question: q.question,
                options: q.options && q.options.length > 0 && q.options.some(o => o.trim()) ? q.options : undefined,
                correctAnswer: q.options && q.options.length > 0 && q.options.some(o => o.trim()) ? ['A','B','C','D'][q.answer || 0] : q.answer,
                explanation: '',
                type: q.options && q.options.length > 0 && q.options.some(o => o.trim()) ? 'MCQ' : 'SPR'
              }));
              
              setTestData({
                id: testId,
                name: miniDoc.title,
                subject: miniDoc.subject,
                M1: m1,
                M2H: [],
                M2E: [],
                customTime: Math.max(5, Math.ceil(m1.length * 1.2))
              });
            }
          }
        } catch (e) {
          console.error("Failed to load custom test or mini quiz", e);
        }
      }
      setLoadingTest(false);
    };
    fetchTest();
  }, [testId]);

  // ── Question state ──
  const questions: DSATQuestion[] = testData ? (testData[moduleKey] ?? []) : [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({ M1: {}, M2H: {}, M2E: {}, MATH_M1: {}, MATH_M2H: {}, MATH_M2E: {} });
  const [sprAnswers, setSprAnswers] = useState<Record<string, Record<number, string>>>({ M1: {}, M2H: {}, M2E: {}, MATH_M1: {}, MATH_M2H: {}, MATH_M2E: {} });
  const [marked, setMarked] = useState<Record<string, Record<number, boolean>>>({ M1: {}, M2H: {}, M2E: {}, MATH_M1: {}, MATH_M2H: {}, MATH_M2E: {} });
  const [crossed, setCrossed] = useState<Record<string, Record<number, string[]>>>({ M1: {}, M2H: {}, M2E: {}, MATH_M1: {}, MATH_M2H: {}, MATH_M2E: {} });
  const [eliminated, setEliminated] = useState<Record<string, Record<number, boolean>>>({ M1: {}, M2H: {}, M2E: {}, MATH_M1: {}, MATH_M2H: {}, MATH_M2E: {} });

  // ── Timer & Anti-Cheat ──
  const [timeLeft, setTimeLeft] = useState((MODULE_TIME[moduleKey] ?? 35) * 60);
  const [showTimer, setShowTimer] = useState(true);
  const [timerWarning, setTimerWarning] = useState(false);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);

  // ── UI state ──
  const [showNav, setShowNav] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [rwScore, setRwScore] = useState(0);
  const [activeHelpsLeft, setActiveHelpsLeft] = useState(5);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [dynamicExplanation, setDynamicExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);

  useEffect(() => {
    setShowWhiteboard(false);
    setDynamicExplanation('');
    setLoadingExplanation(false);
  }, [currentIdx, moduleKey]);

  // Fullscreen enforcement
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && phase === 'testing') {
        setShowFullscreenPrompt(true);
      } else {
        setShowFullscreenPrompt(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [phase]);

  // Anti-Cheat (Focus Mode)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'testing') {
        setCheatWarnings(prev => prev + 1);
        setShowCheatModal(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [phase]);

  // Auto-Save Effect
  useEffect(() => {
    if (phase !== 'testing' && phase !== 'break') return;
    const interval = setInterval(() => {
      const stateToSave = {
        answers,
        sprAnswers,
        marked,
        crossed,
        eliminated,
        timeLeft,
        moduleKey,
        currentIdx,
        cheatWarnings,
        phase,
        activeHelpsLeft
      };
      localStorage.setItem(`dsat_save_${testId}`, JSON.stringify(stateToSave));
    }, 10000);
    return () => clearInterval(interval);
  }, [phase, answers, sprAnswers, marked, crossed, eliminated, timeLeft, moduleKey, currentIdx, testId, cheatWarnings]);

  // Resume Effect
  useEffect(() => {
    if (phase === 'intro' && !hasRestored) {
      const saved = localStorage.getItem(`dsat_save_${testId}`);
      if (saved) {
        if (confirm("We found a saved session for this test. Do you want to resume where you left off?")) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || answers);
            setSprAnswers(parsed.sprAnswers || sprAnswers);
            setMarked(parsed.marked || marked);
            setCrossed(parsed.crossed || crossed);
            setEliminated(parsed.eliminated || eliminated);
            setTimeLeft(parsed.timeLeft || timeLeft);
            setModuleKey(parsed.moduleKey || moduleKey);
            setCurrentIdx(parsed.currentIdx || 0);
            setCheatWarnings(parsed.cheatWarnings || 0);
            setPhase(parsed.phase || 'testing');
            if (parsed.activeHelpsLeft !== undefined) setActiveHelpsLeft(parsed.activeHelpsLeft);
          } catch (e) {
            console.error("Failed to restore save", e);
          }
        } else {
          localStorage.removeItem(`dsat_save_${testId}`);
        }
      }
      setHasRestored(true);
    }
  }, [phase, testId, hasRestored, answers, sprAnswers, marked, crossed, eliminated, timeLeft, moduleKey]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // get current module time
  const currentModuleTime = testData?.modulesConfig?.[moduleKey]?.time ?? testData?.customTime ?? MODULE_TIME[moduleKey] ?? 35;

  // reset timer when module changes, phase changes
  useEffect(() => {
    if (phase === 'break') {
      setTimeLeft(300);
    } else {
      setTimeLeft(currentModuleTime * 60);
    }
    setTimerWarning(false);
  }, [moduleKey, currentModuleTime, phase]);

  // countdown
  useEffect(() => {
    if (phase !== 'testing' && phase !== 'break') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (phase === 'break') {
            setPhase('testing');
          } else {
            handleModuleEnd();
          }
          return 0;
        }
        if (phase === 'testing' && prev === 300) setTimerWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, moduleKey]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleModuleEnd = async () => {
    const currentModuleQs = testData?.[moduleKey] ?? [];
    const correct = currentModuleQs.filter((q: any, i: number) => {
      const userAns = q.type === 'SPR' ? sprAnswers[moduleKey as string]?.[i] : answers[moduleKey as string]?.[i];
      return userAns === q.correctAnswer;
    }).length;
    const pct = currentModuleQs.length > 0 ? correct / currentModuleQs.length : 0;

    if (moduleKey === 'M1' && !testData?.customTime) {
      const nextModule = pct >= 0.5 ? 'M2H' : 'M2E';
      setModuleKey(nextModule);
      setCurrentIdx(0);
      setPhase('break'); 
    } else if ((moduleKey === 'M2H' || moduleKey === 'M2E') && testData?.isFull) {
      setModuleKey('MATH_M1');
      setCurrentIdx(0);
      setPhase('break');
    } else if (moduleKey === 'MATH_M1') {
      const nextModule = pct >= 0.5 ? 'MATH_M2H' : 'MATH_M2E';
      setModuleKey(nextModule);
      setCurrentIdx(0);
      setPhase('break'); 
    } else {
      const isFull = testData?.subject === 'Full';
      
      const getScorePct = (mod: string) => {
        const qs = testData?.[mod] ?? [];
        if (qs.length === 0) return 0;
        const correct = qs.filter((q: any, i: number) => {
          const userAns = q.type === 'SPR' ? sprAnswers[mod]?.[i] : answers[mod]?.[i];
          return userAns === q.correctAnswer;
        }).length;
        return correct / qs.length;
      };

      const questionList: any[] = [];
      let answeredCount = 0;
      let flaggedCount = 0;
      let correctCount = 0;
      let incorrectCount = 0;

      const routedToM2H = getScorePct('M1') >= 0.5;
      const routedToMathM2H = getScorePct('MATH_M1') >= 0.5;

      const rawModules = testData?.customTime 
        ? ['M1'] 
        : isFull 
          ? ['M1', routedToM2H ? 'M2H' : 'M2E', 'MATH_M1', routedToMathM2H ? 'MATH_M2H' : 'MATH_M2E'] 
          : ['M1', routedToM2H ? 'M2H' : 'M2E'];

      const allModules = Array.from(new Set(rawModules.filter(k => Boolean(k) && k !== 'break' && k !== 'results'))) as string[];
      
      allModules.forEach(mk => {
        const qs = testData[mk as keyof DSATModule] ?? [];
        qs.forEach((q: any, i: number) => {
          const userAns = q.type === 'SPR' ? sprAnswers[mk as string]?.[i] : answers[mk as string]?.[i];
          const isCorrect = userAns === q.correctAnswer;
          const isMk = !!marked[mk as string]?.[i];
          
          if (userAns) {
            answeredCount++;
            if (isCorrect) correctCount++;
            else incorrectCount++;
          }
          if (isMk) flaggedCount++;

          questionList.push({
            num: i + 1,
            module: mk,
            isAnswered: !!userAns,
            isCorrect: isCorrect,
            isMarked: isMk,
            idx: i
          });
        });
      });

      let totalCorrect = 0, totalQuestions = 0;
      let mathCorrect = 0, mathQuestions = 0;
      let rwCorrect = 0, rwQuestions = 0;
      const wrongIds: string[] = [];
      const correctIds: string[] = [];
      const unansweredIds: string[] = [];
      
      const bookmarkedIds: string[] = [];
      allModules.forEach(mk => {
        bookmarkedIds.push(...Object.entries(marked[mk] as Record<number, boolean>)
          .filter(([, v]) => v).map(([i]) => (testData[mk as keyof DSATModule] ?? [])[+i]?.id ?? ''));
      });
      
      const skillsData: { skill: string; correct: boolean }[] = [];

      allModules.forEach(mk => {
        const qs = testData[mk as keyof DSATModule] ?? [];
        const isMathModule = mk.includes('MATH') || (testData?.subject === 'Math');
        
        qs.forEach((q: any, i: number) => {
          totalQuestions++;
          if (isMathModule) mathQuestions++; else rwQuestions++;
          
          const userAns = q.type === 'SPR' ? sprAnswers[mk as string]?.[i] : answers[mk as string]?.[i];
          const isCorrect = userAns === q.correctAnswer;
          if (isCorrect) {
            totalCorrect++;
            if (isMathModule) mathCorrect++; else rwCorrect++;
            correctIds.push(q.id);
          } else if (!userAns || userAns.toString().trim() === '') {
            unansweredIds.push(q.id);
          } else {
            wrongIds.push(q.id);
          }
          
          if (q.skill) {
            skillsData.push({ skill: q.skill, correct: isCorrect });
          } else if (q.domain) {
            skillsData.push({ skill: q.domain, correct: isCorrect });
          } else {
            skillsData.push({ skill: 'General Practice', correct: isCorrect });
          }
        });
      });

      const pctOverall = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
      const pctMath = mathQuestions > 0 ? Math.round(mathCorrect / mathQuestions * 100) : 0;
      const pctRW = rwQuestions > 0 ? Math.round(rwCorrect / rwQuestions * 100) : 0;
      const scaledMath = mathQuestions > 0 ? Math.round((200 + (pctMath / 100) * 600) / 10) * 10 : 0;
      const scaledRW = rwQuestions > 0 ? Math.round((200 + (pctRW / 100) * 600) / 10) * 10 : 0;
      
      let finalScaledScore = 0;
      if (isFull) {
        finalScaledScore = scaledMath + scaledRW;
      } else {
        finalScaledScore = scaledMath > 0 ? scaledMath : scaledRW;
      }

      if (appUser?.uid) {
        try {
          await saveTestResult({
            userId: appUser.uid,
            testId: testId as string,
            testName: testData?.name ?? testId as string,
            module: moduleKey,
            totalScore: finalScaledScore,
            maxScore: isFull ? 1600 : 800,
            percentage: pctOverall,
            correctCount: totalCorrect,
            wrongCount: totalQuestions - totalCorrect,
            answers: {
              M1: answers.M1 || {},
              M2H: answers.M2H || {},
              M2E: answers.M2E || {},
              MATH_M1: answers.MATH_M1 || {},
              MATH_M2H: answers.MATH_M2H || {},
              MATH_M2E: answers.MATH_M2E || {},
              sprM1: sprAnswers.M1 || {},
              sprM2H: sprAnswers.M2H || {},
              sprM2E: sprAnswers.M2E || {},
              sprMATH_M1: sprAnswers.MATH_M1 || {},
              sprMATH_M2H: sprAnswers.MATH_M2H || {},
              sprMATH_M2E: sprAnswers.MATH_M2E || {}
            } as any,
            wrongQuestionIds: wrongIds,
            correctQuestionIds: correctIds,
            unansweredQuestionIds: unansweredIds,
            bookmarkedIds,
            skills: skillsData,
            timeTaken: (currentModuleTime * 60),
            subject: isFull ? 'full' : (isMath ? 'math' : 'reading_writing'),
          });

          await addNotification({
            userId: appUser.uid,
            type: 'milestone',
            title: '✅ Test Completed!',
            message: `You scored ${finalScaledScore}/${isFull ? 1600 : 800} (${pctOverall}%) on ${testData?.name}`,
            isRead: false,
            link: '/dashboard/results',
          });

          // Send Mock Email Notification
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: appUser.email || 'student@dsat.jo',
              subject: `Test Results: ${testData?.name}`,
              message: `Hi ${appUser.displayName || 'Student'},\n\nYou just completed ${testData?.name} and scored ${finalScaledScore}/${isFull ? 1600 : 800}.\nKeep up the great work!\n\n- The DSAT.JO Team`
            })
          }).catch(console.error);

          localStorage.removeItem(`dsat_save_${testId}`);
        } catch (err) {
          console.error('Failed to save result:', err);
        }
      }
      setFinalScore(finalScaledScore);
      setMathScore(scaledMath);
      setRwScore(scaledRW);
      setPhase('results');
    }
  };

  const q = questions[currentIdx];
  const annKey = q?.passage ? 'pass_' + q.passage.length + '_' + q.passage.slice(0, 20).replace(/\s/g, '') : q?.id;

  const setAnswer = (optLetter: string) => {
    setAnswers(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: optLetter } }));
  };

  const setSpr = (val: string) => {
    setSprAnswers(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: val } }));
  };

  const toggleMark = async () => {
    const isCurrentlyMarked = !!marked[moduleKey][currentIdx];
    const willBeMarked = !isCurrentlyMarked;
    
    setMarked(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: willBeMarked } }));
    
    if (appUser?.uid) {
      if (willBeMarked) {
        await addBookmark({
          userId: appUser.uid,
          questionId: q.id,
          testId: testId as string,
          questionText: q.text,
          correctAnswer: q.correctAnswer,
          options: q.options,
          explanation: (q as any).explanation,
        }).catch(console.error);
      } else {
        await removeBookmark(appUser.uid, q.id).catch(console.error);
      }
    }
  };

  const answeredCount = Object.keys(answers[moduleKey]).length + Object.keys(sprAnswers[moduleKey]).filter(k => sprAnswers[moduleKey][Number(k)]).length;
  const unanswered = questions.length - answeredCount;

  const fontMap = ['0.95rem', '1.0625rem', '1.1875rem'];
  const lineMap = ['1.65', '1.75', '1.85'];
  const fsz = fontMap[fontSize];
  const lh = lineMap[fontSize];
  const isReviewMode = phase === 'review';


  if (loadingTest) return null;
  if (!testData) return null;

  if (phase === 'intro') {
    const rwModule2Length = Math.max(testData.M2H?.length || 0, testData.M2E?.length || 0);
    const mathModule2Length = Math.max(testData.MATH_M2H?.length || 0, testData.MATH_M2E?.length || 0);
    const totalQuestions = (testData.M1?.length || 0) + rwModule2Length + (testData.MATH_M1?.length || 0) + mathModule2Length;
    const timeLimitStr = testData.customTime ? testData.customTime + ' mins' : (testData.isFull ? '134 mins' : 'Standard');
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '720px', width: '100%', background: '#fff', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Digital SAT</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>{testData.name}</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Subject: {testData.subject || 'Mixed'} | Questions: {totalQuestions} | Time limit: {timeLimitStr}
              </p>
            </div>
          </div>
          <AIExamCharacter phase="intro" activeHelpsLeft={activeHelpsLeft} onRequestHelp={() => setActiveHelpsLeft(p => p - 1)} />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => router.back()}
              style={{ flex: 1, padding: '1rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.75rem', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={() => { 
                setPhase('testing'); 
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(err => console.warn("Fullscreen error", err));
                }
              }}
              style={{ flex: 2, padding: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Start Test <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'break') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1128', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '400', marginBottom: '1.5rem' }}>Take a moment to relax</h1>
        <div style={{ fontSize: '5rem', fontWeight: '400', marginBottom: '2rem', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={() => setPhase('testing')}
          style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#fff', border: '1px solid #475569', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}
        >
          Resume Exam
        </button>
        <button
          style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontFamily: 'sans-serif' }}
          onClick={() => {
             // Mock play music
             alert('Playing Lo-fi Chill music...');
          }}
        >
          <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderLeft: '8px solid #fff', borderBottom: '5px solid transparent' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Relaxing Music</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Lo-fi Chill</div>
          </div>
        </button>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2rem', fontFamily: 'sans-serif' }}>You can resume the test at any point. Use this time to<br/>rest your eyes and mind.</p>
      </div>
    );
  }

  if (phase === 'results') {
    const isFull = testData.subject === 'Full';
    const isMath = testData.subject === 'Math';
    const isRW = testData.subject === 'English';
    const questionList: any[] = [];
    let qNumber = 1;
    let answeredCount = 0;
    let flaggedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    
    const getScorePct = (mod: string) => {
      const qs = testData?.[mod] ?? [];
      if (qs.length === 0) return 0;
      const correct = qs.filter((q: any, i: number) => {
        const userAns = q.type === 'SPR' ? sprAnswers[mod]?.[i] : answers[mod]?.[i];
        return userAns === q.correctAnswer;
      }).length;
      return correct / qs.length;
    };

    const routedToM2H = getScorePct('M1') >= 0.5;
    const routedToMathM2H = getScorePct('MATH_M1') >= 0.5;

    const rawModules = testData?.customTime 
      ? ['M1']
      : isFull 
        ? ['M1', routedToM2H ? 'M2H' : 'M2E', 'MATH_M1', routedToMathM2H ? 'MATH_M2H' : 'MATH_M2E']
        : ['M1', routedToM2H ? 'M2H' : 'M2E'];

    const allModules = Array.from(new Set(rawModules.filter(k => Boolean(k) && k !== 'break' && k !== 'results'))) as string[];
        
    allModules.forEach(mk => {
      const qs = testData[mk as keyof DSATModule] ?? [];
      qs.forEach((q: any, i: number) => {
        const userAns = q.type === 'SPR' ? sprAnswers[mk as string]?.[i] : answers[mk as string]?.[i];
        const isCorrect = userAns === q.correctAnswer;
        const isMk = !!marked[mk as string]?.[i];
        
        if (userAns) {
          answeredCount++;
          if (isCorrect) correctCount++;
          else incorrectCount++;
        }
        if (isMk) flaggedCount++;

        questionList.push({
          num: i + 1,
          module: mk,
          isAnswered: !!userAns,
          isCorrect: isCorrect,
          isMarked: isMk,
          idx: i
        });
      });
    });

    const unansweredCount = questionList.length - answeredCount;

    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: '#2e3b84', color: '#fff', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Test Complete! 🎉
            </h1>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {testData.name || 'Practice Test'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>
              Great job! Your results have been saved successfully. You can review your answers below.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#facc15' }}>{finalScore}</div>
              <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>Total Score</div>
            </div>
            {isFull && (
              <>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{rwScore}</div>
                  <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>Reading/Writing</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{mathScore}</div>
                  <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>Math</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #22c55e', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Correct</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>{correctCount}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={18} color="#16a34a" />
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Mistakes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{incorrectCount}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#dc2626" />
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Answered</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{answeredCount}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={18} color="#2563eb" />
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Flagged</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{flaggedCount}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flag size={18} color="#d97706" />
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Unanswered</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#475569' }}>{unansweredCount}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                ?
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Question Navigator</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Click any question to review your answer</div>
            </div>
            
            <div>
              {allModules.map((mk, modIdx) => {
                const moduleQuestions = questionList.filter(q => q.module === mk);
                if (moduleQuestions.length === 0) return null;
                
                return (
                  <div key={mk} style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      Section {modIdx + 1} {mk.includes('MATH') ? '(Math)' : isRW ? '(Reading & Writing)' : ''}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.75rem' }}>
                      {moduleQuestions.map((q, i) => {
                        let bg = '#f1f5f9';
                        let border = '1px solid #cbd5e1';
                        let color = '#334155';
                        
                        if (q.isAnswered) {
                          if (q.isCorrect) {
                            bg = '#bbf7d0';
                            border = '1px solid #86efac';
                            color = '#166534';
                          } else {
                            bg = '#fecaca';
                            border = '1px solid #fca5a5';
                            color = '#991b1b';
                          }
                        }
                        
                        if (q.isMarked) {
                          border = '2px dashed #eab308';
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setModuleKey(q.module);
                              setCurrentIdx(q.idx);
                              setPhase('review');
                            }}
                            style={{
                              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: bg, border: border, borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', color: color,
                              cursor: 'pointer'
                            }}
                          >
                            {q.num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', background: '#bbf7d0', border: '1px solid #86efac', borderRadius: '2px' }} /> Correct ({correctCount})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', background: '#fecaca', border: '1px solid #fca5a5', borderRadius: '2px' }} /> Mistakes ({incorrectCount})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '2px' }} /> Answered ({answeredCount})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', background: '#fef08a', border: '1px solid #fde047', borderRadius: '2px' }} /> Flagged ({flaggedCount})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} /> Unanswered ({unansweredCount})</span>
              </div>
              <button
                onClick={() => router.push('/dashboard/results')}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Return to Dashboard &rarr;
              </button>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '1rem 2rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </div>
        </div>
      </div>
    );
  }

  const fetchExplanation = async () => {
    if (!q) return;
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.text,
          passage: q.passage,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setDynamicExplanation(data.explanation);
        setShowWhiteboard(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingExplanation(false);
  };

  // ── MAIN TEST UI ──
  if (!q) return null;

  const currentAnswer = q.type === 'SPR' ? undefined : answers[moduleKey]?.[currentIdx];
  const currentSpr = sprAnswers[moduleKey]?.[currentIdx] ?? '';
  const isMarked = !!marked[moduleKey]?.[currentIdx];
  const crossedOptions = crossed[moduleKey]?.[currentIdx] ?? [];
  const isElimMode = !!eliminated[moduleKey]?.[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;
  const hasImage = q.imageUrl && q.imageUrl !== null && q.imageUrl !== '';
  const optLetters = ['A', 'B', 'C', 'D'];

  const toggleCross = (optLetter: string) => {
    setCrossed(prev => {
      const cur = prev[moduleKey]?.[currentIdx] ?? [];
      const next = cur.includes(optLetter) ? cur.filter(x => x !== optLetter) : [...cur, optLetter];
      return { ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: next } };
    });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa', fontFamily: '"Georgia", "Times New Roman", serif', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 2rem', flexShrink: 0,
        background: '#fff', borderBottom: '1px solid transparent'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1e293b', fontSize: '1.2rem' }}>
            {isReviewMode ? 'Review Mode' : (testData?.modulesConfig?.[moduleKey]?.name || `Section ${isMath ? '2' : '1'}, Module ${moduleKey.includes('M1') ? '1' : '2'}: ${isMath ? 'Math' : 'Reading and Writing'}`)}
          </div>
          <button
            onClick={() => setShowDirections(!showDirections)}
            style={{ fontFamily: 'sans-serif', fontWeight: '600', color: '#3b82f6', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', textAlign: 'left' }}
          >
            Directions
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'sans-serif', flex: 1 }}>
          {!isReviewMode ? (
            <>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', fontVariantNumeric: 'tabular-nums', color: timerWarning ? '#ef4444' : '#0f172a' }}>
                {showTimer ? formatTime(timeLeft) : ''}
              </span>
              <button
                onClick={() => !timerWarning && setShowTimer(!showTimer)}
                disabled={timerWarning}
                style={{ background: 'none', border: 'none', cursor: timerWarning ? 'not-allowed' : 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0, opacity: timerWarning ? 0.5 : 1 }}
              >
                {showTimer ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </>
          ) : (
            <div style={{ background: '#eab308', color: '#fff', padding: '0.25rem 1rem', borderRadius: '1rem', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Review Mode
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', fontFamily: 'sans-serif' }}>
          {isMath && (
            <>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.75rem', fontWeight: '600', padding: 0 }}
              >
                <Calculator size={22} /> Calculator
              </button>
              <button
                onClick={() => setShowReference(!showReference)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.75rem', fontWeight: '600', padding: 0 }}
              >
                <LayoutTemplate size={22} /> Reference
              </button>
            </>
          )}
          {!isMath && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.75rem', fontWeight: '600', padding: 0, background: showNotes ? '#e0e7ff' : 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              <div style={{ background: showNotes ? '#e0e7ff' : 'transparent', padding: '0 0.5rem', borderRadius: '4px' }}>
                <Edit2 size={22} color={showNotes ? '#3b82f6' : '#475569'} />
              </div>
              <span style={{ color: showNotes ? '#3b82f6' : '#475569' }}>Highlights & Notes</span>
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.75rem', fontWeight: '600', padding: 0 }}
            >
              <MoreHorizontal size={22} /> More
            </button>
            {showMoreMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '150px', zIndex: 10, marginTop: '0.5rem' }}>
                <button onClick={() => { setShowMoreMenu(false); setShowExitConfirm(true); }} style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' }}>
                  Exit Test
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Colorful Segmented Line */}
      <div style={{ height: '3px', width: '100%', display: 'flex', background: '#fff' }}>
         {Array.from({ length: 40 }).map((_, i) => {
           const colors = ['#2563eb', '#16a34a', '#dc2626', '#8b5cf6', '#f59e0b'];
           return <div key={i} style={{ flex: 1, background: colors[i % colors.length], margin: '0 4px', height: '100%' }} />
         })}
      </div>

      {showDirections && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 3rem', fontFamily: 'sans-serif', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', flexShrink: 0 }}>
          <strong>Directions</strong><br/>
          {isMath ? 'The questions in this section address important math skills. For multiple-choice questions, choose the best answer from the choices provided. For student-produced response questions, solve the problem and enter your answer. A reference sheet with helpful formulas is available.' : 'The questions in this section address a number of important reading and writing skills. Each question has one or more passages. Read each passage and question carefully, and then choose the best answer to the question based on the passage(s).'}
        </div>
      )}

      {timerWarning && !isReviewMode && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '0.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'sans-serif', fontSize: '0.8rem', color: '#92400e', fontWeight: '600', flexShrink: 0 }}>
          <AlertTriangle size={14} /> 5 minutes remaining in this module
        </div>
      )}

      {/* ── QUESTION AREA ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: q.passage ? 'row' : 'column', alignItems: q.passage ? 'stretch' : 'center', overflow: 'hidden', background: '#fff' }}>
        {q.passage && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid #e2e8f0', overflowY: 'auto', fontSize: fsz, lineHeight: lh, fontFamily: 'Georgia, serif', color: '#1e293b', position: 'relative' }}>
             {q.passageName && (
               <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', zIndex: 10, padding: '1.5rem 3rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '1rem' }}>
                 <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.passageName}</Latex>
               </div>
             )}
             <div style={{ padding: q.passageName ? '0 3rem 2rem' : '2rem 3rem' }}>
               <AnnotatableText
                 text={q.passage}
               passageStartLine={q.passageStartLine}
               disableLatex={!isMath}
               annotations={annotations[annKey] || []}
               onAddAnnotation={(ann) => setAnnotations(prev => ({
                 ...prev,
                 [annKey]: [...(prev[annKey] || []), { ...ann, id: Date.now().toString() }]
               }))}
               onRemoveAnnotation={(id) => setAnnotations(prev => ({
                 ...prev,
                 [annKey]: (prev[annKey] || []).filter(a => a.id !== id)
               }))}
             />
             </div>
          </div>
        )}

        <div style={{ flex: 1, width: q.passage ? 'auto' : '100%', maxWidth: q.passage ? 'none' : '800px', overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          
          <div style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0', borderBottom: '1px solid #cbd5e1', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                {currentIdx + 1}
              </div>
              <button
                onClick={toggleMark}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontWeight: '600', fontSize: '0.85rem', padding: '0 1rem', height: '40px' }}
              >
                {isMarked ? <BookmarkCheck size={18} color="#dc2626" /> : <Bookmark size={18} />} Mark for Review
              </button>
            </div>
            
            <button
              onClick={() => setEliminated(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: !prev[moduleKey][currentIdx] } }))}
              style={{ background: 'none', border: 'none', padding: '0 1rem', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isElimMode ? '#2563eb' : '#475569', fontWeight: 'bold', position: 'relative' }}
              title="Answer Elimination"
            >
              <span style={{ fontSize: '0.85rem', position: 'relative' }}>ABC</span>
              <div style={{ position: 'absolute', top: '50%', left: '0.8rem', right: '0.8rem', height: '2px', background: isElimMode ? '#2563eb' : '#475569', transform: 'rotate(-15deg)', transformOrigin: 'center' }} />
            </button>
          </div>

          <div style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: q.passage ? 'flex-start' : 'center' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
              <div style={{ fontSize: fsz, lineHeight: lh, color: '#1e293b', marginBottom: '2rem' }}>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>
                  <AnnotatableText
                     text={q.text}
                     disableLatex={!isMath}
                     annotations={annotations[`${q.id}-qtext`] || []}
                     onAddAnnotation={(ann) => setAnnotations(prev => ({
                       ...prev,
                       [`${q.id}-qtext`]: [...(prev[`${q.id}-qtext`] || []), { ...ann, id: Date.now().toString() }]
                     }))}
                     onRemoveAnnotation={(id) => setAnnotations(prev => ({
                       ...prev,
                       [`${q.id}-qtext`]: (prev[`${q.id}-qtext`] || []).filter(a => a.id !== id)
                     }))}
                  />
                </div>
                {hasImage && (
                  <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <img src={q.imageUrl || undefined} alt="Question figure" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>

            {q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map((opt, i) => {
                  const letter = optLetters[i] ?? String.fromCharCode(65 + i);
                  const isSelected = currentAnswer === letter;
                  const isCrossed = crossedOptions.includes(letter);

                  return (
                    <button
                      key={i}
                      onClick={() => !isReviewMode && setAnswer(letter)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#fff',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #000', borderRadius: '0.5rem', cursor: isReviewMode ? 'default' : 'pointer',
                        position: 'relative', opacity: (isElimMode && isCrossed) ? 0.4 : 1, transition: 'all 0.1s',
                        boxShadow: isSelected ? 'inset 0 0 0 1px #2563eb' : 'none', textAlign: 'left'
                      }}
                    >
                      {isElimMode && (
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleCross(letter); }}
                          style={{
                            position: 'absolute', right: '-10px', top: '-10px', width: '24px', height: '24px', borderRadius: '50%',
                            background: isCrossed ? '#ef4444' : '#fff', border: `1px solid ${isCrossed ? '#ef4444' : '#cbd5e1'}`,
                            color: isCrossed ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          ✕
                        </div>
                      )}
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: isReviewMode 
                          ? (letter === q.correctAnswer ? '#10b981' : isSelected ? '#2563eb' : '#fff')
                          : (isSelected ? '#2563eb' : '#fff'),
                        border: isReviewMode
                          ? (letter === q.correctAnswer ? 'none' : isSelected ? 'none' : '1px solid #000')
                          : (isSelected ? 'none' : '1px solid #000'),
                        color: isReviewMode ? (letter === q.correctAnswer || isSelected ? '#fff' : '#000') : (isSelected ? '#fff' : '#000'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'sans-serif'
                      }}>
                        {letter}
                      </div>
                      <div style={{ flex: 1, fontSize: fsz, lineHeight: lh, position: 'relative', fontFamily: 'Georgia, serif' }}>
                        {(opt.trim().startsWith('http') && !opt.trim().includes(' ')) ? (
                          <img src={opt.trim()} alt="Option image" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', borderRadius: '4px', objectFit: 'contain' }} />
                        ) : opt.includes('<table') ? (
                          <div dangerouslySetInnerHTML={{ __html: opt.replace(/\$([^$]+)\$/g, (m, math) => {
                            try {
                              const katex = require('katex');
                              return katex.renderToString(math, { throwOnError: false });
                            } catch(e) { return m; }
                          }) }} />
                        ) : (
                          <Latex delimiters={LATEX_DELIMITERS} strict={false}>{opt}</Latex>
                        )}
                        {(isElimMode && isCrossed) && (
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '2px solid #000' }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          {q.type === 'SPR' && (
            <div style={{ width: '100%', padding: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                Your Answer:
              </div>
              <input
                type="text"
                value={currentSpr}
                onChange={(e) => {
                  if (!isReviewMode) {
                    setSpr(e.target.value);
                  }
                }}
                disabled={isReviewMode}
                placeholder={isReviewMode ? '' : "Enter your answer here"}
                style={{
                  width: '100%', padding: '0.75rem', fontSize: '1.25rem',
                  border: isReviewMode 
                    ? (currentSpr === q.correctAnswer ? '2px solid #10b981' : '2px solid #ef4444')
                    : '2px solid #cbd5e1', 
                  borderRadius: '0.5rem', fontFamily: 'sans-serif'
                }}
              />
            </div>
          )}
          
          {isReviewMode && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
                {q.type === 'SPR' && (
                  <div style={{ marginBottom: '1rem', color: '#10b981', fontWeight: '700', fontFamily: 'sans-serif' }}>Correct Answer: {q.correctAnswer}</div>
                )}
                
                {q.explanation ? (
                  <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#334155', fontFamily: 'sans-serif' }}>
                    <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.explanation}</Latex>
                  </div>
                ) : (
                  <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#64748b', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                    No written explanation available.
                  </div>
                )}
                
                {!showWhiteboard && (
                  <button 
                    onClick={() => {
                      if (q.explanation || dynamicExplanation) {
                        setShowWhiteboard(true);
                      } else {
                        fetchExplanation();
                      }
                    }}
                    disabled={loadingExplanation}
                    style={{ marginTop: '1.5rem', background: '#4f46e5', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: loadingExplanation ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontFamily: 'sans-serif', opacity: loadingExplanation ? 0.7 : 1 }}
                  >
                    {loadingExplanation ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {loadingExplanation ? 'Analyzing question...' : 'Explain with AI Tutor ✨'}
                  </button>
                )}
                
                {showWhiteboard && (q.explanation || dynamicExplanation) && (
                  <div style={{ marginTop: '2rem', position: 'relative' }}>
                    <button 
                      onClick={() => setShowWhiteboard(false)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                      <X size={16} />
                    </button>
                    <WhiteboardStep explanationText={q.explanation || dynamicExplanation} />
                  </div>
                )}
              </div>
            )}
          
          </div>
        </div>
        </div>
      </main>

      <footer style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 2rem', background: '#fff', borderTop: '2px solid #e2e8f0', flexShrink: 0
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', fontFamily: 'sans-serif' }}>
            {appUser?.displayName ?? 'Student'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowNav(!showNav)}
            style={{
              padding: '0.5rem 1.5rem', background: 'none', color: '#0f172a', border: 'none',
              fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', fontFamily: 'sans-serif',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            Question {currentIdx + 1} of {questions.length}
            {showNav ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {isReviewMode && (
            <button
              onClick={() => setPhase('results')}
              style={{ padding: '0.5rem 1.5rem', background: 'none', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '2rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'sans-serif', marginRight: 'auto' }}
            >
              &larr; Back to Results
            </button>
          )}

          {isFirst ? (
            <button disabled style={{ padding: '0.5rem 1.5rem', background: 'none', color: '#94a3b8', border: '1px solid transparent', fontWeight: 'bold', fontSize: '1rem', cursor: 'not-allowed', fontFamily: 'sans-serif' }}>Back</button>
          ) : (
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              style={{ padding: '0.5rem 1.5rem', background: 'none', color: '#2563eb', border: '1px solid transparent', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', fontFamily: 'sans-serif' }}
            >
              Back
            </button>
          )}
          
          <button
            onClick={() => {
              if (isLast) {
                if (isReviewMode) {
                  setPhase('results');
                } else {
                  setShowSubmitConfirm(true);
                }
              } else {
                setCurrentIdx(i => i + 1);
              }
            }}
            style={{ padding: '0.6rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '2rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '1rem', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
          >
            {isLast && !isReviewMode ? 'Next' : (isLast && isReviewMode ? 'Return to Results' : 'Next')}
          </button>
        </div>
      </footer>

      {/* ── QUESTION NAVIGATOR MODAL ── */}
      {showNav && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowNav(false)}
        >
          <div
            style={{ background: '#fff', padding: '2rem 3rem 3rem', width: '100%', maxHeight: '60vh', overflowY: 'auto', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>
              <h3 style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.25rem', margin: 0 }}>Question Navigator</h3>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                {isReviewMode ? (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#bbf7d0', border: '1px solid #86efac', borderRadius: '4px' }} /> Correct</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#fecaca', border: '1px solid #fca5a5', borderRadius: '4px' }} /> Incorrect</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }} /> Unanswered</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: 'transparent', border: '2px dashed #eab308', borderRadius: '4px' }} /> For Review</span>
                  </>
                ) : (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#2563eb', borderRadius: '4px' }} /> Answered</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '4px' }} /> For Review</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '16px', height: '16px', background: '#fff', border: '2px dashed #94a3b8', borderRadius: '4px' }} /> Unanswered</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '0.5rem', maxWidth: '1000px', margin: '0 auto' }}>
              {questions.map((q, i) => {
                const userAns = q.type === 'SPR' ? sprAnswers[moduleKey]?.[i] : answers[moduleKey]?.[i];
                const isAnswered = userAns !== undefined && userAns !== '';
                const isMk = !!marked[moduleKey]?.[i];
                const isCurrent = i === currentIdx;
                
                let bg = '#fff';
                let border = '2px dashed #94a3b8';
                let color = '#475569';
                
                if (isReviewMode) {
                  bg = '#f1f5f9';
                  border = '1px solid #cbd5e1';
                  color = '#334155';
                  if (isAnswered) {
                    const isCorrect = userAns === q.correctAnswer;
                    if (isCorrect) {
                      bg = '#bbf7d0';
                      border = '1px solid #86efac';
                      color = '#166534';
                    } else {
                      bg = '#fecaca';
                      border = '1px solid #fca5a5';
                      color = '#991b1b';
                    }
                  }
                  if (isMk) {
                    border = '2px dashed #eab308';
                  }
                } else {
                  if (isMk) {
                    bg = '#fef3c7';
                    border = '2px solid #fbbf24';
                    color = '#b45309';
                  } else if (isAnswered) {
                    bg = '#2563eb';
                    border = '2px solid #2563eb';
                    color = '#fff';
                  }
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setShowNav(false); }}
                    style={{
                      width: '100%', aspectRatio: '1', border: border,
                      borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'sans-serif',
                      background: bg, color: color,
                      boxShadow: isCurrent ? '0 0 0 3px #0f172a' : 'none',
                      position: 'relative'
                    }}
                  >
                    {i + 1}
                    {isMk && <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#fff', borderRadius: '50%' }}><BookmarkCheck size={14} color="#dc2626" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRM MODAL ── */}
      {showSubmitConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', fontFamily: 'sans-serif' }}>
            <h3 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Submit Module?</h3>
            {unanswered > 0 && (
              <div style={{ padding: '0.75rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e' }}>
                ⚠️ You have <strong>{unanswered}</strong> unanswered question{unanswered > 1 ? 's' : ''}. Unanswered questions are marked wrong.
              </div>
            )}
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {moduleKey === 'M1' ? 'After submitting, you will proceed to Module 2. You cannot return to this module.' : 'After submitting, you will see your final score. You cannot change answers.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setShowSubmitConfirm(false); handleModuleEnd(); }} style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>
                Yes, Submit
              </button>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                Keep Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXIT CONFIRM ── */}
      {showExitConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', maxWidth: '380px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={22} color="#ef4444" />
              <h3 style={{ fontWeight: '800', color: '#0f172a' }}>Exit Test?</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Your progress will not be saved. Are you sure you want to exit?</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { if (document.fullscreenElement) document.exitFullscreen().catch(e => console.log(e)); router.push('/dashboard/practice'); }} style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>
                Exit Test
              </button>
              <button onClick={() => setShowExitConfirm(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                Continue Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALCULATOR MODAL ── */}
      {showCalculator && (
        <motion.div 
          drag 
          dragMomentum={false}
          style={{
          position: 'fixed', top: '60px', right: '2rem', width: '400px', height: '500px',
          background: '#fff', borderRadius: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 150, display: 'flex', flexDirection: 'column', border: '1px solid #cbd5e1'
        }}>
          <div style={{
            padding: '0.5rem 1rem', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: '0.5rem 0.5rem 0 0', fontFamily: 'sans-serif', cursor: 'grab'
          }}>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>Calculator</strong>
            <button onClick={() => setShowCalculator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <iframe
              src="https://www.desmos.com/testing/cb-digital-sat/graphing"
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '0 0 0.5rem 0.5rem' }}
            />
          </div>
        </motion.div>
      )}

      {/* ── REFERENCE SHEET MODAL ── */}
      {showReference && (
        <motion.div 
          drag 
          dragMomentum={false}
          style={{
          position: 'fixed', top: '60px', left: '2rem', width: '500px', height: '600px',
          background: '#fff', borderRadius: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 150, display: 'flex', flexDirection: 'column', border: '1px solid #cbd5e1'
        }}>
          <div style={{
            padding: '0.5rem 1rem', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: '0.5rem 0.5rem 0 0', fontFamily: 'sans-serif', cursor: 'grab'
          }}>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>Reference</strong>
            <button onClick={() => setShowReference(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '700' }}>Reference</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              {/* Row 1 */}
              <div>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="#000" strokeWidth="2" />
                  <line x1="30" y1="30" x2="55" y2="30" stroke="#000" strokeWidth="1.5" />
                  <text x="40" y="27" fontSize="10">r</text>
                </svg>
                <div style={{ fontSize: '0.85rem' }}><Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$A = \\pi r^2$`}</Latex><br/><Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$C = 2\\pi r$`}</Latex></div>
              </div>
              <div>
                <svg width="80" height="50" viewBox="0 0 80 50">
                  <rect x="5" y="5" width="70" height="40" fill="none" stroke="#000" strokeWidth="2" />
                  <text x="35" y="40" fontSize="10">l</text>
                  <text x="10" y="25" fontSize="10">w</text>
                </svg>
                <div style={{ fontSize: '0.85rem' }}><Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$A = lw$`}</Latex></div>
              </div>
              {/* Row 2 */}
              <div>
                <svg width="60" height="50" viewBox="0 0 60 50">
                  <polygon points="5,45 55,45 30,5" fill="none" stroke="#000" strokeWidth="2" />
                  <line x1="30" y1="5" x2="30" y2="45" stroke="#000" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="32" y="25" fontSize="10">h</text>
                  <text x="30" y="55" fontSize="10">b</text>
                </svg>
                <div style={{ fontSize: '0.85rem' }}><Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$A = \\frac{1}{2}bh$`}</Latex></div>
              </div>
              <div>
                <svg width="80" height="50" viewBox="0 0 80 50">
                  <polygon points="10,40 50,40 50,10" fill="none" stroke="#000" strokeWidth="2" />
                  <rect x="40" y="30" width="10" height="10" fill="none" stroke="#000" strokeWidth="1" />
                  <text x="55" y="25" fontSize="10">a</text>
                  <text x="30" y="50" fontSize="10">b</text>
                  <text x="25" y="20" fontSize="10">c</text>
                </svg>
                <div style={{ fontSize: '0.85rem' }}><Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$c^2 = a^2 + b^2$`}</Latex></div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center', marginTop: '2rem' }}>
              {/* Row 3 - Special Triangles */}
              <div>
                <svg width="70" height="60" viewBox="0 0 70 60">
                  <polygon points="10,50 60,50 60,10" fill="none" stroke="#000" strokeWidth="2" />
                  <text x="25" y="47" fontSize="8">30°</text>
                  <text x="50" y="22" fontSize="8">60°</text>
                  <text x="63" y="30" fontSize="10">x</text>
                  <text x="30" y="60" fontSize="10">x√3</text>
                  <text x="20" y="25" fontSize="10">2x</text>
                </svg>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Special Right Triangles</div>
              </div>
              <div>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <polygon points="10,50 50,50 50,10" fill="none" stroke="#000" strokeWidth="2" />
                  <text x="20" y="47" fontSize="8">45°</text>
                  <text x="40" y="25" fontSize="8">45°</text>
                  <text x="53" y="30" fontSize="10">s</text>
                  <text x="30" y="60" fontSize="10">s</text>
                  <text x="18" y="25" fontSize="10">s√2</text>
                </svg>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Volume</strong><br/>
                Rectangular Solid: <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$V = \\ell w h$`}</Latex><br/>
                Cylinder: <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$V = \\pi r^2 h$`}</Latex><br/>
                Sphere: <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$V = \\frac{4}{3}\\pi r^3$`}</Latex><br/>
                Cone: <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$V = \\frac{1}{3}\\pi r^2 h$`}</Latex><br/>
                Pyramid: <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$V = \\frac{1}{3}\\ell w h$`}</Latex>
              </div>
              <div>
                The number of degrees of arc in a circle is 360.<br/>
                The number of radians of arc in a circle is <Latex delimiters={LATEX_DELIMITERS} strict={false}>{`$2\\pi$`}</Latex>.<br/>
                The sum of the measures in degrees of the angles of a triangle is 180.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Exam Character */}
      {phase === 'testing' && (
        <AIExamCharacter phase="testing" currentQuestion={q} activeHelpsLeft={activeHelpsLeft} onRequestHelp={() => setActiveHelpsLeft(p => p - 1)} />
      )}

      {/* Anti-Cheat Modal */}
      {showCheatModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1rem', maxWidth: '450px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Testing Violation Detected</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              You navigated away from the testing window. The actual Digital SAT requires you to remain in the app at all times.
              <br/><br/>
              <strong>Warnings recorded: {cheatWarnings}</strong>
            </p>
            <button 
              onClick={() => setShowCheatModal(false)}
              style={{ width: '100%', padding: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}>
              I Understand - Return to Test
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Required Modal */}
      {showFullscreenPrompt && phase === 'testing' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1rem', maxWidth: '450px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <Maximize size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Fullscreen Required</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              The exam must be taken in full-screen mode to prevent distractions. You cannot continue the test without entering full-screen.
            </p>
            <button 
              onClick={() => {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(err => console.warn(err));
                }
              }}
              style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}>
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        table.question-table { border-collapse: collapse; margin: 0.5rem auto; }
        table.question-table th, table.question-table td { border: 1px solid #cbd5e1; padding: 0.375rem 0.875rem; text-align: center; font-family: sans-serif; font-size: 0.875rem; }
        table.question-table thead { background: #f1f5f9; font-weight: 700; }
      `}</style>


    </div>
  );
}

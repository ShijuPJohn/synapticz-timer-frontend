import React, { useState, useEffect } from 'react';
import { Plus, Play, CheckCircle2, XCircle, Clock, Trash2, RotateCcw, PlusCircle, PartyPopper, Coffee, AlertCircle, Pause, Trophy, Rocket, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { motivatingLines } from './motivatingLines';

const STORAGE_KEY = 'synapticz_tasks';

// Audio Utility
const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
};

function Modal({ isOpen, onClose, title, message, onConfirm, type = 'alert', confirmText = 'OK', subMessage }) {
  if (!isOpen) return null;

  const isAhead = title === 'Ahead of Schedule!';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40, rotate: isAhead ? -2 : 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            rotate: 0,
            transition: { type: 'spring', damping: 15, stiffness: 200 }
          }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          className={`bg-white rounded-[4rem] shadow-[0_32px_128px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden border-4 ${
            isAhead ? 'border-emerald-400' : 'border-slate-100'
          } relative`}
        >
          {isAhead && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"
              />
            </div>
          )}

          <div className="p-12 sm:p-20 text-center relative z-10">
            <motion.div 
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${
              type === 'alert' ? 'bg-amber-100 text-amber-600 shadow-amber-100' : 
              type === 'success' ? (isAhead ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-100 text-emerald-600 shadow-emerald-100') :
              'bg-indigo-600 text-white shadow-indigo-200'
            }`}>
              {type === 'success' ? (isAhead ? <Rocket size={64} /> : <Trophy size={64} />) : <AlertCircle size={64} />}
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-5xl sm:text-6xl font-black mb-6 tracking-tighter ${
                isAhead ? 'text-emerald-600' : 'text-slate-800'
              }`}
            >
              {title}
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 mb-16"
            >
              <p className="text-slate-500 font-bold text-2xl leading-tight italic">
                "{message}"
              </p>
              {subMessage && (
                <p className="text-slate-400 font-medium text-lg">
                  {subMessage}
                </p>
              )}
            </motion.div>
            
            <div className="flex gap-6">
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="flex-1 py-7 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  CANCEL
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`flex-1 py-7 text-white rounded-[2rem] font-black text-2xl shadow-2xl transition-all relative overflow-hidden group ${
                  type === 'confirm' ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 
                  type === 'success' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' :
                  'bg-amber-500 shadow-amber-200 hover:bg-amber-600'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isAhead && <Zap size={24} fill="currentColor" />}
                  {confirmText}
                </span>
                {isAhead && (
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
    // Default: Interspersed tasks and breaks
    const initial = [];
    for (let i = 0; i < 3; i++) {
      initial.push({
        id: crypto.randomUUID(),
        type: 'task',
        name: '',
        duration: 25,
        status: 'pending',
        startTime: null,
        endTime: null
      });
      initial.push({
        id: crypto.randomUUID(),
        type: 'break',
        name: 'Short Break',
        duration: 5,
        status: 'pending',
        startTime: null,
        endTime: null
      });
    }
    return initial;
  });

  const [mode, setMode] = useState('planning'); // 'planning' | 'waiting' | 'executing' | 'summary'
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [delayConfig, setDelayConfig] = useState({ type: 'none', value: 5 }); // default 5 mins if enabled
  const [targetStartTime, setTargetStartTime] = useState(null);
  const [planStartedAt, setPlanStartedAt] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    subMessage: '',
    type: 'alert',
    confirmText: 'OK',
    onConfirm: null
  });

  const showModal = (config) => {
    setModal({
      isOpen: true,
      confirmText: 'OK',
      type: 'alert',
      subMessage: '',
      onConfirm: null,
      ...config
    });
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle waiting logic
  useEffect(() => {
    let timer;
    if (mode === 'waiting' && targetStartTime) {
      timer = setInterval(() => {
        const now = new Date();
        if (now >= targetStartTime) {
          setPlanStartedAt(now);
          const updatedTasks = [...tasks];
          if (updatedTasks.length > 0) {
            updatedTasks[0].startTime = now;
            setTasks(updatedTasks);
          }
          setMode('executing');
          setTargetStartTime(null);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, targetStartTime, tasks]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Timer logic for execution mode
  useEffect(() => {
    let timer;
    if (mode === 'executing' && activeIndex < tasks.length && !isPaused) {
      const currentTask = tasks[activeIndex];
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) return 0;
          
          const nextVal = prev - 1;
          
          // Break Sound Logic
          if (currentTask.type === 'break') {
            // Tick every second in last 10 seconds
            if (nextVal <= 10 && nextVal > 0) {
              playSound('tick');
            } 
            // Tick every 10 seconds otherwise (if not in last 10s)
            else if (nextVal > 10 && nextVal % 10 === 0) {
              playSound('tick');
            }
          }
          
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, activeIndex, tasks.length, tasks, isPaused]);

  // Sync timeLeft if active task duration changes while paused
  useEffect(() => {
    if (mode === 'executing' && isPaused) {
      setTimeLeft(tasks[activeIndex].duration * 60);
    }
  }, [tasks, activeIndex, isPaused, mode]);

  const startExecution = () => {
    // Only filter out tasks without names if they are actually tasks
    const validItems = tasks.filter(t => t.type === 'break' || t.name.trim() !== '');
    if (validItems.length === 0) {
      return showModal({
        title: 'Empty Plan',
        message: 'Please add at least one task name before starting.',
        type: 'alert'
      });
    }
    
    // Reset all statuses and clear old timestamps
    const resetTasks = validItems.map(t => ({ 
      ...t, 
      status: 'pending',
      startTime: null,
      endTime: null
    }));

    setTasks(resetTasks);
    setActiveIndex(0);
    setTimeLeft(resetTasks[0].duration * 60);
    setIsPaused(false);

    if (delayConfig.type === 'none') {
      const now = new Date();
      setPlanStartedAt(now);
      const updatedTasks = [...resetTasks];
      updatedTasks[0].startTime = now;
      setTasks(updatedTasks);
      setMode('executing');
    } else {
      let target;
      if (delayConfig.type === 'duration') {
        target = new Date(Date.now() + delayConfig.value * 60 * 1000);
      } else {
        // Absolute time "HH:mm"
        const [hours, minutes] = delayConfig.value.split(':');
        target = new Date();
        target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        if (target < new Date()) {
          target.setDate(target.getDate() + 1); // Tomorrow
        }
      }
      setTargetStartTime(target);
      setMode('waiting');
    }
  };

  const triggerConfetti = (isExtra = false) => {
    const scalar = isExtra ? 2.5 : 1;
    const defaults = {
      spread: 70 * scalar,
      ticks: 150 * scalar,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30 * scalar,
      colors: ['#4f46e5', '#10b981', '#fbbf24', '#f43f5e', '#8b5cf6']
    };

    if (isExtra) {
      confetti({ ...defaults, particleCount: 150, origin: { y: 0.6 } });
      setTimeout(() => confetti({ ...defaults, particleCount: 100, origin: { x: 0.2, y: 0.5 } }), 200);
      setTimeout(() => confetti({ ...defaults, particleCount: 100, origin: { x: 0.8, y: 0.5 } }), 400);
    } else {
      confetti({ ...defaults, particleCount: 150, origin: { y: 0.6 } });
    }
  };

  const handleTaskAction = (status) => {
    const now = new Date();
    const currentItem = tasks[activeIndex];
    const isTask = currentItem.type === 'task';
    const isCompleted = status === 'completed';
    const isEarly = isTask && isCompleted && timeLeft > 0;
    
    const proceed = () => {
      const newTasks = [...tasks];
      newTasks[activeIndex].status = status;
      newTasks[activeIndex].endTime = now;
      setIsPaused(false);

      if (activeIndex + 1 < tasks.length) {
        const nextIndex = activeIndex + 1;
        newTasks[nextIndex].startTime = now;
        setTasks(newTasks);
        setTimeout(() => {
          setActiveIndex(nextIndex);
          setTimeLeft(tasks[nextIndex].duration * 60);
        }, isCompleted ? 400 : 0); // Brief pause to see feedback
      } else {
        setTasks(newTasks);
        setTimeout(() => {
          setMode('summary');
        }, 600);
      }
    };

    if (isTask && isCompleted) {
      if (isEarly) {
        triggerConfetti(true);
        const randomLine = motivatingLines[Math.floor(Math.random() * motivatingLines.length)];
        showModal({
          title: 'Ahead of Schedule!',
          message: randomLine,
          subMessage: `You crushed it with ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s to spare!`,
          type: 'success',
          confirmText: 'KEEP THE FLOW',
          onConfirm: proceed
        });
      } else {
        showModal({
          title: 'Task Completed!',
          message: "Well done! You've completed your task. Ready for the next one?",
          type: 'success',
          confirmText: 'CONTINUE',
          onConfirm: proceed
        });
      }
    } else {
      // Break completion or task failure
      proceed();
    }
  };

  const addMoreTime = () => {
    setTimeLeft(prev => prev + 60);
  };

  const addTask = () => {
    const newTasks = [
      ...tasks, 
      { id: crypto.randomUUID(), type: 'task', name: '', duration: 25, status: 'pending', startTime: null, endTime: null },
      { id: crypto.randomUUID(), type: 'break', name: 'Short Break', duration: 5, status: 'pending', startTime: null, endTime: null }
    ];
    setTasks(newTasks);
  };

  const addBreak = () => {
    setTasks([...tasks, { id: crypto.randomUUID(), type: 'break', name: 'Short Break', duration: 5, status: 'pending', startTime: null, endTime: null }]);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter(t => t.id !== id));
  };

  const resetAll = () => {
    showModal({
      title: 'Reset Plan?',
      message: 'This will clear all your tasks and reset your progress. Are you sure?',
      type: 'confirm',
      confirmText: 'YES, RESET',
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.abs(seconds) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalPlanTime = tasks.reduce((acc, t) => acc + t.duration * 60, 0);
  const remainingPlanTime = tasks.slice(activeIndex).reduce((acc, t, i) => {
    if (i === 0) return acc + timeLeft;
    return acc + t.duration * 60;
  }, 0);
  const elapsedPlanTime = totalPlanTime - remainingPlanTime;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-roboto transition-colors duration-500 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
          <a href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity group">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Clock size={40} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tight text-slate-800 leading-none">SYNAPTICZ TIMER</h1>
              <span className="text-xl font-black text-indigo-500 uppercase tracking-[.9rem] mt-1">Focus & Flow</span>
            </div>
          </a>

          <div className="flex items-center gap-16">
            <div className="hidden lg:flex items-center gap-12">
              <div className="flex gap-2 items-center justify-center">
                <span className="text-[1.5rem] font-black text-slate-400 uppercase tracking-widest mb-1">Total Plan: </span>
                <span className="text-5xl font-mono font-bold text-teal-700">{Math.floor(totalPlanTime / 60)}<span className="text-3xl ml-0.5">m</span></span>
              </div>
              {(mode === 'executing' || mode === 'waiting') && (
                <>
                  <div className="flex flex-col items-end border-l-2 border-slate-100 pl-12">
                    <span className="text-[10px] font-black  uppercase tracking-widest mb-1 text-indigo-500">Elapsed</span>
                    <span className="text-3xl font-mono font-black text-indigo-600">{formatTime(elapsedPlanTime)}</span>
                  </div>
                  <div className="flex flex-col items-end border-l-2 border-slate-100 pl-12">
                    <span className="text-[10px] font-black  uppercase tracking-widest mb-1 text-rose-500">Remaining</span>
                    <span className="text-3xl font-mono font-black text-rose-600">{formatTime(remainingPlanTime)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-right border-l-2 border-slate-100 pl-12">
              <p className="text-4xl font-mono font-black text-slate-800 tracking-tighter">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="h-2 w-full bg-slate-100 overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(mode === 'executing' || mode === 'waiting') ? (elapsedPlanTime / totalPlanTime) * 100 : 0}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 1 }}
          />
        </div>
      </header>

      <main className="max-w-[763px] lg:max-w-[889px] mx-auto px-4 pt-12 pb-24">
        <AnimatePresence mode="wait">
          {mode === 'summary' ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 inline-block w-full">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <PartyPopper size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">Plan Complete!</h2>
                <p className="text-slate-500 font-medium mb-12">Here's how you did on your focus session.</p>

                <div className="space-y-4 text-left mb-12">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="text-emerald-500" size={24} />
                        ) : task.status === 'failed' ? (
                          <XCircle className="text-rose-500" size={24} />
                        ) : (
                          <Clock className="text-slate-300" size={24} />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{task.name || (task.type === 'break' ? 'Short Break' : 'Untitled Task')}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{task.type}</span>
                        </div>
                      </div>
                      <span className="text-slate-400 font-bold">{task.duration}m</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setMode('planning')}
                  className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw size={24} />
                  START NEW PLAN
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Context Header */}
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                    {mode === 'planning' ? 'Focus Plan' : mode === 'waiting' ? 'Scheduled' : 'Live Focus'}
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">
                    {mode === 'planning' ? 'Define your flow. Scroll on time to adjust.' : 
                     mode === 'waiting' ? 'Waiting for the scheduled start time...' : 
                     `Currently focusing on: ${tasks[activeIndex]?.name}`}
                  </p>
                </div>
                {mode === 'planning' && (
                  <button
                    onClick={resetAll}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Reset All"
                  >
                    <RotateCcw size={20} />
                  </button>
                )}
              </div>

              {/* Waiting Hero */}
              {mode === 'waiting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 text-center"
                >
                  <div className="text-sm text-indigo-500 font-black tracking-widest uppercase mb-2">Starts At</div>
                  <div className="text-5xl font-mono font-black text-indigo-600 mb-6">
                    {targetStartTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </div>
                  <div className="text-slate-400 font-bold mb-8">
                    {Math.max(0, Math.floor((targetStartTime - currentTime) / 1000))}s remaining
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => { setMode('planning'); setTargetStartTime(null); }}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel & Edit
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date();
                        setPlanStartedAt(now);
                        const updatedTasks = [...tasks];
                        if (updatedTasks.length > 0) {
                          updatedTasks[0].startTime = now;
                          setTasks(updatedTasks);
                        }
                        setMode('executing');
                        setTargetStartTime(null);
                      }}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={20} fill="currentColor" />
                      START NOW
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Execution Hero (Active Timer) */}
              {mode === 'executing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeIndex + 1) / tasks.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left flex-1">
                       <p className="text-indigo-500 font-black tracking-widest uppercase mb-1 text-xs">
                         {tasks[activeIndex].type === 'break' ? 'Break Time' : `Task ${activeIndex + 1} of ${tasks.length}`}
                       </p>
                       <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{tasks[activeIndex].name}</h3>
                    </div>

                    <div className="flex flex-col items-center min-w-[240px]">
                      <div className={`text-7xl font-mono font-black tabular-nums leading-none ${timeLeft < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`p-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center ${isPaused ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-100 text-slate-600 shadow-sm'}`}
                        title={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
                      </button>
                      <button
                        onClick={() => handleTaskAction('completed')}
                        className="p-5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                        title="Complete"
                      >
                        <CheckCircle2 size={28} />
                      </button>
                      <button
                        onClick={() => handleTaskAction('failed')}
                        className="p-5 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all"
                        title="Failed"
                      >
                        <XCircle size={28} />
                      </button>
                      <button
                        onClick={addMoreTime}
                        className="p-5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
                        title="Add 1 min"
                      >
                        <PlusCircle size={28} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Task List */}
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    index={index}
                    isActive={mode === 'executing' && activeIndex === index}
                    isExecuting={mode === 'executing'}
                    isPaused={isPaused}
                    onUpdate={(updates) => updateTask(task.id, updates)}
                    onRemove={() => removeTask(task.id)}
                  />
                ))}
              </div>

              {/* Planning Controls */}
              {(mode === 'planning' || (mode === 'executing' && isPaused)) && (
                <div className="flex flex-col gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={addTask}
                      className="group flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all active:scale-95 bg-white/50"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                      <span className="font-bold">{mode === 'planning' ? 'Add Task + Break' : 'Add Task + Break'}</span>
                    </button>
                    <button
                      onClick={addBreak}
                      className="group flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-amber-400 hover:text-amber-600 transition-all active:scale-95 bg-white/50"
                    >
                      <Coffee size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="font-bold">Add Break</span>
                    </button>
                  </div>

                  {mode === 'planning' && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Start Options</span>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          {['none', 'duration', 'time'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                if (type === 'none') setDelayConfig({ ...delayConfig, type: 'none' });
                                else if (type === 'duration') setDelayConfig({ ...delayConfig, type: 'duration', value: delayConfig.type === 'time' ? 5 : delayConfig.value });
                                else {
                                  const now = new Date();
                                  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                  setDelayConfig({ ...delayConfig, type: 'time', value: timeStr });
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${delayConfig.type === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                              {type === 'none' ? 'Immediately' : type === 'duration' ? 'In...' : 'At...'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {delayConfig.type === 'duration' && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
                          <input
                            type="range" min="1" max="60" value={delayConfig.value}
                            onChange={(e) => setDelayConfig({ ...delayConfig, value: parseInt(e.target.value) })}
                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <span className="font-mono font-bold text-indigo-600 w-16 text-right">{delayConfig.value}m</span>
                        </div>
                      )}

                      {delayConfig.type === 'time' && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
                          <input
                            type="time" value={delayConfig.value}
                            onChange={(e) => setDelayConfig({ ...delayConfig, value: e.target.value })}
                            className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-indigo-600 text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'planning' && (
                    <button
                      onClick={startExecution}
                      className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                    >
                      <Play size={24} fill="currentColor" />
                      START MY PLAN
                    </button>
                  )}
                </div>
              )}

              {/* Active Execution Controls */}
              {mode === 'executing' && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => { 
                      showModal({
                        title: 'Stop Session?',
                        message: 'Do you want to stop the current session and return to planning?',
                        type: 'confirm',
                        confirmText: 'STOP SESSION',
                        onConfirm: () => setMode('planning')
                      });
                    }}
                    className="px-6 py-2 text-slate-400 font-bold hover:text-rose-500 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={18} /> STOP SESSION
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        <Modal 
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          subMessage={modal.subMessage}
          type={modal.type}
          confirmText={modal.confirmText}
          onConfirm={modal.onConfirm}
        />
      </main>
    </div>
  );
}

function TaskRow({ task, index, onUpdate, onRemove, isActive, isExecuting, isPaused }) {
  const handleWheel = (e) => {
    if (isExecuting && !isPaused) return;
    if (e.currentTarget.contains(e.target)) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      const nextValue = Math.min(60, Math.max(1, task.duration + delta));
      onUpdate({ duration: nextValue });
    }
  };

  const isEditable = !isExecuting || isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        borderColor: isActive ? '#4f46e5' : task.status === 'completed' ? '#10b981' : task.status === 'failed' ? '#f43f5e' : (task.type === 'break' ? '#fbbf24' : '#e2e8f0')
      }}
      className={`group p-6 rounded-3xl border-2 transition-colors flex flex-col sm:flex-row items-center gap-6 ${
        isActive ? 'bg-indigo-50/50 border-indigo-600 shadow-xl shadow-indigo-100 z-10' : 
        task.type === 'break' ? 'bg-amber-50/20 border-amber-100' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex-1 w-full flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          task.status === 'completed' ? 'bg-emerald-500 text-white' : 
          task.status === 'failed' ? 'bg-rose-500 text-white' : 
          isActive ? 'bg-indigo-600 text-white' : 
          task.type === 'break' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {task.status === 'completed' ? <CheckCircle2 size={16} /> : 
           task.status === 'failed' ? <XCircle size={16} /> : 
           task.type === 'break' ? <Coffee size={16} /> : index + 1}
        </div>
        <div className="flex flex-col flex-1">
          <input
            type="text"
            value={task.name}
            disabled={!isEditable || task.type === 'break'}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder={task.type === 'break' ? 'Short Break' : `Task #${index + 1}...`}
            className={`w-full text-2xl font-bold focus:outline-none bg-transparent ${
              !isEditable ? 'cursor-default' : ''
            } ${task.status !== 'pending' && !isActive ? 'text-slate-400 line-through' : 'text-slate-700'}`}
          />
          {task.type === 'break' && <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 ml-1">Break</span>}
        </div>
      </div>

      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div 
          onWheel={handleWheel}
          className={`flex flex-col items-center gap-1 select-none ${!isEditable ? '' : 'cursor-ns-resize'}`}
          title={!isEditable ? '' : 'Scroll to adjust time'}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              disabled={!isEditable}
              value={task.duration}
              onChange={(e) => onUpdate({ duration: Math.min(60, Math.max(1, parseInt(e.target.value) || 1)) })}
              className={`w-16 text-center text-3xl font-black focus:outline-none tabular-nums bg-transparent ${
                isActive ? (task.type === 'break' ? 'text-amber-600' : 'text-indigo-600') : 'text-slate-400'
              }`}
            />
            <span className="text-slate-400 font-black text-sm uppercase">min</span>
          </div>
          {isEditable && (
            <input
              type="range" min="1" max="60" value={task.duration}
              onChange={(e) => onUpdate({ duration: parseInt(e.target.value) })}
              className={`w-32 h-2 rounded-lg appearance-none cursor-pointer ${task.type === 'break' ? 'bg-amber-100 accent-amber-500' : 'bg-slate-100 accent-indigo-500'}`}
            />
          )}
        </div>

        {isEditable && (
          <button
            onClick={onRemove}
            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all sm:opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default App;

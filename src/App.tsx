import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { NoteInput } from './components/NoteInput';
import { SummaryView } from './components/SummaryView';
import { summarizeNotes } from './services/gemini';
import { extractTextFromPdf } from './lib/pdf';
import { Sparkles, Loader2, AlertCircle, BookOpen, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
}

export default function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('notes_summary_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('notes_summary_history', JSON.stringify(history));
  }, [history]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
      } else {
        text = await file.text();
      }
      setNotes(text);
      await generateSummary(text, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSummary = async (content: string, title: string = "Manual Entry") => {
    if (!content.trim()) {
      setError("Please provide some content to summarize.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const result = await summarizeNotes(content);
      setSummary(result);
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        title: title.length > 30 ? title.substring(0, 30) + "..." : title,
        summary: result,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSummarize = () => {
    generateSummary(notes);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setSummary(item.summary);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('notes_summary_history');
  };

  return (
    <div className="min-h-screen bg-[#030712] font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden bg-grid">
      {/* Immersive Background Assets */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="glow-orb top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20" />
        <div className="glow-orb top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10" />
        <div className="glow-orb bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-indigo-600/15" />
        
        {/* Floating geometric assets */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[5%] w-12 h-12 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hidden lg:block" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] right-[8%] w-8 h-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hidden lg:block" 
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full px-6 py-8">
        <nav className="max-w-7xl mx-auto glass-panel rounded-[2rem] px-8 h-16 flex items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-blue-600 p-2 rounded-xl shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-black text-white tracking-widest uppercase">Focus<span className="text-blue-500">AI</span></span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 h-10 px-5 text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 rounded-2xl transition-all duration-300 group"
            >
              <History className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
              <span className="hidden sm:inline">Archived</span>
              {history.length > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-[10px] text-white rounded-lg flex items-center justify-center font-black">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-20 items-stretch">
          {/* Input Module */}
          <section className="w-full lg:w-[460px] flex-shrink-0 space-y-16">
            <div className="space-y-6">
              <div className="tech-badge w-fit inline-flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Engine: Neural Summarizer v3</span>
              </div>
              <h1 className="text-7xl font-black text-white leading-[0.85] tracking-tighter">
                Master your <br/>
                <span className="gradient-text">curriculum.</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-sm">
                Distill massive documents into atomic insights with one click.
              </p>
            </div>

            <div className="space-y-10">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              </motion.div>
              
              <div className="flex items-center space-x-6 opacity-30">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">OR</span>
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-white" />
              </div>

              <NoteInput value={notes} onChange={setNotes} disabled={isProcessing} />

              <button
                onClick={handleManualSummarize}
                disabled={isProcessing || !notes.trim()}
                className="group relative w-full h-16 bg-white text-black font-black uppercase tracking-widest text-sm rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] overflow-hidden"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative flex items-center justify-center space-x-3 group-hover:text-white transition-colors duration-500">
                      <Sparkles className="w-5 h-5" />
                      <span>Synthesize</span>
                    </div>
                  </>
                )}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start space-x-4 text-red-400 shadow-2xl"
                >
                  <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-sm font-bold tracking-tight">{error}</p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Results Module */}
          <section className="flex-1 w-full flex flex-col">
            <AnimatePresence mode="wait">
              {summary ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col"
                >
                  <SummaryView summary={summary} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-h-[500px] glass-panel rounded-[3rem] flex flex-col items-center justify-center text-center p-16 space-y-10 border border-white/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  
                  <div className="relative animate-float">
                    <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-blue-500 border border-white/10 shadow-2xl">
                      <Sparkles className="w-12 h-12" />
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20"
                    >
                      <BookOpen className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>

                  <div className="space-y-4 max-w-sm relative">
                    <h3 className="text-3xl font-black text-white tracking-tighter">Station Offline</h3>
                    <p className="text-slate-500 font-bold leading-relaxed uppercase text-xs tracking-widest">
                      Your neural distillation is ready to begin. <br/> Feed the engine content.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 relative">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 h-8 bg-blue-600/20 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* History Slide-over */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[50]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[450px] bg-slate-950 border-l border-white/10 z-[60] flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="p-12 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Archives</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">Historical Distillations</p>
                </div>
                <button 
                  onClick={clearHistory}
                  className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-2xl transition-all duration-300"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {history.length === 0 ? (
                  <div className="text-center py-32 opacity-20">
                    <History className="w-20 h-20 mx-auto mb-6" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">No sessions found</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="w-full text-left p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/50 hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="font-black text-white text-lg mb-3 tracking-tight group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <div className="h-1 w-12 bg-white/10 rounded-full" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Neuro-Focus Lab © 2026</span>
        </div>
        <div className="flex items-center space-x-8">
          <a href="#" className="hover:text-white transition-colors">Compliance</a>
          <a href="#" className="hover:text-white transition-colors">Terminal</a>
          <a href="#" className="hover:text-white transition-colors">Status: Online</a>
        </div>
      </footer>
    </div>
  );
}

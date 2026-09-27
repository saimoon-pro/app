import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Coins,
  LogOut,
  CheckCircle2,
  Bot,
  Layers,
  Upload,
  Eye,
  Send,
  Image as ImageIcon,
  X,
  Printer,
  Trash2,
  FileText,
  Palette,
  Edit3,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { signOutFreeUser, updateUserCredits, TARGET_GOOGLE_SHEET_ID } from '@/services/auth';
import {
  TEMPLATES,
  INITIAL_CV_DATA,
  BLANK_CV_DATA,
  type CVData,
  type TemplateDefinition,
} from './templatesData';
import { A4CVPreview } from './A4CVPreview';
import { parseAndSynthesizeBioData } from '@/services/cvAiParser';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  images?: string[];
}

export const CVMakerWorkspace: React.FC = () => {
  const isOpen = useAuthStore((s) => s.workspaceOpen);
  const setWorkspaceOpen = useAuthStore((s) => s.setWorkspaceOpen);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  // Active top tab on the right screen: 'templates' | 'uploads' | 'preview'
  const [activeRightTab, setActiveRightTab] = useState<'templates' | 'uploads' | 'preview'>(
    'templates'
  );

  // CV Data State
  const [cvData, setCvData] = useState<CVData>(INITIAL_CV_DATA);

  // New CV Creation Modal State
  const [showNewCVModal, setShowNewCVModal] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateRole, setNewCandidateRole] = useState('');
  const [newCandidateBio, setNewCandidateBio] = useState('');

  // Zoom control for preview (0.65, 0.85, 1.0)
  const [previewZoom, setPreviewZoom] = useState<number>(0.75);

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `আসসালামু আলাইকুম! আমি আপনার Saimoon AI CV অ্যাসিস্ট্যান্ট।\n\nI can write high-impact corporate summaries, suggest skills, format experience in the STAR method, or translate between Bangla & English. How can I help with your CV today?`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // File Upload states
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);

  // Credit modal state
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const chatImageInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiGenerating]);

  if (!isOpen) return null;

  // Calculate word count for prompt input
  const wordCount = chatInput.trim() ? chatInput.trim().split(/\s+/).length : 0;
  const isOverWordLimit = wordCount > 1000;

  // Sign out handler
  const handleSignOut = () => {
    signOutFreeUser();
    setWorkspaceOpen(false);
  };

  // Image compression for chat reference images (<2MB)
  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (chatImages.length + files.length > 3) {
      alert('You can attach a maximum of 3 reference images per conversation.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} exceeds 2MB limit. Please attach images under 2MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          setChatImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (chatImageInputRef.current) chatImageInputRef.current.value = '';
  };

  // Handle creating a brand new blank CV
  const handleCreateBlankCV = () => {
    if (user?.uid) {
      updateUserCredits(user.uid, -50);
    }
    setCvData(BLANK_CV_DATA);
    setActiveRightTab('preview');
    setShowNewCVModal(false);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `ai_new_${Date.now()}`,
        sender: 'ai',
        text: `✨ **Brand New Blank CV Created!** (50 Credits Used)\n\nAll fields have been cleared and initialized. You can now edit your details in the [Templates] tab or type your bio data here!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Handle creating new CV with AI
  const handleCreateNewCVWithAI = async () => {
    if (!newCandidateName.trim()) return;
    if (user?.uid) {
      updateUserCredits(user.uid, -50);
    }

    const basePrompt = `My name is ${newCandidateName.trim()}. I am a ${newCandidateRole.trim() || 'Professional'}. ${newCandidateBio.trim()}`;
    const result = await parseAndSynthesizeBioData(basePrompt, {
      ...BLANK_CV_DATA,
      fullName: newCandidateName.trim(),
      jobTitle: newCandidateRole.trim() || BLANK_CV_DATA.jobTitle,
    });

    setCvData(result.updatedCV);
    setActiveRightTab('preview');
    setShowNewCVModal(false);
    setNewCandidateName('');
    setNewCandidateRole('');
    setNewCandidateBio('');

    setChatMessages((prev) => [
      ...prev,
      {
        id: `ai_new_${Date.now()}`,
        sender: 'ai',
        text: `✨ **Brand New CV Created for ${newCandidateName.trim()}!** (50 Credits Used)\n\n${result.explanationBangla}\n\nCheck the Live Preview on the right screen to view the newly formatted CV.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Handle sending a chat prompt
  const handleSendMessage = async () => {
    if ((!chatInput.trim() && chatImages.length === 0) || isOverWordLimit || isAiGenerating) return;

    const userPrompt = chatInput.trim();
    const sentImages = [...chatImages];

    const newUserMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      images: sentImages.length > 0 ? sentImages : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput('');
    setChatImages([]);
    setIsAiGenerating(true);

    try {
      const lower = userPrompt.toLowerCase();

      // Check if user wants to create a new CV from scratch
      const isNewCVRequest =
        lower.includes('create new cv') ||
        lower.includes('make new cv') ||
        lower.includes('start new cv') ||
        lower.includes('নতুন সিভি') ||
        lower.includes('new cv for') ||
        lower.includes('create a cv for');

      if (isNewCVRequest) {
        const parseResult = await parseAndSynthesizeBioData(userPrompt, BLANK_CV_DATA);
        setCvData(parseResult.updatedCV);
        if (user?.uid) updateUserCredits(user.uid, -50);
        setActiveRightTab('preview');

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `✨ **সম্পূর্ণ নতুন সিভি তৈরি করা হয়েছে! (New CV Created)**\n\n${parseResult.explanationBangla}\n\n${parseResult.explanationEnglish}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      // Check if prompt is bio data or contains resume content
      const isBioData =
        userPrompt.length > 40 ||
        lower.includes('name') ||
        lower.includes('experience') ||
        lower.includes('developer') ||
        lower.includes('designer') ||
        lower.includes('editor') ||
        lower.includes('skill') ||
        lower.includes('bio') ||
        lower.includes('summary') ||
        lower.includes('অভিজ্ঞতা') ||
        lower.includes('নাম') ||
        lower.includes('পড়াশোনা');

      if (isBioData) {
        // Run AI synthesis: extracts fields, shortens lengthy descriptions, emphasizes metrics
        const parseResult = await parseAndSynthesizeBioData(userPrompt, cvData);
        setCvData(parseResult.updatedCV);

        const aiReply =
          lower.includes('বাংলা') || lower.includes('bangla')
            ? parseResult.explanationBangla
            : `${parseResult.explanationEnglish}\n\n${parseResult.explanationBangla}`;

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: aiReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Quick conversational response
        let aiReply = `Understood! I am ready to craft your CV. You can type or paste your bio data (name, experience, skills, or past work) and I will automatically format and place it into your chosen corporate template!`;
        if (lower.includes('hi') || lower.includes('hello') || lower.includes('সালাম')) {
          aiReply = `আসসালামু আলাইকুম! আপনার সম্পূর্ণ বায়ো-ডাটা বা পূর্বের কাজের বিবরণ এখানে পেস্ট করুন। আমি স্বয়ংক্রিয়ভাবে প্রফেশনাল সিভি ফরম্যাটে সাজিয়ে দেব এবং অপ্রয়োজনীয় বড় অংশ ছোট করে মূল অর্জনগুলো হাইলাইট করব।`;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: aiReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('[AI Processing error]', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Processing complete. Your CV has been updated with the latest details. Check the [Live Preview] tab on the right!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Quick Prompt Chips
  const handleQuickPrompt = (promptText: string) => {
    setChatInput(promptText);
  };

  // Profile Photo Upload (< 1MB)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setPhotoError('Profile photo must be under 1MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      if (b64) {
        setCvData((prev) => ({ ...prev, profileImage: b64, showPhoto: true }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Previous Resume Upload (< 2MB)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setResumeError('Resume file must be under 2MB. Please select a valid document.');
      return;
    }

    setUploadedResumeName(file.name);

    // Read text and run automated bio data extraction & placement
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        try {
          const parseResult = await parseAndSynthesizeBioData(content, cvData);
          setCvData(parseResult.updatedCV);

          setChatMessages((prev) => [
            ...prev,
            {
              id: `ai_resume_${Date.now()}`,
              sender: 'ai',
              text: `📄 **পূর্বের সিভি সফলভাবে প্রসেস করা হয়েছে!** (${file.name})\n\n${parseResult.explanationBangla}\n\n${parseResult.explanationEnglish}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } catch (err) {
          console.warn('Resume parse note:', err);
        }
      }
    };
    reader.readAsText(file);
  };

  // Select a template
  const handleSelectTemplate = (template: TemplateDefinition) => {
    setCvData((prev) => ({
      ...prev,
      templateId: template.id,
      accentColor: template.defaultAccent,
      secondaryColor: template.defaultSecondary,
    }));
  };

  // Print or Download PDF (deducts 50 credits if needed or exports)
  const handleDownloadPDF = () => {
    if (user?.uid) {
      updateUserCredits(user.uid, -50);
    }
    // Switch to preview tab to make sure it's mounted, then trigger print
    setActiveRightTab('preview');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#030705] text-white select-none overflow-hidden font-sans">
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TOP WORKSPACE NAVIGATION BAR                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <header className="w-full h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-[#07120b] border-b border-emerald-500/20 backdrop-blur-xl z-30 shadow-md">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setWorkspaceOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Portfolio</span>
          </button>

          <div className="h-4 w-[1px] bg-emerald-500/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-[#00FF66]/40 flex items-center justify-center shadow-inner">
              <Sparkles size={14} className="text-[#00FF66]" />
            </div>
            <div>
              <span className="font-display font-black text-sm sm:text-base tracking-tight block leading-tight text-white">
                CV MAKER STUDIO
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                <span>Google Sheet Synced ({TARGET_GOOGLE_SHEET_ID.slice(0, 8)}...)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Credits, Options & Sign Out */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Create New CV Button */}
          <button
            id="btn-create-new-cv"
            onClick={() => setShowNewCVModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#00FF66] hover:brightness-110 text-slate-950 font-display font-black text-xs shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>New CV</span>
          </button>

          {/* Credit Pill */}
          <button
            onClick={() => setShowCreditModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 hover:border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)] transition-all cursor-pointer"
          >
            <Coins size={14} className="text-[#00FF66] animate-bounce" />
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xs sm:text-sm font-black text-white">
                {profile?.creditBalance ?? 100}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold">CREDITS</span>
            </div>
            <Plus size={12} className="text-[#00FF66] ml-0.5" />
          </button>

          {/* User Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-white font-bold max-w-[130px] truncate">
              {profile?.fullName || user?.fullName || 'Google User'}
            </span>
            <CheckCircle2 size={13} className="text-[#00FF66]" />
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SPLIT SCREEN MAIN WORKSPACE                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ────────────────────────────────────────────────────────────────── */}
        {/* LEFT SCREEN: AI CHATBOT & CREDITS & PROMPT CONTROLS (42% Width)    */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <section className="w-full lg:w-[42%] flex flex-col bg-[#050c08] border-b lg:border-b-0 lg:border-r border-emerald-500/20 h-[50vh] lg:h-full overflow-hidden">
          {/* Top Info Bar */}
          <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/15 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#00FF66]" />
              <span className="font-display font-bold text-xs text-white">
                Saimoon AI CV Assistant
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#00FF66] border border-emerald-500/30">
                Bangla + English
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Session: <span className="text-emerald-400 font-bold">Active</span>
            </div>
          </div>

          {/* Quick Credit Actions Strip */}
          <div className="px-4 py-2 bg-black/40 border-b border-emerald-500/10 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none text-[11px] font-mono">
            <span className="text-slate-400 shrink-0">Actions:</span>
            <button
              id="btn-quick-new-cv"
              onClick={() => setShowNewCVModal(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 border border-[#00FF66]/60 text-[#00FF66] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Plus size={12} className="stroke-[3]" />
              <span>New CV (50 CR)</span>
            </button>
            <button
              onClick={() => {
                setActiveRightTab('templates');
                handleQuickPrompt('Help me choose the best template for my career profile');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-[#00FF66]/50 text-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              Templates (50 CR)
            </button>
            <button
              onClick={() => {
                setActiveRightTab('templates');
                handleQuickPrompt('Write a modern custom layout with cyber aesthetics');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-[#00FF66]/50 text-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              Custom Layout (100 CR)
            </button>
            <button
              onClick={() =>
                handleQuickPrompt('Review my resume bullet points and convert them to STAR format')
              }
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-[#00FF66]/50 text-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              AI Prompt Refine (50 CR)
            </button>
          </div>

          {/* Chat Messages Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {msg.sender === 'user' ? 'You' : 'Saimoon AI'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none shadow-md'
                      : 'bg-[#0b1b11] border border-emerald-500/25 text-slate-100 rounded-tl-none shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Attached images preview */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      {msg.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Reference"
                          className="w-16 h-16 object-cover rounded-lg border border-white/20 shadow"
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick Action Button for AI Messages */}
                  {msg.sender === 'ai' &&
                    (msg.text.includes('সিভি') ||
                      msg.text.includes('CV') ||
                      msg.text.includes('Preview') ||
                      msg.text.includes('প্রিভিউ')) && (
                      <button
                        type="button"
                        onClick={() => setActiveRightTab('preview')}
                        className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[#00FF66] font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View in Live Preview (লাইভ প্রিভিউ দেখুন)</span>
                      </button>
                    )}
                </div>
              </div>
            ))}

            {isAiGenerating && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0b1b11] border border-emerald-500/25 text-xs text-emerald-400 w-fit">
                <RefreshCw size={14} className="animate-spin" />
                <span>AI generating professional recommendation...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-[#040906] border-t border-emerald-500/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-[11px]">
            <span className="text-[10px] font-mono text-slate-500 shrink-0">Suggestions:</span>
            <button
              onClick={() => handleQuickPrompt('বাংলায় একটি আকর্ষণীয় সিভি সামারি লিখুন')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-white border border-white/10 shrink-0 transition-colors cursor-pointer"
            >
              বাংলায় সামারি
            </button>
            <button
              onClick={() => handleQuickPrompt('Generate top skills for Senior Video Editor')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-white border border-white/10 shrink-0 transition-colors cursor-pointer"
            >
              Video Editor Skills
            </button>
            <button
              onClick={() =>
                handleQuickPrompt('Convert my experience bullets to quantifiable STAR format')
              }
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-white border border-white/10 shrink-0 transition-colors cursor-pointer"
            >
              STAR Experience
            </button>
          </div>

          {/* Attached Image Thumbnail Staging Area */}
          {chatImages.length > 0 && (
            <div className="px-4 py-2 bg-black/60 border-t border-emerald-500/20 flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-400">Attached ({chatImages.length}/3):</span>
              {chatImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt="Ref"
                    className="w-10 h-10 object-cover rounded-lg border border-emerald-400/50 shadow"
                  />
                  <button
                    onClick={() => setChatImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Prompt Input Box (Under 1000 Words Counter) */}
          <div className="p-3 sm:p-4 bg-[#07130c] border-t border-emerald-500/20 shrink-0">
            <div className="relative rounded-2xl bg-[#030704] border border-emerald-500/30 focus-within:border-[#00FF66] transition-all p-2.5">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="Ask AI to craft your summary, suggest skills, or adapt template (Bangla / English)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  {/* Reference Image Upload Button */}
                  <input
                    type="file"
                    ref={chatImageInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleChatImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => chatImageInputRef.current?.click()}
                    title="Attach reference images (Max 3, auto-compressed < 2MB)"
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-[#00FF66] transition-colors cursor-pointer"
                  >
                    <ImageIcon size={14} />
                    <span>Attach Image</span>
                  </button>

                  {/* Word Limit Counter */}
                  <span
                    className={`text-[10px] font-mono ${
                      isOverWordLimit ? 'text-rose-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Words: {wordCount} / 1000
                  </span>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={(!chatInput.trim() && chatImages.length === 0) || isOverWordLimit || isAiGenerating}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] hover:from-[#00B048] hover:to-[#00E55A] text-black font-display font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40"
                >
                  <span>Send</span>
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* RIGHT SCREEN: TOP OPTIONS TABS (TEMPLATES, UPLOADS, PREVIEW) (58%)  */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <section className="w-full lg:w-[58%] flex flex-col bg-[#020503] h-[50vh] lg:h-full overflow-hidden">
          {/* Top Options Tabs Header */}
          <div className="h-14 px-4 bg-[#08150e] border-b border-emerald-500/20 flex items-center justify-between shrink-0 shadow-md">
            {/* 3 Main Tabs: Templates | Uploads | Preview */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveRightTab('templates')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeRightTab === 'templates'
                    ? 'bg-emerald-500/20 border border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Layers size={14} />
                <span>Templates (10)</span>
              </button>

              <button
                onClick={() => setActiveRightTab('uploads')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeRightTab === 'uploads'
                    ? 'bg-emerald-500/20 border border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Upload size={14} />
                <span>Uploads</span>
              </button>

              <button
                onClick={() => setActiveRightTab('preview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeRightTab === 'preview'
                    ? 'bg-emerald-500/20 border border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Eye size={14} />
                <span>Live Preview / PDF</span>
              </button>
            </div>

            {/* Quick Action: Download / Print PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="py-1.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Download PDF (50 CR)</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: TEMPLATES & CUSTOMIZATION CONTENT                           */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeRightTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Photo Display & Profile Image Control Card */}
              <div className="p-4 rounded-2xl bg-[#07130c] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#00FF66]" />
                    <h3 className="font-display font-bold text-sm text-white">
                      Profile Photo in CV
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cvData.showPhoto
                      ? 'Photo enabled. Turn off for ATS-friendly executive typography.'
                      : 'No-Photo Mode: 40-year veteran designer executive layout with full-width typography.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setCvData((prev) => ({ ...prev, showPhoto: !prev.showPhoto }))}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                      cvData.showPhoto
                        ? 'bg-emerald-500/20 border-[#00FF66] text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                        : 'bg-slate-800/80 border-white/20 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cvData.showPhoto ? 'bg-[#00FF66] animate-pulse' : 'bg-slate-500'}`} />
                    <span>{cvData.showPhoto ? 'Photo: ON' : 'Photo: OFF (Executive Mode)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveRightTab('uploads')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Color Customizer Section */}
              <div className="p-4 rounded-2xl bg-[#07130c] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-[#00FF66]" />
                    <h3 className="font-display font-bold text-sm text-white">
                      Live Color Customizer
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Active Accent: <span className="font-bold text-white">{cvData.accentColor}</span>
                  </span>
                </div>

                {/* Color presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: 'Cyber Emerald', hex: '#00FF66' },
                    { label: 'Corporate Blue', hex: '#2563EB' },
                    { label: 'Luxury Gold', hex: '#D97706' },
                    { label: 'Modern Crimson', hex: '#E11D48' },
                    { label: 'Amethyst', hex: '#9333EA' },
                    { label: 'Slate Grey', hex: '#475569' },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => setCvData((prev) => ({ ...prev, accentColor: preset.hex }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        cvData.accentColor === preset.hex
                          ? 'border-white bg-white/10 text-white shadow'
                          : 'border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ background: preset.hex }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}

                  {/* Custom Hex picker */}
                  <input
                    type="color"
                    value={cvData.accentColor}
                    onChange={(e) => setCvData((prev) => ({ ...prev, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                    title="Choose custom color"
                  />
                </div>
              </div>

              {/* 10 Corporate Templates Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    Choose from 10 Corporate Templates
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">
                    Selected: {cvData.templateId.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
                  {TEMPLATES.map((tmpl) => {
                    const isSelected = cvData.templateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col bg-[#07130c] ${
                          isSelected
                            ? 'border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.3)] ring-2 ring-[#00FF66]'
                            : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#00FF66] text-black font-mono font-black text-[9px] uppercase shadow">
                              Active
                            </div>
                          )}
                        </div>

                        {/* Title & Category */}
                        <div className="p-2.5 space-y-1">
                          <div className="font-display font-bold text-xs text-white truncate">
                            {tmpl.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {tmpl.roleCategory}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Details Quick Editor */}
              <div className="p-5 rounded-2xl bg-[#07130c] border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Edit3 size={16} className="text-[#00FF66]" />
                  <h3 className="font-display font-bold text-sm text-white">
                    Edit Resume Details (Real-time Live Sync)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={cvData.fullName}
                      onChange={(e) => setCvData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={cvData.jobTitle}
                      onChange={(e) => setCvData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={cvData.email}
                      onChange={(e) => setCvData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={cvData.phone}
                      onChange={(e) => setCvData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    value={cvData.summary}
                    onChange={(e) => setCvData((prev) => ({ ...prev, summary: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-[#030704] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66] resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: UPLOADS (PHOTO & PREVIOUS RESUME)                            */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeRightTab === 'uploads' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Profile Photo Upload (< 1MB) */}
              <div className="p-5 rounded-2xl bg-[#07130c] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#00FF66]" />
                    <h3 className="font-display font-bold text-sm text-white">
                      Profile Photo Upload (Max 1MB)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Replace on upload</span>
                </div>

                {photoError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                    {photoError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  {/* Avatar Preview */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-400/40 shrink-0 shadow-lg flex items-center justify-center">
                    {cvData.profileImage ? (
                      <img
                        src={cvData.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 text-center px-2">
                        No Photo Selected
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-[#00FF66] font-mono font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Upload size={14} />
                        <span>{cvData.profileImage ? 'Change Photo' : 'Upload Photo (<1MB)'}</span>
                      </button>

                      {cvData.profileImage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCvData((prev) => ({ ...prev, showPhoto: !prev.showPhoto }))}
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{cvData.showPhoto ? 'Hide from CV' : 'Show on CV'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCvData((prev) => ({ ...prev, profileImage: null, showPhoto: false }))}
                            className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP. Photo will instantly appear on your chosen CV template.
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Resume Upload (< 2MB) */}
              <div className="p-5 rounded-2xl bg-[#07130c] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#00FF66]" />
                    <h3 className="font-display font-bold text-sm text-white">
                      Previous Resume Upload (Max 2MB)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">PDF / DOCX / TXT</span>
                </div>

                {resumeError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                    {resumeError}
                  </div>
                )}

                <input
                  type="file"
                  ref={resumeInputRef}
                  accept=".pdf, .docx, .txt"
                  onChange={handleResumeUpload}
                  className="hidden"
                />

                {/* Dropzone container */}
                <div
                  onClick={() => resumeInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-[#00FF66] bg-[#030704] flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00FF66] transition-all">
                    <Upload size={22} />
                  </div>
                  <div className="font-display font-bold text-sm text-white">
                    {uploadedResumeName ? uploadedResumeName : 'Drop your previous resume here or click to browse'}
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Upload your past CV to let the Saimoon AI extract your work history, skills, and accomplishments automatically.
                  </p>
                </div>

                {uploadedResumeName && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-300 truncate max-w-xs">
                      ✓ Active: {uploadedResumeName}
                    </span>
                    <button
                      onClick={() => {
                        setUploadedResumeName(null);
                      }}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: LIVE PREVIEW & PRINT-READY A4 PDF                           */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeRightTab === 'preview' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f0c]">
              {/* Preview Zoom Controls Bar */}
              <div className="px-4 py-2 bg-[#07130c] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Zoom:</span>
                  <button
                    onClick={() => setPreviewZoom(0.6)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      previewZoom === 0.6
                        ? 'border-[#00FF66] text-[#00FF66] bg-emerald-500/10'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Fit
                  </button>
                  <button
                    onClick={() => setPreviewZoom(0.75)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      previewZoom === 0.75
                        ? 'border-[#00FF66] text-[#00FF66] bg-emerald-500/10'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setPreviewZoom(1.0)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      previewZoom === 1.0
                        ? 'border-[#00FF66] text-[#00FF66] bg-emerald-500/10'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    100%
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[#00FF66] text-xs font-mono font-bold cursor-pointer transition-all"
                  >
                    <Printer size={13} />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </div>

              {/* Scrollable A4 Document Stage */}
              <div className="flex-1 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start">
                <A4CVPreview cvData={cvData} scale={previewZoom} />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BUY CREDITS MODAL (BKASH / NAGAD / INSTANT BONUS)                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showCreditModal && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreditModal(false);
          }}
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#08150e] border border-emerald-500/30 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-[#00FF66]" />
                <h3 className="font-display font-bold text-base text-white">Refill Credits</h3>
              </div>
              <button
                onClick={() => setShowCreditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Corporate Starter (250 CR)</div>
                  <div className="text-slate-400 text-[11px]">Generate 5 High-Impact CVs</div>
                </div>
                <div className="text-emerald-400 font-mono font-black text-sm">৳199 BDT</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Professional Pro (1000 CR)</div>
                  <div className="text-emerald-300 text-[11px]">Unlimited Revisions + Custom Layouts</div>
                </div>
                <div className="text-[#00FF66] font-mono font-black text-sm">৳499 BDT</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-white">Manual bKash / Nagad Send Money:</div>
                <div className="font-mono text-emerald-400">01778011899 (Personal)</div>
                <div className="text-slate-400">Send TrxID to WhatsApp: +8801778011899 to credit immediately.</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (user?.uid) {
                  updateUserCredits(user.uid, 100);
                  alert('100 Demo Credits Added to your account!');
                }
                setShowCreditModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] text-black font-display font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Add 100 Free Test Credits
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CREATE NEW CV MODAL (BLANK / AI GENERATOR / DEMO RESET)                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showNewCVModal && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(14px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewCVModal(false);
          }}
        >
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#08150e] border border-emerald-500/40 text-white shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-[#00FF66]/50 flex items-center justify-center">
                  <Sparkles size={16} className="text-[#00FF66]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">Create New CV / Resume</h3>
                  <p className="text-[11px] font-mono text-emerald-400">Initialize a fresh professional resume</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewCVModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Auto-Generate Section */}
            <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                  <Bot size={14} className="text-[#00FF66]" />
                  Option 1: Generate with AI from Bio Data (50 CR)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-[#00FF66] font-bold">
                  Recommended
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Ahmed"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Target Role / Profession</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior UI/UX Designer or Full-Stack Developer"
                    value={newCandidateRole}
                    onChange={(e) => setNewCandidateRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030704] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Bio Data / Past Work Summary (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Paste your past experience, skills, education, or bio data in Bangla or English..."
                    value={newCandidateBio}
                    onChange={(e) => setNewCandidateBio(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#030704] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00FF66] resize-none leading-relaxed"
                  />
                </div>

                <button
                  disabled={!newCandidateName.trim()}
                  onClick={handleCreateNewCVWithAI}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00C853] to-[#00FF66] text-black font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  Generate New CV with AI (50 Credits)
                </button>
              </div>
            </div>

            {/* Start Blank Slate & Reset Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCreateBlankCV}
                className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-[#00FF66]/50 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                  <FileText size={13} className="text-emerald-400" />
                  <span>Start Fresh (Blank)</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Wipes all fields so you can enter everything manually (50 CR).
                </div>
              </button>

              <button
                onClick={() => {
                  setCvData(INITIAL_CV_DATA);
                  setActiveRightTab('preview');
                  setShowNewCVModal(false);
                  alert('Reset to Saimoon Hassan sample portfolio CV.');
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="font-display font-bold text-xs text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Load Demo Profile</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Restore Saimoon Hassan demo profile data.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVMakerWorkspace;

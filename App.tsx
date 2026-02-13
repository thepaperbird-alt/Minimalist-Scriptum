
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audioService } from './services/audioService';

/**
 * Minimalist Scriptum
 * A high-end minimal typing tool with typewriter-inspired aesthetics.
 * Updated: Retro mobile phone "beep" sounds, removed placeholder, adjusted character spacing.
 */

const App: React.FC = () => {
  const [docName, setDocName] = useState('Untitled Document');
  const [text, setText] = useState('');
  const [dateStr] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ','));
  const [pageNumber] = useState('p01');
  const [showCopied, setShowCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus capture
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow clicking inputs and buttons without stealing focus back to the text area
      if (target.tagName === 'INPUT' || target.closest('button')) return;
      textareaRef.current?.focus();
    };
    window.addEventListener('mousedown', handleGlobalClick);
    textareaRef.current?.focus();
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Play retro beep sounds
    if (newText.length > text.length) {
      const char = newText[newText.length - 1];
      if (char === ' ' || char === '\n') {
        audioService.playSpaceSound();
      } else {
        audioService.playKeySound();
      }
    } else if (newText.length < text.length) {
      // Deleting a character also makes a sound
      audioService.playKeySound(); 
    }

    setText(newText);
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [text]);

  const handleSave = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docName.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [text, docName]);

  return (
    <div className="min-h-screen w-full flex flex-col p-8 md:p-16 lg:p-24 selection:bg-[#2d2d2d] selection:text-[#efeae1] transition-colors duration-500">
      {/* Hidden input for capturing keys */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="input-capture"
        autoFocus
        spellCheck={false}
      />

      {/* Header Metadata */}
      <header className="flex flex-col md:flex-row justify-between items-baseline mb-24 gap-4 border-b border-[#2d2d2d15] pb-6">
        <div className="text-3xl md:text-5xl italic font-medium w-full md:w-auto">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="bg-transparent border-none outline-none focus:ring-0 w-full placeholder:opacity-20 cursor-text hover:bg-[#2d2d2d05] focus:bg-[#2d2d2d05] transition-all rounded px-1 -ml-1 tracking-tight"
            placeholder="Document Name"
            title="Edit Document Name"
          />
        </div>
        <div className="flex gap-8 text-xs md:text-sm font-inter tracking-[0.3em] opacity-40 uppercase whitespace-nowrap">
          <span>{dateStr}</span>
          <span className="opacity-40">{pageNumber}</span>
        </div>
      </header>

      {/* Main Text Area - Slightly more open tracking for refined look */}
      <main 
        className="flex-grow text-5xl md:text-6xl lg:text-8xl leading-[1.1] md:leading-[1.2] text-[#2d2d2d] font-light break-words relative cursor-text min-h-[60vh] tracking-[0.01em]"
        onClick={() => textareaRef.current?.focus()}
      >
        <div className="inline relative">
          {text.split('').map((char, i) => (
            <span 
              key={`${i}-${char}`} 
              className={i === text.length - 1 ? 'char-fade' : ''}
            >
              {char === '\n' ? <br /> : char}
            </span>
          ))}
          <span className="cursor-blink border-b-[6px] border-[#2d2d2d] inline-block w-8 h-1 -mb-1 transform translate-y-[-8px] ml-1"></span>
        </div>
      </main>

      {/* Subtle Controls */}
      <footer className="mt-24 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity duration-300 border-t border-[#2d2d2d10] pt-10">
        <div className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-inter">
          {text.length} characters / {text.trim() === '' ? 0 : text.trim().split(/\s+/).length} words
        </div>
        
        <div className="flex gap-10 items-center">
          <button 
            onClick={handleCopy}
            className="group relative flex items-center gap-2 hover:text-black transition-all active:scale-95"
            title="Copy to clipboard"
          >
            <span className="text-[10px] md:text-xs font-inter uppercase tracking-[0.2em]">
              {showCopied ? 'Copied' : 'Copy'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>

          <button 
            onClick={handleSave}
            className="group flex items-center gap-2 hover:text-black transition-all active:scale-95"
            title="Save as text file"
          >
            <span className="text-[10px] md:text-xs font-inter uppercase tracking-[0.2em]">Save</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;

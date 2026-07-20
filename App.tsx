
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Minimalist Scriptum
 * A high-end minimal typing tool with typewriter-inspired aesthetics.
 * Features: Every 6th word is highlighted with a random vibrant color.
 * Features: Auto-capitalization after full stops.
 * Features: Auto-spacing after periods.
 * Features: Precise click-to-edit positioning and keyboard navigation.
 */

const COLORS = [
  '#ff4d4d', // Vibrant Red
  '#2ecc71', // Vibrant Green
  '#3498db', // Vibrant Blue
  '#f39c12', // Orange
  '#ff9ff3', // Pink
  '#9b59b6', // Purple
  '#f1c40f', // Yellow
  '#1abc9c', // Teal
];

const ADJECTIVES = [
  'ethical', 'disclosed', 'quantum', 'neon', 'velvet', 'brutal', 'infinite', 
  'silent', 'broken', 'digital', 'analog', 'liquid', 'solid', 'vague', 
  'hyper', 'cyber', 'spectral', 'cosmic', 'solar', 'lunar', 'atomic', 
  'hidden', 'raw', 'pure', 'lost', 'found', 'bitter', 'sweet', 'rough', 'smooth'
];

const NOUNS = [
  'gravity', 'turbovan', 'syntax', 'static', 'glitch', 'echo', 'pulse', 
  'void', 'monolith', 'prism', 'ghost', 'signal', 'archive', 'protocol', 
  'fragment', 'engine', 'bloom', 'horizon', 'shadow', 'logic', 'dream', 
  'machine', 'forest', 'desert', 'ocean', 'mountain', 'nebula', 'cluster', 
  'node', 'core'
];

const getRandomTitle = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

const App: React.FC = () => {
  const [docName, setDocName] = useState(getRandomTitle);
  const [text, setText] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dateStr] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ','));
  const [pageNumber] = useState('p01');
  const [showCopied, setShowCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Focus capture and cursor sync
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow clicks on buttons, inputs, or the main document name
      if (target.tagName === 'INPUT' || target.closest('button')) return;
      textareaRef.current?.focus();
    };
    window.addEventListener('mousedown', handleGlobalClick);
    textareaRef.current?.focus();
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Auto-scroll to cursor
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [text, cursorPos]);

  const updateCursorPosition = useCallback(() => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionStart);
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    // 1. Auto-space after period logic (enhanced for mid-word editing)
    const lastChar = newText[start - 1];
    if (newText.length > text.length && lastChar === '.' && newText[start - 2] !== '.') {
      // Check if the character following the period isn't already a space
      if (newText[start] !== ' ') {
        newText = newText.slice(0, start) + ' ' + newText.slice(start);
      }
    }

    // 2. Global Auto-capitalization logic
    newText = newText.replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
      return separator + letter.toUpperCase();
    });

    setText(newText);
    
    // Sync state and force textarea selection update in next tick
    setTimeout(() => {
      if (textareaRef.current) {
        // Maintain relative cursor position after transformations
        const diff = newText.length - e.target.value.length;
        textareaRef.current.selectionStart = start + diff;
        textareaRef.current.selectionEnd = end + diff;
        updateCursorPosition();
      }
    }, 0);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const indexStr = target.getAttribute('data-index');
    
    if (indexStr !== null && textareaRef.current) {
      const index = parseInt(indexStr, 10);
      textareaRef.current.selectionStart = index;
      textareaRef.current.selectionEnd = index;
      textareaRef.current.focus();
      updateCursorPosition();
    } else if (textareaRef.current) {
      // Clicked in the whitespace of the main area, go to end
      const end = text.length;
      textareaRef.current.selectionStart = end;
      textareaRef.current.selectionEnd = end;
      textareaRef.current.focus();
      updateCursorPosition();
    }
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

  const handleClear = useCallback(() => {
    setText('');
    setDocName(getRandomTitle());
    setCursorPos(0);
    textareaRef.current?.focus();
  }, []);

  const Cursor = () => (
    <span 
      ref={cursorRef}
      className={`cursor-blink border-b-[3px] ${isDarkMode ? 'border-white' : 'border-black'} inline-block w-4 h-1 -mb-1 transform translate-y-[-4px] mx-[1px]`}
    ></span>
  );

  // Enhanced rendering logic with index-aware spans and mid-text cursor support
  const renderedContent = useMemo(() => {
    const segments = text.split(/(\s+)/);
    let wordCount = 0;
    let charIndex = 0;
    const elements: React.ReactNode[] = [];

    // If cursor is at start
    if (cursorPos === 0) {
      elements.push(<Cursor key="cursor-start" />);
    }

    segments.forEach((segment, segIdx) => {
      const isWhitespace = /\s+/.test(segment);
      let color = 'inherit';
      
      if (!isWhitespace && segment.length > 0) {
        wordCount++;
        if (wordCount % 6 === 0) {
          color = COLORS[Math.floor(wordCount / 6) % COLORS.length];
        }
      }

      const segmentChars = segment.split('').map((char, localIdx) => {
        const currentGlobalIndex = charIndex;
        charIndex++;
        const isLastCharTyped = currentGlobalIndex === text.length - 1;
        
        const node = (
          <span 
            key={`char-${currentGlobalIndex}`}
            data-index={currentGlobalIndex}
            className={`${isLastCharTyped ? 'char-fade' : ''} cursor-text ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
            style={{ color }}
          >
            {char === '\n' ? <br /> : char}
          </span>
        );

        // Check if cursor should be placed after this character
        if (charIndex === cursorPos) {
          return (
            <React.Fragment key={`frag-${currentGlobalIndex}`}>
              {node}
              <Cursor />
            </React.Fragment>
          );
        }
        return node;
      });

      elements.push(<span key={`seg-${segIdx}`}>{segmentChars}</span>);
    });

    return elements;
  }, [text, cursorPos]);

  return (
    <div className={`min-h-screen w-full flex flex-col p-8 md:p-12 lg:p-20 ${isDarkMode ? 'selection:bg-white selection:text-black bg-black text-white/90' : 'selection:bg-black selection:text-white bg-white text-black/90'} transition-colors duration-500 max-w-7xl mx-auto`}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyUp={updateCursorPosition}
        onKeyDown={updateCursorPosition}
        onMouseUp={updateCursorPosition}
        onSelect={updateCursorPosition}
        className="input-capture"
        autoFocus
        spellCheck={false}
      />

      {/* Header Metadata */}
      <header className={`flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'} pb-4 relative`}>
        <div className="text-xl md:text-3xl italic font-medium w-full md:w-auto">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className={`bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-white/20 cursor-text ${isDarkMode ? 'hover:bg-white/5 focus:bg-white/5 text-white' : 'hover:bg-black/5 focus:bg-black/5 text-black'} transition-all rounded px-1 -ml-1 tracking-tight capitalize`}
            placeholder="Document Name"
            title="Edit Document Name"
          />
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex gap-6 text-[10px] md:text-xs font-inter tracking-[0.2em] opacity-40 uppercase whitespace-nowrap">
            <span>{dateStr}</span>
            <span className="opacity-40">{pageNumber}</span>
          </div>
          
          {/* Mode Toggle Switch */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-white/20 focus:ring-white/40' : 'bg-black/10 focus:ring-black/20'}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform duration-300 ${isDarkMode ? 'bg-white translate-x-5' : 'bg-black translate-x-0'}`} />
          </button>
        </div>
      </header>

      {/* Main Text Area */}
      <main 
        className={`flex-grow text-lg md:text-xl lg:text-2xl leading-[1.6] md:leading-[1.7] ${isDarkMode ? 'text-white/90' : 'text-black/90'} font-light break-words relative cursor-text min-h-[50vh] tracking-[0.02em]`}
        onClick={handleContainerClick}
      >
        <div className="inline relative select-none">
          {renderedContent}
        </div>
      </main>

      {/* Subtle Controls */}
      <footer className={`mt-16 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity duration-300 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'} pt-8`}>
        <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-inter">
          {text.length} characters / {text.trim() === '' ? 0 : text.trim().split(/\s+/).length} words
        </div>
        
        <div className="flex gap-8 items-center">
          <button 
            onClick={handleCopy}
            className={`group relative flex items-center gap-2 ${isDarkMode ? 'hover:text-white' : 'hover:text-black'} transition-all active:scale-95`}
            title="Copy to clipboard"
          >
            <span className="text-[9px] md:text-[10px] font-inter uppercase tracking-[0.15em]">
              {showCopied ? 'Copied' : 'Copy'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
 
          <button 
            onClick={handleSave}
            className={`group flex items-center gap-2 ${isDarkMode ? 'hover:text-white' : 'hover:text-black'} transition-all active:scale-95`}
            title="Save as text file"
          >
            <span className="text-[9px] md:text-[10px] font-inter uppercase tracking-[0.15em]">Save</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </button>

          <button 
            onClick={handleClear}
            className={`group flex items-center gap-2 ${isDarkMode ? 'hover:text-white' : 'hover:text-black'} transition-all active:scale-95`}
            title="Clear content and rename"
          >
            <span className="text-[9px] md:text-[10px] font-inter uppercase tracking-[0.15em]">Clear</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;

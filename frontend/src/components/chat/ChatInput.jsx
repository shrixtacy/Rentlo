import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-t border-gray-100">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder="Type a message…"
        className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 bg-background"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="w-10 h-10 rounded-full bg-primary text-dark flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

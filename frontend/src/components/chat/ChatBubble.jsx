import React from 'react';
import { format } from 'date-fns';

export default function ChatBubble({ message, isSent }) {
  const timeStr = message?.createdAt
    ? (() => { try { return format(new Date(message.createdAt), 'h:mm a'); } catch { return ''; } })()
    : '';

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={[
          'max-w-[70%] px-4 py-2.5 text-sm',
          isSent
            ? 'bg-primary text-dark rounded-2xl rounded-br-sm'
            : 'bg-white text-dark rounded-2xl rounded-bl-sm shadow-sm',
        ].join(' ')}
      >
        <p className="break-words">{message?.content || message?.text || ''}</p>
        {timeStr && (
          <p className={`text-[10px] mt-1 ${isSent ? 'text-dark/60 text-right' : 'text-muted text-left'}`}>
            {timeStr}
          </p>
        )}
      </div>
    </div>
  );
}

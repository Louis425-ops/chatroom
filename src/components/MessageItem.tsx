'use client';

import { Message, User } from '@/types';

interface MessageItemProps {
  message: Message;
  currentUser: User;
  onDelete?: () => void;
}

export default function MessageItem({ message, currentUser, onDelete }: MessageItemProps) {
  const isOwnMessage = message.sender === currentUser.username;
  const canDelete = currentUser.isRoot || isOwnMessage;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canDelete && onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className={`mb-4 ${isOwnMessage ? 'text-right' : 'text-left'}`}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`
          inline-block max-w-[70%] min-w-0 rounded-lg px-4 py-2 break-words overflow-wrap-anywhere
          ${isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        {!isOwnMessage && (
          <div className="text-xs font-medium mb-1 opacity-75 break-words">
            {message.sender}
            {currentUser.isRoot && (
              <span className="ml-1 text-red-300">(Root can delete)</span>
            )}
          </div>
        )}
        <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap">{message.content}</div>
        <div 
          className={`
            text-xs mt-1 opacity-75
            ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}
          `}
        >
          {new Date(message.time).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {canDelete && (
            <span className="ml-2">
              (Right-click to delete)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
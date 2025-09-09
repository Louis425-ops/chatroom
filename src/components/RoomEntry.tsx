'use client';

import { RoomPreviewInfo, User } from '@/types';

interface RoomEntryProps {
  room: RoomPreviewInfo;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  currentUser: User;
}

export default function RoomEntry({ 
  room, 
  isSelected, 
  onClick, 
  onDelete,
  currentUser 
}: RoomEntryProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className={`
        p-4 border-b border-gray-200 cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{room.roomName}</h3>
          {room.lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-1">
              <span className="font-medium">{room.lastMessage.sender}:</span>{' '}
              {room.lastMessage.content}
            </p>
          )}
        </div>
        {room.lastMessage && (
          <span className="text-xs text-gray-500">
            {new Date(room.lastMessage.time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
      {currentUser.isRoot && (
        <div className="text-xs text-red-500 mt-1">
          Right-click to delete (Root)
        </div>
      )}
    </div>
  );
}
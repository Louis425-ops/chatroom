'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useAuth } from '@/contexts/AuthContext';
import { getFetcher, postFetcher } from '@/lib/fetcher';
import RoomEntry from '@/components/RoomEntry';
import MessageItem from '@/components/MessageItem';
import type { 
  RoomListRes, 
  RoomMessageListRes, 
  RoomAddArgs, 
  RoomAddRes,
  MessageAddArgs,
  RoomDeleteArgs 
} from '@/types';

export default function ChatRoom() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Fetch rooms with auto-refresh every 1 second
  const { data: roomsData, error: roomsError } = useSWR<RoomListRes>(
    '/api/room/list',
    getFetcher,
    { refreshInterval: 1000 }
  );

  // Fetch messages for selected room with auto-refresh every 1 second
  const { data: messagesData, error: messagesError } = useSWR<RoomMessageListRes>(
    selectedRoomId ? `/api/room/message/list?roomId=${selectedRoomId}` : null,
    getFetcher,
    { refreshInterval: 1000 }
  );

  // Create room mutation
  const { trigger: createRoom, isMutating: isCreatingRoom } = useSWRMutation<RoomAddRes, Error, string, RoomAddArgs>(
    '/api/room/add',
    postFetcher
  );

  // Delete room mutation
  const { trigger: deleteRoom } = useSWRMutation<null, Error, string, RoomDeleteArgs>(
    '/api/room/delete',
    postFetcher
  );

  // Send message mutation
  const { trigger: sendMessage, isMutating: isSendingMessage } = useSWRMutation<null, Error, string, MessageAddArgs>(
    '/api/message/add',
    postFetcher
  );

  // Delete message mutation
  const { trigger: deleteMessage } = useSWRMutation<null, Error, string, { messageId: number }>(
    '/api/message/delete',
    postFetcher
  );

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRoomName.trim()) return;

    try {
      const result = await createRoom({ user: user.username, roomName: newRoomName.trim() });
      setNewRoomName('');
      setShowNewRoomForm(false);
      setSelectedRoomId(result.roomId);
      mutate('/api/room/list'); // Refresh rooms list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!user) return;
    
    const confirmed = confirm('Are you sure you want to delete this room?');
    if (!confirmed) return;

    try {
      await deleteRoom({ user: user.username, roomId });
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }
      mutate('/api/room/list'); // Refresh rooms list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete room');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRoomId || !message.trim()) return;

    try {
      await sendMessage({
        roomId: selectedRoomId,
        content: message.trim(),
        sender: user.username,
      });
      setMessage('');
      mutate(`/api/room/message/list?roomId=${selectedRoomId}`); // Refresh messages
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    const confirmed = confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      await deleteMessage({ messageId });
      mutate(`/api/room/message/list?roomId=${selectedRoomId}`); // Refresh messages
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting to login...</div>
      </div>
    );
  }

  const selectedRoom = roomsData?.rooms.find(room => room.roomId === selectedRoomId);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - Rooms */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Chat Rooms</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {user.username} {user.isRoot && '(Root)'}
              </span>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Add Room Button */}
          <button
            onClick={() => setShowNewRoomForm(true)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
          >
            + Add Room
          </button>

          {/* New Room Form */}
          {showNewRoomForm && (
            <form onSubmit={handleCreateRoom} className="mt-2">
              <input
                type="text"
                placeholder="Room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isCreatingRoom || !newRoomName.trim()}
                  className="flex-1 bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 text-xs disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewRoomForm(false);
                    setNewRoomName('');
                  }}
                  className="flex-1 bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {roomsError && (
            <div className="p-4 text-red-600">
              Error loading rooms: {roomsError.message}
            </div>
          )}
          {roomsData?.rooms.length === 0 && (
            <div className="p-4 text-gray-500 text-center">
              No rooms yet. Create one to start chatting!
            </div>
          )}
          {roomsData?.rooms.map(room => (
            <RoomEntry
              key={room.roomId}
              room={room}
              isSelected={selectedRoomId === room.roomId}
              onClick={() => setSelectedRoomId(room.roomId)}
              onDelete={() => handleDeleteRoom(room.roomId)}
              currentUser={user}
            />
          ))}
        </div>
      </div>

      {/* Right Content - Chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold">{selectedRoom.roomName}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-w-0">
              {messagesError && (
                <div className="text-red-600 text-center">
                  Error loading messages: {messagesError.message}
                </div>
              )}
              {messagesData?.messages.length === 0 && (
                <div className="text-gray-500 text-center">
                  No messages yet. Be the first to say something!
                </div>
              )}
              {messagesData?.messages.map(msg => (
                <MessageItem
                  key={msg.messageId}
                  message={msg}
                  currentUser={user}
                  onDelete={() => handleDeleteMessage(msg.messageId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !message.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <h2 className="text-xl mb-2">Welcome to Chat Room!</h2>
              <p>Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
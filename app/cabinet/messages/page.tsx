'use client';

import { useState } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listingTitle: string;
  listingImage: string;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    userName: 'Əli Məmmədov',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'Qiymət son deyilmi?',
    lastMessageTime: '10:30',
    unreadCount: 2,
    listingTitle: 'iPhone 14 Pro Max',
    listingImage: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100'
  },
  {
    id: '2',
    userName: 'Leyla İbrahimova',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Mənzili görməyə gələ bilərəm?',
    lastMessageTime: 'Dünən',
    unreadCount: 0,
    listingTitle: 'Mərkəzdə 3 otaqlı mənzil',
    listingImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'
  },
  {
    id: '3',
    userName: 'Orxan Əliyev',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Maşın yaxşı vəziyyətdədir?',
    lastMessageTime: '12.08.2024',
    unreadCount: 0,
    listingTitle: 'Chevrolet Camaro, 2015',
    listingImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Salam, elanınızla maraqlanıram',
    senderId: 'other',
    timestamp: '10:25',
    isOwn: false
  },
  {
    id: '2',
    text: 'Salam, buyurun',
    senderId: 'own',
    timestamp: '10:26',
    isOwn: true
  },
  {
    id: '3',
    text: 'Qiymət son deyilmi?',
    senderId: 'other',
    timestamp: '10:30',
    isOwn: false
  }
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(mockConversations[0]?.id);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const currentConversation = mockConversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      senderId: 'own',
      timestamp: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-12rem)]">
              <div className="flex h-full">
                {/* Conversations List */}
                <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-gray-900 text-xl font-bold">
                      Mesajlar
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {mockConversations.map(conversation => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-4 flex items-start gap-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url("${conversation.userAvatar}")` }}
                        />

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-gray-900 font-semibold text-sm truncate">
                              {conversation.userName}
                            </p>
                            <span className="text-gray-500 text-xs flex-shrink-0">
                              {conversation.lastMessageTime}
                            </span>
                          </div>

                          <p className="text-gray-500 text-xs mb-1 truncate">
                            {conversation.listingTitle}
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-gray-500 text-sm truncate flex-1">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="hidden md:flex flex-1 flex-col">
                  {currentConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${currentConversation.userAvatar}")` }}
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-semibold">
                            {currentConversation.userName}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {currentConversation.listingTitle}
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  message.isOwn
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${
                                message.isOwn ? 'text-right' : 'text-left'
                              }`}>
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Mesaj yazın..."
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="bg-primary text-white rounded-lg px-6 py-2 font-semibold hover:bg-primary-dark transition-colors"
                          >
                            Göndər
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-6xl mb-4">chat_bubble</span>
                        <p>Söhbət seçin</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

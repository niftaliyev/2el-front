'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { chatService, ChatListItem, ChatDetail, ChatMessage } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { az, ru, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F4F7FE]">
        <div className="size-12 border-[4px] border-primary/20 border-t-primary animate-spin rounded-full"></div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

function MessagesPageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive: boolean;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
    isDestructive: false
  });
  const selectedChatIdRef = useRef<string | null>(null);
  const initialLoadDone = useRef(false);
  const scrollInitialized = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getLocale = () => {
    switch (language) {
      case 'az': return az;
      case 'ru': return ru;
      default: return enUS;
    }
  };

  // Sync ref with state for use inside callbacks
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);
    loadConversations();

    // SignalR connection setup (once)
    chatService.startConnection().then(() => {
      chatService.onMessageReceived((chatId: string, message: ChatMessage) => {
        const currentSelected = selectedChatIdRef.current;

        if (chatId === currentSelected) {
          setChatDetail((prev: ChatDetail | null) => {
            if (!prev) return null;
            const messages = [...prev.messages];
            // Prevent duplicate messages or replace optimistic one
            const tempIndex = messages.findIndex(m => m.id.startsWith('temp-') && m.text === message.text);
            if (tempIndex !== -1) {
              messages[tempIndex] = message;
              return { ...prev, messages };
            }
            if (messages.some(m => m.id === message.id)) return prev;
            return { ...prev, messages: [...messages, message] };
          });
          // If message is not from me, mark it as read ONLY if the window is focused
          if (message.senderId !== authService.getUser()?.id && document.hasFocus()) {
            chatService.markAsRead(chatId);
          }
          setIsOtherUserTyping(false);
        } else {
          setConversations((prev: ChatListItem[]) => {
            const chatExists = prev.some(c => c.chatId === chatId);
            if (!chatExists) {
              loadConversations();
              return prev;
            }
            return prev.map(c =>
              c.chatId === chatId ? { ...c, lastMessage: message.text, lastMessageDate: message.createdDate, unreadCount: c.unreadCount + 1 } : c
            );
          });
        }
      });

      chatService.onMessagesRead((chatId: string, userId: string) => {
        if (chatId === selectedChatIdRef.current) {
          setChatDetail((prev: ChatDetail | null) => prev ? {
            ...prev,
            messages: prev.messages.map(m => m.isSelf ? { ...m, isRead: true } : m)
          } : null);
        }
      });

      chatService.onUserOnline((userId: string) => {
        setConversations((prev: ChatListItem[]) => prev.map(c => c.otherUserId === userId ? { ...c, isOtherUserOnline: true } : c));
        if (chatDetail?.otherUserId === userId) {
          setChatDetail(prev => prev ? { ...prev, isOtherUserOnline: true } : null);
        }
      });

      chatService.onUserOffline((userId: string) => {
        setConversations((prev: ChatListItem[]) => prev.map(c => c.otherUserId === userId ? { ...c, isOtherUserOnline: false } : c));
        if (chatDetail?.otherUserId === userId) {
          setChatDetail(prev => prev ? { ...prev, isOtherUserOnline: false } : null);
        }
      });

      chatService.onUserTyping((chatId: string, userId: string) => {
        if (chatId === selectedChatIdRef.current) {
          setIsOtherUserTyping(true);
          // Auto-clear typing after 3 seconds
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherUserTyping(false), 3000);
        }
      });

      chatService.onMessageSent((chatId: string, message: ChatMessage) => {
        if (chatId === selectedChatIdRef.current) {
          setChatDetail((prev: ChatDetail | null) => {
            if (!prev) return null;
            const messages = [...prev.messages];
            // Replace optimistic message (temp ID) with real one
            const tempIndex = messages.findIndex(m => m.id.startsWith('temp-') && m.text === message.text);
            if (tempIndex !== -1) {
              messages[tempIndex] = message;
              return { ...prev, messages };
            }
            if (messages.some(m => m.id === message.id)) return prev;
            return { ...prev, messages: [...messages, message] };
          });
        }
      });

      chatService.onUnreadCountUpdate((count: number) => {
        window.dispatchEvent(new CustomEvent('unreadCountUpdate', { detail: count }));
      });
    });

    return () => {
      chatService.stopConnection();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Handle direct chat from ad or chatId from URL
  useEffect(() => {
    const sellerId = searchParams.get('sellerId');
    const adId = searchParams.get('adId');
    const urlChatId = searchParams.get('chatId');

    if (urlChatId) {
      setSelectedChatId(urlChatId);
      // Ensure the chat is in our list, otherwise refresh
      if (conversations.length > 0 && !conversations.some(c => c.chatId === urlChatId)) {
        loadConversations();
      }
    } else if (sellerId) {
      const initDirectChat = async () => {
        try {
          const newChat = await chatService.startChat(sellerId, adId || undefined);
          // Refresh conversations to include the new one if it's new
          const updatedConversations = await chatService.getChats();
          setConversations(updatedConversations);
          setSelectedChatId(newChat.chatId);
        } catch (err) {
          console.error('Error starting chat from ad:', err);
        }
      };
      initDirectChat();
    }
  }, [searchParams, router, t]);

  // Mark as read when focusing the window
  useEffect(() => {
    const handleFocus = () => {
      if (selectedChatId && document.hasFocus()) {
        chatService.markAsRead(selectedChatId);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedChatId]);

  // Load chat detail when selection changes
  useEffect(() => {
    if (selectedChatId) {
      setPage(1);
      setHasMore(true);
      scrollInitialized.current = false;
      loadChatDetail(selectedChatId, 1, true);
    } else {
      setChatDetail(null);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (page === 1 && chatDetail?.messages) {
      // Use a small timeout to ensure the DOM has updated and images have started loading
      const timer = setTimeout(() => {
        const behavior = scrollInitialized.current ? 'smooth' : 'instant';
        scrollToBottom(behavior);

        // If it was the first load, we might need a second instant scroll 
        // to account for any layout shifts after a few ms
        if (!scrollInitialized.current) {
          setTimeout(() => scrollToBottom('instant'), 100);
          scrollInitialized.current = true;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [chatDetail?.messages]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getChats();
      setConversations(data);
    } catch (err) {
      console.error(err);
      toast.error(t('cabinet.messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatDetail = async (chatId: string, pageNum: number = 1, isInitial: boolean = false) => {
    try {
      const data = await chatService.getChat(chatId, pageNum);

      if (isInitial) {
        setChatDetail(data);
        // Reset unread count locally
        setConversations(prev => prev.map(c => c.chatId === chatId ? { ...c, unreadCount: 0 } : c));
        // Notify server we read it (only if window is focused or we actively clicked it)
        if (document.hasFocus()) {
          chatService.markAsRead(chatId);
        }
      } else {
        if (data.messages.length === 0) {
          setHasMore(false);
        } else {
          // Prepend messages for infinite scroll
          setChatDetail(prev => prev ? {
            ...prev,
            messages: [...data.messages, ...prev.messages]
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(t('cabinet.messages.chatLoadError'));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoading && selectedChatId) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadChatDetail(selectedChatId, nextPage);
    }
  };

  const handleTyping = () => {
    if (!selectedChatId) return;

    if (!isTyping) {
      setIsTyping(true);
      chatService.sendTypingNotification(selectedChatId);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && pendingImages.length === 0) || !selectedChatId || isSending) return;

    try {
      setIsSending(true);
      const messageType = pendingImages.length > 0 ? 1 : 0;

      // Temporary optimistic ID
      const tempId = `temp-${Date.now()}`;
      const newMessage: ChatMessage = {
        id: tempId,
        text: messageInput,
        imageUrls: pendingImages,
        messageType: messageType,
        isSelf: true,
        senderId: currentUser.id,
        createdDate: new Date().toISOString(),
        isRead: false
      };

      // Optimistic update
      setChatDetail(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);

      setConversations(prev => prev.map(c =>
        c.chatId === selectedChatId ? { ...c, lastMessage: messageInput || t('common.image'), lastMessageDate: newMessage.createdDate } : c
      ));

      const inputBackup = messageInput;
      const imagesBackup = pendingImages;

      setMessageInput('');
      setPendingImages([]);

      await chatService.sendMessage(selectedChatId, inputBackup, imagesBackup, messageType);
    } catch (err) {
      console.error(err);
      toast.error(t('cabinet.messages.messageSendError'));
      // Rollback on error could be added here
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedChatId) return;

    const formData = new FormData();
    let hasValidFiles = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('cabinet.messages.imageTooLarge', { name: file.name }));
        continue;
      }
      formData.append('files', file);
      hasValidFiles = true;
    }

    if (!hasValidFiles) return;

    try {
      toast.loading(t('common.loading'));

      const response = await axiosInstance.post<string[]>('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPendingImages((prev: string[]) => [...prev, ...response.data]);
      toast.dismiss();
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error(t('cabinet.messages.imageUploadError'));
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;

    setConfirmModal({
      isOpen: true,
      title: t('cabinet.messages.deleteChat'),
      description: t('cabinet.messages.deleteConfirm'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          await chatService.deleteChat(selectedChatId);
          setConversations((prev: ChatListItem[]) => prev.filter(c => c.chatId !== selectedChatId));
          setSelectedChatId(null);
          toast.success(t('common.delete'));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(t('common.error'));
        } finally {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const handleBlockUser = async () => {
    if (!chatDetail?.otherUserId) return;
    const isBlocked = chatDetail.isBlockedByMe;
    const confirmTitle = isBlocked
      ? t('cabinet.messages.unblockUser')
      : t('cabinet.messages.blockUser');
    const confirmDescription = isBlocked
      ? t('cabinet.messages.unblockConfirm')
      : t('cabinet.messages.blockConfirm');

    setConfirmModal({
      isOpen: true,
      title: confirmTitle,
      description: confirmDescription,
      isDestructive: !isBlocked,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          if (isBlocked) {
            await chatService.unblockUser(chatDetail.otherUserId);
            toast.success(t('cabinet.messages.unblockUser'));
          } else {
            await chatService.blockUser(chatDetail.otherUserId);
            toast.success(t('cabinet.messages.blockUser'));
          }
          loadChatDetail(selectedChatId!);
          setShowMenu(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(t('common.error'));
        } finally {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior
      });
    }
    // Redundancy
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen font-bold text-primary animate-pulse">{t('common.loading')}</div>;
  }

  return (
    <main className="bg-[#F4F7FE] min-h-screen md:h-[100dvh] font-sans flex flex-col overflow-x-hidden selection:bg-primary/20">
      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto md:py-6 md:px-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">

          {/* User Sidebar */}
          <div className="hidden md:block flex-shrink-0">
            <UserSidebar />
          </div>

          <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
            <div className={`bg-white rounded-none md:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isMobile && selectedChatId ? 'fixed inset-0 z-[150]' : 'relative'}`}>
              <div className="flex flex-1 overflow-hidden">

                {/* Conversations List */}
                <div className={`${(isMobile && selectedChatId) ? 'hidden' : 'flex'} w-full md:w-[380px] lg:w-[420px] border-r border-gray-100/80 flex-col bg-white z-20`}>
                  <div className="px-6 py-8 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-gray-900 text-2xl font-black tracking-tight">{t('cabinet.messages.title')}</h1>
                      <div className="bg-primary/10 text-primary p-2 rounded-xl">
                        <span className="material-symbols-outlined">forum</span>
                      </div>
                    </div>
                    <div className="flex bg-[#F4F7FE] p-1.5 rounded-2xl">
                      {(['all', 'buying', 'selling'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-2.5 text-[12px] font-black rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {t(`cabinet.messages.tabs.${tab}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide bg-white px-3 pb-6">
                    {conversations
                      .filter(c => {
                        if (activeTab === 'buying') return !c.isOwner;
                        if (activeTab === 'selling') return c.isOwner;
                        return true;
                      })
                      .length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center gap-6 mt-10">
                        <div className="size-24 bg-[#F4F7FE] rounded-[32px] flex items-center justify-center text-gray-300 transform rotate-12">
                          <span className="material-symbols-outlined !text-[48px]">chat_bubble</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-black text-lg">
                            {t('cabinet.messages.noMessages')}
                          </p>
                          <p className="text-gray-400 text-xs font-medium max-w-[200px] mx-auto">
                            {activeTab === 'all' ? t('cabinet.messages.chatDesc') : activeTab === 'buying' ? t('cabinet.messages.noMessagesBuying') : t('cabinet.messages.noMessagesSelling')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {conversations
                          .filter(c => {
                            if (activeTab === 'buying') return !c.isOwner;
                            if (activeTab === 'selling') return c.isOwner;
                            return true;
                          })
                          .map(conversation => (
                            <button
                              key={conversation.chatId}
                              onClick={() => setSelectedChatId(conversation.chatId)}
                              className={`w-full p-4 flex items-start gap-4 rounded-3xl transition-all duration-300 cursor-pointer relative group mb-1 ${selectedChatId === conversation.chatId ? 'bg-primary shadow-[0_12px_24px_rgba(var(--primary-rgb),0.2)]' : 'hover:bg-[#F4F7FE]'}`}
                            >
                              <div className="relative flex-shrink-0">
                                <div className={`size-14 rounded-2xl bg-gray-100 border-2 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 ${selectedChatId === conversation.chatId ? 'border-white/30' : 'border-white'}`}>
                                  {conversation.isStore && conversation.storeLogo ? (
                                    <img src={getImageUrl(conversation.storeLogo)} alt="" className="w-full h-full object-cover" />
                                  ) : conversation.otherUserPhoto ? (
                                    <img src={getImageUrl(conversation.otherUserPhoto)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className={`w-full h-full flex items-center justify-center font-black text-xl uppercase ${selectedChatId === conversation.chatId ? 'text-white/50' : 'text-gray-300'}`}>
                                      {(conversation.isStore ? conversation.storeName : conversation.otherUserName)?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                {conversation.isOtherUserOnline && (
                                  <div className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 shadow-sm ${selectedChatId === conversation.chatId ? 'bg-green-400 border-primary' : 'bg-green-500 border-white'}`}></div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-1">
                                  <p className={`text-[15px] font-black truncate ${selectedChatId === conversation.chatId ? 'text-white' : 'text-gray-900'}`}>
                                    {conversation.isStore ? conversation.storeName : conversation.otherUserName}
                                  </p>
                                  <span className={`text-[10px] font-bold whitespace-nowrap ml-2 ${selectedChatId === conversation.chatId ? 'text-white/70' : 'text-gray-400'}`}>
                                    {conversation.lastMessageDate ? formatDistanceToNow(new Date(conversation.lastMessageDate), { addSuffix: false, locale: getLocale() }) : ''}
                                  </span>
                                </div>

                                {conversation.adTitle && (
                                  <div className={`flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-lg w-fit ${selectedChatId === conversation.chatId ? 'bg-white/10' : 'bg-primary/5'}`}>
                                    <p className={`text-[9px] truncate font-black uppercase tracking-wider ${selectedChatId === conversation.chatId ? 'text-white/90' : 'text-primary'}`}>
                                      {conversation.adTitle}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-[13px] truncate flex-1 leading-snug font-medium ${selectedChatId === conversation.chatId ? 'text-white/80' : conversation.unreadCount > 0 ? 'text-gray-900 font-black' : 'text-gray-500'}`}>
                                    {conversation.lastMessage || t('cabinet.messages.newChat')}
                                  </p>
                                  {conversation.unreadCount > 0 && selectedChatId !== conversation.chatId && (
                                    <span className="bg-primary text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 ring-2 ring-white">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-white transition-all duration-500 ${(isMobile && !selectedChatId) ? 'hidden' : 'flex'} min-w-0`}>
                  {chatDetail ? (
                    <div className="flex flex-col h-full overflow-hidden min-w-0">
                      {/* Chat Header */}
                      <header className="flex-shrink-0 px-6 py-4 md:py-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl z-30 flex items-center justify-between shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-4 min-w-0">
                          <button
                            onClick={() => setSelectedChatId(null)}
                            className="md:hidden size-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all cursor-pointer active:scale-90"
                          >
                            <span className="material-symbols-outlined !text-[32px] text-gray-700">chevron_left</span>
                          </button>

                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="size-12 sm:size-14 rounded-2xl bg-gray-50 border-2 border-white shadow-sm overflow-hidden">
                                {chatDetail.isStore && chatDetail.storeLogo ? (
                                  <img src={getImageUrl(chatDetail.storeLogo)} alt="" className="w-full h-full object-cover" />
                                ) : chatDetail.otherUserPhoto ? (
                                  <img src={getImageUrl(chatDetail.otherUserPhoto)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase">
                                    {(chatDetail.isStore ? chatDetail.storeName : chatDetail.otherUserName)?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              {chatDetail.isOtherUserOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 size-4.5 bg-green-500 border-[3px] border-white rounded-full shadow-sm"></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-gray-900 font-black text-[16px] sm:text-lg leading-tight truncate">
                                {chatDetail.isStore ? chatDetail.storeName : chatDetail.otherUserName}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${chatDetail.isOtherUserOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                  {chatDetail.isOtherUserOnline ? t('cabinet.messages.online') : t('cabinet.messages.offline')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                          {chatDetail.adId && (
                            <Link
                              href={`/elanlar/${chatDetail.adId}`}
                              className="hidden lg:flex items-center gap-4 p-2 pr-6 hover:bg-[#F4F7FE] rounded-2xl transition-all border border-gray-100 group max-w-[320px] bg-white shadow-sm"
                            >
                              <div className="size-11 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                                {chatDetail.adImageUrl ? (
                                  <img src={getImageUrl(chatDetail.adImageUrl)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <span className="material-symbols-outlined !text-[20px]">image</span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] text-gray-900 font-black truncate group-hover:text-primary transition-colors">{chatDetail.adTitle}</p>
                                <p className="text-[13px] text-primary font-black mt-0.5">{chatDetail.adPrice} ₼</p>
                              </div>
                            </Link>
                          )}

                          <div className="relative" ref={menuRef}>
                            <button
                              onClick={() => setShowMenu(!showMenu)}
                              className="size-11 sm:size-12 flex items-center justify-center hover:bg-gray-50 border border-gray-100 rounded-xl text-gray-400 transition-all cursor-pointer active:scale-90"
                            >
                              <span className="material-symbols-outlined !text-[28px]">more_horiz</span>
                            </button>

                            {showMenu && (
                              <>
                                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100 py-3 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                                  <button
                                    onClick={() => {
                                      window.open(`/elanlar?userId=${chatDetail.otherUserId}`, '_blank');
                                      setShowMenu(false);
                                    }}
                                    className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-[#F4F7FE] flex items-center gap-4 transition-colors font-black"
                                  >
                                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                      <span className="material-symbols-outlined !text-[22px]">account_circle</span>
                                    </div>
                                    {t('cabinet.messages.userAds')}
                                  </button>
                                  {chatDetail.adId && (
                                    <button
                                      onClick={() => {
                                        window.open(`/elanlar/${chatDetail.adId}`, '_blank');
                                        setShowMenu(false);
                                      }}
                                      className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-[#F4F7FE] flex items-center gap-4 transition-colors font-black"
                                    >
                                      <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-outlined !text-[22px]">visibility</span>
                                      </div>
                                      {t('cabinet.messages.viewAd')}
                                    </button>
                                  )}
                                  <button
                                    onClick={handleBlockUser}
                                    className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-[#F4F7FE] flex items-center gap-4 transition-colors font-black"
                                  >
                                    <div className={`size-10 rounded-xl flex items-center justify-center ${chatDetail.isBlockedByMe ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                                      <span className="material-symbols-outlined !text-[22px]">
                                        {chatDetail.isBlockedByMe ? 'lock_open' : 'block'}
                                      </span>
                                    </div>
                                    {chatDetail.isBlockedByMe ? t('cabinet.messages.unblockUser') : t('cabinet.messages.blockUser')}
                                  </button>
                                  <div className="h-px bg-gray-50 my-2 mx-6"></div>
                                  <button
                                    onClick={handleDeleteChat}
                                    className="w-full text-left px-6 py-4 text-sm text-red-600 hover:bg-red-50 flex items-center gap-4 transition-colors font-black"
                                  >
                                    <div className="size-10 rounded-xl bg-red-50/50 flex items-center justify-center text-red-500">
                                      <span className="material-symbols-outlined !text-[22px]">delete_forever</span>
                                    </div>
                                    {t('cabinet.messages.deleteChat')}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </header>

                      {/* Mobile Ad Info Bar */}
                      {isMobile && chatDetail.adId && (
                        <Link
                          href={`/elanlar/${chatDetail.adId}`}
                          className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100 active:bg-gray-50 transition-colors flex-shrink-0"
                        >
                          <div className="size-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                            {chatDetail.adImageUrl ? (
                              <img src={getImageUrl(chatDetail.adImageUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200 text-[18px]">
                                <span className="material-symbols-outlined">image</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-gray-900 font-black truncate leading-tight">{chatDetail.adTitle}</p>
                            <p className="text-[12px] text-primary font-black mt-0.5">{chatDetail.adPrice} ₼</p>
                          </div>
                          <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
                          </div>
                        </Link>
                      )}

                      {/* Messages Area */}
                      <div
                        ref={chatScrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-[#F4F7FE]/30 custom-scrollbar"
                      >
                        {hasMore && chatDetail.messages.length >= 50 && (
                          <div className="flex justify-center py-4">
                            <div className="size-10 border-[3px] border-primary/10 border-t-primary animate-spin rounded-full"></div>
                          </div>
                        )}

                        {chatDetail.messages.map((message, index) => {
                          const showDate = index === 0 ||
                            new Date(message.createdDate).toDateString() !== new Date(chatDetail.messages[index - 1].createdDate).toDateString();

                          return (
                            <React.Fragment key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-10 first:mt-2">
                                  <div className="bg-white px-6 py-2 rounded-2xl text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] shadow-sm border border-gray-100/50">
                                    {new Date(message.createdDate).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU', { day: 'numeric', month: 'long' })}
                                  </div>
                                </div>
                              )}
                              <div className={`flex ${message.isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`max-w-[85%] md:max-w-[65%] group relative`}>
                                  <div
                                    className={`relative rounded-[24px] px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md ${message.isSelf
                                      ? 'bg-primary text-white rounded-tr-none'
                                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-100/80'
                                      }`}
                                  >
                                    {message.imageUrls && message.imageUrls.length > 0 && (
                                      <div className={`grid gap-3 mb-4 ${message.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {message.imageUrls.map((url: string, i: number) => (
                                          <div key={i} className="relative group overflow-hidden rounded-2xl bg-gray-50 border border-black/5 aspect-square shadow-inner">
                                            <img
                                              src={getImageUrl(url)}
                                              alt=""
                                              className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-700"
                                              onClick={() => window.open(getImageUrl(url), '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {message.text && (
                                      <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
                                    )}
                                    <div className={`flex items-center justify-end gap-2 mt-3 ${message.isSelf ? 'text-white/60' : 'text-gray-400'}`}>
                                      <span className="text-[10px] font-black tracking-wider opacity-80 uppercase">
                                        {new Date(message.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {message.isSelf && (
                                        <div className="flex">
                                          {message.isRead ? (
                                            <span className="material-symbols-outlined !text-[16px] text-white animate-in zoom-in duration-300">done_all</span>
                                          ) : (
                                            <span className="material-symbols-outlined !text-[16px] opacity-70">done</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        {isOtherUserTyping && (
                          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-4">
                              <div className="flex gap-1.5">
                                <div className="size-2 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                                <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                              </div>
                              <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest">{t('cabinet.messages.isTyping')}</span>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Footer Area */}
                      <footer className="flex-shrink-0 bg-white border-t border-gray-100/50 pb-safe z-30 w-full max-w-[100vw] overflow-hidden min-w-0">
                        {(chatDetail.isBlockedByMe || chatDetail.hasBlockedMe) ? (
                          <div className="p-10 md:p-16 text-center flex flex-col items-center gap-6 bg-gray-50/30">
                            <div className="size-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center shadow-[inset_0_4px_12px_rgba(239,68,68,0.1)] transform -rotate-12">
                              <span className="material-symbols-outlined !text-[44px]">lock</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-900 text-lg font-black tracking-tight">
                                {chatDetail.isBlockedByMe ? t('cabinet.messages.blockUser') : t('cabinet.messages.hasBlockedMe')}
                              </p>
                              <p className="text-gray-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                                {chatDetail.isBlockedByMe
                                  ? t('cabinet.messages.blockedByMe')
                                  : t('cabinet.messages.hasBlockedMe')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col min-w-0 w-full max-w-[100vw] overflow-hidden min-h-0">
                            {/* Quick Replies */}
                            {chatDetail.messages.length === 0 && !messageInput && (
                              <div className="w-full border-b border-gray-50 bg-[#F4F7FE]/20 overflow-x-auto scrollbar-hide">
                                <div className="suggestions-scroll-container scrollbar-hide touch-pan-x px-6 py-4">
                                  {[t('common.isStillAvailable'), t('common.isNegotiable'), t('common.hasDelivery'), t('common.whereToMeet')].map((text) => (
                                    <button
                                      key={text}
                                      onClick={() => setMessageInput(text)}
                                      className="text-[12px] font-black bg-white hover:bg-primary hover:text-white px-5 py-3 rounded-2xl transition-all duration-300 border border-gray-100 whitespace-nowrap shadow-sm cursor-pointer active:scale-95"
                                    >
                                      {text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Image Previews */}
                            {pendingImages.length > 0 && (
                              <div className="px-6 py-6 flex flex-wrap gap-4 border-b border-gray-50 bg-white animate-in slide-in-from-bottom-6 duration-500">
                                {pendingImages.map((url: string, index: number) => (
                                  <div key={index} className="relative size-28 rounded-[24px] overflow-hidden border-2 border-primary/10 shadow-lg group">
                                    <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removePendingImage(index)}
                                      className="absolute top-2 right-2 size-8 bg-white/90 backdrop-blur-xl text-red-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-75"
                                    >
                                      <span className="material-symbols-outlined !text-[20px]">close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 md:p-8">
                              <div className={`flex gap-2 sm:gap-4 items-center bg-[#F4F7FE] p-1.5 sm:p-2.5 rounded-[24px] sm:rounded-[32px] border-2 transition-all duration-500 ${isSending ? 'opacity-70 pointer-events-none' : 'focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-[0_24px_48px_rgba(var(--primary-rgb),0.1)]'}`}>
                                <div className="flex-shrink-0">
                                  <input
                                    type="file"
                                    id="chat-image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                  />
                                  <label
                                    htmlFor="chat-image-upload"
                                    className="size-11 sm:size-14 bg-white hover:bg-primary/5 text-gray-400 hover:text-primary rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm border border-gray-100 active:scale-90"
                                  >
                                    <span className="material-symbols-outlined !text-[24px] sm:!text-[32px]">add_photo_alternate</span>
                                  </label>
                                </div>
                                <textarea
                                  value={messageInput}
                                  onChange={(e) => {
                                    setMessageInput(e.target.value);
                                    handleTyping();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                  placeholder={t('cabinet.messages.inputPlaceholder')}
                                  className="flex-1 bg-transparent px-2 sm:px-3 py-2.5 sm:py-4 text-[15px] sm:text-base text-gray-900 focus:outline-none transition-all resize-none max-h-40 min-h-[44px] sm:min-h-[56px] custom-scrollbar font-bold placeholder:text-gray-400 leading-tight sm:leading-relaxed"
                                  rows={1}
                                />
                                <button
                                  onClick={handleSendMessage}
                                  disabled={(!messageInput.trim() && pendingImages.length === 0) || isSending}
                                  className={`size-11 sm:size-14 rounded-xl sm:rounded-2xl transition-all duration-500 flex-shrink-0 flex items-center justify-center shadow-xl active:scale-95 group ${(!messageInput.trim() && pendingImages.length === 0)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-tr from-primary to-primary-dark text-white hover:shadow-primary/30 hover:-translate-y-0.5'}`}
                                >
                                  {isSending ? (
                                    <div className="size-6 sm:size-7 border-3 border-white/30 border-t-white animate-spin rounded-full"></div>
                                  ) : (
                                    <div className="relative size-full flex items-center justify-center">
                                      <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-xl sm:rounded-2xl transition-transform duration-500"></div>
                                      <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`sm:w-7 sm:h-7 transition-all duration-500 ${(!messageInput.trim() && pendingImages.length === 0) ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12'}`}
                                      >
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </footer>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#F4F7FE]/50 to-transparent"></div>
                      <div className="relative mb-12">
                        <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-[2]"></div>
                        <div className="relative size-48 bg-white rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.1)] flex items-center justify-center animate-float">
                          <div className="absolute -top-4 -right-4 size-16 bg-primary/10 rounded-[20px] backdrop-blur-xl flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-primary !text-[32px]">auto_awesome</span>
                          </div>
                          <span className="material-symbols-outlined text-primary/10 text-[100px]">forum</span>
                          <div className="absolute -bottom-6 -left-6 size-20 bg-primary shadow-2xl shadow-primary/40 rounded-[24px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white !text-[36px]">message</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative space-y-4 max-w-sm">
                        <h3 className="text-gray-900 text-4xl font-black tracking-tight leading-tight">{t('cabinet.messages.selectChat')}</h3>
                        <p className="text-gray-400 text-[15px] font-bold leading-relaxed">
                          {t('cabinet.messages.chatDesc')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .suggestions-scroll-container {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          gap: 12px;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-x !important;
          cursor: grab;
          user-select: none;
        }
        .suggestions-scroll-container:active {
          cursor: grabbing;
        }
        .suggestions-scroll-container > button {
          flex: 0 0 auto !important;
        }
        :root {
          --primary-rgb: 61, 120, 200;
        }
      `}</style>
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
      />
    </main>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

const raw = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!raw) {
  throw new Error('BACKEND_URL is not defined');
}

const BACKEND_URL = raw.startsWith('http')
  ? raw
  : `https://${raw}`;


const API_URL = `${BACKEND_URL}`;
const WS_URL = `${BACKEND_URL}/ws-chat`;

interface User {
  userId: number;
  realname: string;
  avatarUrl: string;
}

interface Friend {
  friendId: number;
  friendRealname: string;
  avatarUrl: string;
  status: number;
}

interface FriendRequest {
  relationId: number;
  friendId: number;
  friendRealname: string;
  avatarUrl: string;
  status: number;
  create_at: string;
}

interface Message {
  userId: number;
  friendId?: number;
  content: string;
  create_at: string;
  roomId?: string;
  realname?: string;
  avatarUrl?: string;
}

interface Group {
  groupId: number;
  name: string;
  avatarUrl: string;
  description: string;
  ownerId: number;
}

// View hiển thị ở panel bên phải khi chưa mở cuộc trò chuyện nào
type PanelView = 'welcome' | 'discover' | 'requests' | 'friends' | 'groups';

export default function SocialNetworkPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chatPartner, setChatPartner] = useState<Friend | null>(null);
  const [chatGroup, setChatGroup] = useState<Group | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [panelView, setPanelView] = useState<PanelView>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupAvatarUrl, setNewGroupAvatarUrl] = useState('');
  const [newGroupMaxMember, setNewGroupMaxMember] = useState(50);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.access_token || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCurrentUser({
          userId: parsed.auth_id,
          username: parsed.sessionId,
          realname: parsed.sessionId,
          role: parsed.role
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchAllUsers();
    fetchFriends();
    fetchSentRequests();
    fetchIncomingRequests();
    fetchGroups();

    const token = getToken();
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      extraHeaders: { 'authorization': `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('chatMessage', (data: any) => {
      setMessages(prev => [...prev, {
        userId: data.userId,
        content: data.content,
        create_at: data.timestamp || new Date().toISOString(),
        roomId: data.roomId,
        realname: data.realname,
        avatarUrl: data.avatarUrl,
      }]);
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket error:', error);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/all-user`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setAllUsers(data.userTraVe || data.userTrade || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${API_URL}/social_network/all-friend`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setFriends(data.friendInfo || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/social_network/sent-friend`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setSentRequests(data.relationFriendInfo || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/social_network/incoming-friend`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setIncomingRequests(data.relationFriendInfo || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/all-group`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data.groupInfo || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên');
      return;
    }
    if (newGroupMaxMember < selectedUsers.length + 1) {
      alert(`Số thành viên tối đa phải ít nhất ${selectedUsers.length + 1} (bao gồm bạn)`);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/chat/create-group`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newGroupName.trim(),
          avatarUrl: newGroupAvatarUrl.trim() || 'https://via.placeholder.com/150',
          description: newGroupDescription.trim(),
          maxMember: newGroupMaxMember,
          userId: selectedUsers
        }),
      });
      if (!response.ok) throw new Error('Failed to create group');
      const data = await response.json();

      await fetchGroups();
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupAvatarUrl('');
      setNewGroupMaxMember(50);
      setSelectedUsers([]);
      alert('Tạo nhóm thành công!');
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const addFriend = async (friendId: number) => {
    try {
      const response = await fetch(`${API_URL}/social_network/add-friend`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchSentRequests();
      alert('Đã gửi lời mời kết bạn!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const acceptFriend = async (relationId: number) => {
    try {
      const response = await fetch(`${API_URL}/social_network/accept-friend`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ relationId }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchIncomingRequests();
      await fetchFriends();
      alert('Đã chấp nhận lời mời!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const rejectFriend = async (relationId: number) => {
    try {
      const response = await fetch(`${API_URL}/social_network/reject-friend`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ relationId }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchIncomingRequests();
      alert('Đã từ chối lời mời');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const unfriend = async (friendId: number) => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    try {
      const response = await fetch(`${API_URL}/social_network/unfriend`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchFriends();
      alert('Đã hủy kết bạn');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const startChat = async (friend: Friend) => {
    try {
      setLoading(true);
      setChatGroup(null);
      const response = await fetch(`${API_URL}/chat/1-1`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ friendId: friend.friendId }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const newRoomId = data.roomId;

      setRoomId(newRoomId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`room_${friend.friendId}`, newRoomId);
      }
      setChatPartner(friend);

      if (socketRef.current?.connected) {
        socketRef.current.emit('setActiveRoom', { roomId: newRoomId });
      }

      const messagesResponse = await fetch(`${API_URL}/chat/message?roomId=${newRoomId}`, {
        headers: getHeaders(),
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.message || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startGroupChat = async (group: Group) => {
    try {
      setLoading(true);
      setChatPartner(null);
      const newRoomId = `group:${group.groupId}`;

      setRoomId(newRoomId);
      setChatGroup(group);

      if (socketRef.current?.connected) {
        socketRef.current.emit('setActiveRoom', { roomId: newRoomId });
      }

      const messagesResponse = await fetch(`${API_URL}/chat/message?roomId=${newRoomId}`, {
        headers: getHeaders(),
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.message || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current || !roomId) return;
    socketRef.current.emit('chatMessage', {
      roomId: roomId,
      content: messageInput.trim(),
    });
    setMessageInput('');
  };

  const closeChat = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('setActiveRoom', { roomId: null });
    }
    setChatPartner(null);
    setChatGroup(null);
    setMessages([]);
    setRoomId('');
  };

  // Mở một panel quản lý (Khám phá/Lời mời/...) -> đóng cuộc trò chuyện đang mở
  const openPanel = (view: PanelView) => {
    closeChat();
    setPanelView(view);
  };

  const filteredUsers = allUsers.filter(user =>
    user.realname?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.userId !== currentUser?.userId
  );

  const filteredFriends = friends.filter(f =>
    f.friendRealname?.toLowerCase().includes(listSearch.toLowerCase())
  );
  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(listSearch.toLowerCase())
  );

  const isFriend = (userId: number) => friends.some(f => f.friendId === userId);
  const hasSentRequest = (userId: number) => sentRequests.some(r => r.friendId === userId);

  const inChat = chatPartner !== null || chatGroup !== null;

  // ---- Nút điều hướng dùng chung trên đầu sidebar ----
  const NavButton = ({
    view, label, icon, badge,
  }: { view: PanelView; label: string; icon: React.ReactNode; badge?: number }) => {
    const active = !inChat && panelView === view;
    return (
      <button
        onClick={() => openPanel(view)}
        className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${active
            ? 'bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
          }`}
      >
        {icon}
        <span>{label}</span>
        {badge ? (
          <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)]">
            {badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {/* ===== Modal tạo nhóm ===== */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h2 className="m-0 text-xl font-bold text-white uppercase tracking-wider">Tạo nhóm mới</h2>
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setNewGroupAvatarUrl('');
                  setNewGroupMaxMember(50);
                  setSelectedUsers([]);
                }}
                className="bg-transparent border-none cursor-pointer p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-200">Tên nhóm *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-[15px] text-white placeholder-gray-500 outline-none box-border focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-200">URL Avatar</label>
                <input
                  type="text"
                  value={newGroupAvatarUrl}
                  onChange={(e) => setNewGroupAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-[15px] text-white placeholder-gray-500 outline-none box-border focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-200">Mô tả</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Nhập mô tả nhóm..."
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-[15px] text-white placeholder-gray-500 outline-none box-border min-h-[80px] resize-y focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-200">Số thành viên tối đa *</label>
                <input
                  type="number"
                  value={newGroupMaxMember}
                  onChange={(e) => setNewGroupMaxMember(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="50"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-[15px] text-white placeholder-gray-500 outline-none box-border focus:border-blue-500/50 transition-colors"
                />
                <p className="mt-1 mb-0 text-xs text-gray-400">
                  Tối thiểu: {selectedUsers.length + 1} người (bao gồm bạn)
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-200">
                  Thêm thành viên ({selectedUsers.length} đã chọn)
                </label>
                <div className="border border-white/10 rounded-lg max-h-[300px] overflow-y-auto bg-black/30">
                  {friends.length === 0 ? (
                    <p className="p-5 text-center text-gray-400 m-0">Chưa có bạn bè</p>
                  ) : (
                    friends.map(friend => (
                      <div
                        key={friend.friendId}
                        onClick={() => toggleUserSelection(friend.friendId)}
                        className={`p-3 flex items-center gap-3 cursor-pointer border-b border-white/5 transition-colors ${selectedUsers.includes(friend.friendId) ? 'bg-blue-500/20' : 'hover:bg-white/5'
                          }`}
                      >
                        <img
                          src={friend.avatarUrl || 'https://via.placeholder.com/40'}
                          alt={friend.friendRealname}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div className="flex-1">
                          <h4 className="m-0 text-[15px] font-medium text-gray-100">{friend.friendRealname}</h4>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center ${selectedUsers.includes(friend.friendId) ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-transparent'
                          }`}>
                          {selectedUsers.includes(friend.friendId) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2 justify-end bg-black/40">
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setNewGroupAvatarUrl('');
                  setNewGroupMaxMember(50);
                  setSelectedUsers([]);
                }}
                className="px-5 py-2.5 border border-white/10 rounded-lg bg-white/5 text-gray-200 text-[15px] font-semibold cursor-pointer hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={createGroup}
                disabled={loading || !newGroupName.trim() || selectedUsers.length === 0}
                className={`px-5 py-2.5 border rounded-lg text-[15px] font-semibold transition-all ${(!newGroupName.trim() || selectedUsers.length === 0)
                    ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500/80 border-blue-500/50 text-white cursor-pointer hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  }`}
              >
                {loading ? 'Đang tạo...' : 'Tạo nhóm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Layout chính ===== */}
      <div
        className="h-screen flex bg-no-repeat bg-center bg-fixed bg-cover relative"
        style={{ backgroundImage: "url('/assets/br.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none"></div>

        {/* ===== Sidebar ===== */}
        <div
          className="border-r border-white/10 flex flex-col bg-black/60 backdrop-blur-md transition-all duration-300 overflow-hidden relative z-10"
          style={{
            width: showChatList ? '30%' : '0',
            minWidth: showChatList ? '320px' : '0',
            maxWidth: showChatList ? '380px' : '0',
          }}
        >
          {/* Header sidebar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push('/user')}
                className="bg-transparent border-none cursor-pointer p-1.5 rounded-full flex items-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                title="Quay lại trang cá nhân"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-300">
                {currentUser?.realname?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="m-0 text-lg font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Mạng xã hội
              </h2>
            </div>
            <button
              onClick={() => setShowChatList(false)}
              className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              title="Ẩn thanh bên"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Thanh điều hướng */}
          <div className="px-2 py-2 border-b border-white/10 flex gap-1">
            <NavButton
              view="friends"
              label="Đoạn chat"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <NavButton
              view="discover"
              label="Khám phá"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <NavButton
              view="requests"
              label="Lời mời"
              badge={incomingRequests.length}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <NavButton
              view="groups"
              label="Nhóm"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>

          {/* Ô tìm kiếm danh sách chat */}
          <div className="px-4 py-2 border-b border-white/10">
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Tìm kiếm đoạn chat..."
              className="w-full px-3 py-2 border border-white/10 rounded-full bg-black/40 text-[15px] text-white placeholder-gray-500 outline-none box-border focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Danh sách nhóm + bạn bè */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 border-b border-white/10">
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="w-full py-2.5 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Tạo nhóm mới
              </button>
            </div>

            {filteredGroups.length === 0 && filteredFriends.length === 0 ? (
              <div className="text-center text-gray-400 py-10 px-5">
                <div className="text-4xl mb-3 opacity-60">👋</div>
                <p className="m-0 mb-1 text-gray-200 font-medium">Chưa có đoạn chat nào</p>
                <p className="m-0 mb-4 text-[13px]">Kết bạn để bắt đầu trò chuyện nhé!</p>
                <button
                  onClick={() => openPanel('discover')}
                  className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                >
                  Khám phá &amp; kết bạn
                </button>
              </div>
            ) : (
              <>
                {filteredGroups.map((group) => (
                  <div
                    key={group.groupId}
                    onClick={() => startGroupChat(group)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${chatGroup?.groupId === group.groupId ? 'bg-blue-500/20' : 'hover:bg-white/5'
                      }`}
                  >
                    <img
                      src={group.avatarUrl || 'https://via.placeholder.com/56'}
                      alt={group.name}
                      className="w-14 h-14 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h3 className={`m-0 text-[15px] text-gray-100 truncate ${chatGroup?.groupId === group.groupId ? 'font-semibold' : 'font-medium'
                        }`}>
                        {group.name}
                      </h3>
                      <p className="m-0 text-[13px] text-gray-400 truncate">
                        {group.description || 'Nhóm chat'}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredFriends.map((friend) => (
                  <div
                    key={friend.friendId}
                    onClick={() => startChat(friend)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${chatPartner?.friendId === friend.friendId ? 'bg-blue-500/20' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="relative">
                      <img
                        src={friend.avatarUrl || 'https://via.placeholder.com/56'}
                        alt={friend.friendRealname}
                        className="w-14 h-14 rounded-full object-cover border border-white/10"
                      />
                      <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black/80 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className={`m-0 text-[15px] text-gray-100 truncate ${chatPartner?.friendId === friend.friendId ? 'font-semibold' : 'font-medium'
                        }`}>
                        {friend.friendRealname}
                      </h3>
                      <p className="m-0 text-[13px] text-green-400/80 truncate">Đang hoạt động</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ===== Panel bên phải ===== */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {inChat ? (
            /* ----- Cửa sổ chat ----- */
            <>
              <div className="bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {!showChatList && (
                  <button
                    onClick={() => setShowChatList(true)}
                    className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center mr-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {!showChatList && (
                  <button
                    onClick={() => router.push('/user')}
                    className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center mr-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    title="Quay lại trang cá nhân"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <img
                  src={(chatPartner?.avatarUrl || chatGroup?.avatarUrl) || 'https://via.placeholder.com/40'}
                  alt={(chatPartner?.friendRealname || chatGroup?.name) || ''}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1">
                  <h3 className="m-0 text-[15px] font-semibold text-gray-100">
                    {chatPartner?.friendRealname || chatGroup?.name}
                  </h3>
                  <p className="m-0 text-xs text-gray-400">
                    {chatGroup ? `${chatGroup.description || 'Nhóm chat'}` : 'Đang hoạt động'}
                  </p>
                </div>
                <button
                  onClick={closeChat}
                  className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 px-5">
                    <div className="text-5xl mb-3 opacity-60">💬</div>
                    <p>Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.userId === currentUser?.userId;
                    const isGroupChat = chatGroup !== null;

                    return (
                      <div
                        key={idx}
                        className={`flex mb-1 gap-2 items-end ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <img
                            src={msg.avatarUrl || (chatPartner?.avatarUrl || chatGroup?.avatarUrl) || 'https://via.placeholder.com/28'}
                            alt={msg.realname || ''}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                          />
                        )}

                        <div className="max-w-[60%] flex flex-col gap-0.5">
                          {!isOwn && isGroupChat && msg.realname && (
                            <span className="text-xs text-gray-400 pl-3 font-medium">{msg.realname}</span>
                          )}

                          <div
                            className={`px-3 py-2 rounded-2xl text-[15px] leading-relaxed break-words ${isOwn
                                ? 'bg-blue-500/80 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-black/50 text-gray-100 border border-white/10 backdrop-blur-sm'
                              }`}
                          >
                            <p className="m-0">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-white/10 bg-black/60 backdrop-blur-md flex gap-2 items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Aa"
                  className="flex-1 px-3 py-2 border border-white/10 rounded-full bg-black/40 text-[15px] text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className={`bg-transparent border-none p-2 flex items-center transition-opacity ${messageInput.trim() ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
                    }`}
                >
                  <svg width="20" height="20" fill="#60a5fa" viewBox="0 0 24 24" className="drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]">
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,10.7464035 22.0274542,9.96491551 21.1140164,9.80781816 L4.13399899,1.01036432 C3.50612381,0.753266566 2.41,0.909764246 1.77946707,1.33966354 C0.994623095,1.96460548 0.8376543,3.05373336 1.15159189,3.83922031 L3.03521743,10.2802133 C3.03521743,10.4373107 3.19218622,10.5944081 3.50612381,10.5944081 L16.6915026,11.3798951 C16.6915026,11.3798951 17.7876301,11.3798951 17.7876301,12.4744748 C17.7876301,13.5690546 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* ----- Panel quản lý (Khám phá / Lời mời / Bạn bè / Nhóm / Welcome) ----- */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header panel */}
              <div className="bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {!showChatList && (
                  <button
                    onClick={() => setShowChatList(true)}
                    className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {!showChatList && (
                  <button
                    onClick={() => router.push('/user')}
                    className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    title="Quay lại trang cá nhân"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <h2 className="m-0 text-lg font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {panelView === 'discover' && 'Khám phá'}
                  {panelView === 'requests' && 'Lời mời kết bạn'}
                  {panelView === 'friends' && 'Bạn bè'}
                  {panelView === 'groups' && 'Nhóm'}
                  {panelView === 'welcome' && 'Mạng xã hội'}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loading && (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 border-[3px] border-white/10 border-t-blue-500 rounded-full mx-auto animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                  </div>
                )}

                {/* --- Welcome --- */}
                {!loading && panelView === 'welcome' && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                    <div className="text-6xl mb-4 opacity-60">💬</div>
                    <h3 className="text-xl font-medium m-0 mb-2 text-gray-200">Chào mừng quay lại!</h3>
                    <p className="text-sm m-0 mb-6 max-w-[320px]">
                      Chọn một đoạn chat ở thanh bên, hoặc khám phá để kết bạn mới.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPanel('discover')}
                        className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                      >
                        Khám phá &amp; kết bạn
                      </button>
                      {incomingRequests.length > 0 && (
                        <button
                          onClick={() => openPanel('requests')}
                          className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-gray-200 text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          Xem {incomingRequests.length} lời mời
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* --- Khám phá --- */}
                {!loading && panelView === 'discover' && (
                  <div className="max-w-[700px] mx-auto">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Tìm kiếm bạn bè..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 border border-white/10 rounded-full bg-black/40 text-[15px] text-white placeholder-gray-500 outline-none box-border focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <div className="grid gap-2">
                      {filteredUsers.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">Không tìm thấy người dùng</p>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.userId}
                            className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || 'https://via.placeholder.com/60'}
                                alt={user.realname}
                                className="w-[60px] h-[60px] rounded-full object-cover border border-white/10"
                              />
                              <div>
                                <h3 className="m-0 text-[15px] font-semibold text-gray-100">{user.realname}</h3>
                                <p className="m-0 text-[13px] text-gray-400">ID: {user.userId}</p>
                              </div>
                            </div>
                            <div>
                              {isFriend(user.userId) ? (
                                <span className="text-sm text-green-400">✓ Bạn bè</span>
                              ) : hasSentRequest(user.userId) ? (
                                <button className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-gray-300 text-sm font-semibold cursor-default">
                                  Đã gửi lời mời
                                </button>
                              ) : (
                                <button
                                  onClick={() => addFriend(user.userId)}
                                  className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                >
                                  Thêm bạn bè
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* --- Lời mời --- */}
                {!loading && panelView === 'requests' && (
                  <div className="max-w-[700px] mx-auto grid gap-2">
                    {incomingRequests.length === 0 ? (
                      <p className="text-center text-gray-400 py-10">Không có lời mời kết bạn</p>
                    ) : (
                      incomingRequests.map((request) => (
                        <div
                          key={request.relationId}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={request.avatarUrl || 'https://via.placeholder.com/60'}
                              alt={request.friendRealname}
                              className="w-[60px] h-[60px] rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <h3 className="m-0 text-[15px] font-semibold text-gray-100">{request.friendRealname}</h3>
                              <p className="m-0 text-[13px] text-gray-400">
                                {new Date(request.create_at).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptFriend(request.relationId)}
                              className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => rejectFriend(request.relationId)}
                              className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-gray-200 text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* --- Bạn bè --- */}
                {!loading && panelView === 'friends' && (
                  <div className="max-w-[700px] mx-auto grid gap-2">
                    {friends.length === 0 ? (
                      <div className="text-center text-gray-400 py-16">
                        <div className="text-5xl mb-3 opacity-60">🧑‍🤝‍🧑</div>
                        <p className="m-0 mb-4">Bạn chưa có người bạn nào</p>
                        <button
                          onClick={() => openPanel('discover')}
                          className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                        >
                          Khám phá &amp; kết bạn
                        </button>
                      </div>
                    ) : (
                      friends.map((friend) => (
                        <div
                          key={friend.friendId}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={friend.avatarUrl || 'https://via.placeholder.com/60'}
                              alt={friend.friendRealname}
                              className="w-[60px] h-[60px] rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <h3 className="m-0 text-[15px] font-semibold text-gray-100">{friend.friendRealname}</h3>
                              <p className="m-0 text-[13px] text-gray-400">Bạn bè</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startChat(friend)}
                              className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                            >
                              Nhắn tin
                            </button>
                            <button
                              onClick={() => unfriend(friend.friendId)}
                              className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-gray-200 text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            >
                              Hủy kết bạn
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* --- Nhóm --- */}
                {!loading && panelView === 'groups' && (
                  <div className="max-w-[700px] mx-auto">
                    <div className="mb-4">
                      <button
                        onClick={() => setShowCreateGroupModal(true)}
                        className="w-full py-3 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Tạo nhóm mới
                      </button>
                    </div>
                    <div className="grid gap-2">
                      {groups.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">Chưa có nhóm nào</p>
                      ) : (
                        groups.map((group) => (
                          <div
                            key={group.groupId}
                            className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={group.avatarUrl || 'https://via.placeholder.com/60'}
                                alt={group.name}
                                className="w-[60px] h-[60px] rounded-full object-cover border border-white/10"
                              />
                              <div>
                                <h3 className="m-0 text-[15px] font-semibold text-gray-100">{group.name}</h3>
                                <p className="m-0 text-[13px] text-gray-400">{group.description || 'Nhóm chat'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startGroupChat(group)}
                              className="px-4 py-2 border border-blue-500/50 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold cursor-pointer hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                            >
                              Mở chat
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
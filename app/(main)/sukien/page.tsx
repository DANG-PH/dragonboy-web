"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Post {
  id: number;
  title: string;
  url_anh: string;
  content: string;
  editor_id: number;
  editor_realname: string;
  status?: string;
  create_at?: string;
  update_at?: string;
}

function Sukien() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogged, setIsLogged] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        setIsLogged(false);
        setLoading(false);
        return;
      }
      setIsLogged(true);

      const userData = JSON.parse(stored);
      const response = await fetch('/api/all-posts', {
        headers: {
          'Authorization': `Bearer ${userData.access_token}`,
        },
      });

      const data = await response.json();
      console.log('Data from API:', data);

      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
        console.log('Posts set successfully:', data.posts);
      } else {
        console.log('No posts array found');
        setPosts([]);
      }

    } catch (error) {
      console.error('Error:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin h-16 w-16 border-b-2 border-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="mt-4 text-gray-200">Đang tải thông tin...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-8 px-4 bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-10 pt-4 text-center border-b border-white/10 pb-8">
          <span className="inline-block mb-3 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-[0.2em]">
            Tin tức &amp; sự kiện
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500 uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.4))' }}>
            Sự Kiện
          </h1>
          <p className="text-gray-300 font-medium text-base md:text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Cập nhật những sự kiện mới nhất
          </p>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isLogged ? (
            <div className="col-span-full text-center py-20 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Vui lòng đăng nhập!</h2>
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="group bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 hover:bg-black/70 hover:border-white/20 hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                onClick={() => router.push(`/sukien/${post.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-black/40">
                  <img
                    src={post.url_anh || '/placeholder.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* gradient phủ dưới ảnh cho liền mạch với card tối */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                  {post.status && (
                    <span className="absolute top-2 right-2 bg-green-500/20 text-green-300 border border-green-500/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                      {post.status}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 h-[60px] leading-relaxed">{post.content}</p>

                  {/* Info */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4 mt-auto">
                    <span className="flex items-center gap-1">
                      <span>✍️</span>
                      <span>{post.editor_realname}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{post.create_at ? new Date(post.create_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </span>
                  </div>

                  {/* Button */}
                  <button className="w-full border border-green-500/50 bg-green-500/20 text-green-300 py-2.5 rounded-lg font-semibold hover:bg-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300">
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
              <p className="text-white text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">📭 Chưa có sự kiện nào</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Sukien;
"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '../page';

export default function SukienDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchPostDetail();
    }
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        setError('Vui lòng đăng nhập!');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);
      const response = await fetch('/api/all-posts', {
        headers: {
          'Authorization': `Bearer ${userData.access_token}`,
        },
      });

      const data = await response.json();

      if (data.posts && Array.isArray(data.posts)) {
        const foundPost = data.posts.find((p: Post) => p.id.toString() === id);
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Không tìm thấy sự kiện!');
        }
      } else {
        setError('Không thể tải dữ liệu!');
      }

    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin h-16 w-16 border-b-2 border-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="mt-4 text-gray-200 font-medium drop-shadow-md">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="text-center bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
          <p className="text-red-400 text-xl font-bold mb-4">{error || 'Không tìm thấy thông tin sự kiện!'}</p>
          <button
            onClick={() => router.push('/sukien')}
            className="border border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] px-6 py-2 rounded-lg transition-all font-medium cursor-pointer"
          >
            Quay lại trang Sự kiện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Nút quay lại */}
      <div className="max-w-4xl mx-auto mb-6 relative z-10">
        <button
          onClick={() => router.push('/sukien')}
          className="flex items-center text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm w-fit cursor-pointer border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        >
          <span className="mr-2">←</span> Quay lại
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Hình Ảnh */}
        <div className="relative h-[400px]">
          <img
            src={post.url_anh || '/placeholder.jpg'}
            alt={post.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            {post.status && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/40 px-4 py-1.5 rounded-full text-sm font-semibold w-fit mb-4 backdrop-blur-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                {post.status}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{post.title}</h1>

            <div className="flex items-center gap-6 mt-4 text-gray-200">
              <span className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <span className="font-medium text-lg">{post.editor_realname}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <span className="text-lg">
                  {post.create_at ? new Date(post.create_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Nội Dung */}
        <div className="p-8 md:p-12">
          <p className="text-gray-200 leading-loose text-lg whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}
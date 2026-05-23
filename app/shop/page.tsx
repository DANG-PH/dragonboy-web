"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import blackGoku from "../../public/assets/avt.png";
import trungdetu from "../../public/assets/trung_de_tu.png";
import aovaitho from "../../public/assets/ao.png";
import quanthanlinh from "../../public/assets/quan.png";
import gangvaitho from "../../public/assets/gang.png";
import giayvaitho from "../../public/assets/giay.png";
import rada from "../../public/assets/rada.png";
import { StaticImageData } from 'next/image';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/*
  Tailwind safelist — các class màu dưới đây được ghép động qua biến nên cần liệt kê
  nguyên văn để JIT không loại bỏ khi build:
  text-gray-300 text-blue-300 text-fuchsia-300 text-amber-300
  border-gray-400/40 border-blue-400/50 border-fuchsia-400/50 border-amber-400/50
  hover:border-gray-300/60 hover:border-blue-300/70 hover:border-fuchsia-300/70 hover:border-amber-300/70
  hover:shadow-[0_0_30px_rgba(156,163,175,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.45)]
  bg-gray-500/20 bg-blue-500/20 bg-fuchsia-500/20 bg-amber-500/20
  text-gray-200 text-blue-200 text-fuchsia-200 text-amber-200
  border-gray-400/30 border-blue-400/40 border-fuchsia-400/40 border-amber-400/40
  bg-gray-400 bg-blue-400 bg-fuchsia-400 bg-amber-400
*/

interface Item {
  id: number;
  name: string;
  description: string;
  image: StaticImageData;
  price: number;
  rarity: Rarity;
  effect: string;
}

// Cấu hình màu sắc / nhãn theo độ hiếm
const RARITY = {
  common: {
    label: 'Thường',
    text: 'text-gray-300',
    border: 'border-gray-400/40',
    hoverBorder: 'hover:border-gray-300/60',
    glow: 'hover:shadow-[0_0_30px_rgba(156,163,175,0.25)]',
    auraColor: 'rgba(156,163,175,0.25)',
    badge: 'bg-gray-500/20 text-gray-200 border-gray-400/30',
    chip: 'bg-gray-400',
  },
  rare: {
    label: 'Hiếm',
    text: 'text-blue-300',
    border: 'border-blue-400/50',
    hoverBorder: 'hover:border-blue-300/70',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    auraColor: 'rgba(59,130,246,0.35)',
    badge: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
    chip: 'bg-blue-400',
  },
  epic: {
    label: 'Sử thi',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-400/50',
    hoverBorder: 'hover:border-fuchsia-300/70',
    glow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]',
    auraColor: 'rgba(217,70,239,0.35)',
    badge: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40',
    chip: 'bg-fuchsia-400',
  },
  legendary: {
    label: 'Huyền thoại',
    text: 'text-amber-300',
    border: 'border-amber-400/50',
    hoverBorder: 'hover:border-amber-300/70',
    glow: 'hover:shadow-[0_0_35px_rgba(251,191,36,0.45)]',
    auraColor: 'rgba(251,191,36,0.35)',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    chip: 'bg-amber-400',
  },
} as const;

function Shop() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

  const items: Item[] = [
    {
      id: 1,
      name: 'Cải trang Black Goku',
      description: 'Cải trang thành Super Black Goku',
      image: blackGoku,
      price: 10000,
      rarity: 'legendary',
      effect: 'Ngoại hình',
    },
    {
      id: 2,
      name: 'Trứng đệ tử',
      description: 'Giúp người chơi sở hữu đệ tử.',
      image: trungdetu,
      price: 20000,
      rarity: 'epic',
      effect: 'Triệu hồi',
    },
    {
      id: 3,
      name: 'Áo vải thô',
      description: 'Giúp giảm sát thương nhận vào',
      image: aovaitho,
      price: 30000,
      rarity: 'common',
      effect: 'Giáp +',
    },
    {
      id: 4,
      name: 'Quần thần linh',
      description: 'Giúp tăng HP tối đa',
      image: quanthanlinh,
      price: 40000,
      rarity: 'rare',
      effect: 'HP +',
    },
    {
      id: 5,
      name: 'Găng vải thô',
      description: 'Giúp tăng sức đánh',
      image: gangvaitho,
      price: 50000,
      rarity: 'common',
      effect: 'ATK +',
    },
    {
      id: 6,
      name: 'Giày vải thô',
      description: 'Giúp tăng MP tối đa',
      image: giayvaitho,
      price: 60000,
      rarity: 'common',
      effect: 'MP +',
    },
    {
      id: 7,
      name: 'Rada',
      description: 'Giúp tăng tỉ lệ Chí Mạng',
      image: rada,
      price: 70000,
      rarity: 'rare',
      effect: 'Crit +',
    }
  ];

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const handleBuyItem = async (itemId: number): Promise<void> => {
    try {
      const stored = localStorage.getItem("currentUser");

      if (!stored) {
        alert('Vui lòng đăng nhập để mua vật phẩm!');
        return;
      }

      const userData = JSON.parse(stored);
      const authId = userData.auth_id;
      const accessToken = userData.access_token;

      if (!authId || !accessToken) {
        alert('Thông tin đăng nhập không hợp lệ!');
        return;
      }

      setLoading(true);
      setLoadingItemId(itemId);

      const response = await fetch('/api/add-item-web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'auth-id': authId.toString(),
        },
        body: JSON.stringify({
          itemId: itemId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Mua vật phẩm thành công! Vào game để sử dụng.');
        console.log('Response:', data);
      } else {
        throw new Error(data.error || 'Không thể mua vật phẩm');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể mua vật phẩm';
      alert(errorMessage);
    } finally {
      setLoading(false);
      setLoadingItemId(null);
    }
  };

  return (
    <div
      className="min-h-screen py-10 px-4 bg-no-repeat bg-center bg-fixed bg-cover relative"
      style={{ backgroundImage: "url('/assets/br.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/user')}
            className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm w-fit shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10 border-b border-white/10 pb-8">
          <span className="inline-block mb-3 px-4 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-[0.2em]">
            Cửa hàng vật phẩm
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Shop <span className="text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.7)]">Trang Bị</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Nâng cấp nhân vật với những vật phẩm mạnh mẽ nhất
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => {
            const r = RARITY[item.rarity];
            const isItemLoading = loading && loadingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative bg-black/60 backdrop-blur-md border ${r.border} ${r.hoverBorder} rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:bg-black/70 hover:-translate-y-1.5 ${r.glow}`}
              >
                {/* Rarity stripe trên cùng */}
                <div className={`h-1 w-full ${r.chip}`}></div>

                {/* Badge độ hiếm + tác dụng */}
                <div className="absolute top-4 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${r.badge} backdrop-blur-sm`}>
                    {r.label}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/50 text-gray-200 border border-white/10 backdrop-blur-sm">
                    {item.effect}
                  </span>
                </div>

                {/* Image + quầng sáng theo độ hiếm */}
                <div className="relative aspect-square flex items-center justify-center p-8 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${r.auraColor} 0%, transparent 70%)` }}
                  ></div>
                  <img
                    src={item.image.src}
                    alt={item.name}
                    className="relative w-3/5 h-3/5 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
                  />
                </div>

                {/* Info */}
                <div className="p-5 pt-2">
                  <h3 className={`text-lg font-bold mb-1.5 ${r.text}`}>
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-400 mb-4 min-h-[40px] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Price row */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wide">Giá</p>
                      <p className="text-2xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)] leading-tight">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleBuyItem(item.id)}
                    disabled={isItemLoading}
                    className="w-full border border-blue-500/50 bg-blue-500/20 text-blue-200 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500/20 disabled:hover:shadow-none flex items-center justify-center gap-2"
                  >
                    {isItemLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-blue-300 border-t-transparent rounded-full"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Mua Ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="text-gray-200 text-base">
              ⚠️ <strong className="text-blue-300">Lưu ý:</strong> Vật phẩm sẽ được thêm vào tài khoản của bạn sau khi thanh toán.
              Vào game để kiểm tra và sử dụng!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
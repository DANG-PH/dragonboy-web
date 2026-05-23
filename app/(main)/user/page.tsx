"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../src/redux/store";
import { fetchProfileStart, clearProfile } from "../../../src/redux/profile/profileSlice";
interface UserData {
  danhSachVatPhamWeb: any[];
  id: number;
  vang: { low: number; high: number; unsigned: boolean };
  ngoc: { low: number; high: number; unsigned: boolean };
  sucManh: { low: number; high: number; unsigned: boolean };
  vangNapTuWeb: { low: number; high: number; unsigned: boolean };
  ngocNapTuWeb: { low: number; high: number; unsigned: boolean };
  x: number;
  y: number;
  mapHienTai: string;
  daVaoTaiKhoanLanDau: boolean;
  coDeTu: boolean;
  auth_id: number;
}

interface ApiResponse {
  user: UserData;
}


const Icons = {
  Money: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Gem: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Power: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Location: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};

export default function User() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: user, loading, error } = useSelector((state: RootState) => state.profile);
  const [hasRequestedProfile, setHasRequestedProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setHasRequestedProfile(true);
    dispatch(fetchProfileStart());
  }, [dispatch]);

  useEffect(() => {
    if (hasRequestedProfile && !loading && (error || !user)) {
      router.push("/login");
    }
  }, [hasRequestedProfile, loading, error, user, router]);

  const formatNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'low' in value) {
      const low = value.low || 0;
      const high = value.high || 0;
      // Xử lý đúng cho số 64-bit: (high << 32) + (low & 0xFFFFFFFF)
      return (high * Math.pow(2, 32)) + (low >>> 0); // >>> 0 converts to unsigned
    }
    return 0;
  };

  const isRedirectingToLogin = hasRequestedProfile && !loading && (error || !user);

  if (loading || isRedirectingToLogin)
    return (
      <div className="min-h-screen flex items-center justify-center  bg-no-repeat bg-center bg-fixed bg-cover" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-b-2 border-blue-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-200">
            {isRedirectingToLogin ? "Đang chuyển đến trang đăng nhập..." : "Đang tải thông tin..."}
          </p>
        </div>
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center  bg-no-repeat bg-center bg-fixed bg-cover" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-b-2 border-blue-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-200">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      {/* Dark overlay to make content more readable */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">Thông tin nhân vật</h1>
            <p className="text-gray-200 text-sm mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Hồ sơ người dùng</p>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
                onClick={() => router.push("/chat")}
                className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
              >
                Mạng xã hội game
            </button>
            <button
              onClick={() => router.push("/acchistory")}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Lịch sử mua acc
            </button>
            <button
              onClick={() => {
                router.push("/shop");
              }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Shop game
            </button>
            <button
              onClick={() => {
                router.push("/chatbot");
              }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Chatbot
            </button>
            <button
              onClick={() => {
                router.push("/change-password");
              }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Đổi mật khẩu
            </button>
            <button
              onClick={() => router.push("/pay")}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-gray-100 hover:bg-white/20 hover:text-white px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Ví của tôi
            </button>
            <button
              onClick={() => {
                setIsLoggingOut(true);
                localStorage.removeItem("currentUser");
                dispatch(clearProfile());
                router.push("/login");
              }}
              disabled={isLoggingOut}
              className="bg-red-500/50 backdrop-blur-sm border border-red-500/50 text-white hover:bg-red-500/80 px-4 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoggingOut ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang đăng xuất...
                </span>
              ) : (
                "Đăng xuất"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Trạng thái & Vị trí */}
          <div className="bg-black/60 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden text-white transition-all hover:bg-black/70 hover:border-white/20">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-semibold text-gray-100 uppercase text-sm tracking-wider">Trạng thái & Vị trí</h3>
              <div className="flex gap-2">
                <span className={`h-3 w-3 rounded-full ${user.daVaoTaiKhoanLanDau ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {/* Location */}
                <div>
                  <h4 className="flex items-center gap-2 text-gray-100 font-medium mb-4 pb-2 border-b border-white/10">
                    <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]"><Icons.Location /></span> Vị trí hiện tại
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Map:</span>
                      <span className="font-semibold text-gray-100">{user.mapHienTai}</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Tọa độ:</span>
                      <span className="font-mono bg-black/50 border border-white/10 px-2 py-1 rounded text-gray-300">X: {user.x} | Y: {user.y}</span>
                    </li>
                  </ul>
                </div>

                {/* Status */}
                <div>
                  <h4 className="flex items-center gap-2 text-gray-100 font-medium mb-4 pb-2 border-b border-white/10">
                    <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]"><Icons.Info /></span> Tình trạng
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Lần đầu đăng nhập:</span>
                      <span className={`px-2 py-1 text-xs rounded font-medium border ${user.daVaoTaiKhoanLanDau ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {user.daVaoTaiKhoanLanDau ? "Đã vào" : "Chưa vào"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Đệ tử:</span>
                      <span className={`px-2 py-1 text-xs rounded font-medium border ${user.coDeTu ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {user.coDeTu ? "Đã có" : "Chưa có"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Vật phẩm Web:</span>
                      <span className="font-semibold text-gray-100">{user.danhSachVatPhamWeb.length} món</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tổng Vàng */}
          <div className="bg-black/60 backdrop-blur-md p-5 rounded-lg shadow-xl border border-white/10 flex items-center justify-between transition-all hover:bg-black/70 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Tổng Vàng</p>
              <h3 className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">{formatNumber(user.vang)}</h3>
              <p className="text-xs text-blue-400/70 mt-1">Nạp web: {formatNumber(user.vangNapTuWeb)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Icons.Money />
            </div>
          </div>

          {/* Tổng Ngọc */}
          <div className="bg-black/60 backdrop-blur-md p-5 rounded-lg shadow-xl border border-white/10 flex items-center justify-between transition-all hover:bg-black/70 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Tổng Ngọc</p>
              <h3 className="text-2xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">{formatNumber(user.ngoc)}</h3>
              <p className="text-xs text-green-400/70 mt-1">Nạp web: {formatNumber(user.ngocNapTuWeb)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Icons.Gem />
            </div>
          </div>

          {/* Sức mạnh */}
          <div className="bg-black/60 backdrop-blur-md p-5 rounded-lg shadow-xl border border-white/10 flex items-center justify-between transition-all hover:bg-black/70 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Sức mạnh</p>
              <h3 className="text-2xl font-bold text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">{formatNumber(user.sucManh)}</h3>
              <p className="text-xs text-yellow-500/70 mt-1">Chỉ số sức mạnh</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Icons.Power />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Account {
  id: number;
  url: string;
  description: string;
  price: number;
  status: string;
  partner_id: number;
  createdAt: string;
}

export default function ShopAccDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [purchasing, setPurchasing] = useState<boolean>(false);
  // Server xử lý async (outbox + saga) -> không trả username/password ngay.
  // Chỉ cần biết đơn đã được tiếp nhận để báo người dùng xem ở Lịch sử mua acc.
  const [orderMessage, setOrderMessage] = useState<string>('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAccountDetail();
    }
  }, [id]);

  const fetchAccountDetail = async () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        setError('Vui lòng đăng nhập!');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);
      const response = await fetch('/api/all-account-sell', {
        headers: {
          'Authorization': `Bearer ${userData.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách account');
      }

      const data = await response.json();
      let accountsList: Account[] = [];

      if (Array.isArray(data)) {
        accountsList = data;
      } else if (data.accounts && Array.isArray(data.accounts)) {
        accountsList = data.accounts;
      } else if (data.data && Array.isArray(data.data)) {
        accountsList = data.data;
      }

      const foundAccount = accountsList.find((acc: Account) => acc.id.toString() === id);
      if (foundAccount) {
        if (foundAccount.status !== 'ACTIVE') {
          setError('Account này đã được bán hoặc không còn tồn tại.');
        } else {
          setAccount(foundAccount);
        }
      } else {
        setError('Không tìm thấy acc!');
      }

    } catch (error: any) {
      console.error('Error fetching account details:', error);
      setError(error.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAccount = async () => {
    if (!account) return;

    if (!confirm('Bạn có chắc muốn mua account này?')) {
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const userData = JSON.parse(stored);
      const response = await fetch('/api/buy-account-sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.access_token}`,
        },
        body: JSON.stringify({ id: account.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể mua account');
      }

      // Luồng async: server chỉ xác nhận đã tiếp nhận đơn, không trả thông tin acc.
      setOrderMessage(
        data.message ||
        'Đơn của bạn đang được xử lý. Vui lòng kiểm tra tại Lịch sử mua acc.'
      );
      setShowPurchaseModal(true);

    } catch (error: any) {
      console.error('Error buying account:', error);
      setError(error.message || 'Có lỗi xảy ra khi mua account');
      alert(error.message || 'Có lỗi xảy ra khi mua account');
    } finally {
      setPurchasing(false);
    }
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setOrderMessage('');
    router.push('/shopacc');
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

  if (error || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="text-center bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
          <p className="text-red-400 text-xl font-bold mb-4">{error || 'Không tìm thấy thông tin account!'}</p>
          <button
            onClick={() => router.push('/shopacc')}
            className="border border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] px-6 py-2 rounded-lg transition-all font-medium cursor-pointer"
          >
            Quay lại trang Shop Acc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="max-w-4xl mx-auto mb-6 relative z-10">
        <button
          onClick={() => router.push('/shopacc')}
          className="flex items-center text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm w-fit cursor-pointer border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        >
          <span className="mr-2">←</span> Quay lại
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 p-6 md:p-8">
        <h2 className="text-3xl font-black text-white mb-6 pb-4 border-b border-white/10 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Chi Tiết Account
        </h2>

        <div className="mb-8">
          <img
            src={account.url}
            alt={account.description}
            className="w-full max-h-[500px] object-contain object-center rounded-xl bg-black/40 border border-white/5 shadow-inner min-h-[200px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23262626" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23737373" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả</h3>
            <p className="text-gray-100 text-lg break-words leading-relaxed">{account.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-2">Giá</h3>
              <p className="text-4xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]">
                {account.price.toLocaleString('vi-VN')} ₫
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-white/10 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Trạng thái</h3>
              <div>
                <span className="inline-block bg-green-500/20 text-green-300 border border-green-500/40 px-4 py-2 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  {account.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">ID Account</h3>
              <p className="text-gray-100 font-mono text-xl font-medium">#{account.id}</p>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ngày tạo</h3>
              <p className="text-gray-100 text-lg font-medium">
                {new Date(account.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleBuyAccount}
          disabled={purchasing}
          className={`w-full py-5 rounded-xl font-bold text-xl uppercase tracking-wider transition-all border ${purchasing
            ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
            : 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transform hover:-translate-y-1'
            }`}
        >
          {purchasing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Mua Account Này'
          )}
        </button>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 border border-blue-500/40 rounded-full mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                {/* icon đồng hồ — đơn đang xử lý */}
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 2" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Đã tiếp nhận đơn!</h2>
              <p className="text-gray-300 font-medium leading-relaxed">{orderMessage}</p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-400/60 rounded-r-lg p-4 mb-6">
              <p className="text-sm text-amber-200 font-medium leading-relaxed">
                ⏳ Đơn hàng đang được hệ thống xử lý. Thông tin đăng nhập tài khoản sẽ xuất hiện trong{' '}
                <strong className="text-amber-100">Lịch sử mua acc</strong> sau khi hoàn tất.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/acchistory')}
                className="w-full py-4 border border-blue-500/50 bg-blue-500/20 text-blue-200 rounded-xl font-bold uppercase tracking-wide hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
              >
                Xem lịch sử mua acc
              </button>
              <button
                onClick={closePurchaseModal}
                className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold uppercase tracking-wide hover:bg-white/20 transition-colors"
              >
                Đóng & Quay lại Shop
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
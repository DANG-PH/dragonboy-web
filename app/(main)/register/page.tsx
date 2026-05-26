"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  realname: string;
  email: string;
  gameName: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  realname?: string;
  email?: string;
  gameName?: string;
}

function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    realname: '',
    email: '',
    gameName: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!formData.gameName.trim()) {
      newErrors.gameName = 'Vui lòng nhập tên nhân vật';
    }
    if (!formData.realname.trim()) {
      newErrors.realname = 'Vui lòng nhập tên thật';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Gọi Next.js API route
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          realname: formData.realname,
          password: formData.password,
          email: formData.email,
          gameName: formData.gameName

        })
      });

      const data = await response.json();

      console.log('Register response:', data);

      if (response.ok) {
        alert('Đăng ký thành công!');
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          realname: '',
          email: '',
          gameName: ''
        });
        router.push("/login");
      } else {
        alert(data.error || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Đã xảy ra lỗi không mong đợi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="bg-black/50 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl p-8 w-full max-w-[420px] relative z-10 transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.35),0_0_60px_rgba(251,146,60,0.12)] sm:p-6 sm:mx-4" style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[2.5rem] sm:text-[2rem] font-extrabold bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2 animate-[titleGlow_3s_ease-in-out_infinite_alternate]">
            Đăng Ký
          </h2>
          <p className="text-white/80 text-base font-medium">Tạo tài khoản mới của bạn</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">👤</i>
            </div>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.username
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.username && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.username}
              </p>
            )}
          </div>

          {/* Game Name Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">📝</i>
            </div>
            <input
              type="text"
              name="gameName"
              placeholder="Nhập tên nhân vật"
              value={formData.gameName}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.gameName
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.gameName && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.gameName}
              </p>
            )}
          </div>

          {/* Real Name Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">📝</i>
            </div>
            <input
              type="text"
              name="realname"
              placeholder="Nhập tên thật"
              value={formData.realname}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.realname
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.realname && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.realname}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">📧</i>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.email
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.email && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">🔒</i>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.password
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.password && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] pointer-events-none">
              <i className="text-xl text-white/60 transition-all duration-300">🔐</i>
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${errors.confirmPassword
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-white/20'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-red-400 text-sm font-medium" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-4 sm:py-[14px] bg-gradient-to-br from-amber-400 to-orange-500 border-none rounded-2xl text-white text-[1.1rem] sm:text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-[400ms] relative overflow-hidden hover:translate-y-[-2px] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(251,146,60,0.6),0_0_40px_rgba(251,146,60,0.18),0_0_80px_rgba(251,146,60,0.06)] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none ${loading ? 'pointer-events-none' : ''
              }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl"></span>
            )}
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-5 text-center text-white/80 text-[0.95rem]">
          <span>Đã có tài khoản? </span>
          <button
            onClick={() => router.push("/login")}
            className="ml-5 bg-transparent border-none text-amber-400 font-bold cursor-pointer underline underline-offset-4 transition-all duration-300 hover:text-orange-400 hover:shadow-[0_0_10px_rgba(251,146,60,0.5)] hover:scale-105"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            Đăng nhập ngay
          </button>
        </div>

        {/* Home Link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-transparent border-none text-white/60 text-sm cursor-pointer flex items-center justify-center gap-1 mx-auto px-4 py-2 rounded-xl transition-all duration-300 hover:text-white/90 hover:bg-white/5 hover:-translate-x-1"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <span className="text-base">⬅</span> Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';


interface FormData {
  username: string;
  password: string;
}


interface FormErrors {
  username?: string;
  password?: string;
}


function Login() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL;


  if (!raw) {
    throw new Error('BACKEND_URL is not defined');
  }


  const BACKEND_URL = raw.startsWith('http')
    ? raw
    : `https://${raw}`;




  const API_URL = `${BACKEND_URL}`;
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);


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
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });


      const data = await response.json();


      if (response.ok) {
        const old = JSON.parse(localStorage.getItem('currentUser') || '{}');


        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            ...old,
            ...data, // chỉ ghi đè auth_id, role
          })
        );
        console.log("Saved user:", localStorage.getItem('currentUser'));


        alert('Đăng nhập thành công!');
        router.push('/otp');
      } else {
        console.log("Login failed:", data);

        setFormData({ username: '', password: '' });

        if (response.status === 401) {
          alert('Tài khoản hoặc mật khẩu không đúng!');
        } else {
          alert(data.message || 'Đăng nhập thất bại!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Đã xảy ra lỗi khi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };


  const handleSuccess = async (response: any) => {
    try {
      const { credential } = response;
      if (!credential) return;


      // Gọi backend
      const res = await axios.post(
        `${API_URL}/auth/login-google`,
        {
          tokenFromGoogle: credential,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      const currentUser = res.data;
      const old = JSON.parse(localStorage.getItem('currentUser') || '{}');


      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...old,
          ...currentUser, // chỉ ghi đè auth_id, role
        })
      );


      // Redirect sang /user
      router.push('/user');
    } catch (error: any) {
      console.error('Login Google failed:', error?.response?.data || error);
      alert("Đăng nhập thất bại");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center  bg-no-repeat bg-center bg-fixed bg-cover relative" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin h-16 w-16 border-b-2 border-amber-400 mx-auto rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
          <p className="mt-4 text-gray-200">Đang tải thông tin...</p>
        </div>
      </div>
    );


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="bg-black/50 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl p-8 w-full max-w-[420px] relative z-10 transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.35),0_0_60px_rgba(251,146,60,0.12)] sm:p-6 sm:mx-4" style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>


        <div className="text-center mb-8">
          <h2 className="text-[2.5rem] sm:text-[2rem] font-extrabold bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2 animate-[titleGlow_3s_ease-in-out_infinite_alternate]">
            Đăng Nhập
          </h2>
          <p className="text-white/80 text-base font-medium">Chào mừng bạn quay trở lại</p>
        </div>


        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.username
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
              className={`w-full h-14 px-4 pl-12 bg-white/[0.08] border rounded-2xl text-white text-base leading-6 transition-all duration-300 box-border placeholder:text-white/50 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] focus:shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.09),0_0_80px_rgba(251,191,36,0.03)] disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.password
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


          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-white/80 cursor-pointer transition-all duration-300 hover:text-white" style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="mr-2 w-4 h-4 accent-amber-500"
              />
              Ghi nhớ tài khoản
            </label>
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="bg-transparent border-none text-amber-400 cursor-pointer text-sm font-semibold transition-all duration-300 hover:text-orange-400 hover:shadow-[0_0_10px_rgba(251,146,60,0.5)]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              Quên mật khẩu?
            </button>
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-4 sm:py-[14px] bg-gradient-to-br from-amber-400 to-orange-500 border-none rounded-2xl text-white text-[1.1rem] sm:text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-[400ms] relative overflow-hidden hover:translate-y-[-2px] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(251,146,60,0.6),0_0_40px_rgba(251,146,60,0.18),0_0_80px_rgba(251,146,60,0.06)] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none ${
              loading ? 'pointer-events-none' : ''
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl"></span>
            )}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>


        <div className="mt-5 text-center text-white/80 text-[0.95rem]">
          <span>Chưa có tài khoản? </span>
          <button
            onClick={() => router.push("/register")}
            className="ml-5 bg-transparent border-none text-amber-400 font-bold cursor-pointer underline underline-offset-4 transition-all duration-300 hover:text-orange-400 hover:shadow-[0_0_10px_rgba(251,146,60,0.5)] hover:scale-105"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            Đăng ký ngay
          </button>
        </div>


        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-transparent border-none text-white/60 text-sm cursor-pointer flex items-center justify-center gap-1 mx-auto px-4 py-2 rounded-xl transition-all duration-300 hover:text-white/90 hover:bg-white/5 hover:-translate-x-1"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <span className="text-base">⬅</span> Quay về trang chủ
          </button>
        </div>


        <div className="mt-4 flex justify-center">
          <GoogleOAuthProvider clientId="977963570920-h0qat6jqr0j309m1326blhmu7516g0rj.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {
              }}
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}


export default Login;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>GASS API</h1>
          <p className='text-gray-600 mt-2'>Masuk ke akun kamu</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='nama@example.com'
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='••••••••'
              disabled={isLoading}
              required
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-600'>
          Belum punya akun?{' '}
          <Link
            to='/register'
            className='font-medium text-blue-600 hover:text-blue-500'
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

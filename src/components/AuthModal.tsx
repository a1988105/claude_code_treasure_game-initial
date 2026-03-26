import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

export default function AuthModal({ open, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '發生錯誤');
      } else {
        onLogin(data.username);
        setUsername('');
        setPassword('');
        onClose();
      }
    } catch {
      setError('無法連線到伺服器');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm !bg-amber-50 border-amber-300">
        <DialogHeader>
          <DialogTitle className="text-amber-900 text-xl">
            {mode === 'login' ? '🔑 登入' : '📜 註冊'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm text-amber-800 mb-1 block">帳號</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-amber-300 rounded-md px-3 py-2 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="輸入帳號"
              required
            />
          </div>
          <div>
            <label className="text-sm text-amber-800 mb-1 block">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-amber-300 rounded-md px-3 py-2 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="輸入密碼"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
          </Button>
          <p className="text-center text-sm text-amber-700">
            {mode === 'login' ? '還沒有帳號？' : '已有帳號？'}
            <button type="button" onClick={switchMode} className="ml-1 underline text-amber-900 cursor-pointer">
              {mode === 'login' ? '立即註冊' : '返回登入'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

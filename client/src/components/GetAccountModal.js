import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function GetAccountModal({ account, onClose }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
      toast.success(`${type === 'email' ? 'Email' : 'Пароль'} скопирован`);
    } catch (error) {
      toast.error('Ошибка копирования');
    }
  };

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Данные аккаунта</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
                <p className="text-white font-medium">{account.email}</p>
              </div>
              <button
                onClick={() => copyToClipboard(account.email, 'email')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  copiedEmail
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                {copiedEmail ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Пароль
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
                <p className="text-white font-mono font-medium">{account.password}</p>
              </div>
              <button
                onClick={() => copyToClipboard(account.password, 'password')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  copiedPassword
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                {copiedPassword ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Статус
            </label>
            <div className="flex items-center gap-2">
              {account.status === 'available' ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-medium">Доступна</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400 font-medium">Использована</span>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Примечание:</strong> Статус аккаунта не изменяется автоматически.
              Измените его вручную в таблице после использования.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default GetAccountModal;

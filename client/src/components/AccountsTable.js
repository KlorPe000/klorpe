import React from 'react';
import { Copy, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function AccountsTable({ accounts, onStatusToggle }) {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} скопирован в буфер обмена`);
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Пароль
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  Нет аккаунтов для отображения
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account.id}
                  className="hover:bg-gray-700/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">
                        {account.email}
                      </span>
                      <button
                        onClick={() => copyToClipboard(account.email, 'Email')}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-all duration-200"
                        title="Копировать email"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 font-mono">
                        {account.password}
                      </span>
                      <button
                        onClick={() => copyToClipboard(account.password, 'Пароль')}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-all duration-200"
                        title="Копировать пароль"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {account.status === 'available' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-400 font-medium">
                            Доступна
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-400 font-medium">
                            Использована
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onStatusToggle(account.id, account.status)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        account.status === 'available'
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                          : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                      }`}
                    >
                      {account.status === 'available' ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Отметить использованной</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Отметить доступной</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountsTable;

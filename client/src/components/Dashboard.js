import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountsTable from './AccountsTable';
import GetAccountModal from './GetAccountModal';
import { LogOut, Mail, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Dashboard() {
  const { logout, getToken } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get('/api/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки аккаунтов');
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAccount = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/accounts/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedAccount(response.data);
      setIsModalOpen(true);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Нет доступных аккаунтов');
      } else {
        toast.error('Ошибка получения аккаунта');
      }
    }
  };

  const handleStatusToggle = async (accountId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'used' : 'available';
      const token = getToken();
      
      await axios.patch(
        `/api/accounts/${accountId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, status: newStatus } : acc
        )
      );

      toast.success(
        `Статус изменён на ${newStatus === 'available' ? 'доступен' : 'использован'}`
      );
    } catch (error) {
      toast.error('Ошибка изменения статуса');
      console.error('Error updating status:', error);
    }
  };

  const availableCount = accounts.filter((acc) => acc.status === 'available').length;
  const usedCount = accounts.filter((acc) => acc.status === 'used').length;

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-xl font-bold text-white truncate">Email Accounts Manager</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content — прокручиваемая область, список помещается в экран на телефонах */}
      <main className="flex-1 min-h-0 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-6 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Всего</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5 sm:mt-2">{accounts.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Доступно</p>
                <p className="text-xl sm:text-3xl font-bold text-green-400 mt-0.5 sm:mt-2">{availableCount}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Использовано</p>
                <p className="text-xl sm:text-3xl font-bold text-red-400 mt-0.5 sm:mt-2">{usedCount}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <button
            onClick={handleGetAccount}
            disabled={availableCount === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Mail className="w-5 h-5" />
            <span>Получить почту</span>
          </button>
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>

        {/* Table — занимает оставшуюся высоту и прокручивается внутри экрана */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <AccountsTable
              accounts={accounts}
              onStatusToggle={handleStatusToggle}
            />
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <GetAccountModal
          account={selectedAccount}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;

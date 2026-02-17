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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Email Accounts Manager</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Всего аккаунтов</p>
                <p className="text-3xl font-bold text-white mt-2">{accounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Доступно</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{availableCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Использовано</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{usedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <AccountsTable
            accounts={accounts}
            onStatusToggle={handleStatusToggle}
          />
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

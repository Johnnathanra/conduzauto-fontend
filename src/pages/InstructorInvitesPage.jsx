import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { InstructorSidebar } from '../components/InstructorSidebar';
import { Copy, Check, Trash2, Plus, X } from 'lucide-react';

export const InstructorInvitesPage = () => {
  const { isDark } = useTheme();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/my-invites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar convites');
      }
      
      const data = await response.json();
      console.log('✅ [InstructorInvitesPage] Convites carregados:', data.invites);
      
      // Filtrar apenas convites ativos
      const activeInvites = (data.invites || []).filter(invite => invite.isActive);
      setInvites(activeInvites);
    } catch (error) {
      console.error('❌ [InstructorInvitesPage] Erro:', error);
      setSuccessMessage('❌ Erro ao carregar convites');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [InstructorInvitesPage] Convite gerado:', data);
        setSuccessMessage(`✅ Convite gerado com sucesso!\n\n${data.inviteLink}`);
        setShowSuccessModal(true);
        loadInvites();
      } else {
        setSuccessMessage('❌ Erro ao gerar convite');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InstructorInvitesPage] Erro:', error);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInvite = (code) => {
    setConfirmAction({ type: 'single', code });
    setShowConfirmModal(true);
  };

  const handleClearAll = () => {
    setConfirmAction({ type: 'all' });
    setShowConfirmModal(true);
  };

  const confirmAction_Execute = async () => {
    const action = confirmAction;
    setShowConfirmModal(false);

    if (action.type === 'single') {
      await clearInvite(action.code);
    } else if (action.type === 'all') {
      await clearAllInvites();
    }
  };

  const clearInvite = async (code) => {
    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/revoke/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ [InstructorInvitesPage] Convite removido');
        setSuccessMessage('✅ Convite removido com sucesso!');
        setShowSuccessModal(true);
        setInvites(prevInvites => prevInvites.filter(invite => invite.code !== code));
      } else {
        setSuccessMessage('❌ Erro ao remover convite');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InstructorInvitesPage] Erro:', error);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    }
  };

  const clearAllInvites = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/clear-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ [InstructorInvitesPage] Todos os convites foram removidos');
        setSuccessMessage('✅ Todos os convites foram removidos!');
        setShowSuccessModal(true);
        setInvites([]);
      } else {
        setSuccessMessage('❌ Erro ao limpar convites');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InstructorInvitesPage] Erro ao limpar:', error);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link, index) => {
    navigator.clipboard.writeText(link);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  // Truncar URL
  const truncateUrl = (url, length = 35) => {
    if (url.length > length) {
      return url.substring(0, length) + '...';
    }
    return url;
  };

  // Classes reutilizáveis
  const modalBackdrop = `fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50`;
  const modalContent = `${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl max-w-md w-full p-6 shadow-2xl`;
  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all`;
  const secondaryButton = `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-2 px-4 rounded-lg transition-all`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar />

      <div className="md:ml-0 pt-20 md:pt-0">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Meus Convites 🎫
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gere e gerencie convites para seus alunos
            </p>
          </div>
        </div>

        {/* Header com Botões Sticky */}
        <div className={`sticky top-0 z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateInvite}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              {loading ? 'Gerando...' : 'Gerar Novo Convite'}
            </button>

            {invites.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all whitespace-nowrap"
              >
                <Trash2 className="w-5 h-5" />
                Limpar Todos
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Dica fixa */}
          <div className={`${isDark ? 'bg-orange-600' : 'bg-orange-600'} rounded-lg p-4 mb-8 sticky top-16 z-10`}>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-white'}`}>
              💡 <strong>Dica:</strong> Copie o link e compartilhe com seus alunos. Quando clicarem, serão vinculados automaticamente à sua conta.
            </p>
          </div>

          {invites.length === 0 ? (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8 text-center`}>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Nenhum convite gerado ainda. Clique em "Gerar Novo Convite" para começar!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {invites.map((invite, index) => (
                <div
                  key={invite.code}
                  className={`${isDark ? 'bg-gray-800 border-gray-700 hover:border-orange-600' : 'bg-white border-gray-200 hover:border-orange-600'} border rounded-lg p-6 transition-all hover:shadow-lg flex flex-col h-full`}
                >
                  {/* Header Card */}
                  <div className="mb-4">
                    <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Link do Convite
                    </p>
                    <p className={`font-mono text-xs break-all ${isDark ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-100'} p-2 rounded`}>
                      {truncateUrl(invite.link)}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-600">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        🔗 Usos
                      </p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
                        {invite.usageCount}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        📅 Expira
                      </p>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => copyToClipboard(invite.link, index)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                        copied === index
                          ? 'bg-green-600 text-white'
                          : `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-orange-600 hover:bg-orange-800 text-white'}`
                      }`}
                      title={copied === index ? 'Copiado!' : 'Copiar link para área de transferência'}
                    >
                      {copied === index ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleClearInvite(invite.code)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                        isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                      title="Remover este convite"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className={modalBackdrop} onClick={() => setShowConfirmModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {confirmAction?.type === 'all' ? '🗑️ Limpar Todos?' : '🗑️ Limpar Convite?'}
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {confirmAction?.type === 'all' 
                ? 'Tem certeza que deseja limpar TODOS os convites? Esta ação não pode ser desfeita!'
                : 'Tem certeza que deseja limpar este convite? Esta ação não pode ser desfeita!'
              }
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`flex-1 ${secondaryButton}`}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmAction_Execute}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                ✅ Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={modalBackdrop} onClick={() => setShowSuccessModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-6 h-6 text-orange-600" />
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notificação
              </h3>
            </div>
            <p className={`mb-6 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`w-full ${primaryButton}`}
            >
              ✅ OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorInvitesPage;

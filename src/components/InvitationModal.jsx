import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Copy, Check, Trash2, Plus, X } from 'lucide-react';

const InvitationModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      
      if (!token) {
        console.error('❌ [InvitationModal] Token não encontrado');
        setSuccessMessage('❌ Erro: Token não encontrado. Faça login novamente.');
        setShowSuccessModal(true);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/my-invites`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [InvitationModal] Convites carregados:', data.invites);
      
      // Filtrar apenas convites ativos
      const activeInvites = (data.invites || []).filter(invite => invite.isActive);
      console.log(`📊 [InvitationModal] ${activeInvites.length} convite(s) ativo(s) de ${data.invites?.length || 0} total(is)`);
      
      setInvites(activeInvites);
    } catch (error) {
      console.error('❌ [InvitationModal] Erro ao carregar convites:', error);
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
      
      if (!token) {
        setSuccessMessage('❌ Erro: Token não encontrado. Faça login novamente.');
        setShowSuccessModal(true);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log('✅ [InvitationModal] Convite gerado:', data);
        setSuccessMessage(`✅ Convite gerado com sucesso!\n\n${data.inviteLink}`);
        setShowSuccessModal(true);
        loadInvites();
      } else {
        setSuccessMessage('❌ Erro ao gerar convite: ' + (data.message || 'Tente novamente'));
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InvitationModal] Erro ao gerar convite:', error);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInvite = (code) => {
    // Abrir modal de confirmação
    setConfirmAction(code);
    setShowConfirmModal(true);
  };

  const confirmClearInvite = async () => {
    const code = confirmAction;
    setShowConfirmModal(false);

    try {
      setDeletingCode(code);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      
      if (!token) {
        setSuccessMessage('❌ Erro: Token não encontrado. Faça login novamente.');
        setShowSuccessModal(true);
        setDeletingCode(null);
        return;
      }

      console.log(`🔴 [InvitationModal] Revogando convite com code: ${code}`);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/invites/revoke/${code}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [InvitationModal] Convite removido com sucesso');
        setSuccessMessage('✅ Convite removido com sucesso!');
        setShowSuccessModal(true);
        
        // Remover convite da lista localmente
        setInvites(prevInvites => prevInvites.filter(invite => invite.code !== code));
        console.log('✅ [InvitationModal] Convite removido da lista local');
      } else {
        console.error('❌ [InvitationModal] Erro ao remover:', data);
        setSuccessMessage('❌ Erro ao remover convite: ' + (data.message || 'Tente novamente'));
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InvitationModal] Erro ao remover convite:', error);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    } finally {
      setDeletingCode(null);
    }
  };

  const copyToClipboard = (link, index) => {
    navigator.clipboard.writeText(link);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  // Função para truncar URL
  const truncateUrl = (url, length = 40) => {
    if (url.length > length) {
      return url.substring(0, length) + '...';
    }
    return url;
  };

  // Classes reutilizáveis (padrão ConfiguracoesPage)
  const modalBackdrop = `fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50`;
  const modalContent = `${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl max-w-md w-full p-6 shadow-2xl`;
  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all`;
  const secondaryButton = `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-2 px-4 rounded-lg transition-all`;

  if (!isOpen) return null;

  return (
    <div className={modalBackdrop} onClick={onClose}>
      <div className={`rounded-t-lg sm:rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Sticky */}
        <div className={`sticky top-0 z-20 p-4 sm:p-6 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } flex items-center justify-between`}>
          <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gerenciar Convites 🎫
          </h2>
          <button
            onClick={onClose}
            className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Botão Gerar Sticky */}
        <div className={`sticky top-16 z-20 p-4 sm:p-6 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={generateInvite}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Gerando...' : 'Gerar Novo Convite'}
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {invites.length === 0 ? (
            <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-8 text-center`}>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Nenhum convite gerado ainda. Clique em "Gerar Novo Convite" para começar!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invites.map((invite, index) => (
                <div
                  key={invite.code}
                  className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-6`}
                >
                  {/* Linha principal: Link resumido + Info + Botões */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Link resumido */}
                    <div className="flex-1">
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Link do Convite:
                      </p>
                      <p className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {truncateUrl(invite.link)}
                      </p>
                    </div>

                    {/* Informações: Usos e Expiração */}
                    <div className="grid grid-cols-2 gap-6 md:gap-8 md:whitespace-nowrap">
                      <div>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Usos
                        </p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {invite.usageCount}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Expira em
                        </p>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Botões do lado direito */}
                    <div className="flex gap-2 md:flex-col md:gap-2">
                      <button
                        onClick={() => copyToClipboard(invite.link, index)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 md:flex-initial ${
                          copied === index
                            ? 'bg-green-600 text-white'
                            : `${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`
                        }`}
                        title={copied === index ? 'Copiado!' : 'Copiar link para área de transferência'}
                        disabled={deletingCode === invite.code}
                      >
                        {copied === index ? (
                          <>
                            <Check className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleClearInvite(invite.code)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          deletingCode === invite.code
                            ? 'bg-orange-600 text-white'
                            : `${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'}`
                        }`}
                        title="Remover este convite"
                        disabled={deletingCode !== null}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dica Fixada na Base */}
        <div className={`sticky bottom-0 z-20 px-4 sm:px-6 py-3 sm:py-4 mx-4 sm:mx-6 mb-4 rounded-lg ${
          isDark ? 'bg-orange-600' : 'bg-orange-600'
        }`}>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-white'}`}>
            💡 <strong>Dica:</strong> Copie o link e compartilhe com seus alunos.
          </p>
        </div>
      </div>

      {/* Confirm Modal - Padrão ConfiguracoesPage */}
      {showConfirmModal && (
        <div className={modalBackdrop} onClick={() => setShowConfirmModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🗑️ Limpar Convite?
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Tem certeza que deseja limpar este convite? Esta ação não pode ser desfeita!
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`flex-1 ${secondaryButton}`}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmClearInvite}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                ✅ Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Padrão ConfiguracoesPage */}
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

export default InvitationModal;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Copy, Check, Trash2, Plus, X } from 'lucide-react';

const InvitationModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
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
        setSuccessMessage('❌ Erro: Token não encontrado.');
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

      if (!response.ok) throw new Error('Erro ao carregar');

      const data = await response.json();
      const activeInvites = (data.invites || []).filter(invite => invite.isActive);
      setInvites(activeInvites);
    } catch (error) {
      console.error('❌ Erro:', error);
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
        setSuccessMessage('❌ Token não encontrado.');
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
        setSuccessMessage(`✅ Convite gerado!\n\n${data.inviteLink}`);
        setShowSuccessModal(true);
        loadInvites();
      } else {
        setSuccessMessage('❌ Erro ao gerar convite');
        setShowSuccessModal(true);
      }
    } catch (error) {
      setSuccessMessage('❌ Erro ao conectar');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInvite = (code) => {
    setConfirmAction(code);
    setShowConfirmModal(true);
  };

  const confirmClearInvite = async () => {
    const code = confirmAction;
    setShowConfirmModal(false);

    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      
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
        setSuccessMessage('✅ Convite removido!');
        setShowSuccessModal(true);
        setInvites(prevInvites => prevInvites.filter(invite => invite.code !== code));
      } else {
        setSuccessMessage('❌ Erro ao remover');
        setShowSuccessModal(true);
      }
    } catch (error) {
      setSuccessMessage('❌ Erro ao conectar');
      setShowSuccessModal(true);
    }
  };

  const copyToClipboard = (link, index) => {
    navigator.clipboard.writeText(link);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateUrl = (url, length = 18) => {
    return url.length > length ? url.substring(0, length) + '...' : url;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Modal Principal */}
      <div 
        className={`w-full sm:max-w-2xl rounded-t-2xl sm:rounded-lg overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[90vh] ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🎫 Convites
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded flex-shrink-0 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== BOTÕES AÇÃO ===== */}
        <div className={`px-4 py-3 border-b flex-shrink-0 flex gap-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={generateInvite}
            disabled={loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Novo Convite</span>
          </button>
        </div>

        {/* ===== DICA ===== */}
        <div className={`px-4 py-3 flex-shrink-0 ${isDark ? 'bg-orange-600' : 'bg-orange-600'}`}>
          <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">
            💡 Copie e compartilhe com seus alunos
          </p>
        </div>

        {/* ===== CONVITES - SCROLLÁVEL ===== */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {invites.length === 0 ? (
            <div className={`rounded-lg p-4 text-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Nenhum convite gerado
              </p>
            </div>
          ) : (
            invites.map((invite, index) => (
              <div
                key={invite.code}
                className={`rounded-lg p-3 border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Link */}
                <div className="mb-2">
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Link do Convite
                  </p>
                  <div 
                    className={`text-xs p-2 rounded font-mono break-all whitespace-normal ${
                      isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                    }`}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.4',
                      maxHeight: '50px',
                      overflowY: 'auto'
                    }}
                  >
                    {truncateUrl(invite.link, 18)}
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-gray-600">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Usos
                    </p>
                    <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {invite.usageCount}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expira
                    </p>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(invite.link, index)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded text-xs font-semibold transition-all min-h-[36px] ${
                      copied === index
                        ? 'bg-green-600 text-white'
                        : isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {copied === index ? (
                      <><Check className="w-3 h-3" /> <span className="hidden sm:inline">Copiado</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /> <span className="hidden sm:inline">Copiar</span></>
                    )}
                  </button>

                  <button
                    onClick={() => handleClearInvite(invite.code)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded text-xs font-semibold min-h-[36px] ${
                      isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Limpar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== MODAL CONFIRMAÇÃO ===== */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className={`w-full sm:max-w-sm rounded-t-2xl sm:rounded-lg p-4 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🗑️ Confirmar?
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Deseja limpar este convite?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`flex-1 py-2 rounded font-semibold ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearInvite}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SUCESSO ===== */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className={`w-full sm:max-w-sm rounded-t-2xl sm:rounded-lg p-4 max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notificação
              </h3>
            </div>
            <p className={`text-sm mb-4 whitespace-pre-wrap break-words ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationModal;

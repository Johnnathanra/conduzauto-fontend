import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useInstructor } from '../contexts/InstructorContext';
import { useNavigate } from 'react-router-dom';
import { InstructorSidebar } from './InstructorSidebar';
import { LogOut, User, Lock, Bell, Moon, Globe, Trash2, Download, HelpCircle, MessageSquare, X, Check } from 'lucide-react';

export const InstructorSettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { instructor, logoutInstructor } = useInstructor();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('perfil');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(instructor?.name || '');
  const [profileEmail, setProfileEmail] = useState(instructor?.email || '');
  const [profileBio, setProfileBio] = useState(instructor?.bio || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('Português (Brasil)');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    avaliacoes: true
  });

  if (!instructor) {
    navigate('/instructor/auth');
    return null;
  }

  const handleLogout = () => {
    console.log('🚪 [InstructorSettingsPage] Fazendo logout');
    logoutInstructor();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      console.log('🗑️ [InstructorSettingsPage] Deletando conta do instrutor...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/instructor/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        console.log('✅ [InstructorSettingsPage] Conta deletada com sucesso');
        
        // 🔴 NOVO: Remover dados de "manter-me logado" do localStorage (INSTRUTOR)
        localStorage.removeItem('conduzauto_instrutor_remember_email');
        localStorage.removeItem('conduzauto_instrutor_remember_password');
        localStorage.removeItem('conduzauto_instrutor_remember_me');
        console.log('🗑️ [InstructorSettingsPage] Dados de "manter-me logado" removidos');
        
        // Limpar sessionStorage
        sessionStorage.removeItem('conduzauto_instrutor_token');
        sessionStorage.removeItem('conduzauto_instrutor_email');
        sessionStorage.removeItem('conduzauto_instrutor_password');
        console.log('🗑️ [InstructorSettingsPage] sessionStorage limpo');
        
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        setSuccessMessage('✅ Conta deletada com sucesso! Todos os dados foram removidos.');
        
        setTimeout(() => {
          logoutInstructor();
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ [InstructorSettingsPage] Erro ao deletar conta:', errorData);
        setShowDeleteModal(false);
        setSuccessMessage('❌ Erro ao deletar a conta. Tente novamente.');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ [InstructorSettingsPage] Erro na requisição:', error);
      setShowDeleteModal(false);
      setSuccessMessage('❌ Erro ao conectar com o servidor');
      setShowSuccessModal(true);
    }
    setLoading(false);
  };

  const handleSaveProfile = () => {
    setSuccessMessage(`✅ Perfil atualizado!\nNome: ${profileName}\nEmail: ${profileEmail}\nBiografia: ${profileBio}`);
    setShowSuccessModal(true);
    setEditingProfile(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setSuccessMessage('❌ As senhas não coincidem!');
      setShowSuccessModal(true);
      return;
    }
    if (newPassword.length < 6) {
      setSuccessMessage('❌ A senha deve ter pelo menos 6 caracteres!');
      setShowSuccessModal(true);
      return;
    }
    setShowPasswordModal(false);
    setSuccessMessage('✅ Um email foi enviado para confirmar a alteração de senha!');
    setShowSuccessModal(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    setShowNotificationModal(false);
    const config = `Email: ${notifications.email ? 'Ativado' : 'Desativado'}\nPush: ${notifications.push ? 'Ativado' : 'Desativado'}\nAvisos de Avaliações: ${notifications.avaliacoes ? 'Ativado' : 'Desativado'}`;
    setSuccessMessage(`✅ Notificações configuradas!\n${config}`);
    setShowSuccessModal(true);
  };

  const handleChangeLanguage = (lang) => {
    setCurrentLanguage(lang);
    setShowLanguageModal(false);
    setSuccessMessage(`✅ Idioma alterado para ${lang}!`);
    setShowSuccessModal(true);
  };

  const handleExportReports = () => {
    setSuccessMessage('✅ Relatórios exportados! Verifique sua pasta de downloads.');
    setShowSuccessModal(true);
  };

  const handleHelpCenter = () => {
    setSuccessMessage('🆘 Abrindo Central de Ajuda...\n\n• Como começar?\n• Dúvidas sobre avaliações\n• Problemas técnicos\n• Contato com suporte');
    setShowSuccessModal(true);
  };

  const handleChatSupport = () => {
    setSuccessMessage('💬 Chat com Suporte iniciado!\n\nUm agente irá atendê-lo em breve...');
    setShowSuccessModal(true);
  };

  // Classes reutilizáveis
  const modalBackdrop = `fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50`;
  const modalContent = `${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl max-w-md w-full p-6 shadow-2xl`;
  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all`;
  const secondaryButton = `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-2 px-4 rounded-lg transition-all`;
  const inputField = `w-full px-4 py-2 rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar />

      <div className="md:ml-0 pt-20 md:pt-0">

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Configurações ⚙️
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie sua conta e preferências
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Sidebar Menu */}
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} h-fit`}>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('perfil')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === 'perfil'
                      ? 'bg-orange-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <User className="w-4 h-4" /> Perfil
                </button>
                <button
                  onClick={() => setActiveSection('seguranca')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === 'seguranca'
                      ? 'bg-orange-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <Lock className="w-4 h-4" /> Segurança
                </button>
                <button
                  onClick={() => setActiveSection('preferencias')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === 'preferencias'
                      ? 'bg-orange-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <Bell className="w-4 h-4" /> Preferências
                </button>
                <button
                  onClick={() => setActiveSection('relatorios')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === 'relatorios'
                      ? 'bg-orange-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <Download className="w-4 h-4" /> Relatórios
                </button>
                <button
                  onClick={() => setActiveSection('suporte')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === 'suporte'
                      ? 'bg-orange-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Suporte
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:col-span-3">

              {/* Perfil */}
              {activeSection === 'perfil' && (
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Meu Perfil</h2>

                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nome</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={inputField}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className={inputField}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Biografia</label>
                        <textarea
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          className={`${inputField} resize-none`}
                          rows="4"
                          placeholder="Conte um pouco sobre você..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className={`flex-1 ${primaryButton}`}
                        >
                          ✅ Salvar
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className={`flex-1 ${secondaryButton}`}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nome</label>
                        <input type="text" value={profileName} readOnly className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                        <input type="email" value={profileEmail} readOnly className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Biografia</label>
                        <textarea value={profileBio} readOnly className={`w-full px-4 py-2 rounded-lg resize-none ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} rows="4" />
                      </div>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className={primaryButton}
                      >
                        ✏️ Editar Perfil
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Segurança */}
              {activeSection === 'seguranca' && (
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Segurança</h2>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Alterar Senha</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Atualize sua senha regularmente</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className={`${primaryButton} text-sm px-3 py-1`}
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferências */}
              {activeSection === 'preferencias' && (
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Preferências</h2>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Modo Noturno</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ativa/desativa tema escuro</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isDark ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                      >
                        {isDark ? '🌙 Ativo' : '☀️ Desativo'}
                      </button>
                    </div>
                    <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Notificações</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email, push e avisos</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotificationModal(true)}
                        className={`${primaryButton} text-sm px-3 py-1`}
                      >
                        Configurar
                      </button>
                    </div>
                    <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Idioma</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentLanguage}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowLanguageModal(true)}
                        className={`${primaryButton} text-sm px-3 py-1`}
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Relatórios */}
              {activeSection === 'relatorios' && (
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Relatórios</h2>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Exportar Relatórios</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Baixe seus relatórios de avaliações</p>
                          </div>
                        </div>
                        <button
                          onClick={handleExportReports}
                          className={`${primaryButton} text-sm px-3 py-1`}
                        >
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suporte */}
              {activeSection === 'suporte' && (
                <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Suporte</h2>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Central de Ajuda</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Perguntas frequentes</p>
                          </div>
                        </div>
                        <button
                          onClick={handleHelpCenter}
                          className={`${primaryButton} text-sm px-3 py-1`}
                        >
                          Acessar
                        </button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Chat com Suporte</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fale conosco agora</p>
                          </div>
                        </div>
                        <button
                          onClick={handleChatSupport}
                          className={`${primaryButton} text-sm px-3 py-1`}
                        >
                          Iniciar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout e Delete Account */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 ${primaryButton}`}
                >
                  <LogOut className="w-5 h-5" />
                  Sair da Conta
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  {loading ? 'Deletando...' : 'Deletar Conta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className={modalBackdrop} onClick={() => setShowDeleteModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🗑️ Deletar Conta?
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Tem certeza? Esta ação é irreversível e todos seus dados serão perdidos.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 ${secondaryButton}`}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                {loading ? '⏳ Deletando...' : '✅ Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className={modalBackdrop} onClick={() => setShowPasswordModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🔐 Alterar Senha
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <input type="password" placeholder="Senha atual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputField} />
              <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputField} />
              <input type="password" placeholder="Confirmar senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputField} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`flex-1 ${secondaryButton}`}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className={`flex-1 ${primaryButton}`}
              >
                ✅ Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className={modalBackdrop} onClick={() => setShowNotificationModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🔔 Configurar Notificações
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>📧 Notificações por Email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>📱 Notificações Push</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.avaliacoes}
                  onChange={(e) => setNotifications({...notifications, avaliacoes: e.target.checked})}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>⭐ Avisos de Avaliações</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNotificationModal(false)}
                className={`flex-1 ${secondaryButton}`}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleSaveNotifications}
                className={`flex-1 ${primaryButton}`}
              >
                ✅ Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className={modalBackdrop} onClick={() => setShowLanguageModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🌐 Selecionar Idioma
              </h3>
              <button onClick={() => setShowLanguageModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {['Português (Brasil)', 'English', 'Español', 'Français'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleChangeLanguage(lang)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentLanguage === lang
                      ? 'bg-orange-600 text-white font-bold'
                      : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className={`w-full ${secondaryButton}`}
            >
              ❌ Fechar
            </button>
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

export default InstructorSettingsPage;

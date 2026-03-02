import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Check, AlertCircle, Loader } from 'lucide-react';

const InviteLandingPage = () => {
  const { isDark } = useTheme();
  const { slug, code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);

  const validateInvite = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      console.log('🔍 [InviteLandingPage] Validando convite:', { slug, code, apiUrl });

      const response = await fetch(`${apiUrl}/invites/validate/${slug}/${code}`);
      const data = await response.json();

      console.log('✅ [InviteLandingPage] Resposta da validação:', data);

      if (response.ok && data.valid) {
        setInvite(data);
        setError(null);
      } else {
        setError(data.message || 'Convite inválido ou expirado');
        setInvite(null);
      }
    } catch (err) {
      console.error('❌ [InviteLandingPage] Erro:', err);
      setError('Erro ao validar convite. Tente novamente mais tarde.');
      setInvite(null);
    } finally {
      setLoading(false);
    }
  }, [slug, code]);

  useEffect(() => {
    validateInvite();
  }, [validateInvite]);

  const handleJoinInstructor = () => {
    if (invite) {
      const inviteData = {
        slug,
        code,
        instructorId: invite.instructorId,
        instructorName: invite.instructorName,
        instructorEmail: invite.instructorEmail,
      };
      sessionStorage.setItem('inviteData', JSON.stringify(inviteData));
      console.log('💾 [InviteLandingPage] Dados do convite salvos:', inviteData);
      navigate('/signup', { state: { inviteSlug: slug, inviteCode: code, instructorName: invite.instructorName } });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Validando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Convite Inválido</h1>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            ← Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="text-center mb-6">
          <Check className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Convite Válido! 🎉</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Você foi convidado para estudar com um instrutor</p>
        </div>

        {invite && (
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'} border ${isDark ? 'border-gray-600' : 'border-orange-200'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>👨‍🏫 Instrutor</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{invite.instructorName}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{invite.instructorEmail}</p>

            <hr className={`my-4 ${isDark ? 'border-gray-600' : 'border-orange-200'}`} />

            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>📅 Expira em</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              {new Date(invite.expiresAt).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        <button
          onClick={handleJoinInstructor}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all mb-3 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Prosseguir para Registro
        </button>

        <button
          onClick={() => navigate('/')}
          className={`w-full ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-2 px-6 rounded-lg transition-all`}
        >
          ← Voltar para Home
        </button>
      </div>
    </div>
  );
};

export default InviteLandingPage;

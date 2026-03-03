import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Footer } from '../components/Footer';
import { AlertCircle, Loader, ArrowRight } from 'lucide-react';

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
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err) {
      console.error('❌ [InviteLandingPage] Erro:', err);
      setError('Erro ao validar convite. Redirecionando...');
      setInvite(null);
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  }, [slug, code, navigate]);

  useEffect(() => {
    validateInvite();
  }, [validateInvite]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Validando seu convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header Customizado - Centralizado */}
        <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-orange-100'} border-b sticky top-0 z-50 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center px-3 sm:px-4 py-7">
            <a href="/" className="flex items-center gap-2">
              <img 
                src="/ConduzAuto.png" 
                alt="ConduzAuto Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-lg"
              />
              <img 
                src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto gray.svg'} 
                alt="ConduzAuto Logo" 
                className="h-4 sm:h-5 md:h-5 object-contain"
              />
            </a>
          </div>
        </header>

        {/* Erro */}
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

        {/* Footer com Logo Corrigida */}
        <footer className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-900 border-gray-800'} border-t transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Logo e Nome */}
              <div className="flex items-center gap-2">
                <img 
                  src="/ConduzAuto.png" 
                  alt="ConduzAuto Logo" 
                  className="w-8 h-8 rounded-lg shadow-lg"
                />
                <img 
                  src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto white.svg'} 
                  alt="ConduzAuto Logo" 
                  className="h-4 object-contain"
                />
              </div>

              {/* Copyright */}
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right">
                © 2024 ConduzAuto. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (invite) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header Customizado - Centralizado */}
        <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-orange-100'} border-b sticky top-0 z-50 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center px-3 sm:px-4 py-7">
            <a href="/" className="flex items-center gap-2">
              <img 
                src="/ConduzAuto.png" 
                alt="ConduzAuto Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-lg"
              />
              <img 
                src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto gray.svg'} 
                alt="ConduzAuto Logo" 
                className="h-4 sm:h-5 md:h-5 object-contain"
              />
            </a>
          </div>
        </header>

        {/* Hero Section - Imagem em Destaque */}
        <section className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} py-6 sm:py-12 md:py-16 px-3 sm:px-4 lg:px-8 transition-colors duration-300 flex-1`}>
          <div className="max-w-7xl mx-auto">
       {/* Frase "Seu convite chegou" em destaque */}
<div className="mb-2 sm:mb-3 md:mb-4 flex justify-center w-full text-center">
  <div>
    <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
      Seu convite <span className="text-orange-600">chegou</span>
    </h1>
  </div>
</div>

{/* Imagem Grande */}
<div className="mb-3 sm:mb-4 md:mb-6 flex justify-center w-full">
  <div className={`rounded-xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl border-4 sm:border-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} w-full h-auto aspect-video`}>
    <img
      src="/BVjwvNJ5.png"
      alt="Aprenda a Conduzir Bem"
      className="w-full h-full object-cover"
    />
  </div>
</div>

            {/* Conteúdo - Texto e Instrutor */}
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              
              {/* Heading com duas cores em uma linha */}
<div className="w-full mb-6 sm:mb-8">
  <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
    Aprenda a <span className="text-orange-600">Conduzir Bem</span>
  </h2>
</div>

              {/* Instrutor Info - Apenas Nome */}
<div className={`p-4 sm:p-6 rounded-lg ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'} w-full max-w-sm`}>
  <p className={`text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-orange-200' : 'text-gray-700'}`}>
    Seu Instrutor
  </p>
  <p className={`text-xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-orange-600'}`}>
    {invite.instructorName}
  </p>
</div>


              {/* Description */}
              <p className={`text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} w-full max-w-2xl`}>
                Comece sua jornada agora! Aprenda técnicas comprovadas de direção defensiva com conteúdo estruturado para iniciantes e motoristas experientes.
              </p>

              {/* CTA Button */}
              <div className="pt-4 sm:pt-6 w-full flex justify-center">
                <button
                  onClick={() => {
                    sessionStorage.setItem('inviteData', JSON.stringify({ 
                      slug, 
                      code, 
                      instructorId: invite.instructorId, 
                      instructorName: invite.instructorName, 
                      instructorEmail: invite.instructorEmail 
                    }));
                    navigate('/signup', { 
                      state: { 
                        inviteSlug: slug, 
                        inviteCode: code, 
                        instructorName: invite.instructorName 
                      } 
                    });
                  }}
                  className="inline-flex bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 px-20 sm:py-5 sm:px-12 rounded-lg items-center gap-3 transition-all hover:shadow-lg text-base sm:text-xl whitespace-nowrap"
                >
                  Começar Agora
                  <ArrowRight className="w-3 sm:w-5 h-3 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer com Logo Corrigida */}
        <footer className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-900 border-gray-800'} border-t transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Logo e Nome */}
              <div className="flex items-center gap-2">
                <img 
                  src="/ConduzAuto.png" 
                  alt="ConduzAuto Logo" 
                  className="w-8 h-8 rounded-lg shadow-lg"
                />
                <img 
                  src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto white.svg'} 
                  alt="ConduzAuto Logo" 
                  className="h-4 object-contain"
                />
              </div>

              {/* Copyright */}
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right">
                © 2024 ConduzAuto. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return null;
};

export default InviteLandingPage;

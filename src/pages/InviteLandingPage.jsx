import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function InviteLandingPage() {
  const { slug, code } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invite, setInvite] = useState(null);

  const validateInvite = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      console.log('🔍 [InviteLandingPage] Validando convite...');
      console.log('   slug:', slug);
      console.log('   code:', code);

      const response = await fetch(`${apiUrl}/instructor/invitation/${slug}/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 [InviteLandingPage] Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [InviteLandingPage] Erro:', errorData);
        setError(errorData.error || 'Convite inválido ou expirado');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ [InviteLandingPage] Convite validado:', data);

      setInvite({
        instructorId: data.instructorId,
        instructorName: data.instructorName,
        instructorEmail: data.instructorEmail,
        slug: slug,
        code: code
      });

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('❌ [InviteLandingPage] Exceção:', err.message);
      setError('Erro ao validar convite. Tente novamente.');
      setLoading(false);
    }
  }, [slug, code]);

  useEffect(() => {
    validateInvite();
  }, [validateInvite]);

  const handleGetStarted = () => {
    console.log('🎯 [InviteLandingPage] Usuário clicou em "Começar Agora"');

    sessionStorage.setItem('inviteData', JSON.stringify({
      inviteCode: code,
      inviteSlug: slug,
      instructorName: invite.instructorName,
      instructorId: invite.instructorId
    }));

    navigate('/signup', {
      state: {
        inviteCode: code,
        inviteSlug: slug,
        instructorName: invite.instructorName,
        instructorId: invite.instructorId
      }
    });
  };

  // Componente Footer Reutilizável
  const FooterComponent = () => (
    <footer className="bg-gray-900 border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <img 
              src="/ConduzAuto.png" 
              alt="ConduzAuto Logo" 
              className="w-10 h-10 rounded-lg shadow-lg"
            />
            <img 
              src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto white.svg'} 
              alt="ConduzAuto" 
              className="h-6 object-contain"
            />
          </div>

          {/* Copyright */}
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right">
            © 2024 ConduzAuto. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );

  if (loading) {
    return (
      <>
        <section className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} py-32 px-4 flex items-center justify-center min-h-screen`}>
          <div className="text-center">
            <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-orange-600" />
            <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Validando convite...
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Aguarde um momento
            </p>
          </div>
        </section>
        <FooterComponent />
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} py-32 px-4 flex items-center justify-center min-h-screen`}>
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-8 max-w-md w-full shadow-2xl`}>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className={`text-2xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Convite Inválido
            </h2>
            <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all w-full"
            >
              ← Voltar à página inicial
            </button>
          </div>
        </section>
        <FooterComponent />
      </>
    );
  }

  if (invite) {
    return (
      <>
        <section className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} py-4 sm:py-8 md:py-12 px-2 sm:px-2 md:px-2 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto w-full">
            
            {/* Logo e Nome Centralizados Acima */}
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="flex items-center justify-center gap-3">
                <img
                  src="/ConduzAuto.png"
                  alt="ConduzAuto Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-lg"
                />
                <img
                  src={isDark ? '/ConduzAuto white.svg' : '/ConduzAuto gray.svg'}
                  alt="ConduzAuto"
                  className="h-6 sm:h-8 object-contain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 items-start">
              
              {/* Left Content */}
              <div className="space-y-3 sm:space-y-3 md:space-y-3 order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                
                {/* Convite Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Convite Confirmado!</span>
                </div>

                {/* Main Heading */}
                <div className="lg:max-w-lg">
                  <h2 className={`text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Parabéns!
                  </h2>
                  <h2 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-orange-600">
                    Você foi convidado
                  </h2>
                </div>

                {/* Instructor Info Card */}
                <div className="flex justify-center lg:justify-start w-full">
                  <div className={`w-full lg:max-w-lg bg-orange-100 rounded-lg p-6 sm:p-5`}>
                    <p className={`text-sm font-medium mb-2 text-center text-gray-600`}>
                      Instrutor
                    </p>
                    <h3 className={`text-3xl sm:text-4xl font-bold text-center text-orange-600`}>
                      {invite.instructorName}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div className="flex justify-start w-full lg:pl-0">
                  <p className={`text-left text-sm md:text-base max-w-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Clique em "Começar Agora" para criar sua conta e se conectar com seu instrutor. Você terá acesso a aulas de legislação, comando do veículo e técnicas de direção.
                  </p>
                </div>
              </div>

              {/* Right Visual - Imagem */}
              <div className="order-1 lg:order-2 lg:col-span-2 flex justify-center lg:justify-center">
                <div className={`rounded-xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl border-4 sm:border-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl h-auto aspect-video`}>
                  <img
                    src="/BVjwvNJ5.png"
                    alt="Aprenda a Conduzir Bem"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button - Centralizado */}
            <div className="flex justify-center mt-8 md:mt-8">
              <button
                onClick={handleGetStarted}
                className="inline-flex bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 px-20 sm:py-5 sm:px-12 rounded-lg items-center gap-3 transition-all hover:shadow-lg text-base sm:text-xl whitespace-nowrap"
              >
                Começar Agora
                <ArrowRight className="w-3 sm:w-5 h-3 sm:h-5" />
              </button>
            </div>
          </div>
        </section>
        <FooterComponent />
      </>
    );
  }

  return null;
}

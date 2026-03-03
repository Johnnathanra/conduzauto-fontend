import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudent } from '../contexts/StudentContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupUser, error: contextError } = useStudent();
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteState, setInviteState] = useState(null);

  // Carregar dados do convite se existirem
  useEffect(() => {
    console.log('🔍 [StudentSignupPage] location.state:', location.state);
    
    if (location.state?.inviteCode) {
      console.log('📧 [StudentSignupPage] Convite detectado!');
      console.log('   inviteSlug (raw):', location.state.inviteSlug);
      console.log('   inviteSlug (trimmed):', location.state.inviteSlug?.trim());
      console.log('   inviteCode (raw):', location.state.inviteCode);
      console.log('   instructorName:', location.state.instructorName);
      
      const newInviteState = {
        inviteCode: location.state.inviteCode?.trim(),
        inviteSlug: location.state.inviteSlug?.trim(),
        instructorName: location.state.instructorName
      };
      
      setInviteState(newInviteState);
      console.log('✅ [StudentSignupPage] inviteState definido:', newInviteState);
    } else {
      console.log('⚠️ [StudentSignupPage] Nenhum convite nos state');
    }
  }, [location.state]);

  useEffect(() => {
    if (contextError) {
      setError(`❌ ${contextError}`);
    }
  }, [contextError]);

  // ✅ FUNÇÃO CORRIGIDA: Aceitar o convite
  const acceptInvite = async (token) => {
    try {
      if (!inviteState?.inviteCode || !inviteState?.inviteSlug) {
        console.log('⚠️ [StudentSignupPage] Nenhum convite para aceitar');
        return true;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('🎫 [StudentSignupPage] Iniciando aceitação do convite...');
      console.log('   apiUrl:', apiUrl);
      console.log('   slug a enviar:', `"${inviteState.inviteSlug}"`);
      console.log('   code a enviar:', `"${inviteState.inviteCode}"`);
      console.log('   token (primeiros 20 chars):', token?.substring(0, 20));

      const body = {
        slug: inviteState.inviteSlug.trim(),
        code: inviteState.inviteCode.trim()
      };

      console.log('📤 [StudentSignupPage] Body a enviar:', JSON.stringify(body));
      
      const response = await fetch(`${apiUrl}/instructor/accept-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('📥 [StudentSignupPage] Status da resposta:', response.status);
      
      const data = await response.json();
      console.log('📥 [StudentSignupPage] Dados da resposta:', data);

      if (!response.ok) {
        console.error('❌ [StudentSignupPage] Erro ao aceitar convite:', data.error);
        console.error('   Erro completo:', data);
        return false;
      }

      console.log('✅ [StudentSignupPage] Convite aceito com sucesso!');
      console.log('   instructorName:', data.instructorName);
      console.log('   instructorId:', data.instructorId);
      return true;
    } catch (error) {
      console.error('❌ [StudentSignupPage] Exceção ao aceitar convite:', error.message);
      console.error('   Stack:', error.stack);
      return false;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 [StudentSignupPage] handleSignup iniciado');
    console.log('   inviteState:', inviteState);

    if (!name || !email || !password || !confirmPassword) {
      setError('❌ Por favor, preencha todos os campos!');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ As senhas não correspondem!');
      return;
    }

    if (password.length < 6) {
      setError('❌ A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);

    const signupData = {
      name,
      email,
      password,
      confirmPassword,
      ...(inviteState?.inviteCode && { 
        inviteCode: inviteState.inviteCode, 
        inviteSlug: inviteState.inviteSlug 
      })
    };

    console.log('📝 [StudentSignupPage] Dados do cadastro:', signupData);

    const result = await signupUser(signupData);

    console.log('📝 [StudentSignupPage] Resultado do signupUser:', {
      success: result?.success,
      token: result?.token?.substring(0, 20) + '...'
    });

    if (result?.success) {
      console.log('✅ [StudentSignupPage] Cadastro bem-sucedido!');
      
      // ✅ ACEITAR CONVITE APÓS CADASTRO
      if (inviteState?.inviteCode) {
        console.log('🎫 [StudentSignupPage] Processando aceitação do convite...');
        const inviteAccepted = await acceptInvite(result.token);
        console.log('🎫 [StudentSignupPage] Resultado da aceitação:', inviteAccepted);
      } else {
        console.log('⚠️ [StudentSignupPage] Nenhum convite para processar');
      }

      setSuccess('✅ Cadastro realizado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      sessionStorage.removeItem('inviteData');
      
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      console.log('❌ [StudentSignupPage] Cadastro falhou');
      setPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  const inputField = `w-full px-4 py-2 rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`;
  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all w-full disabled:opacity-50`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} flex items-start justify-center px-4 py-20`}>
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-8 max-w-md w-full shadow-2xl`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cadastro Aluno</h2>
        <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Preencha os dados abaixo</p>

        {/* Banner de convite */}
{inviteState?.inviteCode && (
  <div className={`${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'} rounded-lg p-4 mb-8`}>
    <p className={`text-center font-bold text-orange-600 text-4xl mb-2`}>
      Parabéns!
    </p>
    <p className={`text-sm text-center ${isDark ? 'text-orange-200' : 'text-gray-800'} mb-2`}>
      Você foi convidado por
    </p>
    <p className={`text-center font-bold text-orange-600 text-3xl`}>
      {inviteState.instructorName || 'um instrutor'}
    </p>
  </div>
)}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nome Completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputField}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputField}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputField} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputField} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={primaryButton}>
            {loading ? 'Carregando...' : 'Criar Conta'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Já tem conta? <button onClick={() => navigate('/auth')} className="text-orange-600 hover:text-orange-700 font-bold">Faça login</button>
        </p>

        <button onClick={() => window.location.href = '/'} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 text-sm rounded-lg transition-all w-fit mx-auto block mt-6">
          ← Voltar à página inicial
        </button>
      </div>
    </div>
  );
}

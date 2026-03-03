import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useInstructor } from '../contexts/InstructorContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Star, Eye, Edit, Trash2, Plus, X, LogOut, Users, BarChart3, TrendingUp, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import InstructorStudentsManager from './InstructorStudentsManager';

export const InstructorDashboard = () => {
  const { isDark } = useTheme();
  const { instructor, logoutInstructor } = useInstructor();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Estados
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [showStudentsManager, setShowStudentsManager] = useState(false);

  // ✅ Estados para modais customizados
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [pendingDeleteEvaluationId, setPendingDeleteEvaluationId] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  // ✅ Formulário de avaliação
  const [evaluationForm, setEvaluationForm] = useState({
    courseLesson: '',
    rating: 5,
    concept: 'Excelente',
    feedback: '',
    improvementSuggestions: '',
  });

  // ✅ Carregar alunos do backend
  useEffect(() => {
    if (!instructor) {
      navigate('/instructor/auth');
      return;
    }
    
    fetchStudents();
    
    if (location.state?.openStudentsManager) {
      setShowStudentsManager(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructor, navigate, location.state]);

  // ✅ Buscar alunos do backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('👥 [Dashboard] Buscando alunos do instrutor...');
      
      const response = await fetch(`${apiUrl}/instructor/my-students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao carregar alunos`);
      }

      const data = await response.json();
      console.log('✅ [Dashboard] Alunos carregados:', data.length || 0);
      
      setStudents(Array.isArray(data) ? data : []);
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao carregar alunos:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrar alunos
  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // ✅ Buscar avaliações de um aluno
  const fetchStudentEvaluations = async (studentId) => {
    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/instructor/student/${studentId}/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvaluations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
      setEvaluations([]);
    }
  };

  // ✅ Abrir avaliações de um aluno
  const handleOpenEvaluation = (student) => {
    setSelectedStudent(student);
    fetchStudentEvaluations(student._id);
    setShowViewModal(true);
  };

  // ✅ Nova avaliação
  const handleNewEvaluation = (student) => {
    setSelectedStudent(student);
    setEvaluationForm({
      courseLesson: '',
      rating: 5,
      concept: 'Excelente',
      feedback: '',
      improvementSuggestions: '',
    });
    setEditingEvaluation(null);
    setShowEvaluationModal(true);
  };

  // ✅ Submeter avaliação
  const handleSubmitEvaluation = async () => {
    if (!evaluationForm.courseLesson.trim()) {
      setModalMessage('Por favor, preencha o nome da aula!');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const method = editingEvaluation ? 'PUT' : 'POST';
      const url = editingEvaluation 
        ? `${apiUrl}/instructor/evaluate/${editingEvaluation._id}`
        : `${apiUrl}/instructor/evaluate`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          ...evaluationForm
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${editingEvaluation ? 'atualizar' : 'criar'} avaliação`);
      }

      setModalMessage(`✅ Avaliação ${editingEvaluation ? 'atualizada' : 'criada'} com sucesso!`);
      setShowSuccessModal(true);
      setShowEvaluationModal(false);
      fetchStudentEvaluations(selectedStudent._id);
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
      setModalMessage('Erro ao salvar avaliação!');
      setShowErrorModal(true);
    }
  };

  // ✅ Preparar para deletar avaliação
  const handleDeleteEvaluation = (evaluationId) => {
    setPendingDeleteEvaluationId(evaluationId);
    setShowConfirmDeleteModal(true);
  };

  // ✅ Confirmar e executar deleção
  const confirmDeleteEvaluation = async () => {
    try {
      const token = sessionStorage.getItem('conduzauto_instrutor_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/instructor/evaluate/${pendingDeleteEvaluationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar avaliação');
      }

      setModalMessage('✅ Avaliação deletada com sucesso!');
      setShowSuccessModal(true);
      setShowConfirmDeleteModal(false);
      setPendingDeleteEvaluationId(null);
      fetchStudentEvaluations(selectedStudent._id);
    } catch (error) {
      console.error('❌ Erro ao deletar avaliação:', error);
      setModalMessage('Erro ao deletar avaliação!');
      setShowErrorModal(true);
      setShowConfirmDeleteModal(false);
    }
  };

  // ✅ Cores para conceitos
  const getConceptColor = (concept) => {
    switch (concept) {
      case 'Excelente':
        return isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'Bom':
        return isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'Satisfatório':
        return isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Insuficiente':
        return isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Cor para rating
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ✅ Classes reutilizáveis
  const inputField = `w-full px-4 py-2 rounded-lg border-2 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all`;

  const modalBackdrop = `fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`;
  const modalContent = `${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl max-w-md w-full p-6 shadow-2xl`;

  // ✅ Logout
  const handleLogout = () => {
    logoutInstructor();
    navigate('/instructor/auth');
  };

  // ✅ Estatísticas
  const totalStudents = students.length;
  const totalEvaluations = evaluations.length;
  const averageRating = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
    : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="md:ml-0 pt-20 md:pt-0"></div>
      
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6 sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bem-vindo, {instructor?.name}! 👋
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie seus alunos e avaliações
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Botões de ação */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowStudentsManager(true)}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            <Users className="w-4 h-4" />
            Gerenciar Alunos
          </button>
          <button
            onClick={() => navigate('/instructor/invites')}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            title="Gerar links de convite para alunos"
          >
            <Gift className="w-4 h-4" />
            Gerar Convite
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total de Alunos</p>
                <h3 className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalStudents}
                </h3>
              </div>
              <Users className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total de Avaliações</p>
                <h3 className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalEvaluations}
                </h3>
              </div>
              <BarChart3 className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avaliação Média</p>
                <h3 className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {averageRating}/5
                </h3>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Barra de busca */}
        <div className={`mb-8 flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Pesquisar aluno por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent outline-none ${
              isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Lista de alunos */}
        {loading ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Carregando alunos...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {students.length === 0 ? 'Nenhum aluno vinculado ainda' : 'Nenhum aluno encontrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div
                key={student._id}
                className={`rounded-lg p-6 shadow-md hover:shadow-lg transition-all ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {student.email}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'
                    }`}>
                      Nível {student.level || 1}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      XP Total: <span className="font-bold text-orange-600">{student.totalXP || 0}</span>
                    </p>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cursos: <span className="font-bold text-orange-600">{student.coursesCompleted || 0}</span>
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Horas: <span className="font-bold text-orange-600">{student.hoursLearned || 0}h</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenEvaluation(student)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-orange-900 text-orange-200 hover:bg-orange-800'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Avaliações
                  </button>
                  <button
                    onClick={() => handleNewEvaluation(student)}
                    className={`w-full flex items-center justify-center gap-2 ${primaryButton} text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    Nova Avaliação
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de avaliações */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className={`rounded-t-lg sm:rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 p-4 sm:p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Avaliações de {selectedStudent.name}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {evaluations.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nenhuma avaliação ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {evaluations.map(evaluation => (
                    <div
                      key={evaluation._id}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {evaluation.courseLesson}
                          </h4>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(evaluation.evaluatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < evaluation.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm font-bold ${getRatingColor(evaluation.rating)}`}>
                            {evaluation.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getConceptColor(evaluation.concept)}`}>
                          {evaluation.concept}
                        </span>
                      </div>

                      {evaluation.feedback && (
                        <div className="mb-3">
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Feedback:
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {evaluation.feedback}
                          </p>
                        </div>
                      )}

                      {evaluation.improvementSuggestions && (
                        <div className="mb-3">
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Sugestões de Melhoria:
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {evaluation.improvementSuggestions}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t border-gray-300">
                        <button
                          onClick={() => {
                            setEditingEvaluation(evaluation);
                            setEvaluationForm({
                              courseLesson: evaluation.courseLesson,
                              rating: evaluation.rating,
                              concept: evaluation.concept,
                              feedback: evaluation.feedback,
                              improvementSuggestions: evaluation.improvementSuggestions,
                            });
                            setShowViewModal(false);
                            setShowEvaluationModal(true);
                          }}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-yellow-900 text-yellow-200 hover:bg-yellow-800'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          <Edit className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEvaluation(evaluation._id)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-red-900 text-red-200 hover:bg-red-800'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleNewEvaluation(selectedStudent);
                }}
                className={`w-full mt-6 ${primaryButton}`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Nova Avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de criar/editar avaliação */}
      {showEvaluationModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className={`rounded-t-lg sm:rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 p-4 sm:p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEvaluation ? 'Editar' : 'Nova'} Avaliação - {selectedStudent.name}
              </h2>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className={`p-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nome da Aula *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fundamentos de Direção"
                  value={evaluationForm.courseLesson}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, courseLesson: e.target.value })}
                  className={inputField}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Avaliação (Estrelas)
                  </label>
                  <select
                    value={evaluationForm.rating}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, rating: parseInt(e.target.value) })}
                    className={inputField}
                  >
                    <option value="1">⭐ 1 - Insuficiente</option>
                    <option value="2">⭐⭐ 2 - Fraco</option>
                    <option value="3">⭐⭐⭐ 3 - Regular</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Bom</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excelente</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Conceito
                  </label>
                  <select
                    value={evaluationForm.concept}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, concept: e.target.value })}
                    className={inputField}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Bom">Bom</option>
                    <option value="Satisfatório">Satisfatório</option>
                    <option value="Insuficiente">Insuficiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Feedback (Opcional)
                </label>
                <textarea
                  placeholder="Digite o feedback do aluno..."
                  value={evaluationForm.feedback}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, feedback: e.target.value })}
                  className={`${inputField} resize-none`}
                  rows="4"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sugestões de Melhoria (Opcional)
                </label>
                <textarea
                  placeholder="Sugira melhorias para o aluno..."
                  value={evaluationForm.improvementSuggestions}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, improvementSuggestions: e.target.value })}
                  className={`${inputField} resize-none`}
                  rows="4"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  className={`flex-1 ${primaryButton}`}
                >
                  {editingEvaluation ? 'Atualizar' : 'Criar'} Avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE SUCESSO */}
      {showSuccessModal && (
        <div className={modalBackdrop} onClick={() => setShowSuccessModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ✅ Sucesso
              </h3>
              <button onClick={() => setShowSuccessModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {modalMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`w-full ${primaryButton}`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE ERRO */}
      {showErrorModal && (
        <div className={modalBackdrop} onClick={() => setShowErrorModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⚠️ Erro
              </h3>
              <button onClick={() => setShowErrorModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {modalMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className={`w-full ${primaryButton}`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE CONFIRMAÇÃO DE DELEÇÃO */}
      {showConfirmDeleteModal && (
        <div className={modalBackdrop} onClick={() => setShowConfirmDeleteModal(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🗑️ Deletar Avaliação?
              </h3>
              <button onClick={() => setShowConfirmDeleteModal(false)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDeleteModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteEvaluation}
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all`}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gerenciar alunos */}
      {showStudentsManager && (
        <InstructorStudentsManager onClose={() => setShowStudentsManager(false)} />
      )}
    </div>
  );
};

export default InstructorDashboard;

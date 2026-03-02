import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useInstructor } from '../contexts/InstructorContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Star, Eye, Edit, Trash2, Plus, X, LogOut, Users, BarChart3, TrendingUp, Gift } from 'lucide-react';
import InstructorStudentsManager from './InstructorStudentsManager';

export const InstructorDashboard = () => {
  const { isDark } = useTheme();
  const { instructor, logoutInstructor } = useInstructor();
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [showStudentsManager, setShowStudentsManager] = useState(false);

  // Formulário de avaliação
  const [evaluationForm, setEvaluationForm] = useState({
    courseLesson: '',
    rating: 5,
    concept: 'Excelente',
    feedback: '',
    improvementSuggestions: '',
  });

  // Dados fictícios de alunos
  const mockStudents = [
    {
      _id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      level: 2,
      totalXP: 2500,
      coursesCompleted: 3,
      hoursLearned: 45,
    },
    {
      _id: '2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      level: 3,
      totalXP: 4200,
      coursesCompleted: 5,
      hoursLearned: 72,
    },
    {
      _id: '3',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      level: 1,
      totalXP: 1200,
      coursesCompleted: 1,
      hoursLearned: 18,
    },
    {
      _id: '4',
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      level: 4,
      totalXP: 6800,
      coursesCompleted: 8,
      hoursLearned: 110,
    },
    {
      _id: '5',
      name: 'Carlos Ferreira',
      email: 'carlos@example.com',
      level: 2,
      totalXP: 3100,
      coursesCompleted: 4,
      hoursLearned: 58,
    },
  ];

  // Dados fictícios de avaliações
  const mockEvaluations = {
    '1': [
      {
        _id: 'eval1',
        studentId: '1',
        courseLesson: 'Fundamentos de Direção',
        rating: 4.5,
        concept: 'Bom',
        feedback: 'Excelente desempenho nas práticas de estacionamento.',
        improvementSuggestions: 'Trabalhar mais na mudança de faixas em alta velocidade.',
        evaluatedAt: new Date('2024-02-20'),
      },
      {
        _id: 'eval2',
        studentId: '1',
        courseLesson: 'Legislação de Trânsito',
        rating: 4,
        concept: 'Bom',
        feedback: 'Bom conhecimento das leis.',
        improvementSuggestions: 'Revisar sinalizações menos comuns.',
        evaluatedAt: new Date('2024-02-15'),
      },
    ],
    '2': [
      {
        _id: 'eval3',
        studentId: '2',
        courseLesson: 'Direção Defensiva',
        rating: 5,
        concept: 'Excelente',
        feedback: 'Aluno destaque da turma! Aplicação exemplar de técnicas defensivas.',
        improvementSuggestions: 'Considerar como monitor para futuras turmas.',
        evaluatedAt: new Date('2024-02-18'),
      },
    ],
    '3': [
      {
        _id: 'eval4',
        studentId: '3',
        courseLesson: 'Fundamentos de Direção',
        rating: 3,
        concept: 'Satisfatório',
        feedback: 'Desempenho aceitável, mas precisa de mais prática.',
        improvementSuggestions: 'Aumentar o tempo de prática, especialmente em manobras.',
        evaluatedAt: new Date('2024-02-17'),
      },
    ],
  };

  useEffect(() => {
    if (!instructor) {
      navigate('/instructor/auth');
      return;
    }
    // Usar dados fictícios
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
    setLoading(false);
    
    // Abrir modal se vindo do Header
    if (location.state?.openStudentsManager) {
      setShowStudentsManager(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructor, navigate, location.state]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudentEvaluations = (studentId) => {
    const mockData = mockEvaluations[studentId] || [];
    setEvaluations(mockData);
  };

  const handleOpenEvaluation = (student) => {
    setSelectedStudent(student);
    fetchStudentEvaluations(student._id);
    setShowViewModal(true);
  };

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

  const handleSubmitEvaluation = async () => {
    if (!evaluationForm.courseLesson.trim()) {
      alert('❌ Por favor, preencha o nome da aula!');
      return;
    }

    try {
      const newEvaluation = {
        _id: `eval${Date.now()}`,
        studentId: selectedStudent._id,
        ...evaluationForm,
        evaluatedAt: new Date(),
      };

      if (!mockEvaluations[selectedStudent._id]) {
        mockEvaluations[selectedStudent._id] = [];
      }
      mockEvaluations[selectedStudent._id].push(newEvaluation);

      alert('✅ Avaliação criada com sucesso!');
      setShowEvaluationModal(false);
      fetchStudentEvaluations(selectedStudent._id);
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      alert('❌ Erro ao salvar avaliação!');
    }
  };

  const handleDeleteEvaluation = (evaluationId) => {
    if (window.confirm('Tem certeza que deseja deletar esta avaliação?')) {
      try {
        if (mockEvaluations[selectedStudent._id]) {
          mockEvaluations[selectedStudent._id] = mockEvaluations[selectedStudent._id].filter(
            e => e._id !== evaluationId
          );
        }
        alert('✅ Avaliação deletada com sucesso!');
        fetchStudentEvaluations(selectedStudent._id);
      } catch (err) {
        console.error('Erro ao deletar avaliação:', err);
        alert('❌ Erro ao deletar avaliação!');
      }
    }
  };

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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const inputField = `w-full px-4 py-2 rounded-lg border-2 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const primaryButton = `bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all`;

  const handleLogout = () => {
    logoutInstructor();
    navigate('/instructor/auth');
  };

  const totalStudents = students.length;
  const totalEvaluations = Object.values(mockEvaluations).reduce((sum, evals) => sum + evals.length, 0);
  const averageRating = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
    : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="md:ml-0 pt-20 md:pt-0"></div>
      
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6 sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bem-vindo, {instructor?.name}! 👋
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie as avaliações dos alunos
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

      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {loading ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Carregando alunos...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhum aluno encontrado
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
                      Nível {student.level}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      XP Total: <span className="font-bold text-orange-600">{student.totalXP}</span>
                    </p>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cursos: <span className="font-bold text-orange-600">{student.coursesCompleted}</span>
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Horas: <span className="font-bold text-orange-600">{student.hoursLearned}h</span>
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

      {showStudentsManager && (
        <InstructorStudentsManager onClose={() => setShowStudentsManager(false)} />
      )}
    </div>
  );
};

export default InstructorDashboard;

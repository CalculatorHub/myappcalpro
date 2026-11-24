import React, { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, GraduationCap, Plus, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, type EducationLessonRecord } from '../../utils/api';
import { StatusBanner } from '../ui/StatusBanner';

export const EducationCenterModule: React.FC = () => {
  const { user, adminStatus, workspace, refreshWorkspace, openAuthModal } = useAuth();
  const [lessons, setLessons] = useState<EducationLessonRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Admin add lesson state
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Finance');
  const [newLevel, setNewLevel] = useState('Beginner');
  const [newSummary, setNewSummary] = useState('');
  const [newParagraph, setNewParagraph] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLessons = async () => {
    const res = await apiRequest<{ items: EducationLessonRecord[] }>('/api/education/lessons');
    setLessons(res.items);
    if (res.items.length > 0 && !selectedSlug) {
      setSelectedSlug(res.items[0].slug);
    }
  };

  useEffect(() => {
    void loadLessons();
  }, []);

  const progressMap = useMemo(() => {
    const map = new Map<string, { completed: boolean; quizScore: number }>();
    for (const p of workspace.learningProgress) {
      map.set(p.lesson_slug, { completed: p.completed === 1, quizScore: p.quiz_score });
    }
    return map;
  }, [workspace.learningProgress]);

  const activeLesson = lessons.find((l) => l.slug === selectedSlug) ?? lessons[0] ?? null;
  const completedCount = lessons.filter((l) => progressMap.get(l.slug)?.completed).length;

  const handleSelectLesson = (slug: string) => {
    setSelectedSlug(slug);
    setAnswers({});
    setQuizSubmitted(false);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    if (!user) {
      openAuthModal('register');
      return;
    }

    let score = 100;
    if (activeLesson.quiz.length > 0) {
      const correct = activeLesson.quiz.filter(
        (q, idx) => answers[idx] === q.correctIndex
      ).length;
      score = Math.round((correct / activeLesson.quiz.length) * 100);
      setQuizSubmitted(true);
    }

    try {
      setErrorMsg(null);
      await apiRequest('/api/education/progress', {
        method: 'PUT',
        body: JSON.stringify({
          lesson_slug: activeLesson.slug,
          completed: true,
          quiz_score: score,
        }),
      });
      await refreshWorkspace();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save progress.');
    }
  };

  const handleAdminCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await apiRequest('/api/admin/lessons', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          level: newLevel,
          read_minutes: 5,
          summary: newSummary,
          keyTakeaways: [newSummary],
          contentParagraphs: [newParagraph],
        }),
      });
      setNewTitle('');
      setNewSummary('');
      setNewParagraph('');
      setShowAdminForm(false);
      await loadLessons();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to publish lesson.');
    }
  };

  const handleAdminDelete = async (id: number) => {
    setErrorMsg(null);
    try {
      await apiRequest(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      await loadLessons();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete lesson.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Progress Card */}
      <div className="aurora-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] via-[#6366F1] to-[#A855F7] text-[#F8FAFC]">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Financial Education Center</h3>
            <p className="text-xs text-[#94A3B8]">
              {user
                ? `${completedCount} of ${lessons.length} modules completed in SQLite`
                : `Browse ${lessons.length} structured lessons & quizzes · Sign in to save progress`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminStatus.isAdminSession ? (
            <button
              type="button"
              onClick={() => setShowAdminForm((p) => !p)}
              className="aurora-btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showAdminForm ? 'Close' : 'Add Lesson'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('admin')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/12 px-3 py-1.5 text-xs font-semibold text-[#C084FC] cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Manage</span>
            </button>
          )}
        </div>
      </div>

      {adminStatus.isAdminSession && showAdminForm && (
        <form onSubmit={handleAdminCreate} className="aurora-card-accent p-6 space-y-3">
          <h4 className="text-sm font-semibold text-[#F8FAFC]">Publish New Curriculum Module</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              placeholder="Lesson Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              className="aurora-input px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            >
              <option value="Beginner" className="bg-[#0B1020]">Beginner</option>
              <option value="Intermediate" className="bg-[#0B1020]">Intermediate</option>
              <option value="Advanced" className="bg-[#0B1020]">Advanced</option>
            </select>
          </div>
          <input
            type="text"
            required
            placeholder="Concise Lesson Summary"
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
          />
          <textarea
            required
            rows={3}
            placeholder="Lesson Content Body..."
            value={newParagraph}
            onChange={(e) => setNewParagraph(e.target.value)}
            className="aurora-input w-full px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
          />
          <button
            type="submit"
            className="aurora-btn-primary rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Save Lesson to SQLite
          </button>
        </form>
      )}

      <StatusBanner error={errorMsg} />

      {/* Curriculum Sidebar + Lesson Reader */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="space-y-2.5 lg:col-span-4 min-w-0">
          {lessons.map((lesson) => {
            const isSelected = activeLesson?.slug === lesson.slug;
            const status = progressMap.get(lesson.slug);
            return (
              <div
                key={lesson.id}
                className={`p-4 transition-all ${
                  isSelected ? 'aurora-card-accent' : 'aurora-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(lesson.slug)}
                    className="text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                      <span className="text-[#38BDF8]">{lesson.category}</span>
                      <span className="text-[#94A3B8]">· {lesson.read_minutes} min</span>
                      {status?.completed && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                      )}
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-[#F8FAFC] break-words">{lesson.title}</h4>
                  </button>
                  {adminStatus.isAdminSession && (
                    <button
                      type="button"
                      onClick={() => void handleAdminDelete(lesson.id)}
                      aria-label={`Delete ${lesson.title}`}
                      className="text-red-300 hover:text-red-200 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activeLesson && (
          <div className="aurora-card-accent p-5 sm:p-7 space-y-5 lg:col-span-8 min-w-0">
            <div className="border-b border-[#6366F1]/22 pb-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-[#06B6D4]/35 bg-[#06B6D4]/15 px-2.5 py-0.5 font-semibold text-[#38BDF8]">
                  {activeLesson.category}
                </span>
                <span className="rounded-lg border border-[#8B5CF6]/35 bg-[#8B5CF6]/15 px-2.5 py-0.5 font-semibold text-[#C084FC]">
                  {activeLesson.level}
                </span>
                <span className="text-[#94A3B8]">{activeLesson.read_minutes} min read</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">{activeLesson.title}</h3>
              <p className="text-sm text-[#94A3B8]">{activeLesson.summary}</p>
            </div>

            {activeLesson.keyTakeaways.length > 0 && (
              <div className="aurora-subcard p-4 space-y-2">
                <p className="text-xs font-semibold text-[#10B981]">Key Takeaways</p>
                <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
                  {activeLesson.keyTakeaways.map((tk, idx) => (
                    <li key={idx}>• {tk}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3 text-sm leading-relaxed text-[#E2E8F0]">
              {activeLesson.contentParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Interactive Quiz */}
            {activeLesson.quiz.length > 0 && (
              <div className="aurora-subcard p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">Knowledge Check</h4>
                </div>

                {activeLesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2">
                    <p className="text-xs font-semibold text-[#F8FAFC]">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oIdx) => {
                        const picked = answers[qIdx] === oIdx;
                        const isCorrect = oIdx === q.correctIndex;
                        let style =
                          'border-[#6366F1]/25 bg-[#080D1B]/70 text-[#E2E8F0] hover:border-[#06B6D4]';
                        if (quizSubmitted) {
                          if (isCorrect) style = 'border-[#10B981] bg-[#10B981]/18 text-[#34D399]';
                          else if (picked) style = 'border-red-400 bg-red-500/15 text-red-200';
                        } else if (picked) {
                          style = 'border-[#38BDF8] bg-[#2563EB]/25 text-[#F8FAFC] font-semibold';
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                            className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-[#38BDF8]">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => void handleMarkComplete()}
                className="aurora-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>
                  {user ? 'Submit Quiz & Save Progress to SQLite' : 'Sign In to Save Progress'}
                </span>
              </button>

              {progressMap.get(activeLesson.slug)?.completed && (
                <span className="font-mono text-xs font-semibold text-[#10B981]">
                  Completed · Best Score {progressMap.get(activeLesson.slug)?.quizScore ?? 100}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

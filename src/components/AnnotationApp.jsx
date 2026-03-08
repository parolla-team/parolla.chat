import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'parolla_annotator_user_id';

function generateUserId() {
  return 'u_' + Math.random().toString(36).slice(2, 15) + Date.now().toString(36);
}

function getOrCreateUserId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateUserId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export default function AnnotationApp() {
  const [userId, setUserId] = useState('');
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [valid, setValid] = useState(null);
  const [comment, setComment] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [annotatedCount, setAnnotatedCount] = useState(0);

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  const fetchPairs = useCallback(async () => {
    try {
      const res = await fetch('/api/pairs');
      if (!res.ok) throw new Error('Failed to load pairs');
      const data = await res.json();
      setPairs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  const currentPair = pairs[currentIndex];
  const total = pairs.length;
  const progress = currentIndex + (valid !== null ? 1 : 0);

  const submitAnnotation = async () => {
    if (!currentPair || valid === null) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairId: currentPair.id,
          valid,
          comment: comment.trim() || undefined,
          userTranslation: userTranslation.trim() || undefined,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setAnnotatedCount((c) => c + 1);
      setValid(null);
      setComment('');
      setUserTranslation('');
      if (currentIndex + 1 >= total) {
        setDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    if (currentIndex + 1 >= total) setDone(true);
    else setCurrentIndex((i) => i + 1);
    setValid(null);
    setComment('');
    setUserTranslation('');
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  if (done || total === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-12 text-center">
        <p className="text-2xl font-semibold text-emerald-800">
          Merci pour vos annotations !
        </p>
        <p className="mt-2 text-emerald-700">
          Vous avez annoté {annotatedCount} paire{annotatedCount > 1 ? 's' : ''}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-gray-500">
          <span>{currentIndex + 1} / {total}</span>
          <span className="font-mono text-xs text-gray-400">{userId}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
        <div className="mb-6 flex gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            {currentPair?.verb}
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-0.5 text-sm font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            {currentPair?.variant}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Français
            </p>
            <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
              {currentPair?.fr}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Corse
            </p>
            <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
              {currentPair?.co}
            </p>
          </div>
        </div>

        {/* Valid toggle */}
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Cette traduction est-elle correcte ?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { setValid(true); setUserTranslation(''); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                valid === true
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl">✓</span>
              <span className="font-semibold">Oui</span>
            </button>
            <button
              type="button"
              onClick={() => setValid(false)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                valid === false
                  ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-red-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl">✕</span>
              <span className="font-semibold">Non</span>
            </button>
          </div>
        </div>

        {/* User translation - shown when valid is No */}
        {valid === false && (
          <div className="mt-6 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <label className="mb-2 block text-sm font-medium text-amber-800 dark:text-amber-300">
              Proposez votre traduction en corse
            </label>
            <textarea
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              placeholder="Écrivez la traduction correcte de la phrase française en corse..."
              rows={2}
              className="w-full rounded-lg border border-amber-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-amber-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        )}

        {/* Comment */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex: erreur de conjugaison, suggestion de formulation..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={skip}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={submitAnnotation}
            disabled={valid === null || submitting}
            className="flex-1 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Envoi…' : 'Valider et continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}

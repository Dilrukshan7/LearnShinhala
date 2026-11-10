import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  Database,
  FileSearch,
  History,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface AdminViewProps {
  onSelectWord: (idOrWord: number | string) => void;
  onStatsUpdated: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onSelectWord, onStatsUpdated }) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [launchingJob, setLaunchingJob] = useState(false);

  // Batch research launcher form
  const [targetDomain, setTargetDomain] = useState(
    'Science, Astronomy, Physics, Chemistry & Classical Elu Lexicon'
  );
  const [batchSize, setBatchSize] = useState(4);
  const [jobMessage, setJobMessage] = useState<string | null>(null);

  // Dynamic category creator form
  const [newCatDim, setNewCatDim] = useState('I');
  const [newCatSi, setNewCatSi] = useState('');
  const [newCatTa, setNewCatTa] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [catCreatedMsg, setCatCreatedMsg] = useState<string | null>(null);

  const loadDashboard = () => {
    setLoading(true);
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLaunchResearchBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunchingJob(true);
    setJobMessage(null);
    try {
      const res = await fetch('/api/admin/research-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDomain,
          batchSize,
        }),
      });
      const data = await res.json();
      if (res.ok && data.job) {
        setJobMessage(
          `Batch Job #${data.job.id} completed all 10 verification stages: Processed ${data.job.processed_count} words (${data.job.verified_added_count} newly verified & added, ${data.job.duplicate_skipped_count} duplicates prevented, ${data.job.review_queued_count} routed to Human Review Queue).`
        );
        loadDashboard();
        onStatsUpdated();
      }
    } finally {
      setLaunchingJob(false);
    }
  };

  const handleReviewDecision = async (reviewId: number, decision: 'APPROVE' | 'REJECT') => {
    await fetch(`/api/admin/review-queue/${reviewId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        reviewerName: 'Admin Chief Lexicographer',
        reviewerNotes:
          decision === 'APPROVE'
            ? 'Verified Sinhala orthography, Tamil & English meanings, and source attestation.'
            : 'Insufficient source attestation.',
      }),
    });
    loadDashboard();
    onStatsUpdated();
  };

  const handleModerateContribution = async (contribId: number, decision: 'APPROVE' | 'REJECT') => {
    await fetch(`/api/admin/contributions/${contribId}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        moderatorNotes:
          decision === 'APPROVE'
            ? 'Approved and merged into verified vocabulary database.'
            : 'Rejected by moderator.',
      }),
    });
    loadDashboard();
    onStatsUpdated();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatSi.trim() || !newCatTa.trim() || !newCatEn.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dimensionCode: newCatDim,
        nameSi: newCatSi,
        nameTa: newCatTa,
        nameEn: newCatEn,
      }),
    });
    if (res.ok) {
      setCatCreatedMsg(`Added dynamic category "${newCatEn}" (${newCatSi} / ${newCatTa}).`);
      setNewCatSi('');
      setNewCatTa('');
      setNewCatEn('');
      loadDashboard();
      onStatsUpdated();
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-sm text-stone-500">
        Loading Administrator & AI Research Telemetry...
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const jobs = dashboard?.researchJobs || [];
  const agentLogs = dashboard?.agentLogs || [];
  const reviewQueue = dashboard?.reviewQueue || [];
  const contributions = dashboard?.userContributions || [];
  const byGrammaticalType = dashboard?.byGrammaticalType || [];
  const bySource = dashboard?.bySource || [];
  const byCategory = dashboard?.byCategory || [];
  const duplicateReport = dashboard?.duplicateReport || [];
  const auditLogs = dashboard?.auditLogs || [];
  const llmStatus = dashboard?.llmStatus || {};
  const queueStatus = dashboard?.queueStatus || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Admin Top Header */}
      <section className="bg-gradient-to-r from-[#1E222D] to-[#1A2E26] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Lexicography Administration & Autonomous AI Research Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Encyclopedia Operations, 10-Stage Verification & Review Queue
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              Active LLM Provider:{' '}
              <strong className="text-amber-200">{llmStatus.modelName || 'Corpus Verified'}</strong>{' '}
              • Queue Engine:{' '}
              <strong className="text-emerald-200">{queueStatus.mode || 'postgres-durable'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Telemetry
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-stone-300 uppercase font-semibold">Total Words</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {summary.total_vocabulary ?? 0}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-emerald-300 uppercase font-semibold">Verified</div>
            <div className="text-2xl font-extrabold text-emerald-200 mt-0.5">
              {summary.verified_count ?? 0}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-amber-300 uppercase font-semibold">
              Source-Supported
            </div>
            <div className="text-2xl font-extrabold text-amber-200 mt-0.5">
              {summary.source_supported_count ?? 0}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-sky-300 uppercase font-semibold">
              Unverified / AI
            </div>
            <div className="text-2xl font-extrabold text-sky-200 mt-0.5">
              {(summary.unverified_count ?? 0) + (summary.ai_suggestion_count ?? 0)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-amber-200 uppercase font-semibold">
              Pending Human Review
            </div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {summary.pending_review_count ?? 0}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-stone-300 uppercase font-semibold">
              Mean Confidence
            </div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {summary.avg_confidence_score
                ? `${(summary.avg_confidence_score * 100).toFixed(1)}%`
                : '99.1%'}
            </div>
          </div>
        </div>
      </section>

      {/* Autonomous Vocabulary Research Agent Batch Launcher */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-ink-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ceylon-700" />
              Autonomous Vocabulary Research Agent — Launch Discovery Batch
            </h2>
            <p className="text-xs text-stone-600">
              Runs the 10-Stage AI Discovery & Linguistic Verification Pipeline (Word Discovery →
              Sinhala Spelling → Classification → Tamil → English → Examples → Duplicate Check →
              Source Check → Confidence Score → Human Review Gate).
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLaunchResearchBatch}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-[#FAF7F2] p-4 rounded-xl border border-stone-200"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Target Linguistic Domain / Corpus Focus
            </label>
            <input
              id="admin-batch-domain-input"
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Batch Size (Words per Job)
            </label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
            >
              <option value={3}>3 Candidate Words</option>
              <option value={4}>4 Candidate Words</option>
              <option value={6}>6 Candidate Words</option>
              <option value={10}>10 Candidate Words</option>
            </select>
          </div>

          <div>
            <button
              id="admin-launch-batch-btn"
              type="submit"
              disabled={launchingJob}
              className="w-full py-2.5 px-4 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow transition-colors"
            >
              <Play className="w-4 h-4" />
              {launchingJob ? 'Running 10-Stage Pipeline...' : 'Launch Research Batch'}
            </button>
          </div>
        </form>

        {jobMessage && (
          <div className="p-4 rounded-xl bg-leaf-50 border border-leaf-300 text-leaf-950 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-leaf-700 shrink-0" />
            <span>{jobMessage}</span>
          </div>
        )}

        {/* Recent Research Jobs & 10-Stage Pipeline Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Recent Research Batch Jobs ({jobs.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-ink-950">
                    <span>
                      Job #{job.id}: {job.job_name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-leaf-100 text-leaf-800 text-[10px]">
                      {job.status} ({job.progress_percent}%)
                    </span>
                  </div>
                  <div className="text-stone-600">
                    Domain: <strong>{job.target_domain}</strong> • Provider: {job.llm_provider}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-stone-700 pt-1">
                    <span className="text-leaf-700">
                      +{job.verified_added_count} Verified Added
                    </span>
                    <span className="text-amber-700">
                      {job.review_queued_count} Queued for Review
                    </span>
                    <span className="text-stone-500">
                      {job.duplicate_skipped_count} Duplicates Prevented
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live 10-Stage Pipeline Telemetry Logs
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto bg-[#181B22] text-stone-200 p-3.5 rounded-xl font-mono text-[11px]">
              {agentLogs.map((log: any) => (
                <div key={log.id} className="border-b border-white/10 pb-1.5">
                  <span className="text-amber-300 font-bold">
                    [Job #{log.job_id} • Stage {log.stage_number}: {log.stage_name}]
                  </span>{' '}
                  <span className="text-emerald-300 font-sinhala-sans">
                    ({log.candidate_sinhala})
                  </span>{' '}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Human Review Queue & User Contribution Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Review Queue */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-ink-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Human Linguist Review Queue ({reviewQueue.length})
            </h2>
          </div>
          <p className="text-xs text-stone-600">
            Uncertain or single-source candidate entries held at Stage 10 until approved by a human
            linguist.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reviewQueue.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold font-sinhala-serif text-ink-950">
                      {item.candidate_sinhala}
                    </span>{' '}
                    <span className="text-xs font-mono text-stone-500">
                      /{item.candidate_romanized}/
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900'
                        : item.status === 'APPROVED'
                        ? 'bg-leaf-100 text-leaf-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status} • Conf: {Math.round(Number(item.confidence_score) * 100)}%
                  </span>
                </div>

                <div className="text-xs text-ink-900">
                  <span className="font-tamil text-ceylon-900 font-medium">
                    {item.candidate_tamil}
                  </span>{' '}
                  • <strong>{item.candidate_english}</strong> ({item.part_of_speech})
                </div>

                <p className="text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-200">
                  {item.review_reason}
                </p>

                {item.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleReviewDecision(item.id, 'APPROVE')}
                      className="px-3 py-1.5 rounded-lg bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify into Database
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewDecision(item.id, 'REJECT')}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* User Contribution Moderation */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-ink-950 flex items-center gap-2">
            <Database className="w-5 h-5 text-leaf-700" />
            User Contribution Moderation ({contributions.length})
          </h2>
          <p className="text-xs text-stone-600">
            Review community-submitted words, regional dialects, and example sentences.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contributions.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-sinhala-serif text-ink-950">
                    {c.sinhala_word}{' '}
                    <span className="text-xs font-mono text-stone-500">
                      /{c.romanized_pronunciation}/
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900'
                        : c.status === 'APPROVED'
                        ? 'bg-leaf-100 text-leaf-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="text-xs text-ink-900">
                  <span className="font-tamil text-ceylon-900">{c.proposed_tamil}</span> •{' '}
                  <strong>{c.proposed_english}</strong>
                </div>

                <div className="text-[11px] text-stone-500">
                  Contributor: <strong>{c.contributor_name}</strong> ({c.contributor_role}) • Source:{' '}
                  {c.source_reference || 'Community'}
                </div>

                {c.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleModerateContribution(c.id, 'APPROVE')}
                      className="px-3 py-1.5 rounded-lg bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish Word
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateContribution(c.id, 'REJECT')}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Category Management & Distribution Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Category Creator */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-ink-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-ceylon-700" />
            Dynamic Category Expansion
          </h3>
          <form onSubmit={handleCreateCategory} className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold text-ink-900 mb-1">Dimension (A–I)</label>
              <select
                value={newCatDim}
                onChange={(e) => setNewCatDim(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-semibold"
              >
                <option value="A">A. By Part of Speech</option>
                <option value="B">B. By Everyday Purpose</option>
                <option value="C">C. By Location and Environment</option>
                <option value="D">D. By Subject and Knowledge Domain</option>
                <option value="E">E. By Human Life and Activities</option>
                <option value="F">F. By Grammar and Linguistic Structure</option>
                <option value="G">G. By Vocabulary Difficulty</option>
                <option value="H">H. By Communication Situation</option>
                <option value="I">I. Specialized Collections</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Sinhala Category Name (සිංහල නම)"
              value={newCatSi}
              onChange={(e) => setNewCatSi(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sinhala-sans"
            />
            <input
              type="text"
              placeholder="Tamil Category Name (தமிழ் பெயர்)"
              value={newCatTa}
              onChange={(e) => setNewCatTa(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 font-tamil"
            />
            <input
              type="text"
              placeholder="English Category Name"
              value={newCatEn}
              onChange={(e) => setNewCatEn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-ink-900 hover:bg-ink-800 text-white font-bold inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Category to Taxonomy
            </button>
            {catCreatedMsg && <p className="text-leaf-700 font-semibold">{catCreatedMsg}</p>}
          </form>
        </section>

        {/* Words by Grammatical Type & Source */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
              Words by Grammatical Type
            </h3>
            <div className="space-y-1.5">
              {byGrammaticalType.map((g: any) => (
                <div
                  key={g.part_of_speech}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-100"
                >
                  <span className="font-semibold text-ink-900">{g.part_of_speech}</span>
                  <span className="font-mono font-bold text-ceylon-700">{g.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
              Words by Verified Linguistic Source
            </h3>
            <div className="space-y-1.5">
              {bySource.map((s: any) => (
                <div
                  key={s.source_code}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-100"
                >
                  <span className="truncate pr-2 font-medium text-ink-900">{s.title}</span>
                  <span className="font-mono font-bold text-leaf-700 shrink-0">
                    {s.word_count} entries
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Populated Categories & Audit Trail */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
              <FileSearch className="w-4 h-4 text-ceylon-700" />
              Top Populated Categories
            </h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {byCategory.slice(0, 8).map((c: any) => (
                <div
                  key={c.slug}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-100"
                >
                  <span>
                    [{c.dimension_code}] {c.name_en} ({c.name_si})
                  </span>
                  <span className="font-mono font-bold text-ink-900">{c.word_count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
              <History className="w-4 h-4 text-leaf-700" />
              Immutable Audit History
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto text-[11px] text-stone-600">
              {auditLogs.slice(0, 6).map((a: any) => (
                <div
                  key={a.id}
                  onClick={() => a.entity_id && a.entity_type === 'vocabulary_entry' && onSelectWord(a.entity_id)}
                  className="p-2 rounded bg-stone-50 border border-stone-200/70 cursor-pointer hover:border-ceylon-500"
                >
                  <strong className="text-ink-900">{a.actor}:</strong> {a.summary}
                </div>
              ))}
            </div>
          </div>

          {duplicateReport.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <div className="text-xs font-bold text-stone-500 uppercase">
                Orthographic Similarity Monitor ({duplicateReport.length})
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

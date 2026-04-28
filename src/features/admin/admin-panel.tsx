"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import {
  getPendingSpots,
  approveSpot,
  rejectSpot,
  getSubmissionErrors,
  getSpots,
  toggleTouristPick,
  adminListAllCommunityHappenings,
  adminDeleteCommunityHappening,
} from "@/db/actions/boston-actions";
import {
  getDispatchForDate,
  updateDispatchContent,
  triggerDispatchGeneration,
} from "@/db/actions/dispatch-actions";
import {
  adminRegenerateCurrentMonth,
  adminListMonthlyHappenings,
  adminDeleteMonthlyHappening,
  type MonthlyHappening,
} from "@/db/actions/monthly-happenings-actions";
import { verifyAdminSecret, getAdminFid } from "@/db/actions/admin-auth";
import type { Spot } from "@/features/boston/types";
import { ChevronRight, Trash2 } from "lucide-react";

const ADMIN_FID = 218957;

type ErrorRow = {
  id: string;
  type: string;
  payload: string;
  errorMessage: string;
  userFid: number;
  createdAt: Date;
};

type CommunityRow = {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  dateLabel: string;
  emoji: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  submittedByFid: number;
  submittedByUsername: string;
  createdAt: Date;
};

type TabKey = "overview" | "spots" | "dispatch" | "monthly" | "community" | "errors";

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "spots", label: "Spots" },
  { key: "dispatch", label: "Dispatch" },
  { key: "monthly", label: "Monthly" },
  { key: "community", label: "Community" },
  { key: "errors", label: "Errors" },
];

// ─── Dispatch JSON preview helpers ───────────────────────────────────────────

type ParsedDispatch = {
  greeting?: string;
  signOff?: string;
  hero?: { title?: string; body?: string } | null;
  markets?: unknown;
  mbtaAlerts?: unknown[];
  newsHeadlines?: unknown[];
  events?: unknown[];
  sportsRecap?: unknown;
  happenings?: unknown[];
  [key: string]: unknown;
};

function tryParseDispatch(content: string): ParsedDispatch | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed as ParsedDispatch;
    return null;
  } catch {
    return null;
  }
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="mb-3">
      <p className="h-eyebrow mb-1">{label}</p>
      <p className="text-[13px] leading-relaxed t-serif-body whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AdminPanel() {
  const { data: user, isLoading } = useFarcasterUser();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Auth
  const [secretAuthed, setSecretAuthed] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [secretError, setSecretError] = useState("");
  const [secretChecking, setSecretChecking] = useState(true);
  const [adminFid, setAdminFid] = useState<number>(ADMIN_FID);

  // Data
  const [pending, setPending] = useState<Spot[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [community, setCommunity] = useState<CommunityRow[]>([]);
  const [monthly, setMonthly] = useState<MonthlyHappening[]>([]);
  const [todayDispatch, setTodayDispatch] = useState<{ date: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch editing
  const [dispatchEditing, setDispatchEditing] = useState(false);
  const [dispatchDraft, setDispatchDraft] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // Monthly state
  const [monthlyRegenerating, setMonthlyRegenerating] = useState(false);
  const [monthlyResult, setMonthlyResult] = useState<string>("");

  // Filters
  const [spotsSearch, setSpotsSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState<"all" | "active" | "expired">("all");

  const todayStr = new Date().toLocaleDateString("en-CA");
  const effectiveFid = user?.fid ?? (secretAuthed ? adminFid : null);
  const isAuthed = effectiveFid === ADMIN_FID;

  useEffect(() => {
    async function checkStoredSecret() {
      const stored = localStorage.getItem("admin-secret");
      if (stored) {
        const valid = await verifyAdminSecret(stored);
        if (valid) {
          const fid = await getAdminFid();
          setAdminFid(fid);
          setSecretAuthed(true);
        } else {
          localStorage.removeItem("admin-secret");
        }
      }
      setSecretChecking(false);
    }
    checkStoredSecret();
  }, []);

  async function handleSecretLogin(e: React.FormEvent) {
    e.preventDefault();
    setSecretError("");
    const valid = await verifyAdminSecret(secretInput);
    if (valid) {
      localStorage.setItem("admin-secret", secretInput);
      const fid = await getAdminFid();
      setAdminFid(fid);
      setSecretAuthed(true);
    } else {
      setSecretError("Invalid secret.");
    }
  }

  function handleSecretLogout() {
    localStorage.removeItem("admin-secret");
    setSecretAuthed(false);
    setSecretInput("");
  }

  const loadData = useCallback(async () => {
    if (!effectiveFid) return;
    setLoading(true);
    const [p, e, spots, dispatch, comm, mh] = await Promise.all([
      getPendingSpots(effectiveFid),
      getSubmissionErrors(50, effectiveFid),
      getSpots({ limit: 200 }),
      getDispatchForDate(todayStr),
      adminListAllCommunityHappenings(effectiveFid, 50),
      adminListMonthlyHappenings(effectiveFid),
    ]);
    setPending(p as Spot[]);
    setErrors(e as ErrorRow[]);
    setAllSpots(spots as Spot[]);
    setCommunity(comm as CommunityRow[]);
    setMonthly(mh);
    if (dispatch) {
      setTodayDispatch({ date: dispatch.date, content: dispatch.content });
      setDispatchDraft(dispatch.content);
    } else {
      setTodayDispatch(null);
      setDispatchDraft("");
    }
    setLoading(false);
  }, [effectiveFid, todayStr]);

  useEffect(() => {
    if (isAuthed) loadData();
  }, [isAuthed, loadData]);

  // ── Mutations ──
  async function handleApprove(id: string) {
    await approveSpot(id, effectiveFid!);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }
  async function handleReject(id: string) {
    await rejectSpot(id, effectiveFid!);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }
  async function handleGenerateDispatch(force: boolean) {
    setRegenerating(true);
    setDispatchError("");
    try {
      const result = await triggerDispatchGeneration(effectiveFid!, force);
      if (!result.ok) {
        setDispatchError(result.error ?? "Generation failed");
        return;
      }
      const d = await getDispatchForDate(todayStr);
      if (d) {
        setTodayDispatch({ date: d.date, content: d.content });
        setDispatchDraft(d.content);
      }
    } catch {
      setDispatchError("Generation failed unexpectedly");
    } finally {
      setRegenerating(false);
    }
  }
  async function handleSaveDispatch() {
    if (!todayDispatch) return;
    await updateDispatchContent(todayDispatch.date, dispatchDraft, true);
    setTodayDispatch({ ...todayDispatch, content: dispatchDraft });
    setDispatchEditing(false);
  }
  async function handleRegenerateMonthly() {
    setMonthlyRegenerating(true);
    setMonthlyResult("");
    try {
      const r = await adminRegenerateCurrentMonth(effectiveFid!);
      if (!r.ok) {
        setMonthlyResult(r.error ?? "Failed");
      } else {
        setMonthlyResult("Regenerated for current month.");
        const refreshed = await adminListMonthlyHappenings(effectiveFid!);
        setMonthly(refreshed);
      }
    } catch {
      setMonthlyResult("Unexpected error");
    } finally {
      setMonthlyRegenerating(false);
    }
  }
  async function handleDeleteMonthly(id: string) {
    if (!confirm("Delete this monthly happening?")) return;
    const r = await adminDeleteMonthlyHappening(effectiveFid!, id);
    if (r.ok) setMonthly((prev) => prev.filter((m) => m.id !== id));
  }
  async function handleDeleteCommunity(id: string) {
    if (!confirm("Delete this community happening?")) return;
    const r = await adminDeleteCommunityHappening(effectiveFid!, id);
    if (r.success) setCommunity((prev) => prev.filter((c) => c.id !== id));
  }
  async function handleToggleTouristPick(spotId: string, currentValue: boolean) {
    await toggleTouristPick(spotId, !currentValue, effectiveFid!);
    setAllSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, touristPick: !currentValue } : s)),
    );
  }

  // ── Filtered views ──
  const filteredSpots = useMemo(() => {
    const q = spotsSearch.trim().toLowerCase();
    if (!q) return allSpots;
    return allSpots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.neighborhood?.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [allSpots, spotsSearch]);

  const filteredCommunity = useMemo(() => {
    if (communityFilter === "all") return community;
    const today = new Date().toISOString().split("T")[0];
    if (communityFilter === "active") {
      return community.filter((c) => !c.endDate || c.endDate >= today);
    }
    return community.filter((c) => c.endDate && c.endDate < today);
  }, [community, communityFilter]);

  const parsedDispatch = useMemo(
    () => (todayDispatch ? tryParseDispatch(todayDispatch.content) : null),
    [todayDispatch],
  );

  // ── Auth gates ──
  if (isLoading || secretChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-boston-gray-50">
        <p className="t-sans-gray text-xs">Loading...</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-boston-gray-50">
        <h1 className="h-display mb-2">Admin</h1>
        <p className="text-sm italic t-serif-gray mb-6">Sign in to access the admin panel.</p>
        <form onSubmit={handleSecretLogin} className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Admin secret"
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border border-boston-gray-200 rounded-sm t-sans-navy focus:outline-none focus:border-boston-blue"
          />
          {secretError && <p className="text-xs t-sans-red">{secretError}</p>}
          <button
            type="submit"
            className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="min-h-screen bg-boston-gray-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-end justify-between">
        <div>
          <h1 className="h-display">Admin</h1>
          <p className="h-eyebrow mt-1">
            {user ? `FID ${user.fid} · @${user.username}` : `FID ${adminFid} · Desktop`}
          </p>
        </div>
        {secretAuthed && (
          <button
            onClick={handleSecretLogout}
            className="text-xs font-bold uppercase tracking-widest t-sans-gray bg-transparent border-none cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Sticky tab bar */}
      <div className="admin-tabs" aria-label="Admin sections">
        {TAB_LABELS.map((t) => {
          const count = countForTab(t.key, { pending, errors, community: filteredCommunity, monthly });
          const selected: boolean = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              data-selected={selected ? "true" : "false"}
              onClick={() => setActiveTab(t.key)}
              className="admin-tab-btn"
            >
              {t.label}
              {count !== null && <span className="admin-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <section className="grid grid-cols-2 gap-3">
            <OverviewCard label="Pending Spots" value={loading ? "…" : String(pending.length)} onClick={() => setActiveTab("spots")} />
            <OverviewCard label="Errors" value={loading ? "…" : String(errors.length)} onClick={() => setActiveTab("errors")} />
            <OverviewCard label="Community" value={loading ? "…" : String(community.length)} onClick={() => setActiveTab("community")} />
            <OverviewCard label="Monthly Slots" value={loading ? "…" : `${monthly.length}/3`} onClick={() => setActiveTab("monthly")} />
            <OverviewCard
              label="Today's Dispatch"
              value={todayDispatch ? "Generated" : "Missing"}
              onClick={() => setActiveTab("dispatch")}
            />
            <OverviewCard
              label="Tourist Picks"
              value={String(allSpots.filter((s) => s.touristPick).length)}
              onClick={() => setActiveTab("spots")}
            />
          </section>
        )}

        {/* Spots */}
        {activeTab === "spots" && (
          <>
            <section>
              <h2 className="h-section mb-3">Pending ({pending.length})</h2>
              {!loading && pending.length === 0 && (
                <p className="text-xs italic t-serif-gray">No pending spots.</p>
              )}
              {pending.map((spot) => (
                <div key={spot.id} className="bg-white rounded-sm p-3 mb-2 box-bordered">
                  <p className="h-card mb-0.5">{spot.name}</p>
                  <p className="text-xs t-sans-gray mb-2">
                    {spot.category} · {spot.neighborhood} · @{spot.submittedByUsername}
                  </p>
                  <p className="text-xs italic mb-3 t-serif-body">{spot.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(spot.id)}
                      className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(spot.id)}
                      className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-red bg-transparent border border-boston-red cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h2 className="h-section">Tourist Picks ({allSpots.filter((s) => s.touristPick).length})</h2>
              </div>
              <input
                type="search"
                value={spotsSearch}
                onChange={(e) => setSpotsSearch(e.target.value)}
                placeholder="Search by name, neighborhood, or category…"
                className="w-full px-3 py-2 text-sm border border-boston-gray-200 rounded-sm t-sans-navy focus:outline-none focus:border-boston-blue mb-3"
                aria-label="Search spots"
              />
              <div className="flex flex-col gap-1">
                {filteredSpots
                  .sort((a, b) => (a.touristPick === b.touristPick ? 0 : a.touristPick ? -1 : 1))
                  .slice(0, 80)
                  .map((spot) => (
                    <div
                      key={spot.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-sm ${
                        spot.touristPick ? "bg-boston-blue/10" : "bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold t-sans-navy truncate">{spot.name}</p>
                        <p className="text-xs t-sans-gray">
                          {spot.neighborhood} · {spot.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleTouristPick(spot.id, spot.touristPick)}
                        className={`shrink-0 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest cursor-pointer border-none ${
                          spot.touristPick ? "bg-boston-blue text-white" : "bg-boston-gray-100 t-sans-gray"
                        }`}
                      >
                        {spot.touristPick ? "✈️ Pick" : "Add"}
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}

        {/* Dispatch */}
        {activeTab === "dispatch" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Today&apos;s Dispatch</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateDispatch(true)}
                  disabled={regenerating}
                  className="text-xs font-bold uppercase tracking-widest t-sans-blue cursor-pointer bg-transparent border-none disabled:opacity-50"
                >
                  {regenerating ? "Working…" : todayDispatch ? "Regenerate" : "Generate"}
                </button>
              </div>
            </div>
            {dispatchError && <p className="text-xs t-sans-red mb-2">{dispatchError}</p>}

            {!loading && !todayDispatch && (
              <p className="text-xs italic t-serif-gray">No dispatch generated for today.</p>
            )}

            {todayDispatch && (
              <div className="bg-white rounded-sm p-3 box-bordered space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-eyebrow">{todayDispatch.date}</span>
                  <button
                    onClick={() => setDispatchEditing((v) => !v)}
                    className="text-xs font-bold uppercase tracking-widest t-sans-blue cursor-pointer bg-transparent border-none"
                  >
                    {dispatchEditing ? "Hide editor" : "Edit raw"}
                  </button>
                </div>

                {/* Read-only preview from parsed JSON */}
                {parsedDispatch ? (
                  <div className="border-t border-boston-gray-200 pt-3">
                    <PreviewBlock label="Greeting" value={parsedDispatch.greeting ?? ""} />
                    {parsedDispatch.hero && (parsedDispatch.hero.title || parsedDispatch.hero.body) && (
                      <div className="mb-3">
                        <p className="h-eyebrow mb-1">Hero</p>
                        {parsedDispatch.hero.title && (
                          <p className="h-card mb-1">{parsedDispatch.hero.title}</p>
                        )}
                        {parsedDispatch.hero.body && (
                          <p className="text-[13px] leading-relaxed t-serif-body whitespace-pre-wrap">
                            {parsedDispatch.hero.body}
                          </p>
                        )}
                      </div>
                    )}
                    <PreviewBlock label="Sign-off" value={parsedDispatch.signOff ?? ""} />
                    <div className="grid grid-cols-2 gap-2 text-xs t-sans-gray">
                      <span>News: {Array.isArray(parsedDispatch.newsHeadlines) ? parsedDispatch.newsHeadlines.length : 0}</span>
                      <span>Events: {Array.isArray(parsedDispatch.events) ? parsedDispatch.events.length : 0}</span>
                      <span>MBTA alerts: {Array.isArray(parsedDispatch.mbtaAlerts) ? parsedDispatch.mbtaAlerts.length : 0}</span>
                      <span>Markets: {parsedDispatch.markets ? "yes" : "no"}</span>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto bg-boston-gray-50 p-2 rounded-sm t-sans-navy">
                    {todayDispatch.content.slice(0, 600)}
                    {todayDispatch.content.length > 600 ? "…" : ""}
                  </pre>
                )}

                {dispatchEditing && (
                  <div className="border-t border-boston-gray-200 pt-3">
                    <p className="h-eyebrow mb-2">Raw JSON editor</p>
                    <textarea
                      value={dispatchDraft}
                      onChange={(e) => setDispatchDraft(e.target.value)}
                      rows={14}
                      aria-label="Dispatch raw content editor"
                      className="w-full text-xs font-mono p-2 border border-boston-gray-200 rounded-sm mb-2 resize-y"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDispatch}
                        className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setDispatchEditing(false);
                          setDispatchDraft(todayDispatch.content);
                        }}
                        className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-gray bg-transparent border border-boston-gray-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Monthly */}
        {activeTab === "monthly" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Monthly Happenings</h2>
              <button
                onClick={handleRegenerateMonthly}
                disabled={monthlyRegenerating}
                className="text-xs font-bold uppercase tracking-widest t-sans-blue cursor-pointer bg-transparent border-none disabled:opacity-50"
              >
                {monthlyRegenerating ? "Working…" : "Regenerate Current"}
              </button>
            </div>
            <p className="text-xs italic t-serif-gray mb-3">
              Auto-runs on the 1st of each month at 9 AM ET. Three slots per month.
            </p>
            {monthlyResult && <p className="text-xs t-sans-gray mb-2">{monthlyResult}</p>}

            {!loading && monthly.length === 0 && (
              <p className="text-xs italic t-serif-gray">No happenings for the current month yet.</p>
            )}

            <div className="flex flex-col gap-2">
              {monthly.map((m) => (
                <div key={m.id} className="bg-white rounded-sm p-3 box-bordered">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="h-eyebrow mb-1">
                        {m.month} · Slot {m.slot} · {m.emoji}
                      </p>
                      <p className="h-card mb-1">{m.title}</p>
                      <p className="text-xs italic t-serif-body line-clamp-2">{m.summary}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMonthly(m.id)}
                      aria-label={`Delete ${m.title}`}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community */}
        {activeTab === "community" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Community ({filteredCommunity.length})</h2>
              <div className="flex gap-1">
                {(["all", "active", "expired"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setCommunityFilter(f)}
                    className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm cursor-pointer border-none ${
                      communityFilter === f ? "bg-navy text-white" : "bg-boston-gray-100 t-sans-gray"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {!loading && filteredCommunity.length === 0 && (
              <p className="text-xs italic t-serif-gray">No happenings in this view.</p>
            )}

            <div className="flex flex-col gap-2">
              {filteredCommunity.map((c) => {
                const today = new Date().toISOString().split("T")[0];
                const expired = c.endDate ? c.endDate < today : false;
                return (
                  <div key={c.id} className="bg-white rounded-sm p-3 box-bordered">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="h-eyebrow">{c.emoji} {c.neighborhood} · {c.dateLabel}</p>
                          {expired && (
                            <span className="text-[10px] uppercase tracking-widest px-1 py-0.5 rounded-sm bg-boston-gray-100 t-sans-gray">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="h-card mb-1">{c.title}</p>
                        <p className="text-xs italic t-serif-body line-clamp-2">{c.description}</p>
                        <p className="text-[11px] t-sans-gray mt-1">
                          @{c.submittedByUsername} ·{" "}
                          {c.startDate ?? "—"}
                          {c.endDate ? ` → ${c.endDate}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCommunity(c.id)}
                        aria-label={`Delete ${c.title}`}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Errors */}
        {activeTab === "errors" && (
          <section>
            <h2 className="h-section mb-3">Submission Errors ({errors.length})</h2>
            {!loading && errors.length === 0 && (
              <p className="text-xs italic t-serif-gray">No submission errors logged.</p>
            )}
            {errors.map((err) => (
              <div key={err.id} className="bg-white rounded-sm p-3 mb-2 box-bordered-thin">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm t-sans-red admin-error-badge">
                    {err.type}
                  </span>
                  <span className="text-xs t-sans-gray">
                    FID {err.userFid} · {new Date(err.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-bold mb-1 t-sans-red">{err.errorMessage}</p>
                <details>
                  <summary className="text-xs cursor-pointer t-sans-gray">Payload</summary>
                  <pre className="text-xs mt-1 p-2 overflow-x-auto bg-boston-gray-50 admin-pre">
                    {err.payload}
                  </pre>
                </details>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function countForTab(
  key: TabKey,
  ctx: { pending: Spot[]; errors: ErrorRow[]; community: CommunityRow[]; monthly: MonthlyHappening[] },
): number | null {
  switch (key) {
    case "spots":
      return ctx.pending.length;
    case "errors":
      return ctx.errors.length;
    case "community":
      return ctx.community.length;
    case "monthly":
      return ctx.monthly.length;
    default:
      return null;
  }
}

function OverviewCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-sm p-3 box-bordered cursor-pointer flex items-start justify-between gap-2 transition-colors hover:border-boston-blue"
    >
      <div className="min-w-0">
        <p className="h-eyebrow mb-1">{label}</p>
        <p className="h-card text-2xl">
          {value}
        </p>
      </div>
      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" className="shrink-0 mt-1 text-boston-gray-400" />
    </button>
  );
}

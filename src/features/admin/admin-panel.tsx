"use client";

import { useState, useEffect, useCallback, useMemo, cloneElement, isValidElement } from "react";
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
  adminUpdateSpot,
  adminDeleteSpot,
  adminUpdateCommunityHappening,
  adminGetAllBuilders,
  adminToggleBuilderFeatured,
  adminToggleBuilderVerified,
  adminDeleteBuilder,
  adminUpdateBuilderProfile,
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
import type { Spot, Builder } from "@/features/boston/types";
import { ChevronRight, Trash2, Pencil, X, Check } from "lucide-react";

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
  url: string | null;
  status: string;
  submittedByFid: number;
  submittedByUsername: string;
  createdAt: Date;
};

type TabKey = "overview" | "spots" | "dispatch" | "monthly" | "community" | "builders" | "errors";

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "spots", label: "Spots" },
  { key: "dispatch", label: "Dispatch" },
  { key: "monthly", label: "Monthly" },
  { key: "community", label: "Community" },
  { key: "builders", label: "Builders" },
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

// ─── Inline edit field ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const child = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, { "aria-label": children.props["aria-label"] ?? label })
    : children;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-widest t-sans-gray" aria-hidden="true">{label}</span>
      {child}
    </div>
  );
}

const inputCls = "w-full px-2 py-1.5 text-sm border border-boston-gray-200 rounded-sm t-sans-navy focus:outline-none focus:border-boston-blue bg-white";
const textareaCls = `${inputCls} resize-none`;

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
  const [allBuilders, setAllBuilders] = useState<Builder[]>([]);
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
  const [buildersSearch, setBuildersSearch] = useState("");

  // Spot inline editing
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [spotDraft, setSpotDraft] = useState<{
    name: string; category: string; subcategory: string; neighborhood: string;
    description: string; address: string; link: string; latitude: string; longitude: string; featured: boolean;
  } | null>(null);

  // Community inline editing
  const [editingCommunityId, setEditingCommunityId] = useState<string | null>(null);
  const [communityDraft, setCommunityDraft] = useState<{
    title: string; description: string; neighborhood: string; dateLabel: string;
    startDate: string; endDate: string; emoji: string; url: string;
  } | null>(null);

  // Builder inline editing
  const [editingBuilderId, setEditingBuilderId] = useState<string | null>(null);
  const [builderDraft, setBuilderDraft] = useState<{
    bio: string; projectName: string; projectLinks: string; categories: string;
    talkAbout: string; neighborhood: string; category: string;
  } | null>(null);

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
    const [p, e, spots, dispatch, comm, mh, bldrs] = await Promise.all([
      getPendingSpots(effectiveFid),
      getSubmissionErrors(50, effectiveFid),
      getSpots({ limit: 500 }),
      getDispatchForDate(todayStr),
      adminListAllCommunityHappenings(effectiveFid, 100),
      adminListMonthlyHappenings(effectiveFid),
      adminGetAllBuilders(effectiveFid),
    ]);
    setPending(p as Spot[]);
    setErrors(e as ErrorRow[]);
    setAllSpots(spots as Spot[]);
    setCommunity(comm as CommunityRow[]);
    setMonthly(mh);
    setAllBuilders(bldrs as Builder[]);
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

  // ── Spot mutations ──
  async function handleApprove(id: string) {
    await approveSpot(id, effectiveFid!);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }
  async function handleReject(id: string) {
    await rejectSpot(id, effectiveFid!);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }
  function startEditSpot(spot: Spot) {
    setEditingSpotId(spot.id);
    setSpotDraft({
      name: spot.name,
      category: spot.category,
      subcategory: spot.subcategory ?? "",
      neighborhood: spot.neighborhood,
      description: spot.description,
      address: spot.address ?? "",
      link: spot.link ?? "",
      latitude: spot.latitude != null ? String(spot.latitude) : "",
      longitude: spot.longitude != null ? String(spot.longitude) : "",
      featured: spot.featured,
    });
  }
  async function handleSaveSpot(spotId: string) {
    if (!spotDraft) return;
    const lat = spotDraft.latitude !== "" ? parseFloat(spotDraft.latitude) : null;
    const lng = spotDraft.longitude !== "" ? parseFloat(spotDraft.longitude) : null;
    await adminUpdateSpot(effectiveFid!, spotId, {
      name: spotDraft.name,
      category: spotDraft.category,
      subcategory: spotDraft.subcategory || null,
      neighborhood: spotDraft.neighborhood,
      description: spotDraft.description,
      address: spotDraft.address || null,
      link: spotDraft.link || null,
      latitude: lat,
      longitude: lng,
      featured: spotDraft.featured,
    });
    setAllSpots((prev) =>
      prev.map((s) =>
        s.id === spotId
          ? {
              ...s,
              name: spotDraft.name,
              category: spotDraft.category,
              subcategory: spotDraft.subcategory || null,
              neighborhood: spotDraft.neighborhood,
              description: spotDraft.description,
              address: spotDraft.address || null,
              link: spotDraft.link || null,
              latitude: lat,
              longitude: lng,
              featured: spotDraft.featured,
            }
          : s,
      ),
    );
    setEditingSpotId(null);
    setSpotDraft(null);
  }
  async function handleDeleteSpot(id: string) {
    if (!confirm("Delete this spot? This cannot be undone.")) return;
    await adminDeleteSpot(effectiveFid!, id);
    setAllSpots((prev) => prev.filter((s) => s.id !== id));
    setPending((prev) => prev.filter((s) => s.id !== id));
  }
  async function handleToggleTouristPick(spotId: string, currentValue: boolean) {
    await toggleTouristPick(spotId, !currentValue, effectiveFid!);
    setAllSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, touristPick: !currentValue } : s)),
    );
  }

  // ── Community mutations ──
  function startEditCommunity(row: CommunityRow) {
    setEditingCommunityId(row.id);
    setCommunityDraft({
      title: row.title,
      description: row.description,
      neighborhood: row.neighborhood,
      dateLabel: row.dateLabel,
      startDate: row.startDate ?? "",
      endDate: row.endDate ?? "",
      emoji: row.emoji,
      url: row.url ?? "",
    });
  }
  async function handleSaveCommunity(id: string) {
    if (!communityDraft) return;
    await adminUpdateCommunityHappening(effectiveFid!, id, {
      title: communityDraft.title,
      description: communityDraft.description,
      neighborhood: communityDraft.neighborhood,
      dateLabel: communityDraft.dateLabel,
      startDate: communityDraft.startDate || null,
      endDate: communityDraft.endDate || null,
      emoji: communityDraft.emoji,
      url: communityDraft.url || null,
    });
    setCommunity((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title: communityDraft.title,
              description: communityDraft.description,
              neighborhood: communityDraft.neighborhood,
              dateLabel: communityDraft.dateLabel,
              startDate: communityDraft.startDate || null,
              endDate: communityDraft.endDate || null,
              emoji: communityDraft.emoji,
              url: communityDraft.url || null,
            }
          : c,
      ),
    );
    setEditingCommunityId(null);
    setCommunityDraft(null);
  }
  async function handleDeleteCommunity(id: string) {
    if (!confirm("Delete this community happening?")) return;
    const r = await adminDeleteCommunityHappening(effectiveFid!, id);
    if (r.success) setCommunity((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Builder mutations ──
  function startEditBuilder(b: Builder) {
    setEditingBuilderId(b.id);
    setBuilderDraft({
      bio: b.bio ?? "",
      projectName: b.projectName ?? "",
      projectLinks: (b.projectLinks ?? []).join(", "),
      categories: (b.categories ?? []).join(", "),
      talkAbout: b.talkAbout ?? "",
      neighborhood: b.neighborhood ?? "",
      category: b.category ?? "",
    });
  }
  async function handleSaveBuilder(builderId: string) {
    if (!builderDraft) return;
    const links = builderDraft.projectLinks.split(",").map((s) => s.trim()).filter(Boolean);
    const cats = builderDraft.categories.split(",").map((s) => s.trim()).filter(Boolean);
    await adminUpdateBuilderProfile(effectiveFid!, builderId, {
      bio: builderDraft.bio || null,
      projectName: builderDraft.projectName || null,
      projectLinks: links,
      categories: cats,
      talkAbout: builderDraft.talkAbout || null,
      neighborhood: builderDraft.neighborhood || null,
      category: builderDraft.category || null,
    });
    setAllBuilders((prev) =>
      prev.map((b) =>
        b.id === builderId
          ? {
              ...b,
              bio: builderDraft.bio || null,
              projectName: builderDraft.projectName || null,
              projectLinks: links,
              categories: cats,
              talkAbout: builderDraft.talkAbout || null,
              neighborhood: builderDraft.neighborhood || null,
              category: builderDraft.category || null,
            }
          : b,
      ),
    );
    setEditingBuilderId(null);
    setBuilderDraft(null);
  }
  async function handleToggleBuilderFeatured(builderId: string, current: boolean) {
    await adminToggleBuilderFeatured(effectiveFid!, builderId, !current);
    setAllBuilders((prev) =>
      prev.map((b) => (b.id === builderId ? { ...b, featured: !current } : b)),
    );
  }
  async function handleToggleBuilderVerified(builderId: string, current: boolean) {
    await adminToggleBuilderVerified(effectiveFid!, builderId, !current);
    setAllBuilders((prev) =>
      prev.map((b) => (b.id === builderId ? { ...b, verified: !current } : b)),
    );
  }
  async function handleDeleteBuilder(id: string) {
    if (!confirm("Remove this builder? This cannot be undone.")) return;
    await adminDeleteBuilder(effectiveFid!, id);
    setAllBuilders((prev) => prev.filter((b) => b.id !== id));
  }

  // ── Dispatch mutations ──
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

  // ── Monthly mutations ──
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

  const filteredBuilders = useMemo(() => {
    const q = buildersSearch.trim().toLowerCase();
    if (!q) return allBuilders;
    return allBuilders.filter(
      (b) =>
        b.displayName.toLowerCase().includes(q) ||
        b.username.toLowerCase().includes(q) ||
        b.neighborhood?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q),
    );
  }, [allBuilders, buildersSearch]);

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
    <div className="admin-page min-h-screen bg-boston-gray-50">
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
            type="button"
            onClick={handleSecretLogout}
            className="admin-action-btn"
            data-variant="ghost"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Sticky tab bar */}
      <div className="admin-tabs" aria-label="Admin sections">
        {TAB_LABELS.map((t) => {
          const count = countForTab(t.key, { pending, errors, community: filteredCommunity, monthly, builders: allBuilders });
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

        {/* ── Overview ── */}
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
            <OverviewCard label="Builders" value={loading ? "…" : String(allBuilders.length)} onClick={() => setActiveTab("builders")} />
          </section>
        )}

        {/* ── Spots ── */}
        {activeTab === "spots" && (
          <>
            {/* Pending */}
            <section>
              <h2 className="h-section mb-3">Pending ({pending.length})</h2>
              {!loading && pending.length === 0 && (
                <p className="text-xs italic t-serif-gray">No pending spots.</p>
              )}
              {pending.map((spot) => (
                <div key={spot.id} className="bg-white rounded-sm p-3 mb-2 box-bordered">
                  <p className="h-card mb-0.5">{spot.name}</p>
                  <p className="text-xs t-sans-gray mb-1">
                    {spot.category} · {spot.neighborhood} · @{spot.submittedByUsername} · FID {spot.submittedByFid}
                  </p>
                  <p className="text-xs italic mb-1 t-serif-body">{spot.description}</p>
                  {spot.address && <p className="text-xs t-sans-gray mb-1">📍 {spot.address}</p>}
                  {spot.link && <p className="text-xs t-sans-blue mb-1 truncate">🔗 {spot.link}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(spot.id)}
                      className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(spot.id)}
                      className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-red bg-transparent border border-boston-red cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditSpot(spot)}
                      className="admin-action-btn"
                    >
                      <Pencil size={11} aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpot(spot.id)}
                      aria-label={`Delete ${spot.name}`}
                      className="admin-action-btn text-boston-red"
                    >
                      <Trash2 size={11} aria-hidden="true" />
                    </button>
                  </div>
                  {editingSpotId === spot.id && spotDraft && (
                    <SpotEditForm
                      draft={spotDraft}
                      onChange={setSpotDraft}
                      onSave={() => handleSaveSpot(spot.id)}
                      onCancel={() => { setEditingSpotId(null); setSpotDraft(null); }}
                    />
                  )}
                </div>
              ))}
            </section>

            {/* All spots */}
            <section>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h2 className="h-section">All Spots ({allSpots.length})</h2>
                <span className="text-xs t-sans-gray">✈️ {allSpots.filter((s) => s.touristPick).length} tourist picks</span>
              </div>
              <input
                type="search"
                value={spotsSearch}
                onChange={(e) => setSpotsSearch(e.target.value)}
                placeholder="Search by name, neighborhood, or category…"
                className="w-full px-3 py-2 text-sm border border-boston-gray-200 rounded-sm t-sans-navy focus:outline-none focus:border-boston-blue mb-3"
                aria-label="Search spots"
              />
              <div className="flex flex-col gap-2">
                {filteredSpots
                  .sort((a, b) => (a.touristPick === b.touristPick ? 0 : a.touristPick ? -1 : 1))
                  .map((spot) => (
                    <div key={spot.id} className={`rounded-sm p-3 box-bordered ${spot.touristPick ? "bg-boston-blue/5" : "bg-white"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <p className="text-xs font-bold t-sans-navy">{spot.name}</p>
                            {spot.featured && <Badge label="Featured" color="yellow" />}
                            {spot.touristPick && <Badge label="✈️ Pick" color="blue" />}
                          </div>
                          <p className="text-xs t-sans-gray">{spot.category}{spot.subcategory ? ` / ${spot.subcategory}` : ""} · {spot.neighborhood}</p>
                          <p className="text-xs italic t-serif-body mt-0.5 line-clamp-1">{spot.description}</p>
                          {spot.address && <p className="text-[11px] t-sans-gray mt-0.5">📍 {spot.address}</p>}
                          {spot.link && <p className="text-[11px] t-sans-blue mt-0.5 truncate">🔗 {spot.link}</p>}
                          <p className="text-[11px] t-sans-gray mt-0.5">@{spot.submittedByUsername} · FID {spot.submittedByFid}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTouristPick(spot.id, spot.touristPick)}
                            className={`px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest cursor-pointer border-none ${spot.touristPick ? "bg-boston-blue text-white" : "bg-boston-gray-100 t-sans-navy"}`}
                          >
                            ✈️
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditSpot(spot)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm admin-action-btn p-0"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSpot(spot.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      {editingSpotId === spot.id && spotDraft && (
                        <SpotEditForm
                          draft={spotDraft}
                          onChange={setSpotDraft}
                          onSave={() => handleSaveSpot(spot.id)}
                          onCancel={() => { setEditingSpotId(null); setSpotDraft(null); }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}

        {/* ── Dispatch ── */}
        {activeTab === "dispatch" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Today&apos;s Dispatch</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateDispatch(true)}
                  disabled={regenerating}
                  className="admin-action-btn"
                  data-variant="primary"
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
                    type="button"
                    onClick={() => setDispatchEditing((v) => !v)}
                    className="admin-action-btn"
                  >
                    {dispatchEditing ? "Hide editor" : "Edit raw"}
                  </button>
                </div>
                {parsedDispatch ? (
                  <div className="border-t border-boston-gray-200 pt-3">
                    <PreviewBlock label="Greeting" value={parsedDispatch.greeting ?? ""} />
                    {parsedDispatch.hero && (parsedDispatch.hero.title || parsedDispatch.hero.body) && (
                      <div className="mb-3">
                        <p className="h-eyebrow mb-1">Hero</p>
                        {parsedDispatch.hero.title && <p className="h-card mb-1">{parsedDispatch.hero.title}</p>}
                        {parsedDispatch.hero.body && (
                          <p className="text-[13px] leading-relaxed t-serif-body whitespace-pre-wrap">{parsedDispatch.hero.body}</p>
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
                    {todayDispatch.content.slice(0, 600)}{todayDispatch.content.length > 600 ? "…" : ""}
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
                      <button type="button" onClick={handleSaveDispatch} className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer">Save</button>
                      <button type="button" onClick={() => { setDispatchEditing(false); setDispatchDraft(todayDispatch.content); }} className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-gray bg-transparent border border-boston-gray-200 cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Monthly ── */}
        {activeTab === "monthly" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Monthly Happenings</h2>
              <button type="button" onClick={handleRegenerateMonthly} disabled={monthlyRegenerating} className="admin-action-btn" data-variant="primary">
                {monthlyRegenerating ? "Working…" : "Regenerate Current"}
              </button>
            </div>
            <p className="text-xs italic t-serif-gray mb-3">Auto-runs on the 1st of each month at 9 AM ET. Three slots per month.</p>
            {monthlyResult && <p className="text-xs t-sans-gray mb-2">{monthlyResult}</p>}
            {!loading && monthly.length === 0 && <p className="text-xs italic t-serif-gray">No happenings for the current month yet.</p>}
            <div className="flex flex-col gap-2">
              {monthly.map((m) => (
                <div key={m.id} className="bg-white rounded-sm p-3 box-bordered">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="h-eyebrow mb-1">{m.month} · Slot {m.slot} · {m.emoji}</p>
                      <p className="h-card mb-1">{m.title}</p>
                      <p className="text-xs italic t-serif-body line-clamp-2">{m.summary}</p>
                    </div>
                    <button type="button" onClick={() => handleDeleteMonthly(m.id)} aria-label={`Delete ${m.title}`} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer">
                      <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Community ── */}
        {activeTab === "community" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Community ({filteredCommunity.length})</h2>
              <div className="flex gap-1">
                {(["all", "active", "expired"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setCommunityFilter(f)} className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm cursor-pointer border-none ${communityFilter === f ? "bg-navy text-white" : "bg-boston-gray-100 t-sans-navy"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {!loading && filteredCommunity.length === 0 && <p className="text-xs italic t-serif-gray">No happenings in this view.</p>}
            <div className="flex flex-col gap-2">
              {filteredCommunity.map((c) => {
                const today = new Date().toISOString().split("T")[0];
                const expired = c.endDate ? c.endDate < today : false;
                const isEditing = editingCommunityId === c.id;
                return (
                  <div key={c.id} className="bg-white rounded-sm p-3 box-bordered">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="h-eyebrow">{c.emoji} {c.neighborhood} · {c.dateLabel}</p>
                          {expired && <span className="text-[10px] uppercase tracking-widest px-1 py-0.5 rounded-sm bg-boston-gray-100 t-sans-gray">Expired</span>}
                        </div>
                        <p className="h-card mb-0.5">{c.title}</p>
                        <p className="text-xs italic t-serif-body line-clamp-2">{c.description}</p>
                        {c.url && <p className="text-[11px] t-sans-blue mt-0.5 truncate">🔗 {c.url}</p>}
                        <p className="text-[11px] t-sans-gray mt-1">@{c.submittedByUsername} · FID {c.submittedByFid} · {c.startDate ?? "—"}{c.endDate ? ` → ${c.endDate}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => isEditing ? (setEditingCommunityId(null), setCommunityDraft(null)) : startEditCommunity(c)} className="w-7 h-7 flex items-center justify-center rounded-sm admin-action-btn p-0">
                          {isEditing ? <X size={13} aria-hidden="true" /> : <Pencil size={13} aria-hidden="true" />}
                        </button>
                        <button type="button" onClick={() => handleDeleteCommunity(c.id)} aria-label={`Delete ${c.title}`} className="w-7 h-7 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer">
                          <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    {isEditing && communityDraft && (
                      <CommunityEditForm
                        draft={communityDraft}
                        onChange={setCommunityDraft}
                        onSave={() => handleSaveCommunity(c.id)}
                        onCancel={() => { setEditingCommunityId(null); setCommunityDraft(null); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Builders ── */}
        {activeTab === "builders" && (
          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="h-section">Builders ({allBuilders.length})</h2>
              <span className="text-xs t-sans-gray">⭐ {allBuilders.filter((b) => b.featured).length} featured · ✓ {allBuilders.filter((b) => b.verified).length} verified</span>
            </div>
            <input
              type="search"
              value={buildersSearch}
              onChange={(e) => setBuildersSearch(e.target.value)}
              placeholder="Search by name, username, neighborhood…"
              className="w-full px-3 py-2 text-sm border border-boston-gray-200 rounded-sm t-sans-navy focus:outline-none focus:border-boston-blue mb-3"
              aria-label="Search builders"
            />
            {!loading && filteredBuilders.length === 0 && <p className="text-xs italic t-serif-gray">No builders found.</p>}
            <div className="flex flex-col gap-2">
              {filteredBuilders.map((b) => {
                const isEditing = editingBuilderId === b.id;
                return (
                  <div key={b.id} className={`bg-white rounded-sm p-3 box-bordered ${b.featured ? "border-l-4 border-l-boston-yellow" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="text-xs font-bold t-sans-navy">{b.displayName}</p>
                          <p className="text-xs t-sans-gray">@{b.username}</p>
                          <p className="text-[11px] t-sans-gray">FID {b.fid}</p>
                          {b.featured && <Badge label="⭐ Featured" color="yellow" />}
                          {b.verified && <Badge label="✓ Verified" color="blue" />}
                        </div>
                        {b.bio && <p className="text-xs italic t-serif-body line-clamp-1 mt-0.5">{b.bio}</p>}
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          {b.category && <span className="text-[11px] t-sans-gray">{b.category}</span>}
                          {b.neighborhood && <span className="text-[11px] t-sans-gray">📍 {b.neighborhood}</span>}
                          {b.projectName && <span className="text-[11px] font-bold t-sans-navy">🛠 {b.projectName}</span>}
                        </div>
                        {(b.categories ?? []).length > 0 && (
                          <p className="text-[11px] t-sans-gray mt-0.5">{b.categories.join(" · ")}</p>
                        )}
                        {(b.projectLinks ?? []).length > 0 && (
                          <p className="text-[11px] t-sans-blue mt-0.5 truncate">🔗 {b.projectLinks.join(" · ")}</p>
                        )}
                        {b.talkAbout && <p className="text-[11px] t-sans-gray mt-0.5 italic">&ldquo;{b.talkAbout}&rdquo;</p>}
                        <p className="text-[11px] t-sans-gray mt-0.5">Joined {new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={b.featured ? "Unfeature builder" : "Feature builder"}
                            onClick={() => handleToggleBuilderFeatured(b.id, b.featured)}
                            className={`px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest cursor-pointer border-none ${b.featured ? "bg-boston-yellow text-[#091f2f]" : "bg-boston-gray-100 t-sans-navy"}`}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            aria-label={b.verified ? "Unverify builder" : "Verify builder"}
                            onClick={() => handleToggleBuilderVerified(b.id, b.verified)}
                            className={`px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest cursor-pointer border-none ${b.verified ? "bg-boston-blue text-white" : "bg-boston-gray-100 t-sans-navy"}`}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            aria-label={isEditing ? "Cancel editing" : `Edit ${b.displayName}`}
                            onClick={() => isEditing ? (setEditingBuilderId(null), setBuilderDraft(null)) : startEditBuilder(b)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm admin-action-btn p-0"
                          >
                            {isEditing ? <X size={13} aria-hidden="true" /> : <Pencil size={13} aria-hidden="true" />}
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${b.displayName}`}
                            onClick={() => handleDeleteBuilder(b.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm text-boston-red hover:bg-boston-red/10 bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {isEditing && builderDraft && (
                      <BuilderEditForm
                        draft={builderDraft}
                        onChange={setBuilderDraft}
                        onSave={() => handleSaveBuilder(b.id)}
                        onCancel={() => { setEditingBuilderId(null); setBuilderDraft(null); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Errors ── */}
        {activeTab === "errors" && (
          <section>
            <h2 className="h-section mb-3">Submission Errors ({errors.length})</h2>
            {!loading && errors.length === 0 && <p className="text-xs italic t-serif-gray">No submission errors logged.</p>}
            {errors.map((err) => (
              <div key={err.id} className="bg-white rounded-sm p-3 mb-2 box-bordered-thin">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm t-sans-red admin-error-badge">{err.type}</span>
                  <span className="text-xs t-sans-gray">FID {err.userFid} · {new Date(err.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs font-bold mb-1 t-sans-red">{err.errorMessage}</p>
                <details>
                  <summary className="text-xs cursor-pointer t-sans-gray">Payload</summary>
                  <pre className="text-xs mt-1 p-2 overflow-x-auto bg-boston-gray-50 admin-pre">{err.payload}</pre>
                </details>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
}

// ─── Edit forms ──────────────────────────────────────────────────────────────

type SpotDraft = {
  name: string; category: string; subcategory: string; neighborhood: string;
  description: string; address: string; link: string; latitude: string; longitude: string; featured: boolean;
};

function SpotEditForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: SpotDraft;
  onChange: (d: SpotDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (k: keyof SpotDraft, v: string | boolean) => onChange({ ...draft, [k]: v });
  return (
    <div className="mt-3 pt-3 border-t border-boston-gray-200 grid grid-cols-2 gap-3">
      <Field label="Name">
        <input className={inputCls} value={draft.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Category">
        <input className={inputCls} value={draft.category} onChange={(e) => set("category", e.target.value)} />
      </Field>
      <Field label="Subcategory">
        <input className={inputCls} value={draft.subcategory} onChange={(e) => set("subcategory", e.target.value)} />
      </Field>
      <Field label="Neighborhood">
        <input className={inputCls} value={draft.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="Description">
          <textarea className={textareaCls} rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
      <Field label="Address">
        <input className={inputCls} value={draft.address} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Link (URL)">
        <input className={inputCls} value={draft.link} onChange={(e) => set("link", e.target.value)} />
      </Field>
      <Field label="Latitude">
        <input className={inputCls} type="number" step="any" value={draft.latitude} onChange={(e) => set("latitude", e.target.value)} />
      </Field>
      <Field label="Longitude">
        <input className={inputCls} type="number" step="any" value={draft.longitude} onChange={(e) => set("longitude", e.target.value)} />
      </Field>
      <div className="col-span-2 flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest t-sans-gray cursor-pointer">
          <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
      </div>
      <div className="col-span-2 flex gap-2">
        <button type="button" onClick={onSave} className="admin-action-btn" data-variant="primary"><Check size={12} aria-hidden="true" /> Save</button>
        <button type="button" onClick={onCancel} className="admin-action-btn"><X size={12} aria-hidden="true" /> Cancel</button>
      </div>
    </div>
  );
}

type CommunityDraft = {
  title: string; description: string; neighborhood: string; dateLabel: string;
  startDate: string; endDate: string; emoji: string; url: string;
};

function CommunityEditForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: CommunityDraft;
  onChange: (d: CommunityDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (k: keyof CommunityDraft, v: string) => onChange({ ...draft, [k]: v });
  return (
    <div className="mt-3 pt-3 border-t border-boston-gray-200 grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Field label="Title">
          <input className={inputCls} value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Description">
          <textarea className={textareaCls} rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
      <Field label="Emoji">
        <input className={inputCls} value={draft.emoji} onChange={(e) => set("emoji", e.target.value)} />
      </Field>
      <Field label="Neighborhood">
        <input className={inputCls} value={draft.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
      </Field>
      <Field label="Date Label">
        <input className={inputCls} value={draft.dateLabel} onChange={(e) => set("dateLabel", e.target.value)} />
      </Field>
      <Field label="URL">
        <input className={inputCls} value={draft.url} onChange={(e) => set("url", e.target.value)} />
      </Field>
      <Field label="Start Date (YYYY-MM-DD)">
        <input className={inputCls} value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} />
      </Field>
      <Field label="End Date (YYYY-MM-DD)">
        <input className={inputCls} value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} />
      </Field>
      <div className="col-span-2 flex gap-2">
        <button type="button" onClick={onSave} className="admin-action-btn" data-variant="primary"><Check size={12} aria-hidden="true" /> Save</button>
        <button type="button" onClick={onCancel} className="admin-action-btn"><X size={12} aria-hidden="true" /> Cancel</button>
      </div>
    </div>
  );
}

type BuilderDraftType = {
  bio: string; projectName: string; projectLinks: string; categories: string;
  talkAbout: string; neighborhood: string; category: string;
};

function BuilderEditForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: BuilderDraftType;
  onChange: (d: BuilderDraftType) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (k: keyof BuilderDraftType, v: string) => onChange({ ...draft, [k]: v });
  return (
    <div className="mt-3 pt-3 border-t border-boston-gray-200 grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Field label="Bio">
          <textarea className={textareaCls} rows={2} value={draft.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
      </div>
      <Field label="Project Name">
        <input className={inputCls} value={draft.projectName} onChange={(e) => set("projectName", e.target.value)} />
      </Field>
      <Field label="Category">
        <input className={inputCls} value={draft.category} onChange={(e) => set("category", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="Project Links (comma-separated)">
          <input className={inputCls} value={draft.projectLinks} onChange={(e) => set("projectLinks", e.target.value)} />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Categories (comma-separated)">
          <input className={inputCls} value={draft.categories} onChange={(e) => set("categories", e.target.value)} />
        </Field>
      </div>
      <Field label="Neighborhood">
        <input className={inputCls} value={draft.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="Talk About">
          <input className={inputCls} value={draft.talkAbout} onChange={(e) => set("talkAbout", e.target.value)} />
        </Field>
      </div>
      <div className="col-span-2 flex gap-2">
        <button type="button" onClick={onSave} className="admin-action-btn" data-variant="primary"><Check size={12} aria-hidden="true" /> Save</button>
        <button type="button" onClick={onCancel} className="admin-action-btn"><X size={12} aria-hidden="true" /> Cancel</button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: "blue" | "yellow" | "green" }) {
  const cls = {
    blue: "bg-boston-blue/10 text-boston-blue",
    yellow: "bg-boston-yellow/20 text-[#91680a]",
    green: "bg-green-100 text-green-800",
  }[color];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {label}
    </span>
  );
}

function countForTab(
  key: TabKey,
  ctx: { pending: Spot[]; errors: ErrorRow[]; community: CommunityRow[]; monthly: MonthlyHappening[]; builders: Builder[] },
): number | null {
  switch (key) {
    case "spots": return ctx.pending.length || null;
    case "errors": return ctx.errors.length || null;
    case "community": return ctx.community.length;
    case "monthly": return ctx.monthly.length;
    case "builders": return ctx.builders.length;
    default: return null;
  }
}

function OverviewCard({
  label, value, onClick,
}: {
  label: string; value: string; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-sm p-3 box-bordered cursor-pointer flex items-start justify-between gap-2 transition-colors hover:border-boston-blue"
    >
      <div className="min-w-0">
        <p className="h-eyebrow mb-1">{label}</p>
        <p className="h-card text-2xl">{value}</p>
      </div>
      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" className="shrink-0 mt-1 text-boston-gray-400" />
    </button>
  );
}

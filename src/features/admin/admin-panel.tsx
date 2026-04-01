"use client";

import { useState, useEffect, useCallback } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import {
  getPendingSpots,
  approveSpot,
  rejectSpot,
  getSubmissionErrors,
  getSpots,
  toggleTouristPick,
} from "@/db/actions/boston-actions";
import { getDispatchForDate, updateDispatchContent } from "@/db/actions/dispatch-actions";
import type { Spot } from "@/features/boston/types";

const ADMIN_FID = 218957;

type ErrorRow = {
  id: string;
  type: string;
  payload: string;
  errorMessage: string;
  userFid: number;
  createdAt: Date;
};

export function AdminPanel() {
  const { data: user, isLoading } = useFarcasterUser();
  const [pending, setPending] = useState<Spot[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [todayDispatch, setTodayDispatch] = useState<{ date: string; content: string } | null>(null);
  const [dispatchEditing, setDispatchEditing] = useState(false);
  const [dispatchDraft, setDispatchDraft] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  const loadData = useCallback(async () => {
    if (!user?.fid) return;
    setLoading(true);
    const [p, e, spots, dispatch] = await Promise.all([
      getPendingSpots(user.fid),
      getSubmissionErrors(50, user.fid),
      getSpots({ limit: 200 }),
      getDispatchForDate(todayStr),
    ]);
    setPending(p as Spot[]);
    setErrors(e as ErrorRow[]);
    setAllSpots(spots as Spot[]);
    if (dispatch) {
      setTodayDispatch({ date: dispatch.date, content: dispatch.content });
      setDispatchDraft(dispatch.content);
    }
    setLoading(false);
  }, [user?.fid, todayStr]);

  useEffect(() => {
    if (user?.fid === ADMIN_FID) {
      loadData();
    }
  }, [user, loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-boston-gray-50">
        <p className="t-sans-gray text-xs">Loading...</p>
      </div>
    );
  }

  if (!user || user.fid !== ADMIN_FID) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-boston-gray-50">
        <h1
          className="text-xl font-black uppercase tracking-tight mb-2 t-sans-navy"
        >
          Admin
        </h1>
        <p
          className="text-sm italic t-serif-gray"
        >
          Not authorized. This page is restricted.
        </p>
      </div>
    );
  }

  async function handleApprove(id: string) {
    await approveSpot(id, user!.fid);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleReject(id: string) {
    await rejectSpot(id, user!.fid);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleRegenerateDispatch() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/dispatch/generate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      if (res.ok) {
        const dispatch = await getDispatchForDate(todayStr);
        if (dispatch) {
          setTodayDispatch({ date: dispatch.date, content: dispatch.content });
          setDispatchDraft(dispatch.content);
        }
      }
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

  async function handleToggleTouristPick(spotId: string, currentValue: boolean) {
    await toggleTouristPick(spotId, !currentValue, user!.fid);
    setAllSpots((prev) =>
      prev.map((s) => s.id === spotId ? { ...s, touristPick: !currentValue } : s)
    );
  }

  return (
    <div className="min-h-screen bg-boston-gray-50">
      {/* Header */}
      <div
        className="px-4 py-3 bg-navy-bar"
      >
        <h1
          className="text-lg font-black uppercase tracking-tight t-sans-white"
        >
          Admin Panel
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest t-sans text-white/50"
        >
          FID {user.fid} · @{user.username}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Pending spots */}
        <section>
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-3 t-sans-navy"
          >
            Pending Spots ({loading ? "..." : pending.length})
          </h2>

          {!loading && pending.length === 0 && (
            <p
              className="text-xs italic t-serif-gray"
            >
              No pending spots.
            </p>
          )}

          {pending.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-sm p-3 mb-2 box-bordered"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold t-sans-navy">
                    {spot.name}
                  </p>
                  <p className="text-[10px] t-sans-gray">
                    {spot.category} · {spot.neighborhood} · @{spot.submittedByUsername}
                  </p>
                </div>
              </div>
              <p className="text-xs italic mb-3 t-serif-body">
                {spot.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(spot.id)}
                  className="px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(spot.id)}
                  className="px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-red bg-transparent border border-boston-red cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Submission errors */}
        <section>
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-3 t-sans-navy"
          >
            Submission Errors ({loading ? "..." : errors.length})
          </h2>

          {!loading && errors.length === 0 && (
            <p
              className="text-xs italic t-serif-gray"
            >
              No submission errors logged.
            </p>
          )}

          {errors.map((err) => (
            <div
              key={err.id}
              className="bg-white rounded-sm p-3 mb-2 box-bordered-thin"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm t-sans-red admin-error-badge"
                >
                  {err.type}
                </span>
                <span className="text-[10px] t-sans-gray">
                  FID {err.userFid} · {new Date(err.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs font-bold mb-1 t-sans-red">
                {err.errorMessage}
              </p>
              <details>
                <summary className="text-[10px] cursor-pointer t-sans-gray">
                  Payload
                </summary>
                <pre className="text-[10px] mt-1 p-2 overflow-x-auto bg-boston-gray-50 admin-pre">
                  {err.payload}
                </pre>
              </details>
            </div>
          ))}
        </section>

        {/* Dispatch Management */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 t-sans-navy">
            📰 Today&apos;s Dispatch
          </h2>

          {!loading && !todayDispatch && (
            <div className="bg-white rounded-sm p-3 box-bordered">
              <p className="text-xs italic t-serif-gray mb-3">No dispatch generated for today.</p>
              <button
                onClick={handleRegenerateDispatch}
                disabled={regenerating}
                className="px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer disabled:opacity-50"
              >
                {regenerating ? "Generating..." : "Generate Dispatch"}
              </button>
            </div>
          )}

          {todayDispatch && (
            <div className="bg-white rounded-sm p-3 box-bordered">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest t-sans-gray">
                  {todayDispatch.date}
                </span>
                <div className="flex gap-2">
                  {!dispatchEditing && (
                    <button
                      onClick={() => setDispatchEditing(true)}
                      className="text-[10px] font-bold uppercase tracking-widest t-sans-blue cursor-pointer bg-transparent border-none"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleRegenerateDispatch}
                    disabled={regenerating}
                    className="text-[10px] font-bold uppercase tracking-widest t-sans-gray cursor-pointer bg-transparent border-none disabled:opacity-50"
                  >
                    {regenerating ? "..." : "Regenerate"}
                  </button>
                </div>
              </div>
              {dispatchEditing ? (
                <div>
                  <textarea
                    value={dispatchDraft}
                    onChange={(e) => setDispatchDraft(e.target.value)}
                    rows={12}
                    aria-label="Dispatch content editor"
                    className="w-full text-xs font-mono p-2 border border-boston-gray-200 rounded-sm mb-2 resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDispatch}
                      className="px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-white bg-boston-blue border-none cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setDispatchEditing(false); setDispatchDraft(todayDispatch.content); }}
                      className="px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-gray bg-transparent border border-boston-gray-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="text-[10px] whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto bg-boston-gray-50 p-2 rounded-sm">
                  {todayDispatch.content.slice(0, 500)}{todayDispatch.content.length > 500 ? "..." : ""}
                </pre>
              )}
            </div>
          )}
        </section>

        {/* Tourist Picks */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 t-sans-navy">
            ✈️ Tourist Picks ({allSpots.filter(s => s.touristPick).length})
          </h2>
          <p className="text-[10px] t-sans-gray mb-3">
            Toggle spots as tourist picks. These appear under the ✈️ Tourist Picks filter.
          </p>
          <div className="flex flex-col gap-1">
            {allSpots
              .sort((a, b) => (a.touristPick === b.touristPick ? 0 : a.touristPick ? -1 : 1))
              .slice(0, 50)
              .map((spot) => (
                <div
                  key={spot.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded-sm ${spot.touristPick ? "bg-boston-blue/10" : "bg-white"}`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold t-sans-navy truncate">{spot.name}</p>
                    <p className="text-[10px] t-sans-gray">{spot.neighborhood} · {spot.category}</p>
                  </div>
                  <button
                    onClick={() => handleToggleTouristPick(spot.id, spot.touristPick)}
                    className={`shrink-0 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest cursor-pointer border-none ${
                      spot.touristPick ? "bg-boston-blue text-white" : "bg-boston-gray-100 t-sans-gray"
                    }`}
                  >
                    {spot.touristPick ? "✈️ Pick" : "Add"}
                  </button>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

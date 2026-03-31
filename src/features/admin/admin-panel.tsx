"use client";

import { useState, useEffect, useCallback } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import {
  getPendingSpots,
  approveSpot,
  rejectSpot,
  getSubmissionErrors,
} from "@/db/actions/boston-actions";
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
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, e] = await Promise.all([getPendingSpots(), getSubmissionErrors(50)]);
    setPending(p as Spot[]);
    setErrors(e as ErrorRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.fid === ADMIN_FID) {
      loadData();
    }
  }, [user, loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f3f3f3" }}>
        <p style={{ fontFamily: "var(--font-sans)", color: "#828282", fontSize: "12px" }}>Loading...</p>
      </div>
    );
  }

  if (!user || user.fid !== ADMIN_FID) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center" style={{ background: "#f3f3f3" }}>
        <h1
          className="text-xl font-black uppercase tracking-tight mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
        >
          Admin
        </h1>
        <p
          className="text-sm italic"
          style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
        >
          Not authorized. This page is restricted.
        </p>
      </div>
    );
  }

  async function handleApprove(id: string) {
    await approveSpot(id);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleReject(id: string) {
    await rejectSpot(id);
    setPending((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen" style={{ background: "#f3f3f3" }}>
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ background: "#091f2f", borderBottom: "3px solid #1871bd" }}
      >
        <h1
          className="text-lg font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
        >
          Admin Panel
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.5)" }}
        >
          FID {user.fid} · @{user.username}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Pending spots */}
        <section>
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
          >
            Pending Spots ({loading ? "..." : pending.length})
          </h2>

          {!loading && pending.length === 0 && (
            <p
              className="text-xs italic"
              style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
            >
              No pending spots.
            </p>
          )}

          {pending.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-sm p-3 mb-2"
              style={{ border: "2px solid #e0e0e0" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}>
                    {spot.name}
                  </p>
                  <p className="text-[10px]" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
                    {spot.category} · {spot.neighborhood} · @{spot.submittedByUsername}
                  </p>
                </div>
              </div>
              <p className="text-xs italic mb-3" style={{ fontFamily: "var(--font-serif)", color: "#58585b" }}>
                {spot.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(spot.id)}
                  className="px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-sans)", background: "#1871bd", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(spot.id)}
                  className="px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-sans)", background: "transparent", color: "#d22d23", border: "1px solid #d22d23", cursor: "pointer" }}
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
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
          >
            Submission Errors ({loading ? "..." : errors.length})
          </h2>

          {!loading && errors.length === 0 && (
            <p
              className="text-xs italic"
              style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
            >
              No submission errors logged.
            </p>
          )}

          {errors.map((err) => (
            <div
              key={err.id}
              className="bg-white rounded-sm p-3 mb-2"
              style={{ border: "1px solid #e0e0e0" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                  style={{ fontFamily: "var(--font-sans)", background: "rgba(210,45,35,0.1)", color: "#d22d23" }}
                >
                  {err.type}
                </span>
                <span className="text-[10px]" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
                  FID {err.userFid} · {new Date(err.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs font-bold mb-1" style={{ fontFamily: "var(--font-sans)", color: "#d22d23" }}>
                {err.errorMessage}
              </p>
              <details>
                <summary className="text-[10px] cursor-pointer" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
                  Payload
                </summary>
                <pre className="text-[10px] mt-1 p-2 overflow-x-auto" style={{ background: "#f3f3f3", borderRadius: "2px", color: "#58585b" }}>
                  {err.payload}
                </pre>
              </details>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

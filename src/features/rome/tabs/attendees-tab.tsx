"use client";

import { FormEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { getRomeAttendeeByFid, upsertRomeAttendee } from "@/db/actions/rome-actions";
import { openFarcasterProfile, shouldUseMiniAppNavigation } from "@/features/rome/utils/share";
import { buildProfileUrl } from "@/lib/farcaster-urls";
import type { RomeAttendee } from "@/features/rome/types";

type Filter = "all" | "verified" | "self";

type AttendeesResponse = {
  attendees?: RomeAttendee[];
  error?: string | null;
};

type AttendeesTabProps = {
  onMeaningfulActionSuccess?: () => Promise<void> | void;
};

export function AttendeesTab({ onMeaningfulActionSuccess }: AttendeesTabProps) {
  const { data: user } = useFarcasterUser();
  const [filter, setFilter] = useState<Filter>("all");
  const [attendees, setAttendees] = useState<RomeAttendee[]>([]);
  const [showSelfAdd, setShowSelfAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/rome-attendees", { cache: "no-store" });
      const payload = (await response.json()) as AttendeesResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load attendees.");
      }
      setAttendees(payload.attendees ?? []);
      if (payload.error) setLoadError(payload.error);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load attendees.";
      setLoadError(message);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredAttendees = useMemo(() => {
    if (filter === "verified") return attendees.filter((a) => a.ticketVerified);
    if (filter === "self") return attendees.filter((a) => a.selfAdded);
    return attendees;
  }, [attendees, filter]);

  const countLabel = useMemo(() => `${filteredAttendees.length} attending`, [filteredAttendees.length]);

  const handleProfileLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, attendee: RomeAttendee, profileUrl: string) => {
      if (!shouldUseMiniAppNavigation()) return;
      event.preventDefault();
      void openFarcasterProfile({
        fid: attendee.fid,
        fallbackUrl: profileUrl,
      });
    },
    [],
  );

  return (
    <div className="h-full overflow-y-auto pb-6">
      <section className="px-4 py-4 border-b border-boston-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide t-sans-navy">Attendees</h2>
            <p className="text-xs italic t-serif-gray">Farcon Rome crew</p>
          </div>
          <span className="px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-widest bg-boston-blue text-white">
            {countLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSelfAdd(true)}
          className="mt-3 w-full py-2.5 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest"
        >
          I am going to Farcon
        </button>

        <div className="flex gap-2 mt-3">
          {([
            { id: "all", label: "All" },
            { id: "verified", label: "Verified Ticket" },
            { id: "self", label: "Self-Added" },
          ] as const).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={`px-2.5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest ${
                filter === option.id ? "bg-boston-blue text-white" : "border border-boston-gray-100 t-sans-navy"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loadError && (
          <p className="mt-3 text-xs t-sans-red">{loadError}</p>
        )}
      </section>

      <section className="p-4">
        {loading ? (
          <div className="animate-pulse h-20 rounded-sm bg-boston-gray-100" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAttendees.map((attendee) => (
              <article key={attendee.id} className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-center gap-2">
                  {attendee.pfpUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attendee.pfpUrl} alt={attendee.displayName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-boston-gray-100" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest t-sans-navy truncate">{attendee.displayName}</p>
                    {attendee.username && <p className="text-xs t-sans-blue truncate">@{attendee.username}</p>}
                  </div>
                </div>

                {attendee.bio && <p className="text-xs italic t-serif-body mt-2 line-clamp-3">{attendee.bio}</p>}

                {attendee.fid && attendee.username && (() => {
                  const profileUrl = buildProfileUrl(attendee.username);
                  if (!profileUrl) return null;
                  return (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleProfileLinkClick(e, attendee, profileUrl)}
                      className="inline-block mt-2 text-xs uppercase tracking-widest t-sans-blue underline cursor-pointer"
                    >
                      View on Farcaster
                    </a>
                  );
                })()}
              </article>
            ))}
          </div>
        )}
      </section>

      {showSelfAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl p-4">
            <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Join Attendees</h3>
            <SelfAddForm
              userFid={user?.fid}
              username={user?.username ?? null}
              displayName={user?.displayName ?? user?.username ?? ""}
              pfpUrl={user?.pfpUrl ?? null}
              onClose={() => setShowSelfAdd(false)}
              onSuccess={async () => {
                await refresh();
                setShowSelfAdd(false);
                await onMeaningfulActionSuccess?.();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type SelfAddFormProps = {
  userFid?: number;
  username: string | null;
  displayName: string;
  pfpUrl: string | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function SelfAddForm({ userFid, username, displayName, pfpUrl, onClose, onSuccess }: SelfAddFormProps) {
  const [bio, setBio] = useState("");
  const [existing, setExisting] = useState<RomeAttendee | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!userFid) return;
    getRomeAttendeeByFid(userFid).then((row) => {
      if (!row) return;
      const attendee = row as RomeAttendee;
      setExisting(attendee);
      setBio(attendee.bio ?? "");
    });
  }, [userFid]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userFid) return;

    setPending(true);
    await upsertRomeAttendee({
      fid: userFid,
      username,
      displayName,
      pfpUrl,
      bio: bio.trim() || null,
      selfAdded: true,
    });
    setPending(false);
    await onSuccess();
  }

  if (!userFid) {
    return <p className="text-sm italic t-serif-gray">Farcaster auth is required.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {existing && (
        <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">
          You&apos;re already on the list ✓
        </p>
      )}
      <input className="submit-input" value={displayName} aria-label="Display name" title="Display name" disabled />
      <input className="submit-input" value={username ? `@${username}` : "No username"} aria-label="Username" title="Username" disabled />
      <textarea
        className="submit-input submit-textarea"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        placeholder="Optional bio"
      />

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-sm border border-boston-gray-200 text-xs font-bold uppercase tracking-widest t-sans-gray">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="flex-1 py-2.5 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest">
          {pending ? "Saving..." : existing ? "Update Bio" : "Join List"}
        </button>
      </div>
    </form>
  );
}

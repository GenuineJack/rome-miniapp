"use client";

import { FormEvent, useMemo, useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { MapView } from "@/features/rome/components/map-view";
import { submitRomeSpot } from "@/db/actions/rome-actions";
import type { RomeSpot } from "@/features/rome/types";

type ExploreTabProps = {
  spots: RomeSpot[];
  loading: boolean;
  onSelectSpot: (spot: RomeSpot) => void;
};

type AddSpotFormProps = {
  categories: string[];
  onSuccess: () => Promise<void> | void;
  onClose: () => void;
};

export function ExploreTab({ spots, loading, onSelectSpot }: ExploreTabProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(spots.map((spot) => spot.category).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [spots]);

  const filtered = useMemo(() => {
    return spots.filter((spot) => {
      const categoryOk = activeCategory === "All" || spot.category === activeCategory;
      const query = search.trim().toLowerCase();
      const text = `${spot.name} ${spot.neighborhood} ${spot.description}`.toLowerCase();
      const searchOk = !query || text.includes(query);
      return categoryOk && searchOk;
    });
  }, [spots, activeCategory, search]);

  return (
    <div className="flex flex-col h-full">
      <MapView
        spots={filtered}
        onSpotClick={(spot) => onSelectSpot(spot as RomeSpot)}
        center={[41.9028, 12.4964]}
        zoom={13}
      />

      <div className="px-4 pt-3 pb-2 border-b border-boston-gray-100 bg-boston-gray-50">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="submit-input"
          placeholder="Search Rome spots"
          aria-label="Search Rome spots"
        />
      </div>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-boston-gray-100 bg-boston-gray-50">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`cat-filter-btn px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest ${
              category === activeCategory ? "cat-filter-active" : "cat-filter-inactive"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading ? (
          <div className="animate-pulse h-20 rounded-sm bg-boston-gray-100" />
        ) : filtered.length === 0 ? (
          <p className="text-sm italic t-serif-gray">No spots match this filter yet.</p>
        ) : (
          filtered.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelectSpot(spot)}
              className="text-left border border-boston-gray-100 bg-white rounded-sm p-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest t-sans-blue mb-1">{spot.category}</p>
              <h3 className="text-sm font-black uppercase tracking-wide t-sans-navy">{spot.name}</h3>
              <p className="text-xs italic t-serif-body mt-1">{spot.description}</p>
              <p className="text-[11px] uppercase tracking-widest t-sans-gray mt-2">{spot.neighborhood}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function AddSpotForm({ categories, onSuccess, onClose }: AddSpotFormProps) {
  const { data: user } = useFarcasterUser();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [link, setLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    setPending(true);
    setMessage(null);

    const result = await submitRomeSpot({
      name: name.trim(),
      category: category.trim(),
      neighborhood: neighborhood.trim(),
      description: description.trim(),
      address: address.trim() || undefined,
      link: link.trim() || undefined,
      latitude: latitude.trim() ? Number(latitude) : null,
      longitude: longitude.trim() ? Number(longitude) : null,
      submittedByFid: user.fid,
      submittedByUsername: user.username ?? "",
      submittedByDisplayName: user.displayName ?? user.username ?? "Farcaster User",
      submittedByPfpUrl: user.pfpUrl ?? undefined,
    });

    setPending(false);

    if (!result.success) {
      setMessage(result.error ?? "Could not submit spot.");
      return;
    }

    setMessage("Spot submitted for approval.");
    await onSuccess();
    onClose();
  }

  if (!user) {
    return <p className="text-sm italic t-serif-gray">Sign in with Farcaster to add a spot.</p>;
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} className="submit-input" placeholder="Spot name" required />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="submit-input" required>
        <option value="">Select category</option>
        {categories.filter((c) => c !== "All").map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="submit-input" placeholder="Rome neighborhood" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="submit-input submit-textarea" placeholder="Short description" required />
      <input value={address} onChange={(e) => setAddress(e.target.value)} className="submit-input" placeholder="Address" />
      <input value={link} onChange={(e) => setLink(e.target.value)} className="submit-input" placeholder="Link" />
      <div className="grid grid-cols-2 gap-2">
        <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="submit-input" placeholder="Latitude" />
        <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="submit-input" placeholder="Longitude" />
      </div>
      {message && <p className="text-xs t-sans-red">{message}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-sm border border-boston-gray-100 text-xs font-bold uppercase tracking-widest t-sans-gray">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="flex-1 py-2.5 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest">
          {pending ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

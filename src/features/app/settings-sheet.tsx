"use client";

type Props = {
  onClose: () => void;
};

export function SettingsSheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-lg shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <div className="px-5 pb-2 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-4">
            Settings
          </h2>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 mb-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-navy bg-boston-gray-50 hover:bg-[#e0e0e0] transition-colors duration-150 focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

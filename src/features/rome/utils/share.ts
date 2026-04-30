"use client";

import sdk from "@farcaster/miniapp-sdk";
import { publicConfig } from "@/config/public-config";
import { buildComposeUrl } from "@/lib/farcaster-urls";

type AddMiniAppReason =
  | "rejected_by_user"
  | "invalid_domain_manifest"
  | "unavailable_context"
  | "unknown_error";

export type AddMiniAppOutcome =
  | {
      success: true;
      source: string;
      notificationEnabled: boolean;
    }
  | {
      success: false;
      source: string;
      reason: AddMiniAppReason;
    };

type AddMiniAppLogContext = {
  source: string;
  host: string;
  canonicalDomain: string;
  homeUrl: string;
};

function getErrorSignals(error: unknown) {
  if (!error) return "";

  if (typeof error === "string") {
    return error.toLowerCase();
  }

  if (typeof error === "object") {
    const candidate = error as {
      name?: unknown;
      message?: unknown;
      reason?: unknown;
      type?: unknown;
      code?: unknown;
    };
    const values = [
      candidate.name,
      candidate.message,
      candidate.reason,
      candidate.type,
      candidate.code,
    ]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase());

    return values.join(" ");
  }

  return "";
}

function classifyAddMiniAppError(error: unknown): AddMiniAppReason {
  const signals = getErrorSignals(error);

  if (!signals) {
    return "unknown_error";
  }

  if (
    signals.includes("addminiapp.rejectedbyuser") ||
    signals.includes("rejectedbyuser") ||
    signals.includes("rejected_by_user") ||
    signals.includes("rejected by user")
  ) {
    return "rejected_by_user";
  }

  if (
    signals.includes("addminiapp.invaliddomainmanifest") ||
    signals.includes("invaliddomainmanifestjson") ||
    signals.includes("invalid_domain_manifest") ||
    signals.includes("invalid domain manifest") ||
    signals.includes("manifest")
  ) {
    return "invalid_domain_manifest";
  }

  if (
    signals.includes("miniapp") ||
    signals.includes("context") ||
    signals.includes("not available") ||
    signals.includes("unsupported")
  ) {
    return "unavailable_context";
  }

  return "unknown_error";
}

function emitAddMiniAppTelemetry(
  outcome: AddMiniAppOutcome,
  context: AddMiniAppLogContext,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("rome:add-miniapp", {
      detail: {
        ...outcome,
        ...context,
      },
    }),
  );
}

export async function addMiniAppWithHandling(source: string): Promise<AddMiniAppOutcome> {
  const context: AddMiniAppLogContext = {
    source,
    host: typeof window !== "undefined" ? window.location.hostname : "unknown",
    canonicalDomain: publicConfig.canonicalDomain,
    homeUrl: publicConfig.homeUrl,
  };

  try {
    const result = await sdk.actions.addMiniApp();
    const outcome: AddMiniAppOutcome = {
      success: true,
      source,
      notificationEnabled: Boolean(result.notificationDetails),
    };

    console.info("[Add Mini App] Success", {
      ...context,
      notificationEnabled: outcome.notificationEnabled,
    });
    emitAddMiniAppTelemetry(outcome, context);
    return outcome;
  } catch (error) {
    const reason = classifyAddMiniAppError(error);
    const outcome: AddMiniAppOutcome = {
      success: false,
      source,
      reason,
    };

    if (reason === "rejected_by_user") {
      console.info("[Add Mini App] User declined", context);
    } else if (reason === "invalid_domain_manifest") {
      console.error("[Add Mini App] Invalid domain/manifest configuration", {
        ...context,
        error,
      });
    } else if (reason === "unavailable_context") {
      console.warn("[Add Mini App] Not available in this runtime context", {
        ...context,
        error,
      });
    } else {
      console.error("[Add Mini App] Unexpected failure", {
        ...context,
        error,
      });
    }

    emitAddMiniAppTelemetry(outcome, context);
    return outcome;
  }
}

export async function openExternalUrl(url: string) {
  try {
    await sdk.actions.openUrl(url);
  } catch {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }
}

export async function shareToFarcaster(text: string) {
  try {
    await sdk.actions.composeCast({ text });
    return { success: true, method: "sdk" as const };
  } catch {
    const url = buildComposeUrl(text);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return { success: false, method: "fallback" as const };
  }
}

export function shareToX(text: string, url?: string) {
  if (typeof window === "undefined") return;
  const payload = url ? `${text} ${url}` : text;
  const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(payload)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
}

export async function copyLink(url: string) {
  if (typeof navigator === "undefined") return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

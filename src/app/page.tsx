import { publicConfig } from "@/config/public-config";
import { MiniApp } from "@/features/app/mini-app";
import { getFarcasterPageMetadata } from "@/neynar-farcaster-sdk/src/nextjs/get-farcaster-page-metadata";
import { db } from "@/neynar-db-sdk/db";
import { spots as spotsTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  return getFarcasterPageMetadata({
    title: publicConfig.name,
    description: publicConfig.description,
    homeUrl: publicConfig.homeUrl,
    path: "",
    splashImageUrl: publicConfig.splashImageUrl,
    splashBackgroundColor: publicConfig.splashBackgroundColor,
    buttonTitle: publicConfig.shareButtonTitle,
    searchParams,
  });
}

export default async function Home() {
  let initialSpots: (typeof spotsTable.$inferSelect)[] = [];
  try {
    initialSpots = await db
      .select()
      .from(spotsTable)
      .where(eq(spotsTable.status, "approved"))
      .orderBy(desc(spotsTable.createdAt))
      .limit(100);
  } catch (e) {
    console.error("[page] Failed to load initial spots:", e);
  }
  return <MiniApp initialSpots={initialSpots} />;
}

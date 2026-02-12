import { getAllProvidersWithAvailability } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = getAllProvidersWithAvailability();

    return new Response(JSON.stringify({ providers }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache for 60 seconds — provider availability rarely changes
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[Models API Error]", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch available models" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

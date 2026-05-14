// Astro API proxy: forwards /api/health to the real health API.
// Server-side fetch avoids CORS — the browser sees same-origin.
export const prerender = false;

export async function GET() {
    try {
        const response = await fetch("https://api.freetheai.xyz/v1/health", {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: `Upstream returned ${response.status}` }),
                { status: 502, headers: { "Content-Type": "application/json" } },
            );
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to reach upstream" }),
            { status: 504, headers: { "Content-Type": "application/json" } },
        );
    }
}

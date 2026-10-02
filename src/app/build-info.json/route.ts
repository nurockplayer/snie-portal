export const dynamic = "force-static"

/** Cloudflare supplies the immutable source commit for each deployment. */
export function GET() {
  return Response.json({
    project: "SNIE",
    commit: process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
  })
}

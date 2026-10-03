"use client"

import type { ReactNode } from "react"
import { skipToContent } from "@/components/skip-to-content.mjs"

export default function SkipLink({ children }: { children: ReactNode }) {
  return <a className="skip-link" href="#main-content" onClick={skipToContent}>{children}</a>
}

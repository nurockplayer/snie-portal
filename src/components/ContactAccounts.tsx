"use client"

import { useRef, useState } from "react"
import type { Dictionary } from "@/i18n/dictionaries"
import { copyPublishedHandle } from "@/components/contact-copy.mjs"

type ContactCopy = Dictionary["pages"]["contact"]

function AccountCard({ platform, handle, copy }: { platform: string; handle: string; copy: ContactCopy }) {
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"copied" | "select" | null>(null)
  async function copyAccount() {
    const result = await copyPublishedHandle(handle, navigator.clipboard, () => { input.current?.focus(); input.current?.select() })
    setStatus(result)
  }
  return <article className="contact-account">
    <h3>{platform}</h3>
    <label className="contact-account__label">{copy.accountLabel}
      <input ref={input} readOnly value={handle} aria-label={`${platform} ${copy.accountLabel}`} spellCheck={false} />
    </label>
    <button type="button" onClick={copyAccount} aria-label={`${copy.copyLabel} ${handle}`}>{copy.copyLabel}</button>
    <p className="contact-account__status" role="status">{status === "copied" ? copy.copied : status === "select" ? copy.selectToCopy : ""}</p>
  </article>
}

export default function ContactAccounts({ copy }: { copy: ContactCopy }) {
  return <div className="contact-accounts">{copy.accounts.map((account) => <AccountCard key={account.handle} {...account} copy={copy} />)}</div>
}

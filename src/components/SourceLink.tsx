export default function SourceLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="text-link">{label}<span aria-hidden="true"> ↗</span></a>
}

interface Props {
  title: string
  hint: string
}

export default function PlaceholderView({ title, hint }: Props) {
  return (
    <div className="admin-card coming">
      <span className="coming-badge">Coming soon</span>
      <h2>{title}</h2>
      <p>{hint}</p>
    </div>
  )
}

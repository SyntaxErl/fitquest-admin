export default function Badge({ label, status = 'active' }) {
  const colors = {
    active:    { bg: '#1A3A1A', color: '#CCFF00', border: '#2A5A2A' },
    inactive:  { bg: '#3A1A1A', color: '#FF5F1F', border: '#5A2A2A' },
    completed: { bg: '#1A2A3A', color: '#60AFFF', border: '#2A4A6A' },
    pending:   { bg: '#3A3A1A', color: '#FFD700', border: '#5A5A2A' },
  }

  const c = colors[status] || colors.active

  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: '20px',
      padding: '3px 10px',
      fontSize: '11px',
      fontWeight: '600',
    }}>
      {label}
    </span>
  )
}
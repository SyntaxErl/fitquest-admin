export default function StatCard({ title, value, icon, change, changeType = 'up' }) {
  return (
    <div style={{
      backgroundColor: '#2C2C2C',
      borderRadius: '14px',
      padding: '20px 24px',
      border: '1px solid #3A3A3A',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#A0A0A0', fontWeight: '500' }}>{title}</span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: '#121212',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>{icon}</div>
      </div>

      {/* Value */}
      <p style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
        {value}
      </p>

      {/* Change */}
      {change && (
        <p style={{ fontSize: '12px', color: changeType === 'up' ? '#CCFF00' : '#FF5F1F', margin: 0 }}>
          {changeType === 'up' ? '▲' : '▼'} {change} vs last month
        </p>
      )}
    </div>
  )
}
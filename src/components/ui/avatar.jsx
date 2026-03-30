export default function Avatar({ name = '', size = 40, color = '#CCFF00' }) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: `${size * 0.35}px`,
      color: '#121212',
      flexShrink: 0,
    }}>
      {initials || 'U'}
    </div>
  )
}
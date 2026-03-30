export default function Button({ children, onClick, variant = 'primary', disabled = false, fullWidth = false }) {
  const styles = {
    primary: {
      backgroundColor: disabled ? '#A0A0A0' : '#CCFF00',
      color: '#121212',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid #3A3A3A',
    },
    danger: {
      backgroundColor: 'transparent',
      color: '#FF5F1F',
      border: '1px solid #FF5F1F',
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'opacity 0.2s, transform 0.1s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}
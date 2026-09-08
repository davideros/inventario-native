export function getTheme(scheme) {
  const isDark = scheme === 'dark';

  return {
    background: isDark ? '#0f172a' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#1f2937' : '#eef2ff',
    card: isDark ? '#0b1220' : '#ffffff',
    text: isDark ? '#f8fafc' : '#111827',
    muted: isDark ? '#a1a1aa' : '#475569',
    border: isDark ? '#334155' : '#dbeafe',
    primary: '#3b82f6',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    shadow: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(15, 23, 42, 0.12)',
  };
}
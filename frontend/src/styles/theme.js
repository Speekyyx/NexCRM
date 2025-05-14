export const theme = {
  colors: {
    // Palette de couleurs chaudes
    primary: '#FF7A50', // Orange corail
    primaryLight: '#FFA280',
    primaryDark: '#E05A30',
    
    secondary: '#764AF1', // Violet
    secondaryLight: '#9770FF',
    secondaryDark: '#5732C8',
    
    accent: '#FFCE00', // Jaune doré
    
    success: '#2DD4BF',
    warning: '#FBBF24',
    error: '#F43F5E',
    
    // Arrière-plans et textes
    background: '#121212',
    backgroundLight: '#1E1E1E',
    backgroundDark: '#0A0A0A',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textDisabled: '#666666',
    
    // Dégradés
    gradient: {
      primary: 'linear-gradient(120deg, #FF7A50, #E05A30)',
      secondary: 'linear-gradient(120deg, #764AF1, #5732C8)',
      accent: 'linear-gradient(120deg, #FFCE00, #FFAC00)',
    }
  },
  
  // Ombres avec un effet futuriste
  shadows: {
    sm: '0 2px 8px rgba(255, 122, 80, 0.15)',
    md: '0 4px 12px rgba(255, 122, 80, 0.2)',
    lg: '0 8px 24px rgba(255, 122, 80, 0.25)',
    glow: '0 0 15px rgba(255, 122, 80, 0.5)'
  },
  
  // Arrondis pour un design moderne
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
    full: '9999px',
  },
  
  // Transitions pour les animations
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  
  // Points de rupture pour le responsive
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
}; 
/**
 * ITSM v5 Multi-tenancy Theme Config
 * - 테넌트별 브랜드 컬러(HSL) 및 로고 설정
 */
export const TENANT_THEMES = {
  default: {
    name: '기본 테마',
    colors: {
      primary: '190 100% 50%', // Neon Cyan
      background: '222 47% 11%',
      text: '210 40% 98%',
    },
    logo: '/images/logos/default_logo.png',
  },
  'tenant-a': {
    name: '고객사 A (Green)',
    colors: {
      primary: '142 70% 45%', // Professional Green
      background: '210 10% 10%',
      text: '210 10% 95%',
    },
    logo: '/images/logos/tenant_a_logo.png',
  },
  'tenant-b': {
    name: '고객사 B (Purple)',
    colors: {
      primary: '262 80% 50%', // Royal Purple
      background: '220 20% 8%',
      text: '220 20% 98%',
    },
    logo: '/images/logos/tenant_b_logo.png',
  }
};

// 런타임에 CSS Variable을 업데이트하는 유틸 함수
export const applyTenantTheme = (tenantId: string) => {
  const theme = TENANT_THEMES[tenantId as keyof typeof TENANT_THEMES] || TENANT_THEMES.default;
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
};

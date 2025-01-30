# Header Component Updates

## Changes Made

1. User Profile Display
   - Added user name display
   - Added settings navigation
   - Improved user menu styling

2. Empresa Selection
   - Added empresa selector in header
   - Shows current selected empresa
   - Quick navigation to empresa selection

## Component Structure

```typescript
const Header = () => {
  const { empresaSelecionada } = useEmpresa();
  const { user } = useAuth();
  
  return (
    <header>
      // Search bar
      // Notifications
      // User profile with settings
    </header>
  );
};
```

## Navigation
- User name click -> Settings page
- Empresa name click -> Empresa selection
- Settings icon -> User settings
# Authentication Flow Improvements

## Changes Made

1. User Type Handling
   - Added support for different user types (admin/regular)
   - Implemented conditional navigation based on user type
   - Added empresa selection for admin users

2. Login Flow
   - Regular users now automatically navigate to dashboard
   - Admin users are directed to empresa selection
   - Added empresa state management

## Technical Details

### Auth Context Updates
```typescript
interface AuthUser extends User {
  tipo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  // ...other methods
}
```

### Navigation Flow
1. User logs in
2. System checks user type:
   - Regular user -> Dashboard with pre-selected empresa
   - Admin user -> Empresa selection screen
3. After empresa selection -> Dashboard
# Frontend Directory Restructure Checklist

## Current Structure Analysis

The current frontend structure follows a traditional "by type" organization:
- `/components` - all components mixed together
- `/pages` - all pages grouped by type
- `/layouts` - layout components
- `/hooks` - shared hooks
- `/lib` - utilities

## Target Structure (Domain-Based)

Following the rules for React 18 + Inertia monolith structure:

```
resources/js/
  app.tsx                  # Inertia bootstrap
  shims.d.ts
  shared/
    components/ui/*        # shadcn/ui components
    utils/*               # shared utilities
    hooks/*               # shared hooks
    layouts/*             # shared layouts
  features/<feature>/
    pages/                # route targets (Inertia)
    containers/           # data + orchestration
    components/           # pure presentational
    hooks/                # feature-specific hooks
    services/             # client helpers
    types/                # feature-specific types
```

## Features to Create

Based on current pages and functionality:

1. **`features/auth/`** - Authentication & Registration
2. **`features/dashboard/`** - Central Dashboard
3. **`features/tenant/`** - Tenant Management
4. **`features/settings/`** - User Settings
5. **`features/roles/`** - Role Management (part of tenant)

## Detailed Migration Checklist

### Phase 1: Create New Directory Structure

- [ ] Create `shared/` directory
- [ ] Create `shared/components/ui/` for shadcn components
- [ ] Create `shared/utils/` 
- [ ] Create `shared/hooks/`
- [ ] Create `shared/layouts/`
- [ ] Create `features/` directory
- [ ] Create `features/auth/` with subdirectories
- [ ] Create `features/dashboard/` with subdirectories
- [ ] Create `features/tenant/` with subdirectories
- [ ] Create `features/settings/` with subdirectories

### Phase 2: Move Shared Components

#### UI Components (to `shared/components/ui/`)
- [ ] Move all files from `components/ui/` → `shared/components/ui/`
- [ ] Update imports in all files using these components

#### Shared Utilities
- [ ] Move `lib/utils.ts` → `shared/utils/index.ts`
- [ ] Update all imports referencing utils

#### Shared Hooks
- [ ] Move `hooks/use-appearance.tsx` → `shared/hooks/`
- [ ] Move `hooks/use-mobile.tsx` → `shared/hooks/`
- [ ] Move `hooks/use-mobile-navigation.ts` → `shared/hooks/`
- [ ] Move `hooks/use-initials.tsx` → `shared/hooks/`
- [ ] Update imports

#### Shared Layouts
- [ ] Move `layouts/app-layout.tsx` → `shared/layouts/`
- [ ] Move `layouts/auth-layout.tsx` → `shared/layouts/`
- [ ] Move layout components from `layouts/app/` → `shared/layouts/app/`
- [ ] Move layout components from `layouts/auth/` → `shared/layouts/auth/`

### Phase 3: Restructure Features

#### Auth Feature (`features/auth/`)
- [ ] Create pages directory: `features/auth/pages/`
- [ ] Move `pages/auth/login.tsx` → `features/auth/pages/login.tsx`
- [ ] Move `pages/auth/register.tsx` → `features/auth/pages/register.tsx`
- [ ] Move `pages/auth/forgot-password.tsx` → `features/auth/pages/forgot-password.tsx`
- [ ] Move `pages/auth/reset-password.tsx` → `features/auth/pages/reset-password.tsx`
- [ ] Move `pages/auth/confirm-password.tsx` → `features/auth/pages/confirm-password.tsx`
- [ ] Move `pages/auth/verify-email.tsx` → `features/auth/pages/verify-email.tsx`
- [ ] Create `features/auth/components/` for auth-specific components
- [ ] Create `features/auth/hooks/` if needed
- [ ] Create `features/auth/types/` for auth types

#### Dashboard Feature (`features/dashboard/`)
- [ ] Create pages directory: `features/dashboard/pages/`
- [ ] Move `pages/dashboard.tsx` → `features/dashboard/pages/index.tsx`
- [ ] Move `pages/welcome.tsx` → `features/dashboard/pages/welcome.tsx`
- [ ] Create `features/dashboard/components/` for dashboard widgets
- [ ] Create `features/dashboard/types/` for dashboard types

#### Tenant Feature (`features/tenant/`)
- [ ] Create pages directory: `features/tenant/pages/`
- [ ] Move `pages/tenant/dashboard.tsx` → `features/tenant/pages/dashboard.tsx`
- [ ] Move `pages/tenant/role-grant.tsx` → `features/tenant/pages/role-grant.tsx`
- [ ] Move `layouts/tenant-layout.tsx` → `features/tenant/components/tenant-layout.tsx`
- [ ] Create `features/tenant/components/` for tenant-specific components
- [ ] Create `features/tenant/hooks/` for tenant hooks
- [ ] Create `features/tenant/services/` for tenant API calls
- [ ] Create `features/tenant/types/` for tenant types

#### Settings Feature (`features/settings/`)
- [ ] Create pages directory: `features/settings/pages/`
- [ ] Move `pages/settings/profile.tsx` → `features/settings/pages/profile.tsx`
- [ ] Move `pages/settings/password.tsx` → `features/settings/pages/password.tsx`
- [ ] Move `pages/settings/appearance.tsx` → `features/settings/pages/appearance.tsx`
- [ ] Move `layouts/settings/layout.tsx` → `features/settings/components/settings-layout.tsx`
- [ ] Create `features/settings/components/` for settings components
- [ ] Create `features/settings/types/` for settings types

### Phase 4: Move Shared App Components

- [ ] Analyze components in `components/` root
- [ ] Move reusable components to `shared/components/`
- [ ] Move feature-specific components to appropriate feature directories
- [ ] Components to move to shared:
  - [ ] `app-logo.tsx`, `app-logo-icon.tsx` → `shared/components/`
  - [ ] `breadcrumbs.tsx` → `shared/components/`
  - [ ] `heading.tsx`, `heading-small.tsx` → `shared/components/`
  - [ ] `icon.tsx` → `shared/components/`
  - [ ] `input-error.tsx` → `shared/components/`
  - [ ] `text-link.tsx` → `shared/components/`

### Phase 5: Update Import Statements

#### Global Import Updates
- [ ] Update all `@/components/ui/*` imports to `@/shared/components/ui/*`
- [ ] Update all `@/lib/utils` imports to `@/shared/utils`
- [ ] Update all hook imports to use new shared structure
- [ ] Update layout imports

#### Feature-Specific Import Updates
- [ ] Update imports in auth pages
- [ ] Update imports in dashboard pages  
- [ ] Update imports in tenant pages
- [ ] Update imports in settings pages
- [ ] Update imports in layout components

### Phase 6: Update Path Aliases (if needed)

- [ ] Check `tsconfig.json` path mappings
- [ ] Update Vite configuration if needed
- [ ] Ensure `@/shared/*` and `@/features/*` paths work

### Phase 7: Cleanup

- [ ] Remove old empty directories
- [ ] Clean up unused components
- [ ] Verify all imports are working
- [ ] Run linting and fix issues

### Phase 8: Testing & Validation

- [ ] Run `npm run build` to ensure compilation
- [ ] Test all pages load correctly
- [ ] Verify all features work as expected
- [ ] Check for any missing imports or broken links
- [ ] Run tests if available

## Migration Notes

1. **Preserve shadcn/ui Structure**: Keep shadcn components in their own directory for easy updates
2. **Gradual Migration**: Can be done incrementally, starting with shared components
3. **Import Consistency**: Use consistent import patterns throughout
4. **Feature Boundaries**: Keep features independent, avoid cross-feature dependencies
5. **Shared First**: When in doubt, start with shared and move to feature-specific later

## Benefits After Restructure

- ✅ Clear separation of concerns
- ✅ Better scalability for new features
- ✅ Easier maintenance and refactoring
- ✅ Follows modern React/Inertia patterns
- ✅ Clearer feature boundaries
- ✅ Better developer experience

## Rollback Plan

If issues arise:
1. Keep old structure in git history
2. Can revert specific moves if needed
3. Import updates can be reverted via search/replace
4. Build process will catch most issues early

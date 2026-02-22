# Client Directory Restructuring Summary

## Overview
The client application has been restructured to follow a more organized and scalable architecture. The changes focus on separating reusable components (core and common) from domain-specific logic, and establishing consistent naming conventions.

## Key Changes

### 1. **Core Module Reorganization**
- **Renamed**: `core/types/` → `core/models/`
- **New Model**: Added `core/models/user-basic.model.ts`
  - Contains `UserBasic` interface (independent of domain)
  - Used for authentication purposes
  - Domain `User` model now extends `UserBasic` with `isAdmin` property

### 2. **Shared Module Split**
The `shared/` directory is now clearly divided into two distinct areas:

#### **2.1 Common (`shared/common/`)**
Reusable, project-agnostic utilities that can be used across different projects:
- `shared/common/services/`
  - `cache.service.ts`
  - `modal.service.ts`
  - `pagination.service.ts`
  - `toast.service.ts`
- `shared/common/ui/`
  - `components/` - Generic UI components (form, table, charts, etc.)
  - `models/` - UI configuration models (form-config, table-config, chart-config)
  - `pipes/` - Reusable pipes
  - `helpers/` - Generic UI helpers

#### **2.2 Domain (`shared/domain/`)**
Project-specific logic related to the business domain:
- `shared/domain/models/`
  - `user.model.ts`
  - `account.model.ts`
  - `transaction.model.ts`
  - `settings.model.ts`
- `shared/domain/services/`
  - `user.service.ts`
  - `account.service.ts`
  - `transaction.service.ts`
  - `auth.service.ts`
  - `settings.service.ts`
- `shared/domain/helpers/`
  - `user.helper.ts`
  - `account.helper.ts`
  - `transaction.helper.ts`
  - `auth.helper.ts`
  - `settings.helper.ts`
- `shared/domain/components/`
  - `no-accounts/` - Domain-specific component
  - `transaction-list/` - Domain-specific component
- `shared/domain/utils/`
  - `transaction.utils.ts` - Domain-specific utilities
- `shared/domain/dto/`
  - `user.dto.ts`, `account.dto.ts`, etc.

### 3. **Type/Model Naming Convention**
- **Unified naming**: All `types/` directories are now renamed to `models/`
- **Import paths**: Updated all imports to reference `models` instead of `types`

### 4. **Import Path Updates**
All components, services, and helpers have been updated with new import paths:

**Core Models** (reusable):
- `core/models/response.model.ts`
- `core/models/modal.model.ts`
- `core/models/toast.model.ts`
- `core/models/user-basic.model.ts`

**Common Services** (reusable):
```typescript
import { XyzService } from 'shared/common/services/xyz.service';
```

**Domain Services** (project-specific):
```typescript
import { UserService } from 'shared/domain/services/user.service';
import { AccountService } from 'shared/domain/services/account.service';
```

**Common UI Components and Helpers** (reusable):
```typescript
import { FormComponent } from 'shared/common/ui/components/form/form.component';
import { FormConfig } from 'shared/common/ui/models/form-config.model';
```

**Domain Helpers** (project-specific):
```typescript
import { UserHelper } from 'shared/domain/helpers/user.helper';
import { AccountHelper } from 'shared/domain/helpers/account.helper';
```

## Architecture Benefits

### 1. **Clear Separation of Concerns**
- **Core Module**: Reusable, framework-level abstractions
- **Common**: Generic, project-agnostic utilities and components
- **Domain**: Business logic and the Ledgerly project's specific requirements

### 2. **Reusability & Modularity**
- `core/` and `shared/common/` can be extracted into a shared library for use in other projects
- Clear boundaries make it easy to understand what's reusable vs. project-specific

### 3. **Scalability**
- Easy to add new domain-specific modules or features
- Consistent structure for both common and domain features

### 4. **Maintainability**
- Unified naming convention (models vs. types)
- Clear import paths make dependencies obvious
- Helpers are organized by domain entity

## Directory Structure

```
app/
├── core/
│   ├── components/           (core UI components)
│   ├── models/              (renamed from types)
│   │   ├── response.model.ts
│   │   ├── modal.model.ts
│   │   ├── toast.model.ts
│   │   └── user-basic.model.ts
│   ├── providers/
│   ├── services/
│   └── utils/
├── pages/                    (no changes)
│   ├── accounts/
│   ├── admin/
│   ├── dashboard/
│   ├── reports/
│   └── transactions/
└── shared/
    ├── common/              (reusable, project-agnostic)
    │   ├── services/
    │   │   ├── cache.service.ts
    │   │   ├── modal.service.ts
    │   │   ├── pagination.service.ts
    │   │   └── toast.service.ts
    │   └── ui/
    │       ├── components/
    │       ├── helpers/     (generic UI helpers)
    │       ├── pipes/
    │       └── models/      (renamed from types)
    └── domain/              (project-specific)
        ├── services/
        │   ├── user.service.ts
        │   ├── account.service.ts
        │   ├── transaction.service.ts
        │   ├── auth.service.ts
        │   └── settings.service.ts
        ├── helpers/
        │   ├── user.helper.ts
        │   ├── account.helper.ts
        │   ├── transaction.helper.ts
        │   ├── auth.helper.ts
        │   └── settings.helper.ts
        ├── components/
        ├── models/
        ├── dto/
        └── utils/
```

## Backward Compatibility

All functionality remains the same. This is purely a structural reorganization. The application builds and runs successfully with the new structure.

## Build Status

✅ Application builds successfully
✅ All imports updated correctly
✅ No functional changes

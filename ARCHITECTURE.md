# SocietyEase Architecture & Flow Document

Welcome to the SocietyEase codebase! This document outlines the structural layout of the project, how different pieces communicate with each other, and where to look when you want to modify a feature.

## High-Level Tech Stack

*   **Framework:** React + Vite
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS + Framer Motion (for animations)
*   **Backend / Database:** Firebase (Authentication, Firestore Database)
*   **State Management / Data Fetching:** React Query (`@tanstack/react-query`)
*   **Icons:** Lucide React

## Folder Structure

The project code is primarily housed inside the `src/` directory.

### `src/components/`
Contains reusable UI building blocks used across multiple pages.
*   **`/ui/`**: Generic, lowest-level components like `Button`, `Input`, `Label`, `Dialog`, and `Card`. These are highly reusable and not tied to any specific feature.
*   **`/layout/`**: Structural components like `MainLayout.tsx` which wraps all protected pages, providing the sidebar and mobile top-bar.
*   **`ProtectedRoute.tsx`**: A critical security component that checks if a user is logged in, email-verified, and has the correct role (Admin, Resident, Guard) before allowing them to see a page.

### `src/context/`
Contains React Context providers for global state.
*   **`AuthContext.tsx`**: The beating heart of the application's auth. It listens to Firebase for login/logout events, fetches the user's specific profile (and Role) from Firestore, and provides this state to the entire app.

### `src/hooks/`
Contains custom React hooks, primarily used for data fetching.
*   **`useFirestore.ts`**: This file contains all the React Query hooks used to read and write to the database. Instead of writing Firebase `getDoc` or `addDoc` everywhere, components simply call `useComplaints()` or `useUpdateBillStatus()`. This keeps components clean and handles caching/loading states automatically.

### `src/pages/`
Contains the actual views/screens for the application. They are divided by Role:
*   **`/auth/`**: `Login`, `Register`, `VerifyEmail`, `ForgotPassword`. These handle the onboarding and entry process.
*   **`/admin/`**: The Admin dashboards (`AdminDashboard`, `AdminComplaints`, `AdminNotices`, `AdminExpenses`, `AdminBilling`). Only accessible if `userProfile.role === 'admin'`.
*   **`/resident/`**: The Resident dashboards (`ResidentHome`, `ResidentBilling`). Accessible if `userProfile.role === 'resident'`.
*   **`/guard/`**: The Security Guard portal (`GuardPortal`, `GateLogs`). Used for scanning QR codes and checking logs.

### `src/services/`
Contains external service configurations.
*   **`firebase.ts`**: Initializes the Firebase application using your environment variables and exports the `auth` and `db` (Firestore) instances used throughout the app.

### `src/types/`
*   **`index.ts`**: Contains all the TypeScript interfaces (`User`, `Complaint`, `Notice`, `Bill`, etc.). This acts as the source of truth for what shape your data should take.

---

## Data Flow (How It Works)

If a Resident submits a Complaint, here is the lifecycle of that data:

1.  **Component (UI)**: The resident clicks "Submit" in `ResidentHome.tsx`.
2.  **Hook (Mutation)**: The component calls `addComplaint.mutateAsync(newComplaint)` from `src/hooks/useFirestore.ts`.
3.  **Firebase (Database)**: The hook sends the data to Firestore.
4.  **React Query (Cache)**: Upon success, React Query invalidates the old cached list of complaints and triggers a re-fetch.
5.  **Admin View**: An Admin sitting on `AdminComplaints.tsx` is using the `useComplaints()` hook. Because React Query knows the data changed, the Admin's screen automatically updates with the new complaint without them refreshing the page.

## Authentication Flow

1.  A user navigates to `/`.
2.  `App.tsx` renders the `<RootRedirect />` component.
3.  `<RootRedirect />` checks `AuthContext` to see if a user is logged in.
4.  If not logged in, they are redirected to `/login`.
5.  If logged in, their specific profile is loaded from Firestore (which contains their `role`).
6.  They are then routed to their respective dashboard (`/admin/dashboard`, `/resident/dashboard`, etc.).
7.  The `<ProtectedRoute>` component ensures they cannot manually change the URL to visit another role's page.

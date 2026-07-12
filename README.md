# SocietyEase

SocietyEase is a modern web application designed to manage the daily operations of a housing society. It serves as a central hub for residents, security guards, and administrators to communicate, manage visitors, handle maintenance bills, and track complaints.

## 🚀 Recent Updates (Premium UI/UX Redesign)

We recently underwent a complete UI/UX overhaul to transform SocietyEase into a premium, world-class product inspired by modern SaaS platforms:
- **Motion Design & Interactivity**: Integrated `framer-motion` for buttery-smooth page transitions, staggered reveals, and micro-interactions on hover.
- **Glassmorphism Aesthetics**: Replaced stark backgrounds with frosted glass panels (`backdrop-blur`), elegant gradients, and soft layered shadows.
- **Animated Layouts**: Upgraded the main layout with a responsive, animated, collapsible sidebar.
- **Split-Screen Authentication**: The login and registration flows now feature a modern split-screen design.
- **New Features**: 
  - **Universal Share Option**: Added a share button across all major fields (Billing, Notices, Complaints, Gate Logs).
  - **Email Verification**: Enforced email verification during registration for all roles.

## 👥 User Roles

1. **🏠 Resident**: Primary users living in flats. Can view notices, track maintenance bills, raise complaints, and generate QR visitor passes.
2. **🛡️ Security Guard**: Frontline security personnel. Can scan visitor QR passes or manually register walk-ins.
3. **👔 Administrator**: Management committee. Oversees operations, broadcasts notices, manages residents, tracks expenses, and resolves complaints.

## 🛠️ Tech Stack

* **Frontend**: React, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Custom CSS variables, Framer Motion
* **UI Components**: Shadcn UI (Customized)
* **Backend / Database**: Firebase Authentication & Firestore
* **Icons**: Lucide React

## 📦 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## 🔒 Authentication Flow
All users sign in using Email and Password. The system instantly identifies their role and redirects them to their specific dashboard. New users must register, with Staff (Guards/Admins) requiring a special Access Passcode to authorize their account creation.

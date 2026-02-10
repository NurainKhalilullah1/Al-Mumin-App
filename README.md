# Al-Mumin School Management System

## 🚀 Project Overview
The **Al-Mumin School App** is a comprehensive school management system designed to digitize administrative, academic, and financial operations. It features dedicated portals for **Admins**, **Teachers**, and **Students/Parents**.

## 🛠️ Tech Stack
-   **Frontend**: React.js (Vite), Tailwind CSS
-   **Backend**: Supabase (PostgreSQL, Auth, RLS)
-   **Mobile**: Capacitor (Android/iOS)
-   **Routing**: React Router DOM
-   **Icons**: Lucide React

## ✨ Key Features
-   **authentication**: Secure RBAC (Role-Based Access Control).
-   **Principal's Workspace**: Real-time stats, fee tracking, and session management.
-   **Admissions**: Online application and bulk student registration.
-   **Academics**: Result processing, automated grading, and transcript generation.
-   **Finance**: Payment proof upload and verification workflow.
-   **Communication**: Notice board and internal messaging.
-   **Mobile App**: Native Android app support via Capacitor.

## 📂 Project Structure
```
src/
├── components/   # Reusable UI components (Buttons, Cards, Inputs)
├── layouts/      # Dashboard and Page layouts
├── pages/        # Main application pages
│   ├── dashboard/# Protected routes (Admin, Teacher, Student views)
│   └── ...       # Public pages (Home, Login, etc.)
├── utils/        # Helper functions & Database logic (db.js)
└── App.jsx       # Main routing logic
```

## ⚙️ Setup & Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/NurainKhalilullah1/Al-Mumin-App.git
    cd Al-Mumin-App
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory (confidential):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    > **Note**: You can find these values in your Supabase Project Settings -> API.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## 📱 Mobile Build (Android)
To build the Android app using Capacitor:
1.  **Sync Web Assets**:
    ```bash
    npm run build
    npx cap sync
    ```
2.  **Open Android Studio**:
    ```bash
    npx cap open android
    ```
3.  **Run**: Click the "Run" button in Android Studio to deploy to an emulator or device.

## 📝 License
This project is proprietary software for Al-Mumin School.

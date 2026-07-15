# Overview
We're building a wellness tracking app for people with chronic health conditions. Users can log symptoms, moods, medications, and daily habits, then view trends to identify patterns. Think of it as a health journal with basic analytics

The MVP needs to be simple enough that someone with brain fog or fatigue can use it quickly, but powerful enough to surface useful insights over time.

## Tech Stack
 - **Frontend:** React with TypeScript, Tailwind CSS
 - **Backend:** Node.js + Express
 - **Database:** PostgreSQL with Prisma ORM
 - **Hosting:** TBD (Vercel, Railway, or Render)

 ## Data Model

We will use Prisma ORM to interact with our PostgreSQL database. The schema is designed to be highly relational but simple, focusing on quick writes for the user.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  logs         DailyLog[]
  medications  Medication[]
}

model DailyLog {
  id          String       @id @default(uuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime     @default(now())
  mood        Int?         // Scale of 1-5 (e.g., 1 = Terrible, 5 = Great)
  energy      Int?         // Scale of 1-5 (e.g., 1 = Depleted, 5 = High)
  brainFog    Int?         // Scale of 1-5 (e.g., 1 = None, 5 = Severe)
  notes       String?      // Optional quick thought or context
  symptoms    SymptomLog[]
  habits      HabitLog[]
  medications MedLog[]

  @@unique([userId, date])
}

model SymptomLog {
  id         String   @id @default(uuid())
  logId      String
  dailyLog   DailyLog @relation(fields: [logId], references: [id], onDelete: Cascade)
  name       String   // e.g., "Joint Pain", "Headache", "Nausea"
  severity   Int      // Scale of 1-5
}

model HabitLog {
  id       String   @id @default(uuid())
  logId    String
  dailyLog DailyLog @relation(fields: [logId], references: [id], onDelete: Cascade)
  name     String   // e.g., "8 Hours Sleep", "Hydrated", "Stretched"
  value    Boolean  // Yes/No tracking for simplicity
}

model Medication {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String   // e.g., "Synthroid"
  dosage    String   // e.g., "50mcg"
  frequency String   // e.g., "Once daily"
  active    Boolean  @default(true)
  logs      MedLog[]
}

model MedLog {
  id           String     @id @default(uuid())
  logId        String
  dailyLog     DailyLog   @relation(fields: [logId], references: [id], onDelete: Cascade)
  medicationId String
  medication   Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)
  taken        Boolean    @default(true)
}
```

## Core Features

### 1. Zero-Friction Daily Logging
*   **One-Tap Quick Log:** Users can quickly submit their mood, energy level, and brain fog on a scale of 1 to 5 using large, color-coded interactive buttons.
*   **Dynamic Symptom & Habit Checklists:** Tap-to-toggle symptoms and habits based on the user's past entries to minimize typing.
*   **Auto-Save & Draft State:** Logs are saved progressively to prevent loss of data if a user gets fatigued and closes the app mid-entry.

### 2. Simple Trends & Insights
*   **Correlation Flags:** A basic algorithm compares daily habit logs against mood/energy levels (e.g., "On days you logged '8 Hours Sleep', your average Energy was 1.5 points higher").
*   **Visual Weekly Graphs:** Simple, high-contrast line and bar charts tracking severity over time to help users prepare for doctor appointments.

### 3. Lightweight Medication Tracker
*   **Active Med List:** A clean list of current medications and dosages.
*   **Daily Checkoff:** Integrates seamlessly into the Daily Log UI, allowing users to check off what they took with a single tap.

## Screens

### 1. Dashboard (The Home Screen)
*   **Top Area:** Today's date with a large "How are you feeling right now?" quick-log card.
*   **Mid Area:** Quick toggle checklist for today's medications and habits.
*   **Bottom Area:** A micro-visualization showing energy and brain fog levels over the last 3 days.

### 2. Log Entry Screen
*   **Focus Mode Layout:** Large, accessible UI elements with plenty of whitespace to prevent cognitive overload.
*   **Log Modules:**
    *   *Sliders/Buttons:* 1-5 scales for Mood, Energy, and Brain Fog.
    *   *Symptoms Card:* Multi-select chips with quick tap severity toggles.
    *   *Notes Section:* A single clean text area for optional journaling.

### 3. Trends & Analytics Screen
*   **Filter Toggles:** Switch between 7-day, 14-day, and 30-day views.
*   **The Trend Chart:** An overlapping line chart mapping Mood vs. Brain Fog or Energy vs. Symptom severity.
*   **Friendly Insights Card:** Plain-text bullet points summarizing potential triggers or positive trends (e.g., *"Your brain fog was lowest on days you checked 'Hydrated'."*).

### 4. Settings & Medication Manager
*   **Manage Medications:** Add, edit, or archive daily medications (name, dosage, frequency).
*   **Manage Symptoms/Habits:** Customize the quick-select list items that appear on the Log Entry screen.

## API Endpoints

All endpoints are prefixed with `/api/v1` and require an `Authorization: Bearer <token>` header unless marked public.

### Auth Endpoints
*   `POST /auth/register` (Public) - Register a new user.
*   `POST /auth/login` (Public) - Authenticate user and return JWT.

### Daily Log Endpoints
*   `GET /logs` - Fetch logs (supports optional query params `startDate` and `endDate`).
*   `GET /logs/today` - Retrieve today's log if it exists to populate the dashboard.
*   `POST /logs` - Create or update today's log (handles upserting core metrics, symptoms, habits, and med checks in a single payload).

### Medication Endpoints
*   `GET /medications` - Retrieve all active medications for the user.
*   `POST /medications` - Add a new medication to track.
*   `PATCH /medications/:id` - Edit or archive (set `active: false`) a medication.

### Analytics Endpoints
*   `GET /analytics/correlations` - Returns processed data correlating logged habits/meds with energy and brain fog trends.
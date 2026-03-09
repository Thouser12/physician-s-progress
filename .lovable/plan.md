

# Doctor Dashboard — Health Behavior Tracking App

## Overview
A mobile-first doctor dashboard for managing patients' behavioral progress through a gamified goal system. Uses mock data (no backend) with a dark premium medical interface.

## Design System
- Dark theme: Background `#0F172A`, Cards `#1E293B`, Accent `#3B82F6`
- Level colors: Bronze `#CD7F32`, Silver `#C0C0C0`, Gold `#F5C542`, Platinum `#8FD3F4`
- Rounded cards, soft shadows, clean typography

## Screens & Features

### 1. Doctor Dashboard (Home)
- Header with doctor name and copyable Doctor ID (`DR-48291`)
- Summary metric cards: Total Patients, Pending Requests, Avg Completion Rate
- Quick action buttons to navigate to Patient List, Requests, and Goals Template

### 2. Patient Requests
- List of pending connection requests with patient name, level badge, and request date
- Accept/Reject buttons per request card

### 3. Patient List
- Searchable list of attached patients
- Each card shows name, level badge, weekly completion percentage
- Tap to open Patient Detail

### 4. Patient Detail
- Patient info header with name, level, weekly progress bar
- List of current goals with completion frequency
- Actions: Edit goal, Remove goal, Add new goal (max 10)

### 5. Edit Goals
- Form to add/edit goals with title and optional description
- Remove goals, enforced 10-goal maximum

### 6. Patient Progress
- Weekly completion percentage with simple bar/line chart (Recharts)
- Weekly history list with level change indicators (promoted/demoted/maintained)

### 7. Chat
- Simple message bubble interface with timestamps
- Text input field for sending messages
- Mock conversation data

## Navigation
- Bottom tab bar with icons: Dashboard, Patients, Requests, Chat
- Stack navigation within tabs (e.g., Patient List → Detail → Edit Goals → Progress)

## Data
- All data is mock/local state — no backend integration
- React state management for accepting requests, editing goals, sending messages


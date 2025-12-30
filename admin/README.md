# Agribook Admin Panel

Next.js admin panel for managing the Agribook agricultural eBook platform.

## Features

- **Dashboard**: Overview of platform statistics and recent activity
- **Books Management**: View, approve, reject, and manage books
- **Audio Books Management**: Manage audio books/podcasts
- **Authors Management**: View and manage authors
- **Users Management**: View and manage platform users
- **Government Curriculum**: Manage government curriculum PDFs
- **Settings**: Platform configuration and settings

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **App Router** - Next.js routing

## Project Structure

```
admin/
├── app/
│   ├── dashboard/       # Dashboard page
│   ├── books/           # Books management
│   ├── audio-books/     # Audio books management
│   ├── authors/         # Authors management
│   ├── users/           # Users management
│   ├── curriculum/      # Government curriculum
│   └── settings/        # Settings page
├── components/          # Reusable components
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── Header.tsx      # Page header
├── lib/
│   └── dummyData.ts    # Dummy data (will be replaced with API calls)
└── package.json
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Phase 2 - API Integration

In the next phase, we will:
- Replace dummy data with API calls
- Add authentication
- Implement CRUD operations
- Add file upload functionality
- Add search and filtering
- Add pagination
- Add real-time updates

## Current Status

✅ Basic admin panel structure
✅ Dashboard with statistics
✅ Books management page
✅ Authors management page
✅ Users management page
✅ Audio books management page
✅ Government curriculum management page
✅ Settings page
✅ Dummy data integration

## Notes

- All data is currently using dummy data from `lib/dummyData.ts`
- API integration will be added in phase 2
- Authentication is not yet implemented (will be added in phase 2)

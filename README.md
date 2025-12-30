# Agribook - Agricultural eBook Platform

A comprehensive platform for agricultural eBooks with mobile app and admin panel.

## Project Structure

```
Agribook/
├── mobile/          # React Native mobile application
├── admin/           # Next.js admin panel
└── README.md        # This file
```

## Mobile App (React Native)

The mobile application for readers and authors.

### Features
- Multiple cover images for books
- Author-specific book filtering
- Audio book/podcast upload and playback
- Government curriculum with state selection
- Hindi and English language support
- Edit functionality for authors

### Getting Started

```bash
cd mobile
npm install
npm run android  # or npm run ios
```

## Admin Panel (Next.js)

The admin panel for managing the platform.

### Features
- Dashboard with statistics
- Books management
- Audio books management
- Authors management
- Users management
- Government curriculum management
- Settings

### Getting Started

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Status

### Phase 1 (Current)
- ✅ Mobile app with all features
- ✅ Admin panel with dummy data
- ✅ Basic UI/UX implementation

### Phase 2 (Upcoming)
- API integration
- Authentication
- Real-time updates
- File uploads
- Advanced features

## Technologies

### Mobile
- React Native 0.83
- React Navigation
- Context API for state management

### Admin Panel
- Next.js 16
- TypeScript
- Tailwind CSS

## License

Private project







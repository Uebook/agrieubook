# Agri eBook Hub

A React Native mobile application for agricultural eBooks, inspired by Amazon Kindle. The app supports both Reader/Customer and Author/Publisher roles.

## Features

### Authentication & Onboarding
- Mobile number login with OTP verification
- Email login (optional)
- Google/Apple social login
- Role selection (Reader/Customer or Author/Publisher)
- Category preferences during onboarding
- Reading progress sync across devices

### Home Screen
- Personalized recommendations
- Recently opened books
- Continue Reading section with progress
- Trending books
- Quick category access

### Book Store / Marketplace
- Search with auto-suggestions
- Filters (Category, Author, Price, Rating, Language)
- Sorting (Popularity, Latest, Price Low→High, Price High→Low)
- Book detail pages with:
  - Cover image
  - Summary
  - Sample reading (first chapter)
  - Author information
  - Ratings & reviews
  - Price (Buy/Free)
  - Add to wishlist

### eBook Reader
- EPUB/PDF reader with customizable UI
- Font resizing
- Font family selection
- Light/Dark/Sepia mode
- Bookmark pages
- Highlight text
- Add notes
- Search within book
- Page flip animation
- Audio Reading Mode (Text-to-speech)
- Adjustable line height & margins
- Reading progress indicator
- Offline reading support

### Library / My Books
- List of purchased books
- Cloud sync with account
- Download for offline reading
- Reading history
- Filter by All/Downloaded/Recent

### Payment & Wallet
- Payment Gateway Integration (Razorpay/Stripe/PayPal)
- UPI/Cards/Net banking
- Order history
- Invoice download

### Reviews & Ratings
- Add rating
- Write reviews
- Like/dislike reviews

### Profile & Settings
- Edit profile
- My orders
- Wishlist
- Privacy settings
- Notification settings
- Delete account

## Project Structure

```
Agribook/
├── src/
│   ├── screens/
│   │   ├── auth/              # Authentication screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── OTPScreen.js
│   │   │   ├── RoleSelectionScreen.js
│   │   │   └── OnboardingScreen.js
│   │   ├── main/              # Main app screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── BookStoreScreen.js
│   │   │   ├── LibraryScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   ├── BookDetailScreen.js
│   │   │   ├── SearchScreen.js
│   │   │   ├── CategoryScreen.js
│   │   │   ├── PaymentScreen.js
│   │   │   ├── OrderHistoryScreen.js
│   │   │   ├── WishlistScreen.js
│   │   │   ├── SettingsScreen.js
│   │   │   └── ReviewsScreen.js
│   │   └── reader/            # Reader screens
│   │       └── ReaderScreen.js
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.js
│   │   ├── AuthStack.js
│   │   ├── MainStack.js
│   │   └── BottomTabNavigator.js
│   ├── components/            # Reusable components
│   │   ├── common/
│   │   └── books/
│   ├── services/              # API services
│   ├── utils/                 # Utility functions
│   ├── context/               # Context providers
│   └── assets/                # Images, fonts, etc.
├── color.js                   # Color theme
├── App.js                     # Main app component
└── package.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods:
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Start Metro Bundler
```bash
npm start
```

## Navigation Structure

- **AuthStack**: Handles authentication flow (Login → OTP → Role Selection → Onboarding)
- **MainStack**: Main app navigation with bottom tabs
- **BottomTabNavigator**: Home, BookStore, Library, Profile tabs

## Color Theme

The app uses a comprehensive color theme defined in `color.js` with:
- Primary green colors (agricultural theme)
- Dark mode support
- Component-specific colors (buttons, cards, inputs, etc.)

## Technologies Used

- React Native 0.83.0
- React Navigation 6.x
- React Native Gesture Handler
- React Native Reanimated
- React Native Safe Area Context

## Next Steps

1. Integrate backend API
2. Implement actual authentication
3. Add EPUB/PDF reader library
4. Integrate payment gateways
5. Add social login (Google/Apple)
6. Implement offline storage
7. Add push notifications
8. Implement audio reading mode

## License

Private project

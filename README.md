# Expo Inventory App

Migrate of web-based inventory app to native Expo for iOS & Android using Expo Go.

## Quick Start

### Prerequisites
- [Expo Go](https://expo.dev/client) installed on your phone (or simulator)
- Node.js 16+

### Installation & Run

```bash
cd mobile
npm install
npx expo start
```

Then:
- **Android**: Scan the QR code with Expo Go
- **iOS**: Scan with the camera app, tap the Expo link
- **Web**: Press `w` in the terminal

## Project Structure

```
mobile/
├── App.js                    # Root entry point
├── navigation/
│   └── RootNavigator.js     # React Navigation stack
├── screens/
│   └── WelcomeScreen.js     # Login/guest entry
└── lib/                      # Shared utilities (future)
```

## Migration Notes

### What Was Done
- ✅ Scaffolded Expo app with `@react-navigation` for native routing
- ✅ Basic Welcome screen (supports Admin/Guest login)
- ✅ Navigation wired and functional

### What's Next
- **AsyncStorage setup**: Replace localStorage → `@react-native-async-storage/async-storage`
- **Core screens**: Migrate `src/components/pages/` to React Native
- **UI components**: Create native equivalents for Radix components (buttons, forms, dialogs)
- **Export/Import**: Use `expo-file-system`, `expo-sharing`, `expo-document-picker` for file ops
- **Charts/Graphs**: Use `react-native-svg` + `victory-native` instead of Recharts

### Web Library Replacements
| Web Lib | Native Equiv |
|---------|--------------|
| react-router-dom | @react-navigation/* ✅ |
| @radix-ui/* | Custom RN components |
| tailwindcss | React Native StyleSheet |
| react-hook-form | react-hook-form (cross-platform) |
| recharts | victory-native |
| html2canvas + jspdf | react-native-pdf + file ops |
| lucide-react | lucide-react-native |

## Testing Workflow
1. Edit a file in `mobile/screens/` or `mobile/navigation/`
2. Save → Expo auto hot-reload
3. Scan QR or use simulator
4. See changes instantly

## Troubleshooting
- **Port 8081 in use?** `lsof -i :8081` and kill the process, then restart
- **Module not found?** Run `npm install` again in `mobile/`
- **QR code not scanning?** Use localhost IP instead: tap "Connection" in Expo dev menu



✅ What's Now Complete:
1. Products Management
StoreDetailScreen — View products in a store, add/edit/delete
ProductFormScreen — Full create/edit form with name, code, quantity, description
2. Search Functionality
SearchScreen — Cross-store product search by name or code
Real-time results display with quantity info
3. Bottom Tab Navigation
📍 Áreas tab — Full areas → stores → products hierarchy
🔍 Buscar tab — Global product search
⚙️ Configuración tab — Settings + logout
4. Settings Screen
Shows login mode (Admin/Guest)
About section
Secure logout button


Login (Welcome) 
  ↓
Main App (Bottom Tabs)
├─ Áreas → Areas → Stores → Products (CRUD)
├─ Buscar → Global product search
└─ Configuración → Settings & Logout
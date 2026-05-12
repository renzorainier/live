# Totem Overlay with Live Controls

An interactive TikTok Totem experience with live multi-device controls via Firebase.

## Features

- 🎯 **Main Display**: Animated totem that charges with follows and pops with chat interactions
- 📱 **Remote Control Panel**: Control the totem from any device on the same network
- 🔊 **Audio Control**: Toggle sounds remotely
- 🔥 **Live Sync**: Real-time updates via Firebase Firestore
- 🎬 **Particle Effects**: Dynamic visual effects and animations

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy `.env.local.example` to `.env.local` and add your Firebase config:

```bash
cp .env.local.example .env.local
```

Update the values in `.env.local` with your Firebase project credentials.

### 3. Set Up Firestore Security Rules

**Important**: The app requires Firestore security rules to work.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with the contents of `firestore.rules`
5. Click **Publish**

**firestore.rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /adminControls/{document=**} {
      allow read, write: if true;
    }
  }
}
```

Or you can copy-paste from the `firestore.rules` file in this project.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the main totem display.

## Usage

### Main Display (localhost:3000)
- Shows the animated totem that charges with follows and pops with chat interactions
- Click **"📱 Control"** button to access the control panel
- Toggle audio with **"🔊 Audio"** button
- Mock events with **"Queue Mock"** for testing

### Control Panel (localhost:3000/admin)
- Access from any device on the same network: `http://<your-ip>:3000/admin`
- **Queue Follows**: Add follow events to the totem (1-100)
- **Queue POPs**: Add pop events to trigger the explosion (1-100)
- **Emergency Reset**: Clear the totem state
- **Audio Control**: Toggle audio on/off across all devices
- All changes sync live to the main display

## Project Structure

```
app/
  page.js          # Main totem display
  admin/page.js    # Control panel
  useAudio.js      # Audio hook
  layout.js        # Layout wrapper
lib/
  firebase.js      # Firebase config and functions
public/
  sounds/          # Audio files
firestore.rules    # Firestore security rules
```

## Commands Available

### Admin Panel Functions

- `resetTotem()` - Reset totem to initial state
- `queueRemoteFollow(count)` - Queue follow events
- `queueRemotePop(count)` - Queue pop events
- `toggleAudio()` - Toggle audio on/off
- `enableAudio()` / `disableAudio()` - Set audio state

## Troubleshooting

**Firebase Permission Error**
- Make sure Firestore security rules are properly set and published
- Check that your `.env.local` has correct Firebase credentials
- Verify the `adminControls` collection can be accessed

**Image Aspect Ratio Warning**
- This should be resolved with `height: auto` style on images

**No Real-Time Updates**
- Check browser console for Firebase errors
- Verify Firestore rules allow read/write access
- Make sure both devices are using the same Firebase project

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Framer Motion](https://www.framer.com/motion/) - for animations

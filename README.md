# MU-DOST SA Online

![Version](https://img.shields.io/badge/version-0.2.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**MU-DOST SA Online** is a comprehensive management system for the Mapúa University Department of Science and Technology Student Association (MU-DOST SA). This desktop application streamlines organization operations including event management, attendance tracking, inventory management, and member roster maintenance.

## Features

### Event Management

- Create and manage organization events
- Track event schedules and details
- View upcoming and past events
- Real-time event updates

### Attendance System

- Digital attendance tracking for events and activities
- QR code-based attendance logging
- Attendance sheet management
- Member and non-member attendance records
- Link attendance sheets to specific events

### Room Tambayan Scheduling

- Schedule and manage room tambayan sessions
- Track active and upcoming room schedules
- Multi-campus support (Intramuros and Makati)
- Real-time status indicators for active sessions

### Inventory Management

- Track organization inventory items
- Quantity adjustment and history
- Multi-user inventory updates
- Item categorization and search

### Member Roster

- Comprehensive member database
- Member profile management
- Membership verification system
- Token-based member authentication

### Authentication & Security

- Secure user authentication via Supabase
- Role-based access control
- Session management
- Protected routes and data

### User Interface

- Modern, responsive design with Tailwind CSS
- Dark theme optimized for extended use
- Material Icons for intuitive navigation
- Smooth animations and transitions
- Global navigation with back button history
- Loading states and error handling

## Tech Stack

### Frontend

- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack web framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with runes
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server

### Backend & Services

- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage
- **[Zod](https://zod.dev/)** - Schema validation

### Desktop Application

- **[Tauri](https://tauri.app/)** - Desktop application framework
- **[Rust](https://www.rust-lang.org/)** - Systems programming language for Tauri backend

### Additional Libraries

- **crypto-js** - Cryptographic functions
- **jwt-decode** - JWT token decoding
- **qrcode** - QR code generation
- **svelte-qrcode** - Svelte QR code component

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Rust** (latest stable version)
- **Tauri Prerequisites** - See [Tauri Prerequisites Guide](https://tauri.app/v1/guides/getting-started/prerequisites)

### Platform-Specific Requirements

#### Windows

- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

#### macOS

- Xcode Command Line Tools

#### Linux

- System dependencies (webkit2gtk, etc.)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MUDOSTSA/mudostsa-app.git
cd mudostsa-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

### 4. Development Mode

#### Web Development (Browser)

```bash
npm run dev
```

Access the application at `http://localhost:1420`

#### Desktop Development (Tauri)

```bash
npm run tauri dev
```

This will start the development server and launch the Tauri desktop application.

### 5. Build for Production

#### Web Build

```bash
npm run build
```

#### Desktop Build

```bash
npm run tauri build
```

The compiled application will be available in `src-tauri/target/release`.

## Project Structure

```
mudostsa-app/
├── src/
│   ├── components/          # Reusable Svelte components
│   │   ├── NavigationBar.svelte
│   │   ├── MaterialIcon.svelte
│   │   ├── Throbber.svelte
│   │   ├── Dialog.svelte
│   │   └── ...
│   ├── lib/
│   │   ├── stores/          # Svelte stores (state management)
│   │   │   ├── user.ts      # User authentication state
│   │   │   └── navigation.ts # Navigation history
│   │   ├── zod/             # Zod validation schemas
│   │   ├── supabase.ts      # Supabase client and API functions
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── ...
│   ├── routes/              # SvelteKit routes
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +page.svelte     # Landing page
│   │   ├── auth/            # Authentication routes
│   │   └── proper/          # Main application routes
│   │       ├── +layout.svelte
│   │       ├── attendance/
│   │       ├── events/
│   │       ├── inventory/
│   │       ├── membership/
│   │       ├── roster/
│   │       ├── tambayan/
│   │       └── verify/
│   ├── app.html             # HTML template
│   └── global.css           # Global styles
├── src-tauri/               # Tauri (Rust) backend
│   ├── src/
│   │   ├── main.rs          # Tauri application entry
│   │   └── lib.rs
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── static/                  # Static assets
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features Explained

### Navigation System

- **Global Back Button**: Navigate through your browsing history (up to 10 pages)
- **Smooth Animations**: Page transitions and UI element animations
- **Responsive Header**: Back button appears/disappears with smooth transitions

### State Management

- **User Store**: Centralized authentication and profile management
- **Navigation Store**: Page history stack with 10-page limit
- **Reactive Updates**: Automatic UI updates with Svelte 5 runes

### Data Management

- **Real-time Updates**: Supabase real-time subscriptions
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Error Handling**: Comprehensive error states and user feedback

## Configuration

### Supabase Database Tables

The application expects a certain database schema not publically available.

### Tailwind Configuration

The project uses Tailwind CSS v4 with custom configurations. Modify `tailwind.config.js` to customize the design system.

## Development Tools

### Type Checking

```bash
npm run check
```

### Watch Mode Type Checking

```bash
npm run check:watch
```

### Preview Production Build

```bash
npm run preview
```

## Supported Platforms

The application can be built for:

- **Windows** (x64, ARM64)
- **macOS** (Intel, Apple Silicon)
- **Linux** (Debian, AppImage, RPM)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Svelte 5 runes syntax (`$state`, `$derived`, `$effect`)
- Maintain consistent code formatting
- Add comments for complex logic
- Test features before submitting PRs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

**Yuan Benedict O. Suarez**

## Support

For support, please contact the MU-DOST SA organization or open an issue in the repository.

## Acknowledgments

- Mapúa University
- Department of Science and Technology Student Association
- All contributors and maintainers

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Version:** 0.2.1  
**Last Updated:** October 2025

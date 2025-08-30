# Assalatur Rahman Islamic Association - Event Management App

A comprehensive event management platform for the Assalatur Rahman Islamic Association in London, designed to facilitate community engagement, event organization, and attendance tracking.

## 🌟 Features

### For Administrators & Sub-administrators
- **Dashboard Analytics**: Comprehensive overview of community statistics
- **Event Management**: Create, edit, and manage community events
- **Attendance Tracking**: Monitor event attendance with real-time updates
- **User Management**: Manage community members and their roles
- **Invitation System**: Invite new members and sub-administrators
- **Export Functionality**: Generate PDF and Excel reports for events, users, and attendance
- **Display Mode**: Special attendance display view for large screens at events

### For Community Members
- **Event Discovery**: Browse upcoming and past events
- **Registration System**: Register for events that require registration
- **Attendance Check-in**: Mark attendance for events that have started
- **Profile Management**: Update personal information and settings
- **Mobile-Friendly**: Responsive design for all devices

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API server running (see Backend Integration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mosque-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your API URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🔗 Backend Integration

This frontend is designed to work with a RESTful API backend. The backend should be running on `http://localhost:3000/api` by default.

### Backend Requirements
- **API Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT-based with role management
- **CORS**: Enabled for frontend origin
- **Response Format**: Consistent JSON structure

### API Endpoints
The frontend expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/login/otp` - OTP login
- `GET /api/auth/me` - Get current user

#### Events
- `GET /api/events` - Get events with pagination
- `POST /api/events` - Create event (Admin/Subadmin)
- `PUT /api/events/:id` - Update event (Admin/Subadmin)
- `DELETE /api/events/:id` - Delete event (Admin/Subadmin)

#### Users
- `GET /api/users` - Get users (Admin/Subadmin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Testing with Backend
1. Ensure your backend server is running on `http://localhost:3000`
2. Use the provided test credentials:
   - **Admin**: `admin@islamicassociation.com` / `admin123`
   - **User**: `user@islamicassociation.com` / `user123`
3. The frontend will automatically connect to the backend API

## 🏗️ Project Structure

```
mosque-app/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── Navbar.tsx          # Navigation component
│   │   └── Footer.tsx          # Footer component
│   ├── pages/
│   │   ├── auth/               # Authentication pages
│   │   │   ├── Login.tsx       # Login page
│   │   │   └── Register.tsx    # Registration page
│   │   ├── admin/              # Admin pages
│   │   │   └── Dashboard.tsx   # Admin dashboard
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── Index.tsx           # Landing page
│   │   └── NotFound.tsx        # 404 page
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── services/
│   │   ├── api.ts              # API service layer
│   │   └── mockData.ts         # Mock data for development
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── export.ts           # Export utilities (PDF/Excel)
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # App entry point
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

## 🎨 Design System

The app uses a custom Islamic-themed design system with:

- **Primary Colors**: Islamic green palette
- **Secondary Colors**: Gold accents
- **Typography**: Modern, readable fonts
- **Components**: Consistent UI components using shadcn/ui
- **Animations**: Subtle Islamic-themed animations and transitions

## 🔐 Authentication

The app supports multiple authentication methods:

- **Email/Password**: Traditional login
- **Phone/OTP**: SMS-based authentication
- **Role-based Access**: Admin, Sub-admin, and User roles

## 📊 Key Features

### Event Management
- Create events with detailed information
- Set registration requirements and deadlines
- Track attendance and capacity
- Categorize events (Prayer, Lecture, Community, Education, Charity, Social)

### Attendance System
- Real-time attendance tracking
- Check-in/check-out functionality
- Attendance display mode for large screens
- Export attendance reports

### User Management
- Invite new members via email
- Manage user roles and permissions
- User profile management
- Account verification system

### Reporting & Analytics
- Dashboard with key metrics
- Export functionality (PDF/Excel)
- Attendance analytics
- User activity tracking

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context + React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Export**: jsPDF + xlsx
- **Build Tool**: Vite
- **Package Manager**: npm

## 📱 Responsive Design

The app is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Large display screens (for attendance display)

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy       # Deploy to Vercel (production)
npm run deploy:dev   # Deploy to Vercel (development)
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Development Settings
VITE_APP_NAME="Assalatur Rahman Islamic Association"
VITE_APP_VERSION="1.0.0"
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deploy to Vercel

This project is configured for easy deployment on Vercel:

#### Quick Deploy
```bash
npm run deploy
```

#### Development Deploy
```bash
npm run deploy:dev
```

#### Manual Deploy
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`

### Environment Variables for Production

Set these environment variables in your Vercel project:

- `VITE_API_URL`: Your production API URL (e.g., `https://your-api-domain.com/api`)

### Recommended Hosting

- **Vercel** (Recommended - configured and ready)
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Assalatur Rahman Islamic Association for the opportunity
- The Muslim community in London for inspiration
- All contributors and supporters

## 📞 Support

For support and questions, please contact:
- Email: hazeem@cosonas.co.uk
- Phone: +44.........

---

**Built with ❤️ for the Muslim community in London**

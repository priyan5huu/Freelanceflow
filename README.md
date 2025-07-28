# FreelanceFlow - Freelance Marketplace

A modern, full-stack freelance marketplace built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo

**Production URL**: [https://freelanceflow-ophgjnk6s-priyanshu-pandeys-projects-7f754995.vercel.app/](https://freelanceflow-ophgjnk6s-priyanshu-pandeys-projects-7f754995.vercel.app/)

### Quick Demo Access
Click the **Demo Client** or **Demo Freelancer** buttons on the login page for instant access.

**Demo Credentials** (if needed):
- **Client**: `client@demo.com` / `password123`
- **Freelancer**: `freelancer@demo.com` / `password123`

## Features

### Current Implementation (50% MVP)
- ✅ Beautiful landing page with professional design
- ✅ User authentication (JWT) for clients and freelancers
- ✅ Protected routes and role-based access
- ✅ Client dashboard for posting and managing projects
- ✅ Freelancer dashboard for browsing and bidding on projects
- ✅ Project listing with advanced filtering and search
- ✅ Detailed project pages with bidding functionality
- ✅ Responsive design for all screen sizes
- ✅ Professional UI with Tailwind CSS and Heroicons

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: React Hook Form with Yup, Express Validator
- **UI Components**: Heroicons, React Hot Toast

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelanceflow
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Setup**
   
   **Frontend (.env)**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   **Backend (server/.env)**:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/freelanceflow
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Seed the database (optional)**
   ```bash
   npm run server:seed
   ```

7. **Start the development servers**
   
   **Terminal 1 - Backend**:
   ```bash
   npm run server
   ```
   
   **Terminal 2 - Frontend**:
   ```bash
   npm run dev
   ```

### Demo Accounts

After seeding the database, you can use these demo accounts:

**Client Account**:
- Email: `client@demo.com`
- Password: `password123`

**Freelancer Account**:
- Email: `freelancer@demo.com`
- Password: `password123`

## Project Structure

```
freelanceflow/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── landing/        # Landing page components
│   │   └── ...             # Form, navigation components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Main application pages
│   └── main.tsx           # Application entry point
├── server/                # Backend Node.js application
│   ├── models/            # MongoDB data models
│   ├── routes/            # Express API routes
│   ├── middleware/        # Authentication middleware
│   ├── scripts/           # Database utilities
│   └── server.js          # Server entry point
├── api/                   # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   └── health.js          # Health check endpoint
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all projects (with filtering)
- `GET /api/projects/my-projects` - Get user's projects (clients)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (clients)
- `PUT /api/projects/:id` - Update project (clients)
- `DELETE /api/projects/:id` - Delete project (clients)
- `POST /api/projects/:id/bids` - Submit bid (freelancers)

## Features in Detail

### Authentication & Authorization
- JWT-based authentication with secure password hashing
- Role-based access control (client/freelancer)
- Protected routes with automatic redirects
- Session persistence with token refresh

### Project Management
- Rich project creation with validation
- Advanced filtering by skills, budget, and keywords
- Real-time search functionality
- Deadline tracking and status management

### Bidding System
- Freelancers can submit detailed proposals
- Bid amount, delivery time, and message
- Prevent duplicate bids and self-bidding
- Client can view all proposals with freelancer details

### User Experience
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for user feedback
- Intuitive navigation and clean UI

## Security Features

- Password hashing with bcrypt
- JWT token expiration and validation
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## Future Enhancements (Remaining 50%)

- [ ] Project assignment and contract management
- [ ] Milestone-based payment system
- [ ] Real-time messaging between clients and freelancers
- [ ] File upload and sharing
- [ ] Rating and review system
- [ ] Advanced user profiles with portfolios
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Admin dashboard and analytics
- [ ] Advanced search with Elasticsearch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
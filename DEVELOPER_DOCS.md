# FreelanceFlow Developer Documentation

## Project Architecture

### Frontend (React + TypeScript + Vite)
```
src/
├── components/        # Reusable UI components
├── contexts/         # React Context providers
├── pages/           # Page components
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

### Backend (Node.js + Express + MongoDB)
```
server/
├── middleware/      # Authentication and validation middleware
├── models/         # MongoDB schema definitions
├── routes/         # API route handlers
├── scripts/        # Database utilities and seeding
├── services/       # Business logic services
├── utils/          # Helper utilities
└── server.js       # Server entry point
```

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation
1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `cd server && npm install`
4. Copy environment files:
   - Frontend: Copy `.env.development` to `.env`
   - Backend: Copy `server/.env.example` to `server/.env`
5. Start MongoDB
6. Seed database: `npm run server:seed`
7. Start development servers:
   - Frontend: `npm run dev`
   - Backend: `npm run server`

## Code Standards

### TypeScript Configuration
- Strict mode enabled
- Path mapping for imports
- ESLint + Prettier for formatting

### API Design Principles
- RESTful conventions
- Consistent error responses
- Input validation with express-validator
- JWT authentication for protected routes

### Database Schema
- User model with role-based permissions
- Project model with bidding system
- Soft delete for data preservation

## Testing Strategy

### Unit Tests
- Jest + React Testing Library for frontend
- Supertest for API testing
- Aim for >70% code coverage

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## Deployment

### Docker Deployment
```bash
npm run docker:build  # Build image
npm run docker:prod   # Production deployment
```

### Environment Variables
See `.env.example` files for required configuration.

## Security Considerations

### Authentication
- JWT tokens with 7-day expiration
- bcrypt password hashing
- Rate limiting on API endpoints

### Data Protection
- Input sanitization
- CORS configuration
- Helmet.js security headers
- MongoDB injection prevention

## Contributing

### Branch Strategy
- `main`: Production code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Critical fixes

### Pull Request Process
1. Create feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit PR with detailed description

## Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image optimization
- Bundle analysis with webpack-bundle-analyzer

### Backend
- MongoDB indexing
- Query optimization
- Caching strategies (Redis for production)

## Monitoring & Logging

### Development
- Console logging with winston
- Error tracking with detailed stack traces

### Production
- Structured logging
- Error monitoring (Sentry recommended)
- Performance monitoring
- Health check endpoints

## Known Issues & Limitations

1. No real-time notifications (WebSocket implementation pending)
2. File upload limited to 10MB
3. No payment gateway integration yet
4. Email service uses mock implementation

## Future Enhancements

### Phase 2 Features
- Real-time messaging system
- Payment integration (Stripe/PayPal)
- File sharing for projects
- Advanced search with Elasticsearch

### Technical Improvements
- Microservices architecture
- GraphQL API
- Progressive Web App features
- Advanced caching layer
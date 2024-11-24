# Interactive Story Platform 📚✨

A modern web application for creating, sharing, and experiencing interactive stories. Built with React and MongoDB, this platform enables authors to craft branching narratives while readers enjoy making choices that shape their reading experience.

**Live Demo:** [Interactive Story Platform](https://hazemelraffiee.github.io/interactive-story)

## Features 🌟

### For Readers
- Explore a diverse collection of interactive stories
- Make meaningful choices that affect story outcomes
- Track reading progress across multiple stories
- Save favorites and build reading lists
- Real-time story updates and notifications

### For Authors
- Intuitive story creation interface
- Rich text editing with dialogue and thought formatting
- Visual story flow designer
- Public/private story management
- Reader analytics and engagement metrics

## Tech Stack 🛠️

### Frontend:
- React.js 18
- Tailwind CSS 3
- Lucide Icons
- DND Kit (drag and drop)
- Monaco Editor
- React Router DOM
- Axios for API calls

### Backend:
- Node.js & Express
- MongoDB with Mongoose
- JWT for Authentication
- CORS
- bcrypt for password hashing

### Deployment:
- Frontend: GitHub Pages
- Backend: Render.com
- Database: MongoDB Atlas

## Project Structure 📁

```
interactive-story/          # Root repository (Frontend)
├── src/
│   ├── components/
│   │   ├── common/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── sections/    # Page sections
│   │   └── story/       # Story-related components
│   └── pages/           # Page components
├── package.json
│
└── backend/             # Backend directory
    ├── server/
    │   ├── index.js     # Entry point
    │   ├── middleware/  # Middleware
    │   ├── models/      # Database models
    │   └── routes/      # API routes
    └── package.json
```

## Getting Started 🚀

### Prerequisites
- Node.js (v18 or higher)
- npm/yarn
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hazemelraffiee/interactive-story.git
cd interactive-story
```

2. Install Frontend Dependencies (from root directory):
```bash
npm install
```

3. Install Backend Dependencies:
```bash
cd backend
npm install
```

4. Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

5. Create a `.env` file in the root directory for frontend:
```env
REACT_APP_API_URL=http://localhost:5000
```

6. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal, from root directory):
```bash
npm start
```

### Building for Production

Frontend (from root directory):
```bash
npm run build
```

Backend:
```bash
cd backend
npm run build
```

## API Documentation 📚

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Stories
- GET `/api/stories` - Get all stories
- GET `/api/stories/:id` - Get single story
- POST `/api/stories` - Create new story
- PUT `/api/stories/:id` - Update story
- DELETE `/api/stories/:id` - Delete story
- POST `/api/stories/:id/like` - Toggle story like

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/favorites` - Get favorite stories
- GET `/api/users/reading-history` - Get reading history
- POST `/api/users/reading-progress` - Update reading progress

## Deployment Guides 🚀

### Frontend Deployment (GitHub Pages)
The frontend is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a build and deployment.

### Backend Deployment (Render.com)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=10000`
   - `CORS_ORIGIN=https://hazemelraffiee.github.io`
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && node server/index.js`

## Key Components 🔑

### StoryDesigner
The heart of the authoring experience, enabling writers to:
- Create and organize chapters
- Design interactive scenes
- Set up choice-based navigation
- Preview stories in real-time

### InteractiveStoryViewer
A dynamic reader that:
- Renders story content with animations
- Handles user choices
- Tracks reading progress
- Manages story state

### ChaptersTreeDesigner
A visual tool for:
- Organizing story structure
- Managing scene connections
- Visualizing story flow
- Drag-and-drop chapter ordering

## Contributing 🤝

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the beautiful icons
- [DND Kit](https://dndkit.com) for drag and drop functionality
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Render](https://render.com) for backend hosting

## Support 💪

If you find this project useful, please consider:
- Starring the repository
- Reporting bugs
- Submitting feature requests
- Contributing code or documentation

## Contact 📧

Project Link: [https://github.com/hazemelraffiee/interactive-story](https://github.com/hazemelraffiee/interactive-story)

---

Made with ❤️ for storytellers and readers everywhere

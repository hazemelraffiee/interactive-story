# Interactive Story Platform 📚✨

A modern web application for creating, sharing, and experiencing interactive stories. Built with React and Firebase, this platform enables authors to craft branching narratives while readers enjoy making choices that shape their reading experience.

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

- **Frontend:**
  - React.js 18
  - Tailwind CSS 3
  - Lucide Icons
  - DND Kit (drag and drop)
  - Monaco Editor
  - React Router DOM

- **Backend:**
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - Firebase Security Rules

## Getting Started 🚀

### Prerequisites
- Node.js (v18 or higher)
- npm/yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hazemelraffiee/interactive-story.git
cd interactive-story
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

### Building for Production

```bash
npm run build
```

### Deployment

The project is automatically deployed to GitHub Pages when changes are pushed to the main branch. You can also manually deploy using:

```bash
npm run deploy
```

## Project Structure 📁

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── common/        # Reusable UI components
│   │   ├── AchievementBadge.jsx
│   │   ├── GenrePills.jsx
│   │   ├── NotificationToast.jsx
│   │   ├── ProgressBar.jsx
│   │   └── SearchBar.jsx
│   ├── layout/
│   │   └── Navigation.jsx
│   ├── sections/
│   │   └── HeroSection.jsx
│   └── story/
│       ├── ChaptersTreeDesigner.jsx
│       ├── InteractiveStoryViewer.jsx
│       ├── SceneContentEditor.jsx
│       └── StoryCard.jsx
├── pages/
│   └── StoryPlatform/
│       ├── FavoritesView.jsx
│       ├── MyStoriesView.jsx
│       └── StoryPlatform.jsx
└── firebase/         # Firebase configuration
```

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

## Automatic Deployment 🚀

This project uses GitHub Actions for continuous deployment. Every push to the main branch automatically triggers a build and deployment to GitHub Pages.

The deployment workflow can be found in `.github/workflows/deploy.yml`.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the beautiful icons
- [DND Kit](https://dndkit.com) for drag and drop functionality
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor

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
# Evals - Employee Evaluation System

A modern, corporate-grade employee evaluation and feedback system built with Next.js, Firebase, and Tailwind CSS.

## Features

### 🔐 Authentication

- **Google OAuth** for seamless single sign-on
- **Protected routes** with role-based access control
- **User management** with automatic profile creation
- **No password management** - simplified and secure

### 📝 Evaluation System

- **Question Types**:
  - Slider questions (1-10 scale)
  - Paragraph/text responses
- **Question Management**:
  - Create, edit, and delete evaluation questions
  - Categorize questions by department or skill area
  - Set question order and required status
- **Evaluation Types**:
  - Peer-to-peer evaluations
  - Manager-to-employee evaluations
  - Employee-to-manager evaluations

### 👥 User Roles

- **Admin**: Full system access, question management, evaluation assignment
- **Manager**: Evaluate employees, view team reports
- **Employee**: Complete assigned evaluations, view personal history

### 🎨 User Experience

- **Modern, responsive design** with Tailwind CSS
- **Intuitive navigation** with clear visual hierarchy
- **Progress tracking** for multi-step evaluations
- **Real-time updates** with Firebase Firestore

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Authentication, Firestore)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd evals
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**

   - Enable Authentication (Google provider only)
   - Enable Firestore Database
   - Set up Firestore security rules for your use case

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
evals/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin-only pages
│   │   └── questions/     # Question management
│   ├── dashboard/         # User dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Login/signup page
├── components/            # Reusable components
│   ├── EvaluationForm.tsx # Evaluation form component
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── firestore.ts       # Firestore service functions
├── types/                 # TypeScript type definitions
│   └── index.ts           # Application types
└── README.md              # This file
```

## Usage

### For Administrators

1. **Create Questions**

   - Navigate to Dashboard → Create Question
   - Add questions with appropriate types and categories
   - Set display order and required status

2. **Assign Evaluations**

   - Set up evaluation templates
   - Assign evaluations to specific users
   - Set due dates and evaluation types

3. **Monitor Progress**
   - View completion rates
   - Generate reports and analytics
   - Manage user roles and permissions

### For Users

1. **Complete Evaluations**

   - View pending evaluations on dashboard
   - Navigate through questions step-by-step
   - Submit responses with validation

2. **Track Progress**
   - View completed evaluations
   - Check evaluation history
   - Monitor upcoming deadlines

## Firebase Security Rules

Set up appropriate Firestore security rules for your production environment:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Questions are readable by all authenticated users
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Evaluations are readable by participants
    match /evaluations/{evaluationId} {
      allow read, write: if request.auth != null &&
        (resource.data.evaluatorId == request.auth.uid ||
         resource.data.evaluateeId == request.auth.uid);
    }
  }
}
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variables**
4. **Deploy**

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the Firebase documentation
- Review the Next.js documentation

## Roadmap

- [ ] **Advanced Analytics**: Detailed reporting and insights
- [ ] **Email Notifications**: Automated reminders and updates
- [ ] **Mobile App**: React Native companion app
- [ ] **Integration APIs**: Connect with HR systems
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Question Types**: Matrix questions, file uploads
- [ ] **Performance Optimization**: Caching and optimization
- [ ] **Unit Tests**: Comprehensive test coverage

---

Built with ❤️ using modern web technologies

# CAREERSPHERE - AI Career Coach Platform 🚀

CAREERSPHERE is a comprehensive AI-powered career development platform built with Next.js 15, React 19, and PostgreSQL. It provides personalized career guidance, interview preparation, resume building, and community networking for professionals.

## 🌐 Live Demo

[🚀 View Live Application](https://career-sphere-ik2l.vercel.app/)

## ✨ Features

### 🔐 Authentication & User Management
- **Manual Authentication** with NextAuth.js and Credentials Provider
- **Secure Password Hashing** using bcryptjs
- **JWT Session Management** with secure cookies
- **Custom Signup/Login Pages** with ShadCN UI components
- **User Onboarding** with industry selection and profile completion
- **Profile Management** with avatar upload and personal details

### 🎯 Career Development Tools
- **AI Interview Preparation** - Interactive quiz system with personalized feedback and performance tracking
- **Resume Builder** - Dynamic resume creation with multiple sections and ATS optimization
- **Cover Letter Generator** - AI-powered cover letter creation for specific job applications
- **Industry Insights** - AI-generated career guidance, salary ranges, and market analysis
- **Skills Assessment** - Personalized quiz generation based on industry and experience

### 🌐 Community Features
- **Professional Networking** - Connect with fellow professionals
- **Discussion Posts** - Share career advice, job search tips, and industry insights
- **Interactive Comments** - Engage in meaningful discussions
- **Like System** - Show appreciation for valuable content
- **User Profiles** - View professional backgrounds and achievements

### 🎨 Modern UI/UX
- **ShadCN UI Components** for consistent, accessible design
- **Blue/Teal Gradient Theme** for professional appearance
- **Responsive Design** optimized for all device sizes
- **Dark/Light Mode Support** with system preference detection
- **Loading States** and smooth transitions throughout the app

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Modern component library built on Radix UI
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Complete authentication solution
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database

### AI & Integrations
- **Google Gemini API** - AI-powered content generation
- **Inngest** - Background job processing for AI insights
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful icon library

### Development & Deployment
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting and formatting
- **Prisma Studio** - Database management GUI
- **Vercel/Netlify** - Optimized deployment platforms

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Roisul-Shohan/CAREER-SPHERE.git
   cd CAREER-SPHERE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000

   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply database migrations

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

### Core Models
- **User** - User accounts with profile information, skills, and industry data
- **Assessment** - Interview quiz results and performance tracking
- **Resume** - User resume content and ATS scoring
- **CoverLetter** - Generated cover letters for job applications
- **IndustryInsight** - AI-generated industry trends and salary data

### Community Models
- **Post** - Community discussion posts
- **Comment** - Comments on posts
- **Like** - User interactions (likes on posts and comments)

### Key Features
- **Full-text search** on posts and comments
- **Foreign key relationships** with cascading deletes
- **Index optimization** for performance
- **JSON fields** for flexible data storage (quiz questions, salary ranges)

## 🔒 Authentication Flow

1. **Signup** → User creates account with email/password
2. **Auto-login** → System automatically logs in the user
3. **Onboarding** → User completes profile with industry selection
4. **Dashboard** → Full access to all features

## 🎯 Current Status

### ✅ Fully Functional
- User registration and authentication
- Profile onboarding with industry insights
- Interview preparation with AI-generated quizzes
- Dashboard with personalized content
- Responsive design for all devices

### 🚧 Coming Soon
- AI-powered resume builder
- Cover letter generation
- Advanced industry analytics
- Job matching algorithms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database ORM by [Prisma](https://prisma.io/)

---

**Made with ❤️ by CAREERSPHERE Team**

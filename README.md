# CAREERSPHERE - AI Career Coach Platform 🚀

CAREERSPHERE is a comprehensive AI-powered career development platform built with Next.js, featuring manual authentication, PostgreSQL database, and modern UI components.

## 🌐 Live Demo

[🚀 View Live Application](https://career-sphere-8z9d.vercel.app/)

## ✨ Features

### 🔐 Authentication System
- **Manual Authentication** with NextAuth.js and Credentials Provider
- **Secure Password Hashing** using bcrypt
- **JWT Session Management** with secure cookies
- **Custom Signup/Login Pages** with ShadCN UI components

### 🎯 Career Development Tools
- **AI Interview Preparation** - Interactive quiz system with personalized feedback
- **Resume Builder** - Coming Soon
- **Cover Letter Generator** - Coming Soon
- **Industry Insights** - AI-powered career guidance and market analysis

### 🎨 Modern UI/UX
- **ShadCN UI Components** for consistent design
- **Blue/Teal Gradient Theme** for professional appearance
- **Responsive Design** for all device sizes
- **Dark/Light Mode Support**

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **UI Components**: ShadCN UI, Radix UI
- **AI Integration**: Google Gemini API (for future features)
- **Deployment**: Ready for Vercel/Netlify

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

## 📁 Project Structure

```
CAREERSPHERE/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Protected pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN UI components
│   └── providers.jsx     # NextAuth Session Provider
├── actions/              # Server actions
├── lib/                  # Utility functions
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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

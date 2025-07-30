# AI Resume Analyzer

An intelligent resume analysis tool that provides ATS scores and improvement recommendations using multiple AI providers.

## 🚀 Features

- **ATS Score Analysis**: Get detailed scores on how well your resume performs with Applicant Tracking Systems
- **AI-Powered Feedback**: Receive personalized improvement suggestions using Google Gemini AI
- **PDF Processing**: Upload and analyze PDF resumes with automatic text extraction using Gemini Vision
- **Secure Storage**: Cloud storage integration with Supabase
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React, React Router, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini (text analysis and vision)
- **Database**: Supabase
- **File Processing**: PDF.js, Gemini Vision API
- **Build Tool**: Vite
- **Deployment**: Docker support included

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key (free tier available)

## ⚡ Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-resume-analyzer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual API keys and Supabase configuration.

4. **Set up Supabase database**

   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Update your `.env.local` with the Supabase URL and anon key

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5174`

## 🔧 Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🚢 Production Deployment

### Using Docker

1. **Build the Docker image**

   ```bash
   docker build -t ai-resume-analyzer .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 ai-resume-analyzer
   ```

### Manual Deployment

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
├── app/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and services
│   ├── routes/        # Application routes
│   └── root.tsx       # Root component
├── constants/         # Application constants
├── public/           # Static assets
├── types/            # TypeScript type definitions
└── supabase-schema.sql  # Database schema
```

## 🔒 Security

- All API keys are stored as environment variables
- Supabase Row Level Security (RLS) is enabled
- Client-side validation and server-side processing
- Secure file upload handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are properly set
2. Ensure your Google Gemini API key is valid and has sufficient quota
3. Verify your Supabase database is properly configured
4. Check the browser console for any error messages

For additional help, please open an issue in the GitHub repository.

## 🚨 Tutorial

This repository contains the code corresponding to an in-depth tutorial available on our YouTube channel, <a href="https://www.youtube.com/@javascriptmastery/videos" target="_blank"><b>JavaScript Mastery</b></a>.

If you prefer visual learning, this is the perfect resource for you. Follow our tutorial to learn how to build projects like these step-by-step in a beginner-friendly manner!

<a href="https://www.youtube.com/watch?v=iYOz165wGkQ" target="_blank"><img src="https://github.com/sujatagunale/EasyRead/assets/151519281/1736fca5-a031-4854-8c09-bc110e3bc16d" /></a>

## <a name="introduction">✨ Introduction</a>

Build an AI-powered Resume Analyzer with React, React Router, and Puter.js! Implement seamless auth, upload and store resumes, and match candidates to jobs using smart AI evaluations. Get custom feedback and ATS scores tailored to each listing—all wrapped in a clean, reusable UI.

If you're getting started and need assistance or face any bugs, join our active Discord community with over **50k+** members. It's a place where people help each other out.

<a href="https://discord.com/invite/n6EdbFJ" target="_blank"><img src="https://github.com/sujatagunale/EasyRead/assets/151519281/618f4872-1e10-42da-8213-1d69e486d02e" /></a>

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[React](https://react.dev/)** is a popular open‑source JavaScript library for building user interfaces using reusable components and a virtual DOM, enabling efficient, dynamic single-page and native apps.

- **[React Router v7](https://reactrouter.com/)** is the go‑to routing library for React apps, offering nested routes, data loaders/actions, error boundaries, code splitting, and SSR support—all with a smooth upgrade path from v6.

- **[Puter.com](https://jsm.dev/resumind-puter)** is an advanced, open-source internet operating system designed to be feature-rich, exceptionally fast, and highly extensible. Puter can be used as: A privacy-first personal cloud to keep all your files, apps, and games in one secure place, accessible from anywhere at any time.

- **[Puter.js](https://jsm.dev/resumind-puterjs)** is a tiny client‑side SDK that adds serverless auth, storage, database, and AI (GPT, Claude, DALL·E, OCR…) straight into your browser app—no backend needed and costs borne by users.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows developers to design custom user interfaces by applying low-level utility classes directly in HTML, streamlining the design process.

- **[TypeScript](https://www.typescriptlang.org/)** is a superset of JavaScript that adds static typing, providing better tooling, code quality, and error detection for developers, making it ideal for building large-scale applications.

- **[Vite](https://vite.dev/)** is a fast build tool and dev server using native ES modules for instant startup, hot‑module replacement, and Rollup‑powered production builds—perfect for modern web development.

- **[Zustand](https://github.com/pmndrs/zustand)** is a minimal, hook-based state management library for React. It lets you manage global state with zero boilerplate, no context providers, and excellent performance through selective state subscriptions.

## <a name="features">🔋 Features</a>

👉 **Easy & convenient auth**: Handle authentication entirely in the browser using Puter.js—no backend or setup required.

👉 **Resume upload & storage**: Let users upload and store all their resumes in one place, safely and reliably.

👉 **AI resume matching**: Provide a job listing and get an ATS score with custom feedback tailored to each resume.

👉 **Reusable, modern UI**: Built with clean, consistent components for a great-looking and maintainable interface.

👉 **Code Reusability**: Leverage reusable components and a modular codebase for efficient development.

👉 **Cross-Device Compatibility**: Fully responsive design that works seamlessly across all devices.

👉 **Modern UI/UX**: Clean, responsive design built with Tailwind CSS and shadcn/ui for a sleek user experience.

And many more, including code architecture and reusability.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/adrianhajdin/ai-resume-analyzer.git
cd ai-resume-analyzer
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the project.

## <a name="links">🔗 Assets</a>

Assets and snippets used in the project can be found in the **[video kit](https://jsm.dev/resumind-kit)**.

<a href="https://jsm.dev/resumind-kit" target="_blank">
  <img src="public/readme/videokit.webp" alt="Video Kit Banner">
</a>

## <a name="more">🚀 More</a>

**Advance your skills with Next.js Pro Course**

Enjoyed creating this project? Dive deeper into our PRO courses for a richer learning adventure. They're packed with
detailed explanations, cool features, and exercises to boost your skills. Give it a go!

<a href="https://jsm.dev/resumind-courses" target="_blank">
  <img src="public/readme/jsmpro.webp" alt="Project Banner">
</a>
# ai-resume-analyzer
# resume-analyzer

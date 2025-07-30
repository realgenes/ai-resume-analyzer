# AI Resume Analyzer

An intelligent resume analysis tool that provides ATS scores and improvement recommendations using Google Gemini AI.

## 🚀 Features

- **ATS Score Analysis**: Get detailed scores on how well your resume performs with Applicant Tracking Systems
- **AI-Powered Feedback**: Receive personalized improvement suggestions using Google Gemini AI
- **PDF Processing**: Upload and analyze PDF resumes with automatic text extraction using Gemini Vision
- **Secure Storage**: Cloud storage integration with Supabase
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **Multi-Provider Support**: Ready for integration with OpenAI, Anthropic Claude, and Hugging Face

## 🛠️ Tech Stack

- **Frontend**: React, React Router v7, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini (text analysis and vision)
- **Database**: Supabase with Row Level Security
- **File Processing**: PDF.js, Gemini Vision API
- **Build Tool**: Vite
- **State Management**: Zustand
- **Deployment**: Docker support included

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key (free tier available)

## ⚡ Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/realgenes/ai-resume-analyzer.git
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

# Optional: Other AI Providers
# VITE_OPENAI_API_KEY=your_openai_key
# VITE_ANTHROPIC_API_KEY=your_anthropic_key
# VITE_HUGGINGFACE_API_KEY=your_huggingface_key
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
│   │   ├── Summary.tsx       # Resume score summary
│   │   ├── Details.tsx       # Detailed feedback
│   │   ├── ATS.tsx          # ATS analysis
│   │   ├── FileUploader.tsx # PDF upload component
│   │   └── ...              # Other components
│   ├── lib/           # Utility functions and services
│   │   ├── ai.ts            # AI service integration
│   │   ├── supabase.ts      # Database configuration
│   │   ├── pdf2img.ts       # PDF processing
│   │   └── ...              # Other utilities
│   ├── routes/        # Application routes
│   └── root.tsx       # Root component
├── constants/         # Application constants
├── public/           # Static assets
├── types/            # TypeScript type definitions
└── supabase-schema.sql  # Database schema
```

## 🎯 How It Works

1. **Upload Resume**: Users upload their PDF resume
2. **AI Analysis**: Google Gemini analyzes the resume content and structure
3. **Score Generation**: Calculate ATS compatibility and overall scores
4. **Feedback**: Provide detailed recommendations for improvement
5. **Storage**: Securely store resumes and analysis results

## 🔒 Security Features

- Environment variables for sensitive API keys
- Supabase Row Level Security (RLS) enabled
- Client-side validation and secure file handling
- API key rotation support
- `.env.local` excluded from version control

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are properly set
2. Ensure your Google Gemini API key is valid and has sufficient quota
3. Verify your Supabase database is properly configured
4. Check the browser console for any error messages

For additional help, please open an issue in the GitHub repository.

## � Acknowledgments

- Google Gemini for AI capabilities
- Supabase for backend services
- React and Vite for the development framework

---

**Built with ❤️ by Shishupal**
# ai-resume-analyzer

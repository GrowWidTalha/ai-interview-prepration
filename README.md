# 🎙️ AI-Based Interview Prep Platform

Welcome to the voice-driven AI interview prep platform! 🚀 Designed to simulate real-world interview scenarios, this tool helps you sharpen technical knowledge, polish sales pitches, and practice spoken English — all through natural voice interactions powered by VAPI AI.

## 🔍 Overview

When I first built the backend in JavaScript, it was a fun prototype. But for a **new challenge**, I rewrote the some backend in **Python** using **FastAPI**. This rewrite not only improved performance and maintainability but also deepened my Python skills and improved agents performance.



**Live frontend URL**: [https://prepai.talhaali.xyz/](https://prepai.talhaali.xyz/dashboard)

**Live Backend API**: [https://interview-platform-backend-production.up.railway.app/](https://interview-platform-backend-production.up.railway.app/api/v1)

## 🛠️ Features

* **🤖 Voice-Based Interview Agent**

  * Powered by VAPI AI for smooth, real-time voice prompts and feedback.
* **💻 Technical Interviews** (✅ ENABLED)

  * Tackle coding, algorithm, and system design questions.
* **📞 Sales Call Interviews** (🚧 DISABLED)

  * Role-play sales pitches, objection handling, and closing techniques. *(Coming back in a future update!)*
* **🗣️ English Prep Interviews** (🚧 DISABLED)

  * Practice fluency, vocabulary, and pronunciation for confident conversation. *(Reactivating soon!)*

> The **Sales Call** and **English Prep** modes worked flawlessly in the old JavaScript backend but are temporarily paused due to limited time resources. Stay tuned — they’ll be back stronger!

## 🔧 Tech Stack

* **Frontend**: Next.js, Tailwind CSS, ShadCN UI
* **Database & ORM**: PostgreSQL, Prisma
* **Backend**: Python, FastAPI, OpenAI Agents SDK
* **Voice AI**: VAPI AI

## 🚀 Getting Started

### Prerequisites

* **Node.js ≥ 18.x**
* **Python ≥ 3.10**
* **PostgreSQL ≥ 13**

### Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/GrowWidTalha/ai-interview-prepration
   cd ai-interview-prepration
   ```

2. **Setup Backend (Python)**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate    # Windows
   pip install -r requirements.txt
   cp .env.example .env       # Add DB URL & API keys
   alembic upgrade head       # Run migrations
   uvicorn main:app --reload  # Start server
   ```

3. **Setup Frontend (Next.js)**

   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL
   npm run dev                        # Start dev server
   ```

## 🎯 Usage

1. Visit `http://localhost:3000` in your browser.
2. Choose an interview mode (Technical is active; others coming soon!).
3. Allow microphone access for voice interaction.
4. Engage with the AI — speak, listen, and receive instant feedback! 🎧

## 📅 Future Roadmap

* 🔄 **Re-enable Sales Call & English Prep** modes with new question banks.
* 🌐 **Multi-language support** for non-English interviews.
* 🔒 **User authentication** and **progress tracking** dashboards.
* 📊 **Analytics**: Export performance reports and track improvements.
* 🤝 **Community features**: Peer review and shared mock sessions.

## 🤝 Contributing

Your contributions & feedback are welcome! Please open an issue or PR to:

* Report bugs 🐞
* Suggest new question categories 💡
* Improve UI/UX 🎨

## 📄 License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

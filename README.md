# 🤖 AI Resume Analyzer

> An intelligent resume analysis tool that matches your resume against job descriptions using AI-powered scoring and provides actionable improvement suggestions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Groq](https://img.shields.io/badge/Groq-API-purple.svg)](https://console.groq.com)

---

## ✨ Features

- 📄 **Multi-format Resume Upload** – Supports PDF, DOCX, and TXT files
- 🔍 **AI-Powered Analysis** – Uses Groq's Llama 3.3 70B for intelligent scoring
- 📊 **Detailed Scoring** – Overall match, JD match, Technical, Experience, Education, and Clarity scores
- 🎯 **Skill Gap Analysis** – Identifies matched and missing skills
- 💡 **Actionable Suggestions** – Get personalized improvement recommendations
- ✏️ **Resume Editor** – Edit your resume directly in the browser
- 🔄 **Auto Re-analysis** – Add missing skills and watch your score improve automatically
- ⭐ **User Rating System** – Rate each analysis (1-5 stars) with submit button
- 🎨 **Modern UI** – Clean, professional interface with glass-morphism design
- 📱 **Responsive** – Works on desktop, tablet, and mobile devices

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Groq API Key](https://console.groq.com) (free, no credit card required)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer

# Install dependencies
npm install

# Create .env file and add your Groq API key
echo "GROQ_API_KEY=your-groq-key-here" > .env
echo "PORT=3000" >> .env

# Start the server
node server.js

# Screenshot
<img width="1440" height="713" alt="Screenshot 2026-08-15 at 9 29 28 PM" src="https://github.com/user-attachments/assets/2fc5b87a-187d-4080-9bef-1021ff96be5b" />
<img width="1440" height="715" alt="Screenshot 2026-08-15 at 9 29 09 PM" src="https://github.com/user-attachments/assets/1567e321-4542-4244-b581-efb986dbc5c6" />
<img width="1440" height="715" alt="Screenshot 2026-08-15 at 9 15 33 PM" src="https://github.com/user-attachments/assets/8ea4138e-6c0a-4352-99f1-6db09d85a5f6" />



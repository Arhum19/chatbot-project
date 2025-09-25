# 💬 Arhum's AI Chat

A modern, feature-rich chatbot powered by Google's Gemini AI with a beautiful, responsive interface and advanced chat management capabilities.

![Chatbot Demo](https://img.shields.io/badge/Status-Production%20Ready-green)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Conversations**: Integrated with Google Gemini AI for intelligent responses
- 💬 **Real-time Streaming**: Messages appear character by character for natural conversation flow
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX**: Clean, professional interface with smooth animations

### Advanced Features
- 🌙 **Dark/Light Theme**: Toggle between dark and light modes with persistent preferences
- 📚 **Multi-Chat Sessions**: Create, manage, and switch between multiple chat conversations
- 📋 **Message Management**: Copy individual messages with one click
- ⏰ **Message Timestamps**: Track when each message was sent
- 🗂️ **Chat History**: Persistent chat storage with session management
- 🗑️ **Smart Cleanup**: Clear individual chats or all chat history

### User Experience
- 🔄 **Session Persistence**: Your conversations are saved locally and restored on return
- 📱 **Mobile Optimized**: Touch-friendly interface with mobile-specific optimizations
- ⚡ **Fast Performance**: Optimized loading and responsive interactions
- 🎯 **Intuitive Navigation**: Easy-to-use sidebar and dropdown menus

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini AI API key
- Vercel CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install @google/generative-ai
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run locally**
   ```bash
   vercel dev --listen 3001
   ```

5. **Open in browser**
   Navigate to `http://localhost:3001`

## 📁 Project Structure

```
chatbot/
├── api/
│   └── chat.js              # Serverless API endpoint for AI chat
├── public/
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Complete styling and themes
│   └── script.js           # Frontend JavaScript logic
├── .env                    # Environment variables (not in repo)
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

## 🛠️ Configuration

### API Configuration
The chatbot uses Google's Gemini AI API. Configure your API key in the `.env` file:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Customization Options

#### Themes
- Modify CSS variables in `styles.css` to customize colors
- Themes are automatically saved in localStorage

#### AI Behavior
- Adjust AI parameters in `api/chat.js`
- Modify system prompts and response handling

#### Features
- Enable/disable features by modifying the JavaScript in `script.js`
- Customize UI elements in `index.html`

## 🎨 UI Components

### Header Controls
- **New Chat** (➕): Start a fresh conversation
- **Chat History** (◈): View and manage all chat sessions
- **Theme Toggle** (🌙/☀️): Switch between dark and light modes
- **Menu** (⋯): Access additional options

### Chat Management
- **Multi-Session Support**: Each chat gets a unique ID and title
- **Session Switching**: Click any chat in history to load it
- **Auto-Naming**: Chats are automatically titled based on first message
- **Deletion Options**: Remove individual chats or clear all history

### Mobile Features
- **Responsive Design**: Optimized layout for small screens
- **Touch-Friendly**: Larger buttons and improved touch targets
- **Mobile Sidebar**: Slide-out chat history with overlay
- **Visible Controls**: Delete buttons always visible on mobile

## 🔧 Technical Details

### Frontend Technologies
- **Vanilla JavaScript**: No frameworks, pure performance
- **CSS3**: Modern styling with variables and animations
- **HTML5**: Semantic, accessible markup
- **Local Storage**: Client-side data persistence

### Backend Technologies
- **Vercel Serverless**: Functions for API handling
- **Google Gemini AI**: Advanced language model integration
- **Streaming Responses**: Real-time message delivery

### Performance Optimizations
- **Lazy Loading**: Efficient resource management
- **Debounced Inputs**: Optimized user interaction handling
- **Cached Responses**: Smart caching for better performance
- **Minified Assets**: Optimized file sizes

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   In your Vercel dashboard, add your `GEMINI_API_KEY`

### Alternative Deployment Options
- **Netlify**: Compatible with serverless functions
- **Railway**: Full-stack deployment option
- **Heroku**: Traditional hosting with custom setup

## 🔒 Privacy & Security

- **Local Storage**: All chat data is stored locally in your browser
- **No Data Collection**: No personal information is sent to external servers
- **API Security**: Environment variables protect your API keys
- **Secure Communications**: HTTPS encryption for all API calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Bug fixes
- Feature enhancements
- UI/UX improvements
- Documentation updates
- Performance optimizations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the powerful language model
- **Vercel** for excellent serverless deployment platform
- **Contributors** who helped improve this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Review the documentation above

## 🔄 Version History

### Current Version
- ✅ Multi-chat session management
- ✅ Real-time streaming responses
- ✅ Dark/light theme toggle
- ✅ Message timestamps and copying
- ✅ Responsive mobile design
- ✅ Chat history with persistent storage

---

**Made with ❤️ by Arhum** | *Powered by Google Gemini AI*
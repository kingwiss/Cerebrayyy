# 🧠 Cerebray - Brain Training & Educational Games Platform

A comprehensive web application featuring brain training games, educational content, and premium subscription functionality with integrated payment processing.

## ✨ Features

### 🎮 Games & Activities
- **Classic Games**: Chess, Tetris, Snake, Pac-Man, Breakout, and more
- **Brain Training**: Memory games, puzzles, riddles, and cognitive challenges
- **Educational Content**: Trivia, word searches, crosswords, and learning modules
- **Premium Games**: Advanced games and exclusive content for premium subscribers

### 🔐 User Management
- **Authentication**: Secure login/signup with Appwrite backend
- **Password Reset**: Branded email templates for password recovery
- **Email Verification**: Professional onboarding email system
- **User Profiles**: Personalized experience and progress tracking

### 💳 Premium Subscription System
- **Stripe Integration**: Secure payment processing
- **Tier Management**: Free and Premium user tiers
- **Access Control**: Premium-only content and features
- **Subscription Management**: Automated billing and user upgrades

### 📧 Email System
- **Custom Branding**: Professional Cerebray-branded email templates
- **Multiple Templates**: Password reset, email verification, welcome emails
- **Responsive Design**: Mobile-optimized email layouts
- **Security Features**: Expiration times and security tips

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface with gradient themes
- **Mobile Responsive**: Optimized for all device sizes
- **Premium UI**: Dynamic interface updates based on subscription status
- **Footer Navigation**: Privacy Policy and Terms of Service pages

## 🚀 Quick Start

### 📋 Prerequisites
- Git installed on your system
- Node.js (v14 or higher)
- GitHub account
- Appwrite account and project
- Stripe account for payments

### 🔧 GitHub Setup (First Time)

**Option 1: Use the automated setup script**
1. Double-click `setup-git.bat` (Windows)
2. Follow the prompts to enter your GitHub username
3. The script will handle the entire upload process

**Option 2: Manual setup**
1. Create a new repository on GitHub named "Cerebray"
2. **DO NOT** initialize with README, .gitignore, or license
3. Run these commands in your terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Complete Cerebray application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Cerebray.git
   git push -u origin main
   ```

### 💻 Local Development Setup

1. **Clone your repository** (if working from GitHub)
   ```bash
   git clone https://github.com/YOUR_USERNAME/Cerebray.git
   cd Cerebray
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual API keys
   # - Stripe keys from your Stripe dashboard
   # - ElevenLabs API key
   # - Other service keys as needed
   ```

4. **Configure Services**
   - **Appwrite**: Follow instructions in `APPWRITE_EMAIL_SETUP.md`
   - **Stripe**: Follow instructions in `STRIPE_PAYMENT_README.md`

5. **Start development server**
   ```bash
   # Option 1: Python server
   python -m http.server 8000
   
   # Option 2: Node.js server
   node server.js
   
   # Option 3: Stripe payment server
   node stripe-payment-server.js
   ```

6. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📁 Project Structure

```
cerebray/
├── index.html                 # Main application entry point
├── script.js                  # Core application logic
├── styles.css                 # Main stylesheet
├── auth-modal.js              # Authentication functionality
├── premium-games.js           # Premium game implementations
├── user-tier-manager.js       # User subscription management
├── stripe-payment.js          # Payment processing
├── email-templates/           # Branded email templates
│   ├── password-reset-template.html
│   ├── email-verification-template.html
│   └── welcome-email-template.html
├── images/                    # Game and UI assets
├── privacy-policy.html        # Privacy policy page
├── terms-of-service.html      # Terms of service page
└── docs/                      # Documentation
    ├── APPWRITE_EMAIL_SETUP.md
    ├── STRIPE_PAYMENT_README.md
    └── CEREBRAY_EMAIL_BRANDING_GUIDE.md
```

## 🔧 Configuration

### Environment Setup
1. **Appwrite Configuration**
   - Project ID
   - API Endpoint
   - Database ID
   - Collection IDs

2. **Stripe Configuration**
   - Publishable Key
   - Secret Key (server-side)
   - Webhook endpoints

3. **Email Configuration**
   - SMTP settings
   - Email templates
   - Branding customization

### Key Files
- `script.js` - Main application logic and game implementations
- `auth-modal.js` - User authentication and session management
- `premium-games.js` - Premium content and game logic
- `stripe-payment.js` - Payment processing and subscription handling
- `user-tier-manager.js` - User tier and subscription management

## 🎮 Games Included

### Free Games
- Tic Tac Toe
- Memory Game
- Basic Trivia
- Simple Puzzles

### Premium Games
- Advanced Chess with AI
- Complex Strategy Games
- Educational Modules
- Exclusive Brain Training Content

## 💡 Key Features

### Payment System
- Secure Stripe integration
- Real-time payment processing
- Automatic user tier upgrades
- Subscription management

### User Experience
- Seamless premium upgrades
- Persistent login sessions
- Progress tracking
- Responsive design

### Security
- Server-side payment validation
- Secure authentication
- Protected premium content
- Transaction logging

## 📧 Email Templates

Professional, branded email templates for:
- Password reset requests
- Email verification
- Welcome messages
- Subscription confirmations

All templates feature:
- Cerebray branding and colors
- Mobile-responsive design
- Security best practices
- Professional styling

## 🛠️ Development

### Adding New Games
1. Create game logic in appropriate JS file
2. Add game assets to `images/` directory
3. Update game selection interface
4. Configure premium/free access level

### Customizing Email Templates
1. Edit templates in `email-templates/` directory
2. Follow branding guidelines in `CEREBRAY_EMAIL_BRANDING_GUIDE.md`
3. Test templates in Appwrite console
4. Update subject lines and content as needed

### Payment Integration
1. Configure Stripe webhooks
2. Update payment processing logic
3. Test with Stripe test cards
4. Implement subscription management

## 📚 Documentation

- **[Email Setup Guide](APPWRITE_EMAIL_SETUP.md)** - Complete Appwrite email configuration
- **[Payment Setup Guide](STRIPE_PAYMENT_README.md)** - Stripe integration instructions
- **[Email Branding Guide](CEREBRAY_EMAIL_BRANDING_GUIDE.md)** - Email template customization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review setup guides for Appwrite and Stripe
- Open an issue for bugs or feature requests

## 🎯 Roadmap

- [ ] Additional premium games
- [ ] Advanced analytics dashboard
- [ ] Social features and leaderboards
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced AI opponents

---

**Cerebray** - Empowering minds through engaging brain training and educational games! 🧠✨
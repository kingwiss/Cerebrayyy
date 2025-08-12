# 🧠 Cerebray Email Branding Guide

## Overview
This guide provides comprehensive instructions for implementing consistent Cerebray branding across all email communications sent through Appwrite.

## 🎨 Brand Identity Elements

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Blue**: `#667eea`
- **Secondary Purple**: `#764ba2`
- **Text Colors**:
  - Primary: `#333333`
  - Secondary: `#555555`
  - Muted: `#6c757d`
- **Background Colors**:
  - Main: `#ffffff`
  - Light: `#f8f9fa`
  - Accent: `#f5f7fa`

### Typography
- **Font Family**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Brand Name**: Font size `2.5rem`, weight `800`
- **Headings**: Font sizes `1.8rem` to `1.2rem`
- **Body Text**: Font size `1rem`, line height `1.6`

### Logo & Branding
- **Brand Name**: `🧠 Cerebray`
- **Tagline**: `Brain Training & Educational Games`
- **Icon**: Brain emoji (🧠) as primary brand identifier

## 📧 Email Template Structure

### 1. Header Section
```html
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 2.5rem; font-weight: 800;">
        🧠 Cerebray
    </h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 1.1rem; opacity: 0.9;">
        Brain Training & Educational Games
    </p>
</div>
```

### 2. Content Section
- **Padding**: `40px 30px`
- **Background**: White (`#ffffff`)
- **Text Color**: `#555555`
- **Line Height**: `1.6`

### 3. Call-to-Action Button
```html
<a href="{{url}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
    [Button Text with Icon]
</a>
```

### 4. Footer Section
```html
<div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 0.9rem;">
        This email was sent by Cerebray - Brain Training Platform
    </p>
    <p style="color: #6c757d; margin: 0; font-size: 0.8rem;">
        If you have any questions, please contact our support team.
    </p>
    <div style="margin-top: 15px;">
        <p style="color: #6c757d; margin: 0; font-size: 0.8rem;">
            © 2024 Cerebray. All rights reserved.
        </p>
    </div>
</div>
```

## 📋 Email Templates Available

### 1. Password Reset Email
- **File**: `email-templates/password-reset-template.html`
- **Subject**: `🧠 Reset Your Cerebray Password`
- **Purpose**: Password recovery requests
- **Key Elements**: Security tips, expiration notice, branded CTA

### 2. Email Verification
- **File**: `email-templates/email-verification-template.html`
- **Subject**: `🧠 Verify Your Cerebray Email Address`
- **Purpose**: Account email verification
- **Key Elements**: Welcome message, verification CTA, next steps

### 3. Welcome Email
- **File**: `email-templates/welcome-email-template.html`
- **Subject**: `🎉 Welcome to Cerebray - Start Your Brain Training Journey!`
- **Purpose**: New user onboarding
- **Key Elements**: Feature highlights, getting started CTA

## ⚙️ Appwrite Configuration

### Email Service Settings
1. **From Name**: `Cerebray - Brain Training Platform`
2. **From Email**: 
   - Production: `noreply@cerebray.com`
   - Development: Your configured email with Cerebray branding

### Template Configuration Steps
1. Go to Appwrite Console → Settings → Email
2. Navigate to Templates section
3. Select the appropriate template type:
   - **Password Recovery** → Use password reset template
   - **Email Verification** → Use email verification template
   - **Welcome Email** → Use welcome template (if available)

### Subject Line Formats
- **Password Reset**: `🧠 Reset Your Cerebray Password`
- **Email Verification**: `🧠 Verify Your Cerebray Email Address`
- **Welcome**: `🎉 Welcome to Cerebray - Start Your Brain Training Journey!`

## 🎯 Best Practices

### Content Guidelines
1. **Tone**: Friendly, encouraging, professional
2. **Language**: Clear, concise, action-oriented
3. **Emojis**: Use brain (🧠), security (🔐), success (✅), celebration (🎉) emojis strategically
4. **Personalization**: Include user names when available using `{{name}}`

### Technical Guidelines
1. **Mobile Responsive**: All templates are mobile-optimized
2. **Accessibility**: High contrast colors, readable fonts
3. **Cross-Client Compatibility**: Inline CSS for maximum compatibility
4. **Loading Speed**: Optimized for fast loading

### Security Considerations
1. **Link Expiration**: Always mention link expiration times
2. **Security Tips**: Include security reminders in sensitive emails
3. **Contact Information**: Provide clear support contact methods
4. **Branding Consistency**: Maintain visual consistency to prevent phishing confusion

## 🔧 Implementation Checklist

- [ ] Configure Appwrite email service
- [ ] Set branded "From Name" and "From Email"
- [ ] Upload password reset template
- [ ] Upload email verification template
- [ ] Upload welcome email template (if needed)
- [ ] Test all email templates
- [ ] Verify mobile responsiveness
- [ ] Check spam folder delivery
- [ ] Confirm link functionality
- [ ] Validate brand consistency

## 📞 Support & Maintenance

### Regular Updates
- Review email templates quarterly
- Update copyright year annually
- Monitor email delivery rates
- Gather user feedback on email experience

### Troubleshooting
- Check Appwrite email logs for delivery issues
- Verify DNS settings for custom domains
- Test templates across different email clients
- Monitor spam folder placement

---

**Note**: All email templates are stored in the `email-templates/` directory and can be customized further based on specific business needs while maintaining the core Cerebray branding elements.
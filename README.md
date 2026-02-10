# Carlisle CCM Contractor Dashboard

A comprehensive role-based access control (RBAC) dashboard for the Carlisle Construction Materials mobile app initiative, showcasing different user roles and their specific access permissions.

## 🎯 Overview

This dashboard demonstrates how different user types interact with the Carlisle CCM mobile application:

- **Contractors**: Full job management, inspection requests, and warranty registration
- **Sales Representatives**: Customer management, analytics, and territory oversight
- **CCM Employees**: Full system administration and user management
- **Inspectors**: Inspection queue management and report completion
- **Guests**: Limited access to public product documentation

## 🚀 Features

### Role-Based Access Control
- **Dropdown role selector** for easy switching between user types
- Dynamic dashboard updates based on selected role
- Comprehensive permission management system
- Visual indicators for available/restricted features

### Dashboard Components
1. **Welcome Section**: Personalized greeting based on role
2. **Statistics Grid**: Role-specific KPIs and metrics
3. **Features Grid**: Available features with authentication requirements
4. **Recent Activity**: Timeline of recent actions
5. **Permissions Panel**: Visual representation of access rights

### Technical Features
- Responsive design (mobile, tablet, desktop)
- Keyboard shortcuts (Alt + 1-5 for role switching, Ctrl + E for export)
- Print-friendly layout
- Dark mode support
- Smooth animations and transitions
- Accessibility-focused (WCAG 2.1 compliant)

## 📁 Project Structure

```
contractor-dashboard/
├── index.html          # Main HTML structure
├── styles.css          # Comprehensive styling
├── roleConfig.js       # RBAC configuration
├── app.js             # Application logic
└── README.md          # This file
```

## 🛠️ Setup Instructions

### Option 1: Open Locally
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. No server required - runs entirely in the browser

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Open the `contractor-dashboard` folder in VS Code
3. Right-click `index.html` and select "Open with Live Server"
4. Dashboard will open at `http://localhost:5500`

### Option 3: Simple HTTP Server
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server installed)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000`

## 👥 User Roles

### Contractor
- **Access Level**: Authenticated user
- **Key Features**:
  - Job management (create, view, edit)
  - Inspection requests
  - Warranty registration via CWS
  - Assembly letters generation
  - Photo uploads
  - Offline mode support
- **Restrictions**: Cannot view all jobs or manage users

### Sales Representative
- **Access Level**: Authenticated user
- **Key Features**:
  - Customer relationship management
  - Territory job overview
  - Sales analytics and reporting
  - Lead management
  - Warranty support for contractors
- **Restrictions**: Cannot create jobs or manage system users

### CCM Employee
- **Access Level**: Administrator
- **Key Features**:
  - Full system administration
  - User management
  - All jobs visibility
  - Analytics dashboard
  - System logs and audit trails
- **Restrictions**: None (full access)

### Inspector
- **Access Level**: Authenticated user
- **Key Features**:
  - Inspection queue management
  - Report completion and submission
  - Photo capture and annotation
  - Offline inspection mode
- **Restrictions**: Cannot create jobs or register warranties

### Guest
- **Access Level**: Public (no authentication)
- **Key Features**:
  - Product documentation browsing
  - Product search
  - Contact information access
- **Restrictions**: Most features require authentication

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-blue: #2563eb;
    --success-green: #10b981;
    /* ... more variables */
}
```

### Adding New Roles
1. Add role configuration in `roleConfig.js`:

```javascript
roleConfig.newRole = {
    name: "New Role",
    description: "Role description",
    requiresAuth: true,
    features: [...],
    permissions: {...},
    stats: {...},
    recentActivity: [...]
};
```

2. Add option to dropdown in `index.html`:

```html
<option value="newRole">New Role</option>
```

### Modifying Features
Edit the `features` array for any role in `roleConfig.js`:

```javascript
features: [
    {
        id: "feature-id",
        name: "Feature Name",
        icon: "🎯",
        description: "Feature description",
        enabled: true,
        requiresAuth: true
    }
]
```

## ⌨️ Keyboard Shortcuts

- `Alt + 1`: Switch to Contractor view
- `Alt + 2`: Switch to Sales Representative view
- `Alt + 3`: Switch to CCM Employee view
- `Alt + 4`: Switch to Inspector view
- `Alt + 5`: Switch to Guest view
- `Ctrl + E`: Export dashboard data (if permitted)

## 📱 Mobile Responsiveness

The dashboard is fully responsive with breakpoints at:
- Desktop: 1400px+
- Tablet: 768px - 1399px
- Mobile: 320px - 767px

## 🔒 Security Considerations

This is a **demo/prototype** application. For production use:

1. Implement real authentication (OAuth 2.0, SAML, etc.)
2. Add server-side authorization checks
3. Use secure API endpoints
4. Implement CSRF protection
5. Add rate limiting
6. Use HTTPS only
7. Implement proper session management
8. Add audit logging

## 🔄 Integration Points

The dashboard is designed to integrate with:

- **Carlisle Warranty System (CWS)**: Warranty registration
- **CCM Inspect 2.0**: Inspection management
- **Customer Success Portal (CSP)**: Customer data
- **Assembly Letter Tool**: Document generation
- **Azure Backend**: API and data services

## 📊 Future Enhancements

Planned features:
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Data visualization charts
- [ ] Export to PDF/Excel
- [ ] Multi-language support (ES, FR-CA)
- [ ] Offline-first architecture
- [ ] Progressive Web App (PWA) capabilities
- [ ] Push notifications
- [ ] Biometric authentication integration

## 🧪 Testing

### Manual Testing Checklist
- [ ] Switch between all 5 roles
- [ ] Verify features show/hide correctly per role
- [ ] Test on mobile, tablet, and desktop viewports
- [ ] Verify keyboard shortcuts work
- [ ] Test print layout
- [ ] Check accessibility with screen reader
- [ ] Verify all animations and transitions

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 License

Copyright © 2024 Carlisle Construction Materials. All rights reserved.

## 🤝 Contributing

This is an internal Carlisle CCM project. For modifications or questions, contact the Digital Experience team.

## 📧 Support

For technical support or questions:
- Email: digitalexperience@carlisle.com
- Internal Slack: #ccm-mobile-app
- Project Lead: Hamza

## 🔗 Related Documentation

- [Carlisle CCM Mobile App Initiative](link-to-project-docs)
- [Vision 2030 Strategy](link-to-vision-2030)
- [API Documentation](link-to-api-docs)
- [Design System](link-to-design-system)

---

**Version**: 1.0.0  
**Last Updated**: February 2024  
**Author**: Carlisle Digital Experience Team

# Quick Start Guide - Carlisle CCM Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Open the Dashboard
Simply open `index.html` in your web browser. Double-click the file, or right-click and choose "Open with" → your preferred browser.

### Step 2: Switch Roles
Use the dropdown menu in the top-right corner to switch between different user roles:
- **Contractor** (Alt + 1)
- **Sales Representative** (Alt + 2)
- **CCM Employee** (Alt + 3)
- **Inspector** (Alt + 4)
- **Guest** (Alt + 5)

### Step 3: Explore Features
Watch how the dashboard changes dynamically:
- ✅ Available features for the current role
- 📊 Role-specific statistics
- 🔒 Permission levels
- 📝 Recent activity timeline

---

## 💡 Key Features to Try

### For Contractors
1. View your 12 active jobs
2. See 3 pending inspections
3. Access product documents (no login required)
4. Check warranty registration status

### For Sales Reps
1. Review territory analytics
2. View 45 active customers
3. Track 12 pending leads
4. Access sales performance metrics

### For CCM Employees
1. Access admin panel
2. Manage 1,247 total users
3. View all 356 active jobs
4. Check system uptime (99.8%)

### For Inspectors
1. View 8 assigned inspections
2. Track 3 completed today
3. Review 2 pending reports
4. Check average completion time

### For Guests
1. Browse product documents
2. Search product database
3. Access contact information
4. No login required

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Switch to Contractor |
| `Alt + 2` | Switch to Sales Rep |
| `Alt + 3` | Switch to CCM Employee |
| `Alt + 4` | Switch to Inspector |
| `Alt + 5` | Switch to Guest |
| `Ctrl + E` | Export dashboard data |

---

## 📱 Mobile Testing

To test mobile responsiveness:

1. **Chrome DevTools**: Press `F12` → Click device toggle icon
2. **Firefox**: Press `F12` → Click responsive design mode
3. **Safari**: Enable Developer Menu → Enter Responsive Design Mode

---

## 🎨 Customization Quick Reference

### Change Primary Color
Open `styles.css` and modify:
```css
--primary-blue: #2563eb;  /* Change this hex value */
```

### Add a New Feature
Open `roleConfig.js` and add to any role's `features` array:
```javascript
{
    id: "new-feature",
    name: "New Feature",
    icon: "🎯",
    description: "What this feature does",
    enabled: true,
    requiresAuth: true
}
```

### Modify Statistics
Update the `stats` object for any role in `roleConfig.js`:
```javascript
stats: {
    customStat: "Your Value",
    anotherStat: 42
}
```

---

## 🐛 Troubleshooting

### Dashboard not loading?
- Ensure all 4 files are in the same folder: `index.html`, `styles.css`, `app.js`, `roleConfig.js`
- Try opening in a different browser
- Check browser console for errors (F12 → Console)

### Role switching not working?
- Open browser console (F12)
- Look for JavaScript errors
- Ensure `roleConfig.js` is loaded

### Styles not applying?
- Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Check that `styles.css` is in the same folder
- Verify CSS file path in `index.html`

---

## 🔗 Next Steps

1. **Read the README**: Full documentation of all features
2. **Explore roleConfig.js**: See how RBAC is configured
3. **Customize for your needs**: Modify roles, features, and permissions
4. **Deploy**: Host on your web server or cloud platform

---

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review roleConfig.js for role configuration examples
- Open browser console (F12) for debugging information

---

**Happy Exploring! 🎉**

The dashboard is designed to showcase Carlisle CCM's Vision 2030 digital transformation initiative.

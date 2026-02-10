// Main Application Logic
let currentRole = 'contractor';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeRoleSelector();
    updateDashboard(currentRole);
});

// Initialize role selector dropdown
function initializeRoleSelector() {
    const roleDropdown = document.getElementById('userRole');
    
    roleDropdown.addEventListener('change', (e) => {
        currentRole = e.target.value;
        updateDashboard(currentRole);
    });
}

// Update entire dashboard based on selected role
function updateDashboard(role) {
    const config = roleConfig[role];
    
    if (!config) {
        console.error('Invalid role:', role);
        return;
    }

    updateWelcomeSection(config);
    updateStatsSection(config);
    updateFeaturesGrid(config);
    updateActivitySection(config);
    updatePermissionsGrid(config);
    
    // Add transition animation
    document.querySelector('.dashboard').classList.add('updating');
    setTimeout(() => {
        document.querySelector('.dashboard').classList.remove('updating');
    }, 300);
}

// Update welcome section
function updateWelcomeSection(config) {
    const title = document.getElementById('welcomeTitle');
    const description = document.getElementById('welcomeDescription');
    
    title.textContent = `Welcome, ${config.name}`;
    description.textContent = '';
}

// Update statistics section
function updateStatsSection(config) {
    const statsSection = document.getElementById('statsSection');
    
    if (!config.stats) {
        statsSection.style.display = 'none';
        return;
    }
    
    statsSection.style.display = 'grid';
    
    const statCards = statsSection.querySelectorAll('.stat-card');
    const statEntries = Object.entries(config.stats);
    
    statCards.forEach((card, index) => {
        if (index < statEntries.length) {
            const [key, value] = statEntries[index];
            const countElement = card.querySelector('h3');
            const labelElement = card.querySelector('p');
            
            countElement.textContent = value;
            labelElement.textContent = formatStatLabel(key);
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Update features grid
function updateFeaturesGrid(config) {
    const featuresGrid = document.getElementById('featuresGrid');
    featuresGrid.innerHTML = '';
    
    config.features.forEach(feature => {
        const featureCard = createFeatureCard(feature);
        featuresGrid.appendChild(featureCard);
    });
}

// Create individual feature card
function createFeatureCard(feature) {
    const card = document.createElement('div');
    card.className = 'feature-card';
    if (!feature.enabled) {
        card.classList.add('disabled');
    }
    
    card.innerHTML = `
        <div class="feature-content">
            <h3>${feature.name}</h3>
            <p>${feature.description}</p>
        </div>
    `;
    
    if (feature.enabled) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            handleFeatureClick(feature);
        });
    }
    
    return card;
}

// Update activity section
function updateActivitySection(config) {
    const activitySection = document.getElementById('activitySection');
    const activityList = document.getElementById('activityList');
    
    if (!config.recentActivity || config.recentActivity.length === 0) {
        activitySection.style.display = 'none';
        return;
    }
    
    activitySection.style.display = 'block';
    activityList.innerHTML = '';
    
    config.recentActivity.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityList.appendChild(activityItem);
    });
}

// Create individual activity item
function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    item.innerHTML = `
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
            <p class="activity-action">${activity.action}</p>
            <p class="activity-date">${formatDate(activity.date)}</p>
        </div>
        <div class="activity-type">
            <span class="type-badge">${activity.type}</span>
        </div>
    `;
    
    return item;
}

// Update permissions grid
function updatePermissionsGrid(config) {
    const permissionsGrid = document.getElementById('permissionsGrid');
    // permissions panel may be intentionally removed from the DOM — skip safely
    if (!permissionsGrid) return;

    permissionsGrid.innerHTML = '';
    const permissions = config.permissions || {};

    Object.entries(permissions).forEach(([key, value]) => {
        const permissionCard = createPermissionCard(key, value);
        permissionsGrid.appendChild(permissionCard);
    });
}

// Create individual permission card
function createPermissionCard(permission, allowed) {
    const card = document.createElement('div');
    card.className = `permission-card ${allowed ? 'allowed' : 'denied'}`;
    
    const permissionLabel = formatPermissionLabel(permission);
    const icon = allowed ? '✓' : '✗';
    
    card.innerHTML = `
        <span class="permission-icon">${icon}</span>
        <span class="permission-label">${permissionLabel}</span>
    `;
    
    return card;
}

// Handle feature click
function handleFeatureClick(feature) {
    if (feature.requiresAuth && !isAuthenticated()) {
        showAuthPrompt(feature);
    } else {
        showFeatureDetail(feature);
    }
}

// Check if user is authenticated (simplified for demo)
function isAuthenticated() {
    return currentRole !== 'guest';
}

// Show authentication prompt
function showAuthPrompt(feature) {
    alert(`Authentication required to access ${feature.name}\n\nPlease log in to continue.`);
}

// Show feature detail modal
function showFeatureDetail(feature) {
    const message = `Feature: ${feature.name}\n\n${feature.description}\n\nAccess Level: ${feature.requiresAuth ? 'Requires Login' : 'Public Access'}\nStatus: ${feature.enabled ? 'Available' : 'Not Available'}`;
    alert(message);
    
    // In a real application, this would open a detailed view or navigate to the feature
    console.log('Opening feature:', feature.id);
}

// Utility function to format stat labels
function formatStatLabel(key) {
    const labels = {
        activeJobs: 'Active Jobs',
        pendingInspections: 'Pending Inspections',
        completedWarranties: 'Registered Warranties',
        documentsAccessed: 'Documents Accessed',
        activeCustomers: 'Active Customers',
        pendingLeads: 'Pending Leads',
        completedSales: 'Completed Sales',
        territoryJobs: 'Territory Jobs',
        totalUsers: 'Total Users',
        systemUptime: 'System Uptime',
        assignedInspections: 'Assigned Inspections',
        completedToday: 'Completed Today',
        pendingReports: 'Pending Reports',
        avgCompletionTime: 'Avg. Completion Time'
    };
    
    return labels[key] || key;
}

// Utility function to format permission labels
function formatPermissionLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Export data function (available for certain roles)
function exportDashboardData() {
    const config = roleConfig[currentRole];
    
    if (!config.permissions.exportData) {
        alert('You do not have permission to export data.');
        return;
    }
    
    const data = {
        role: config.name,
        stats: config.stats,
        permissions: config.permissions,
        recentActivity: config.recentActivity,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${currentRole}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + 1-5 to quickly switch roles
    if (e.altKey) {
        const roleDropdown = document.getElementById('userRole');
        const roles = ['contractor', 'sales-rep', 'ccm-employee', 'inspector', 'guest'];
        const keyNum = parseInt(e.key);
        
        if (keyNum >= 1 && keyNum <= 5) {
            roleDropdown.value = roles[keyNum - 1];
            currentRole = roles[keyNum - 1];
            updateDashboard(currentRole);
            e.preventDefault();
        }
    }
    
    // Ctrl + E to export (if permitted)
    if (e.ctrlKey && e.key === 'e') {
        exportDashboardData();
        e.preventDefault();
    }
});

// Add console helper
console.log('%cCarlisle CCM Dashboard', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('Keyboard shortcuts:');
console.log('  Alt + 1-5: Switch between roles');
console.log('  Ctrl + E: Export dashboard data (if permitted)');
console.log('\nAvailable roles:', Object.keys(roleConfig));

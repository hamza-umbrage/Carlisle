// Role-Based Access Control Configuration
const roleConfig = {
    contractor: {
        name: "Contractor",
        description: "Full access to job management, inspections, and warranty registration",
        requiresAuth: true,
        features: [
            {
                id: "product-docs",
                name: "Product Documents",
                icon: "📚",
                description: "Access technical datasheets, installation guides, and product specifications",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "job-management",
                name: "Job Management",
                icon: "🏗️",
                description: "Create, view, and manage your construction jobs",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-request",
                name: "Request Inspections",
                icon: "🔍",
                description: "Submit inspection requests and track their status",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-registration",
                name: "Warranty Registration",
                icon: "✅",
                description: "Register warranties through CWS system",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "assembly-letters",
                name: "Assembly Letters",
                icon: "📝",
                description: "Generate and download assembly letters",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "ccm-communication",
                name: "Contact CCM",
                icon: "💬",
                description: "Communicate with Carlisle team members",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "photo-upload",
                name: "Photo Upload",
                icon: "📸",
                description: "Upload job site photos and documentation",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "offline-mode",
                name: "Offline Access",
                icon: "📱",
                description: "Work offline and sync when connected",
                enabled: true,
                requiresAuth: true
            }
        ],
        permissions: {
            viewProductDocs: true,
            createJobs: true,
            editOwnJobs: true,
            deleteOwnJobs: true,
            requestInspections: true,
            registerWarranties: true,
            uploadPhotos: true,
            downloadDocuments: true,
            contactCCM: true,
            viewOwnData: true,
            viewAllJobs: false,
            manageUsers: false,
            viewAnalytics: false,
            exportData: true
        },
        stats: {
            activeJobs: 12,
            pendingInspections: 3,
            completedWarranties: 28,
            documentsAccessed: 156
        },
        recentActivity: [
            { type: "inspection", action: "Requested inspection for Job #2024-0156", date: "2024-02-08", icon: "🔍" },
            { type: "warranty", action: "Registered warranty for Roof System Installation", date: "2024-02-07", icon: "✅" },
            { type: "document", action: "Downloaded TPO Installation Guide", date: "2024-02-06", icon: "📚" },
            { type: "job", action: "Created new job: Commercial Building Reroof", date: "2024-02-05", icon: "🏗️" }
        ]
    },

    "sales-rep": {
        name: "Sales Representative",
        description: "Manage customer relationships, view analytics, and support contractors",
        requiresAuth: true,
        features: [
            {
                id: "product-docs",
                name: "Product Documents",
                icon: "📚",
                description: "Access all product documentation and marketing materials",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "customer-management",
                name: "Customer Management",
                icon: "👥",
                description: "View and manage customer accounts",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "job-overview",
                name: "Job Overview",
                icon: "📊",
                description: "View jobs in your territory",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-tracking",
                name: "Inspection Tracking",
                icon: "🔍",
                description: "Track inspection requests and status",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-support",
                name: "Warranty Support",
                icon: "✅",
                description: "Assist contractors with warranty registration",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "sales-analytics",
                name: "Sales Analytics",
                icon: "📈",
                description: "View sales metrics and performance data",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "lead-management",
                name: "Lead Management",
                icon: "🎯",
                description: "Track and manage sales leads",
                enabled: true,
                requiresAuth: true
            }
        ],
        permissions: {
            viewProductDocs: true,
            createJobs: false,
            editOwnJobs: false,
            deleteOwnJobs: false,
            requestInspections: false,
            registerWarranties: true,
            uploadPhotos: true,
            downloadDocuments: true,
            contactCCM: true,
            viewOwnData: true,
            viewAllJobs: true,
            manageUsers: false,
            viewAnalytics: true,
            exportData: true
        },
        stats: {
            activeCustomers: 45,
            pendingLeads: 12,
            completedSales: 38,
            territoryJobs: 89
        },
        recentActivity: [
            { type: "customer", action: "Met with ABC Construction for new project", date: "2024-02-08", icon: "👥" },
            { type: "lead", action: "Qualified new lead: Downtown Office Complex", date: "2024-02-07", icon: "🎯" },
            { type: "analytics", action: "Reviewed Q1 territory performance", date: "2024-02-06", icon: "📈" },
            { type: "support", action: "Assisted contractor with warranty registration", date: "2024-02-05", icon: "✅" }
        ]
    },

    "ccm-employee": {
        name: "CCM Employee",
        description: "Full system access for internal Carlisle team members",
        requiresAuth: true,
        features: [
            {
                id: "product-docs",
                name: "Product Documents",
                icon: "📚",
                description: "Full access to all product documentation",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "admin-panel",
                name: "Admin Panel",
                icon: "⚙️",
                description: "System administration and configuration",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "user-management",
                name: "User Management",
                icon: "👥",
                description: "Manage user accounts and permissions",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "all-jobs",
                name: "All Jobs",
                icon: "🏗️",
                description: "View and manage all jobs in the system",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-management",
                name: "Inspection Management",
                icon: "🔍",
                description: "Manage all inspection requests and assignments",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-admin",
                name: "Warranty Administration",
                icon: "✅",
                description: "Full warranty system administration",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "analytics-dashboard",
                name: "Analytics Dashboard",
                icon: "📊",
                description: "Comprehensive business intelligence and reporting",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "system-logs",
                name: "System Logs",
                icon: "📋",
                description: "View system activity and audit logs",
                enabled: true,
                requiresAuth: true
            }
        ],
        permissions: {
            viewProductDocs: true,
            createJobs: true,
            editOwnJobs: true,
            deleteOwnJobs: true,
            requestInspections: true,
            registerWarranties: true,
            uploadPhotos: true,
            downloadDocuments: true,
            contactCCM: true,
            viewOwnData: true,
            viewAllJobs: true,
            manageUsers: true,
            viewAnalytics: true,
            exportData: true
        },
        stats: {
            totalUsers: 1247,
            activeJobs: 356,
            pendingInspections: 43,
            systemUptime: "99.8%"
        },
        recentActivity: [
            { type: "admin", action: "Updated system configuration", date: "2024-02-08", icon: "⚙️" },
            { type: "user", action: "Approved 3 new contractor accounts", date: "2024-02-07", icon: "👥" },
            { type: "analytics", action: "Generated monthly performance report", date: "2024-02-06", icon: "📊" },
            { type: "system", action: "Completed system backup", date: "2024-02-05", icon: "📋" }
        ]
    },

    inspector: {
        name: "Inspector",
        description: "Manage and complete field inspections",
        requiresAuth: true,
        features: [
            {
                id: "product-docs",
                name: "Product Documents",
                icon: "📚",
                description: "Access installation standards and guidelines",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "inspection-queue",
                name: "Inspection Queue",
                icon: "📋",
                description: "View and manage assigned inspections",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-reports",
                name: "Inspection Reports",
                icon: "📝",
                description: "Complete and submit inspection reports",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "job-details",
                name: "Job Details",
                icon: "🏗️",
                description: "View detailed job information",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "photo-capture",
                name: "Photo Capture",
                icon: "📸",
                description: "Capture and annotate inspection photos",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "offline-inspections",
                name: "Offline Inspections",
                icon: "📱",
                description: "Complete inspections offline and sync later",
                enabled: true,
                requiresAuth: true
            }
        ],
        permissions: {
            viewProductDocs: true,
            createJobs: false,
            editOwnJobs: false,
            deleteOwnJobs: false,
            requestInspections: false,
            registerWarranties: false,
            uploadPhotos: true,
            downloadDocuments: true,
            contactCCM: true,
            viewOwnData: true,
            viewAllJobs: false,
            manageUsers: false,
            viewAnalytics: false,
            exportData: false
        },
        stats: {
            assignedInspections: 8,
            completedToday: 3,
            pendingReports: 2,
            avgCompletionTime: "2.5 hrs"
        },
        recentActivity: [
            { type: "inspection", action: "Completed inspection for Job #2024-0145", date: "2024-02-08", icon: "✅" },
            { type: "inspection", action: "Started inspection at 123 Main Street", date: "2024-02-08", icon: "🔍" },
            { type: "report", action: "Submitted inspection report with photos", date: "2024-02-07", icon: "📝" },
            { type: "inspection", action: "Assigned to new inspection in Zone 3", date: "2024-02-07", icon: "📋" }
        ]
    },

    guest: {
        name: "Guest",
        description: "Limited access to public product information",
        requiresAuth: false,
        features: [
            {
                id: "product-docs",
                name: "Product Documents",
                icon: "📚",
                description: "Browse product catalogs and basic specifications",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "product-search",
                name: "Product Search",
                icon: "🔍",
                description: "Search product database",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "contact-info",
                name: "Contact Information",
                icon: "📞",
                description: "Find Carlisle representatives",
                enabled: true,
                requiresAuth: false
            }
        ],
        permissions: {
            viewProductDocs: true,
            createJobs: false,
            editOwnJobs: false,
            deleteOwnJobs: false,
            requestInspections: false,
            registerWarranties: false,
            uploadPhotos: false,
            downloadDocuments: true,
            contactCCM: false,
            viewOwnData: false,
            viewAllJobs: false,
            manageUsers: false,
            viewAnalytics: false,
            exportData: false
        },
        stats: null,
        recentActivity: []
    }
};

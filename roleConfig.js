// Role-Based Access Control Configuration
const roleConfig = {
    contractor: {
        name: "Contractor",
        description: "Full access to job management, inspections, and warranty registration",
        requiresAuth: true,
        features: [
            {
                id: "job-management",
                name: "Job Management",
                description: "Create, view, and manage all your construction jobs in one place. Track project timelines, update job status, assign crew members, and monitor progress from planning through completion.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-request",
                name: "Request Inspections",
                description: "Submit inspection requests directly to Carlisle field inspectors. Schedule pre-installation, mid-installation, and final inspections, and receive real-time status updates as they are processed.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-registration",
                name: "Warranty Registration",
                description: "Register product warranties through the Carlisle Warranty System (CWS). Submit completed job details, select warranty coverage levels up to 30 years, and download warranty certificates.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "assembly-letters",
                name: "Assembly Letters",
                description: "Generate assembly letters for your roofing projects. Select from approved Carlisle system assemblies, customize specifications for your job, and download PDF documents ready for submittal.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "ccm-communication",
                name: "Contact CCM",
                description: "Reach your Carlisle Construction Materials representative directly. Send messages, request technical support, schedule site visits, and get answers on product specifications or installation questions.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "offline-mode",
                name: "Offline Access",
                description: "Access critical job information, product documents, and inspection checklists without an internet connection. All changes sync automatically when connectivity is restored.",
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
            completedWarranties: 28
        },
        recentActivity: [
            { type: "inspection", action: "Requested inspection for Job #2024-0156", date: "2024-02-08", icon: "inspection" },
            { type: "warranty", action: "Registered warranty for Roof System Installation", date: "2024-02-07", icon: "warranty" },
            { type: "document", action: "Downloaded TPO Installation Guide", date: "2024-02-06", icon: "document" },
            { type: "job", action: "Created new job: Commercial Building Reroof", date: "2024-02-05", icon: "job" }
        ]
    },

    "sales-rep": {
        name: "Sales Representative",
        description: "Manage customer relationships, view analytics, and support contractors",
        requiresAuth: true,
        features: [
            {
                id: "customer-management",
                name: "Customer Management",
                description: "Maintain a complete view of your contractor accounts. Track contact details, job history, purchase volume, and account status. Set follow-up reminders and log meeting notes.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "job-overview",
                name: "Job Overview",
                description: "Monitor all active and upcoming jobs across your sales territory. Filter by contractor, product type, or status to identify opportunities for support and upselling.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-tracking",
                name: "Inspection Tracking",
                description: "Stay informed on inspection requests and outcomes for jobs in your territory. View scheduled dates, inspector assignments, pass/fail results, and any follow-up actions needed.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-support",
                name: "Warranty Support",
                description: "Help contractors navigate the warranty registration process. Review submitted applications, check for missing documentation, and escalate issues to the warranty administration team.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "sales-analytics",
                name: "Sales Analytics",
                description: "View detailed performance metrics including revenue by product line, quota attainment, conversion rates, and territory comparisons. Export reports for quarterly business reviews.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "lead-management",
                name: "Lead Management",
                description: "Track and prioritize sales leads from initial contact through close. Log outreach activities, set pipeline stages, estimate deal values, and forecast quarterly revenue.",
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
            { type: "customer", action: "Met with ABC Construction for new project", date: "2024-02-08", icon: "customer" },
            { type: "lead", action: "Qualified new lead: Downtown Office Complex", date: "2024-02-07", icon: "lead" },
            { type: "analytics", action: "Reviewed Q1 territory performance", date: "2024-02-06", icon: "analytics" },
            { type: "support", action: "Assisted contractor with warranty registration", date: "2024-02-05", icon: "support" }
        ]
    },

    "ccm-employee": {
        name: "CCM Employee",
        description: "Full system access for internal Carlisle team members",
        requiresAuth: true,
        features: [
            {
                id: "admin-panel",
                name: "Admin Panel",
                description: "Configure system-wide settings including notification rules, approval workflows, regional assignments, and integration parameters. Manage feature flags and deployment settings.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "user-management",
                name: "User Management",
                description: "Create, edit, and deactivate user accounts across all roles. Assign permissions, reset credentials, review access logs, and approve new contractor and inspector registrations.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "all-jobs",
                name: "All Jobs",
                description: "Full visibility into every job across all contractors and regions. Search, filter, and drill into any project. Reassign inspectors, override statuses, and resolve escalated issues.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-management",
                name: "Inspection Management",
                description: "Oversee the entire inspection pipeline. Assign inspectors to requests, manage scheduling conflicts, review submitted reports, and track inspector workload and performance metrics.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "warranty-admin",
                name: "Warranty Administration",
                description: "Full control over warranty processing. Approve or reject applications, issue warranty certificates, manage claims, and generate compliance reports for auditing purposes.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "analytics-dashboard",
                name: "Analytics Dashboard",
                description: "Comprehensive business intelligence across all operations. View KPIs for jobs, inspections, warranties, and sales. Generate custom reports, set alerts, and track trends over time.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "system-logs",
                name: "System Logs",
                description: "Monitor all system activity with detailed audit trails. Track user logins, data changes, API calls, and error events. Filter by date range, user, or action type for compliance reviews.",
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
            { type: "admin", action: "Updated system configuration", date: "2024-02-08", icon: "admin" },
            { type: "user", action: "Approved 3 new contractor accounts", date: "2024-02-07", icon: "user" },
            { type: "analytics", action: "Generated monthly performance report", date: "2024-02-06", icon: "analytics" },
            { type: "system", action: "Completed system backup", date: "2024-02-05", icon: "system" }
        ]
    },

    inspector: {
        name: "Inspector",
        description: "Manage and complete field inspections",
        requiresAuth: true,
        features: [
            {
                id: "inspection-queue",
                name: "Inspection Queue",
                description: "View all inspections assigned to you, sorted by priority and scheduled date. Accept or reschedule assignments, see job location details, and plan your daily route efficiently.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "inspection-reports",
                name: "Inspection Reports",
                description: "Complete detailed inspection reports with structured checklists for substrate, insulation, membrane, seams, and flashing. Attach photos, add notes, and submit for immediate processing.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "job-details",
                name: "Job Details",
                description: "Access full job specifications before arriving on site. Review the approved roofing system assembly, product specs, contractor information, square footage, and any prior inspection history.",
                enabled: true,
                requiresAuth: true
            },
            {
                id: "offline-inspections",
                name: "Offline Inspections",
                description: "Complete inspections in areas without cellular or Wi-Fi coverage. All checklists, photo uploads, and report submissions are cached locally and sync automatically once you reconnect.",
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
            { type: "inspection", action: "Completed inspection for Job #2024-0145", date: "2024-02-08", icon: "completed" },
            { type: "inspection", action: "Started inspection at 123 Main Street", date: "2024-02-08", icon: "inspection" },
            { type: "report", action: "Submitted inspection report with photos", date: "2024-02-07", icon: "report" },
            { type: "inspection", action: "Assigned to new inspection in Zone 3", date: "2024-02-07", icon: "assigned" }
        ]
    },

    guest: {
        name: "Guest",
        description: "Limited access to public product information",
        requiresAuth: false,
        features: [
            {
                id: "product-search",
                name: "Product Search",
                description: "Browse the full Carlisle product catalog including TPO, EPDM, and metal roofing systems. View technical data sheets, compare product specifications, and download public documentation.",
                enabled: true,
                requiresAuth: false
            },
            {
                id: "contact-info",
                name: "Contact Information",
                description: "Find your local Carlisle sales representative by region or zip code. View office locations, phone numbers, and email addresses. Submit a general inquiry for product or partnership questions.",
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

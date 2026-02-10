git commit -m "Update dashboard and login styling - red feature cards, white text, centered form"// Demo Data Configuration
// This file contains sample data for demonstrating the dashboard with realistic scenarios

const demoData = {
    contractors: [
        {
            id: "CNT001",
            name: "ABC Roofing Solutions",
            contact: "John Smith",
            email: "john@abcroofing.com",
            phone: "(555) 123-4567",
            activeJobs: 12,
            completedJobs: 145,
            pendingInspections: 3,
            registeredWarranties: 28,
            joinDate: "2020-03-15",
            rating: 4.8,
            specialties: ["Commercial Roofing", "TPO Installation", "EPDM Systems"]
        },
        {
            id: "CNT002",
            name: "Elite Construction Group",
            contact: "Sarah Johnson",
            email: "sarah@eliteconstruction.com",
            phone: "(555) 234-5678",
            activeJobs: 8,
            completedJobs: 89,
            pendingInspections: 2,
            registeredWarranties: 15,
            joinDate: "2021-06-20",
            rating: 4.9,
            specialties: ["Residential Roofing", "Metal Roofing", "Warranty Services"]
        }
    ],

    // Documents associated with jobs (product specs, photos, uploads)
    jobDocuments: {
        "JOB2024-0156": [
            { type: "Product Document", name: "TPO Spec Sheet.pdf", url: "docs/JOB2024-0156-tpo-spec.pdf", uploadedBy: "John Smith", uploadedAt: "2024-01-12" },
            { type: "Photo", name: "Site-Before.jpg", url: "https://via.placeholder.com/800x480?text=JOB2024-0156+Before", uploadedBy: "Foreman", uploadedAt: "2024-01-14" },
            { type: "Photo", name: "Site-Progress-01.jpg", url: "https://via.placeholder.com/800x480?text=JOB2024-0156+Progress+1", uploadedBy: "Crew", uploadedAt: "2024-02-01" }
        ],
        "JOB2024-0157": [
            { type: "Product Document", name: "Metal Panel Data.pdf", url: "docs/JOB2024-0157-metal-data.pdf", uploadedBy: "Sarah Johnson", uploadedAt: "2024-01-20" }
        ],
        "JOB2024-0158": [
            { type: "Warranty Document", name: "EPDM Warranty.pdf", url: "docs/JOB2024-0158-warranty.pdf", uploadedBy: "Admin", uploadedAt: "2024-01-29" },
            { type: "Photo", name: "Final.jpg", url: "https://via.placeholder.com/800x480?text=JOB2024-0158+Final", uploadedBy: "Inspector", uploadedAt: "2024-01-28" }
        ]
    },

    jobs: [
        {
            id: "JOB2024-0156",
            name: "Downtown Office Complex Reroof",
            contractor: "ABC Roofing Solutions",
            status: "In Progress",
            type: "Commercial",
            startDate: "2024-01-15",
            estimatedCompletion: "2024-03-30",
            squareFeet: 25000,
            products: ["TPO Membrane", "Insulation Board", "Fasteners"],
            progress: 65,
            inspections: [
                {
                    type: "Pre-Installation",
                    date: "2024-01-10",
                    status: "Completed",
                    inspector: "Mike Williams"
                },
                {
                    type: "Mid-Installation",
                    date: "2024-02-15",
                    status: "Scheduled",
                    inspector: "Mike Williams"
                }
            ]
        },
        {
            id: "JOB2024-0157",
            name: "Residential Home - Metal Roof",
            contractor: "Elite Construction Group",
            status: "Planning",
            type: "Residential",
            startDate: "2024-02-20",
            estimatedCompletion: "2024-03-15",
            squareFeet: 3500,
            products: ["Metal Roofing Panels", "Underlayment"],
            progress: 10,
            inspections: []
        },
        {
            id: "JOB2024-0158",
            name: "Warehouse Roof Repair",
            contractor: "ABC Roofing Solutions",
            status: "Completed",
            type: "Industrial",
            startDate: "2024-01-05",
            completionDate: "2024-01-28",
            squareFeet: 50000,
            products: ["EPDM Membrane", "Adhesive"],
            progress: 100,
            inspections: [
                {
                    type: "Final",
                    date: "2024-01-28",
                    status: "Passed",
                    inspector: "Lisa Chen"
                }
            ]
        }
    ],

    inspections: [
        {
            id: "INS2024-0089",
            jobId: "JOB2024-0156",
            type: "Mid-Installation",
            status: "Scheduled",
            scheduledDate: "2024-02-15",
            inspector: "Mike Williams",
            inspectorId: "INSP001",
            checklist: [
                "Substrate preparation",
                "Insulation installation",
                "Membrane application",
                "Seam integrity",
                "Flashing details"
            ]
        },
        {
            id: "INS2024-0090",
            jobId: "JOB2024-0159",
            type: "Pre-Installation",
            status: "Pending",
            scheduledDate: "2024-02-12",
            inspector: "Lisa Chen",
            inspectorId: "INSP002"
        },
        {
            id: "INS2024-0091",
            jobId: "JOB2024-0160",
            type: "Final",
            status: "In Progress",
            scheduledDate: "2024-02-09",
            inspector: "Mike Williams",
            inspectorId: "INSP001",
            notes: "Conducting final walkthrough"
        }
    ],

    warranties: [
        {
            id: "WAR2024-0234",
            jobId: "JOB2024-0158",
            registrationDate: "2024-01-30",
            warrantyType: "Total System",
            duration: "20 years",
            status: "Active",
            contractor: "ABC Roofing Solutions",
            products: ["EPDM Membrane", "Insulation", "Fasteners"],
            squareFeet: 50000
        },
        {
            id: "WAR2024-0235",
            jobId: "JOB2024-0145",
            registrationDate: "2024-02-01",
            warrantyType: "Standard",
            duration: "15 years",
            status: "Active",
            contractor: "Elite Construction Group",
            products: ["TPO Membrane"],
            squareFeet: 12000
        }
    ],

    salesReps: [
        {
            id: "SALES001",
            name: "David Martinez",
            email: "dmartinez@carlisle.com",
            phone: "(555) 345-6789",
            territory: "Northeast Region",
            customers: 45,
            activeLeads: 12,
            salesYTD: 2850000,
            quota: 3500000,
            topProducts: ["TPO Systems", "Metal Roofing", "Insulation"]
        },
        {
            id: "SALES002",
            name: "Jennifer Lee",
            email: "jlee@carlisle.com",
            phone: "(555) 456-7890",
            territory: "Southeast Region",
            customers: 38,
            activeLeads: 8,
            salesYTD: 3200000,
            quota: 3200000,
            topProducts: ["EPDM Systems", "Coatings", "Accessories"]
        }
    ],

    products: [
        {
            id: "PROD-TPO-001",
            name: "Sure-Weld TPO Membrane",
            category: "Roofing Membrane",
            description: "Premium thermoplastic polyolefin single-ply roofing membrane",
            specifications: {
                thickness: "60 mil",
                width: "10 ft",
                color: "White",
                warranty: "Up to 30 years"
            },
            documents: [
                {
                    name: "Installation Guide",
                    type: "PDF",
                    size: "2.3 MB",
                    url: "#"
                },
                {
                    name: "Technical Data Sheet",
                    type: "PDF",
                    size: "450 KB",
                    url: "#"
                },
                {
                    name: "Safety Data Sheet",
                    type: "PDF",
                    size: "320 KB",
                    url: "#"
                }
            ]
        },
        {
            id: "PROD-EPD-001",
            name: "Sure-Seal EPDM Membrane",
            category: "Roofing Membrane",
            description: "High-performance ethylene propylene diene monomer roofing system",
            specifications: {
                thickness: "45-60 mil",
                width: "10-30 ft",
                color: "Black",
                warranty: "Up to 25 years"
            },
            documents: [
                {
                    name: "Installation Manual",
                    type: "PDF",
                    size: "3.1 MB",
                    url: "#"
                },
                {
                    name: "Product Specifications",
                    type: "PDF",
                    size: "680 KB",
                    url: "#"
                }
            ]
        }
    ],

    activityTimeline: [
        {
            timestamp: "2024-02-09T14:30:00",
            type: "inspection",
            user: "Mike Williams",
            action: "Completed inspection for Job #2024-0160",
            details: "All criteria passed. Ready for warranty registration."
        },
        {
            timestamp: "2024-02-09T11:15:00",
            type: "job",
            user: "John Smith",
            action: "Created new job: Commercial Building Reroof",
            details: "25,000 sq ft TPO system installation"
        },
        {
            timestamp: "2024-02-08T16:45:00",
            type: "warranty",
            user: "Sarah Johnson",
            action: "Registered warranty for Roof System Installation",
            details: "20-year total system warranty activated"
        },
        {
            timestamp: "2024-02-08T09:30:00",
            type: "document",
            user: "John Smith",
            action: "Downloaded TPO Installation Guide",
            details: "Document accessed for job planning"
        },
        {
            timestamp: "2024-02-07T13:20:00",
            type: "inspection",
            user: "Lisa Chen",
            action: "Scheduled inspection for next Tuesday",
            details: "Pre-installation inspection for residential project"
        }
    ],

    analytics: {
        contractor: {
            avgJobCompletion: 45, // days
            onTimePercentage: 92,
            customerSatisfaction: 4.7,
            repeatCustomerRate: 68,
            inspectionPassRate: 95
        },
        salesRep: {
            conversionRate: 34,
            avgDealSize: 75000,
            customerRetention: 89,
            leadResponseTime: 2.5, // hours
            quotaAttainment: 91
        },
        system: {
            totalUsers: 1247,
            activeJobs: 356,
            completedJobsThisMonth: 89,
            pendingInspections: 43,
            registeredWarrantiesThisMonth: 67,
            avgInspectionTime: 2.5, // hours
            systemUptime: 99.8
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = demoData;
}

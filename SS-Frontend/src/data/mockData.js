export const employees = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Dev",
    team: "Engineering",
    impactScore: 92,
    activityScore: 45,
    silentArchitect: true,
    impactBreakdown: [
      { metric: "Code Reviews", score: 95, description: "Consistently reviews complex PRs, catching critical security flaws." },
      { metric: "Bug Fixes", score: 88, description: "Fixed 3 high-priority production incidents this sprint." },
      { metric: "Architecture", score: 90, description: "Designed the new scalable event bus system." },
      { metric: "Feature Delivery", score: 85, description: "Delivered core payment integration on time." }
    ]
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Product Lead",
    team: "Product",
    impactScore: 88,
    activityScore: 90,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 75, description: "Reviews focused on functional requirements and UX consistency." },
      { metric: "Bug Fixes", score: 60, description: "Assists in triage and reproduction of issues." },
      { metric: "Architecture", score: 85, description: "Defined the data model for the new user profile service." },
      { metric: "Feature Delivery", score: 92, description: "Led the successful launch of the Q3 roadmap." }
    ]
  },
  {
    id: 3,
    name: "Mike Ross",
    role: "Junior Dev",
    team: "Engineering",
    impactScore: 45,
    activityScore: 85,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 40, description: "Active in reviews but focuses mostly on style/formatting." },
      { metric: "Bug Fixes", score: 65, description: "Resolved several backlog UI glitches." },
      { metric: "Architecture", score: 30, description: "Learning system design patterns." },
      { metric: "Feature Delivery", score: 50, description: "Delivered 2 minor features with guidance." }
    ]
  },
  {
    id: 4,
    name: "Emily Davis",
    role: "UX Designer",
    team: "Design",
    impactScore: 95,
    activityScore: 30,
    silentArchitect: true,
    impactBreakdown: [
      { metric: "Code Reviews", score: 85, description: "Ensures frontend implementation matches design specs perfectly." },
      { metric: "Bug Fixes", score: 40, description: "Identified and documented UX inconsistencies." },
      { metric: "Architecture", score: 92, description: "Created the comprehensive Design System architecture." },
      { metric: "Feature Delivery", score: 95, description: "Delivered all high-fidelity prototypes ahead of schedule." }
    ]
  },
  {
    id: 5,
    name: "James Wilson",
    role: "DevOps",
    team: "Engineering",
    impactScore: 78,
    activityScore: 75,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 70, description: "Reviews CI/CD pipeline changes and infrastructure code." },
      { metric: "Bug Fixes", score: 92, description: "Resolved critical deployment failures in staging." },
      { metric: "Architecture", score: 75, description: "Optimized cloud resource allocation reducing costs." },
      { metric: "Feature Delivery", score: 60, description: "Implemented new automated testing pipeline." }
    ]
  },
  {
    id: 6,
    name: "Lisa Wong",
    role: "Frontend Dev",
    team: "Engineering",
    impactScore: 65,
    activityScore: 60,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 60, description: "Participates in frontend component reviews." },
      { metric: "Bug Fixes", score: 70, description: "Fixed layout issues reported by QA." },
      { metric: "Architecture", score: 50, description: "Refactored legacy forms to use new hooks." },
      { metric: "Feature Delivery", score: 75, description: "Shipped the new settings dashboard page." }
    ]
  },
  {
    id: 7,
    name: "David Miller",
    role: "Backend Lead",
    team: "Engineering",
    impactScore: 89,
    activityScore: 50,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 90, description: "Sets the standard for backend code quality." },
      { metric: "Bug Fixes", score: 75, description: "Debugged complex race condition in database layer." },
      { metric: "Architecture", score: 88, description: "Architected the microservices migration strategy." },
      { metric: "Feature Delivery", score: 82, description: "Delivered the new search API endpoint." }
    ]
  },
  {
    id: 8,
    name: "Rachel Green",
    role: "Marketing",
    team: "Marketing",
    impactScore: 70,
    activityScore: 95,
    silentArchitect: false,
    impactBreakdown: [
      { metric: "Code Reviews", score: 50, description: "Reviews content changes on the website." },
      { metric: "Bug Fixes", score: 40, description: "Fixed typos and SEO metadata issues." },
      { metric: "Architecture", score: 60, description: "Structured the marketing campaign analytics flow." },
      { metric: "Feature Delivery", score: 85, description: "Launched 3 successful email campaigns." }
    ]
  }
];

export const teams = ["All Teams", "Engineering", "Product", "Design", "Marketing"];

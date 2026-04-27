// Mock data for the coordinator dashboard

export const MOCK_NEEDS = [
  { id: 1, title: 'Emergency Medical Aid', zone: 'Dharavi, Mumbai', urgency: 9, skills: ['Nursing', 'First Aid'], lat: 35, lng: 25, status: 'active', hours: 4, description: 'Elderly patients in flooded community center need urgent medical attention. 15-20 people affected.', assignedTo: null, createdAt: '2 mins ago' },
  { id: 2, title: 'Food Distribution Required', zone: 'Andheri East, Mumbai', urgency: 7, skills: ['Logistics', 'Community Outreach'], lat: 55, lng: 45, status: 'active', hours: 6, description: 'Over 50 families require food supply kits. Distribution center needs setup.', assignedTo: null, createdAt: '18 mins ago' },
  { id: 3, title: 'Debris Clearing - Road Block', zone: 'Bandra West, Mumbai', urgency: 8, skills: ['Construction', 'Heavy Lifting'], lat: 70, lng: 65, status: 'active', hours: 8, description: 'Major road blocked by fallen trees and debris. Emergency vehicles cannot pass.', assignedTo: null, createdAt: '32 mins ago' },
  { id: 4, title: 'Water Purification Setup', zone: 'Kurla, Mumbai', urgency: 6, skills: ['Engineering', 'Water Safety'], lat: 40, lng: 70, status: 'assigned', hours: 5, description: 'Contaminated water supply in residential area. Need portable purification units.', assignedTo: 'Raj Kumar', createdAt: '1 hr ago' },
  { id: 5, title: 'Child Care & Safety', zone: 'Dadar, Mumbai', urgency: 8, skills: ['Child Care', 'Counseling'], lat: 20, lng: 55, status: 'resolved', hours: 3, description: '12 unaccompanied children found at evacuation center. Need care and family tracing.', assignedTo: 'Aisha Patel', createdAt: '2 hrs ago' },
];

export const MOCK_VOLUNTEERS = [
  { id: 1, name: 'Priya Sharma', skills: ['Nursing', 'First Aid', 'Emergency Medicine'], location: 'Dharavi, Mumbai', distance: 0.8, reliability: 96, tasksCompleted: 23, totalTasks: 24, avatar: '👩‍⚕️', available: true, transport: 'On foot' },
  { id: 2, name: 'Raj Kumar', skills: ['Logistics', 'Construction', 'Heavy Lifting'], location: 'Andheri, Mumbai', distance: 1.2, reliability: 88, tasksCompleted: 18, totalTasks: 21, avatar: '👨‍🔧', available: true, transport: 'Motorcycle' },
  { id: 3, name: 'Aisha Patel', skills: ['Community Outreach', 'Counseling', 'Child Care'], location: 'Bandra, Mumbai', distance: 2.1, reliability: 92, tasksCompleted: 15, totalTasks: 16, avatar: '👩‍💼', available: false, transport: 'Car' },
  { id: 4, name: 'Marco Silva', skills: ['First Aid', 'Emergency Response', 'Driving'], location: 'Kurla, Mumbai', distance: 1.5, reliability: 91, tasksCompleted: 12, totalTasks: 13, avatar: '👨‍🚒', available: true, transport: 'Car' },
  { id: 5, name: 'Sneha Desai', skills: ['Engineering', 'Water Safety', 'Planning'], location: 'Dadar, Mumbai', distance: 3.2, reliability: 85, tasksCompleted: 9, totalTasks: 11, avatar: '👩‍🔬', available: true, transport: 'Public Transit' },
  { id: 6, name: 'Vikram Singh', skills: ['Construction', 'Heavy Lifting', 'Driving'], location: 'Sion, Mumbai', distance: 2.8, reliability: 79, tasksCompleted: 7, totalTasks: 10, avatar: '👷', available: true, transport: 'Truck' },
];

export const MOCK_INTEL_REPORT = {
  generatedAt: 'Just now',
  zones: [
    { name: 'Dharavi', activeNeeds: 8, criticalGaps: 'Medical volunteers undersupplied', recommendation: 'Pre-position 3 nurses from Zone 3', prediction: '40% escalation in next 2 hours', severity: 'critical' },
    { name: 'Andheri East', activeNeeds: 5, criticalGaps: 'Logistics personnel needed', recommendation: 'Redirect 2 logistics volunteers from Dadar', prediction: 'Stable — manageable with current resources', severity: 'warning' },
    { name: 'Bandra West', activeNeeds: 3, criticalGaps: 'Construction crew shortage', recommendation: 'Request mutual aid from neighboring district', prediction: '20% improvement expected after road clearance', severity: 'warning' },
    { name: 'Kurla', activeNeeds: 2, criticalGaps: 'None — adequately covered', recommendation: 'Monitor water quality reports', prediction: 'De-escalation likely within 4 hours', severity: 'success' },
  ],
  summary: 'Mumbai flood response — 18 active needs across 4 zones. Medical aid remains the highest priority with 40% of critical needs unassigned. Volunteer deployment rate: 87%. Average match time: 2.3 minutes. System confidence: 94%.',
  alerts: [
    'URGENT: Dharavi zone medical demand exceeds volunteer supply by 3x',
    'WARNING: Monsoon intensification predicted — prepare for 60% increase in shelter requests',
    'INFO: 4 new volunteers onboarded in the last hour — skills: Construction, Driving',
  ]
};

export function computeMatchScore(volunteer, need) {
  const skillMatch = volunteer.skills.filter(s => need.skills.some(ns => s.toLowerCase().includes(ns.toLowerCase()) || ns.toLowerCase().includes(s.toLowerCase()))).length / Math.max(need.skills.length, 1);
  const proximity = Math.max(0, 1 - volunteer.distance / 5);
  const reliability = volunteer.reliability / 100;
  const finalScore = skillMatch * 0.45 + proximity * 0.30 + reliability * 0.25;
  return {
    total: Math.round(finalScore * 100),
    skill: Math.round(skillMatch * 100),
    proximity: Math.round(proximity * 100),
    reliability: volunteer.reliability,
    matchingSkills: volunteer.skills.filter(s => need.skills.some(ns => s.toLowerCase().includes(ns.toLowerCase()) || ns.toLowerCase().includes(s.toLowerCase()))),
  };
}

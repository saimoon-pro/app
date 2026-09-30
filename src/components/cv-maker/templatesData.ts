/**
 * 10 Pre-built Corporate CV Templates
 * Mapped to assets from Assets/tamplates demo/
 */

import { assetUrl } from '@/lib/assetUrl';

export interface CVExperience {
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface CVEducation {
  institution: string;
  degree: string;
  period: string;
  grade?: string;
}

export interface CVCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface CVData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  profileImage: string | null;
  showPhoto?: boolean;
  summary: string;
  skills: string[];
  tools: string[];
  experiences: CVExperience[];
  education: CVEducation[];
  certifications: CVCertification[];
  languages: string[];
  accentColor: string;
  secondaryColor: string;
  templateId: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  roleCategory: string;
  thumbnail: string;
  defaultAccent: string;
  defaultSecondary: string;
  description: string;
  tags: string[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'developer',
    name: 'Developer & Tech Lead',
    roleCategory: 'Engineering & Tech',
    thumbnail: assetUrl('templates/Developer.jpg'),
    defaultAccent: '#00FF66',
    defaultSecondary: '#00E5FF',
    description: 'High-contrast dual-column tech layout with skill telemetry and project highlight cards.',
    tags: ['Tech', 'Full-Stack', 'ATS Friendly'],
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    roleCategory: 'Management',
    thumbnail: assetUrl('templates/executive.jpg'),
    defaultAccent: '#2563EB',
    defaultSecondary: '#1E293B',
    description: 'Prestigious corporate layout designed for C-level executives, directors, and managers.',
    tags: ['Executive', 'Corporate', 'Leadership'],
  },
  {
    id: 'creative',
    name: 'Creative Director',
    roleCategory: 'Design & Media',
    thumbnail: assetUrl('templates/Creative.jpg'),
    defaultAccent: '#E11D48',
    defaultSecondary: '#F59E0B',
    description: 'Bold aesthetic layout emphasizing portfolio achievements, creative vision, and awards.',
    tags: ['Creative', 'Visual', 'Portfolio'],
  },
  {
    id: 'art-director',
    name: 'Art Director',
    roleCategory: 'Design & Visuals',
    thumbnail: assetUrl('templates/Art directore.jpg'),
    defaultAccent: '#9333EA',
    defaultSecondary: '#C084FC',
    description: 'Minimalist Swiss-style editorial typography with high visual balance and clean margins.',
    tags: ['Editorial', 'Art Direction', 'Minimal'],
  },
  {
    id: 'hr',
    name: 'People & HR Manager',
    roleCategory: 'Human Resources',
    thumbnail: assetUrl('templates/hr.jpg'),
    defaultAccent: '#0D9488',
    defaultSecondary: '#14B8A6',
    description: 'Warm, approachable corporate design highlighting organizational impact and certifications.',
    tags: ['HR', 'Operations', 'Corporate'],
  },
  {
    id: 'director',
    name: 'Managing Director',
    roleCategory: 'Executive',
    thumbnail: assetUrl('templates/Director.jpg'),
    defaultAccent: '#D97706',
    defaultSecondary: '#78350F',
    description: 'Authoritative layout with strategic milestone metrics and global team leadership sections.',
    tags: ['Director', 'Global', 'Strategy'],
  },
  {
    id: 'graphics-designer',
    name: 'Senior Graphic Designer',
    roleCategory: 'Branding & UI',
    thumbnail: assetUrl('templates/Graphics designer.jpg'),
    defaultAccent: '#EC4899',
    defaultSecondary: '#8B5CF6',
    description: 'Vibrant showcase layout with visual competency meters and branding case studies.',
    tags: ['Branding', 'Graphics', 'UI'],
  },
  {
    id: 'editor',
    name: 'Lead Video Editor & Colorist',
    roleCategory: 'Post-Production',
    thumbnail: assetUrl('templates/Editor.jpg'),
    defaultAccent: '#00E5FF',
    defaultSecondary: '#3B82F6',
    description: 'Cinematic cyber layout optimized for video editors, motion designers, and VFX artists.',
    tags: ['Video', 'VFX', 'Cinematic'],
  },
  {
    id: 'executive2',
    name: 'Corporate Strategy',
    roleCategory: 'Consulting',
    thumbnail: assetUrl('templates/executive2.jpg'),
    defaultAccent: '#0284C7',
    defaultSecondary: '#0F172A',
    description: 'Sleek modern business template with clean KPI bullets and executive summaries.',
    tags: ['Consulting', 'Finance', 'Strategy'],
  },
  {
    id: 'professional',
    name: 'Professional Minimalist',
    roleCategory: 'Universal ATS',
    thumbnail: assetUrl('templates/Professional.jpg'),
    defaultAccent: '#10B981',
    defaultSecondary: '#334155',
    description: 'Classic monochrome ATS-optimized format trusted by Fortune 500 recruiters globally.',
    tags: ['ATS-Optimized', 'Universal', 'Classic'],
  },
];

export const INITIAL_CV_DATA: CVData = {
  fullName: 'Muhammad Saimoon Hassan',
  jobTitle: 'Senior Video Editor & Creative Tech Founder',
  email: 'muhammadsaimoonhassan@gmail.com',
  phone: '+880 1778-011899',
  location: 'Dhaka, Bangladesh · Available Globally',
  portfolioUrl: 'https://helixonix.xyz',
  profileImage: null,
  showPhoto: false,
  summary:
    'Versatile Senior Video Editor, Motion Graphic Artist, and Full-Stack Developer with 6+ years of commercial experience delivering high-converting video campaigns, interactive web experiences, and scalable AI solutions for international brands in USA, UK, Canada, and Germany.',
  skills: [
    'Commercial Video Editing',
    'Motion Graphics & VFX',
    'Color Grading & Audio Mastering',
    'UI/UX Architecture',
    'React & TypeScript Development',
    'AI Automation & Workflows',
    'Brand Identity Strategy',
    'Cross-Cultural Team Leadership',
  ],
  tools: [
    'Adobe Premiere Pro',
    'After Effects',
    'DaVinci Resolve',
    'Figma',
    'Next.js / React',
    'Tailwind CSS',
    'Blender 3D',
    'Photoshop & Illustrator',
  ],
  experiences: [
    {
      company: 'Helixonix Digital Corp',
      role: 'Founder & Creative Lead',
      period: '2021 — PRESENT',
      location: 'Dhaka / Remote',
      highlights: [
        'Directed end-to-end post-production for 340+ commercial videos, achieving over 45M+ organic impressions for lifestyle brands.',
        'Engineered responsive web applications and AI tools with 99.8% uptime and modern cyber aesthetics.',
        'Maintained 100% Client Satisfaction Score across 60+ global commercial contracts.',
      ],
    },
    {
      company: 'Upwork Global Inc.',
      role: 'Top Rated Plus Video Editor & Designer',
      period: '2020 — PRESENT',
      location: 'Global Remote',
      highlights: [
        'Ranked in the top 3% of global freelance talent with 100% Job Success Score.',
        'Delivered high-converting TVC, social ads, and cinematic trailers for clients across USA, UK, and Canada.',
        'Standardized 24-hour turnaround pipelines using GPU-accelerated cloud rendering workflows.',
      ],
    },
  ],
  education: [
    {
      institution: 'Dhaka University of Engineering & Technology',
      degree: 'B.Sc. in Computer Science & Engineering',
      period: '2019 — 2023',
      grade: 'First Class Honors',
    },
  ],
  certifications: [
    {
      name: 'Adobe Certified Professional — Video Design',
      issuer: 'Adobe Inc.',
      year: '2023',
    },
    {
      name: 'Google Professional UX & Frontend Specialization',
      issuer: 'Google',
      year: '2022',
    },
  ],
  languages: ['English (Fluent / Professional)', 'Bengali (Native)'],
  accentColor: '#00FF66',
  secondaryColor: '#00E5FF',
  templateId: 'developer',
};

export const BLANK_CV_DATA: CVData = {
  fullName: 'Your Full Name',
  jobTitle: 'Your Professional Title',
  email: 'your.email@example.com',
  phone: '+880 1XXXXXXXXX',
  location: 'Dhaka, Bangladesh',
  portfolioUrl: 'https://portfolio.com',
  profileImage: null,
  showPhoto: false,
  summary:
    'A driven, result-oriented professional with a track record of delivering high-impact projects, streamlining workflows, and driving quantifiable organizational growth.',
  skills: [
    'Project Leadership',
    'Strategic Planning',
    'Team Collaboration',
    'Workflow Optimization',
    'Problem Solving',
    'Client Relations',
  ],
  tools: ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4'],
  experiences: [
    {
      company: 'Premier Enterprise Corp',
      role: 'Senior Specialist / Lead',
      period: '2022 — PRESENT',
      location: 'Dhaka / Remote',
      highlights: [
        'Spearheaded key operations delivering +35% efficiency and driving measurable team growth.',
        'Managed cross-functional initiatives delivering high-quality deliverables ahead of deadlines.',
      ],
    },
  ],
  education: [
    {
      institution: 'University / College Name',
      degree: 'Bachelor of Science / Arts',
      period: '2018 — 2022',
      grade: 'Graduated with Honors',
    },
  ],
  certifications: [
    {
      name: 'Professional Industry Certification',
      issuer: 'Accredited Institute',
      year: '2023',
    },
  ],
  languages: ['English (Professional)', 'Bengali (Native)'],
  accentColor: '#00FF66',
  secondaryColor: '#00E5FF',
  templateId: 'developer',
};


export interface ContentItem {
  id: string;
  contentType: ContentType;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  previewImageUrl: string;
  videoUrl: string;
  websiteUrl: string;
  caseStudyUrl: string;
  tags: string[];
  featured: boolean;
  uploadStatus: 'Uploaded' | 'Pending';
  displayOrder: number;
  uploadDate: string;
  notes: string;
}

export type ContentType =
  | 'Career'
  | 'Video Editing'
  | 'UIUX Design'
  | 'Illustration'
  | 'Post Design'
  | 'Graphic Design'
  | 'Website Project'
  | 'Certification'
  | 'Achievement'
  | 'Testimonial';

export interface WebsiteSettings {
  name: string;
  title: string;
  tagline: string;
  geminiApiKey: string;
  aiSystemPrompt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  businessName: string;
  ctaText: string;
  footerText: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  videoSuggestions?: Array<{
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    videoUrl: string;
    description: string;
  }>;
  suggestedSection?: string;
  action?: string;
}

export type OrbitNodeId = 'career' | 'video' | 'design' | 'web' | 'ai' | 'contact';

export interface OrbitNode {
  id: OrbitNodeId;
  label: string;
  icon: string;
  angle: number;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnail: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
}

export interface TimelineItem {
  id: string;
  role: string;
  organization: string;
  duration: string;
  impact: string;
}

export interface SkillItem {
  name: string;
  percentage: number;
}

export interface CertificationItem {
  id: string;
  title: string;
  subtitle: string;
  issuer: string;
}

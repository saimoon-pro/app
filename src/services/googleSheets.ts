// Google Sheets CMS Service
// For demo purposes, this returns placeholder data.
// In production, replace SHEET_ID with actual Google Sheet ID and fetch via Google Sheets API

import Papa from 'papaparse';
import type { ContentItem, WebsiteSettings, ContactSettings } from '@/types/content';
import { assetUrl } from '@/lib/assetUrl';

// Google Sheet: https://docs.google.com/spreadsheets/d/1k8JqJooRpIbHBhgQS3-lSw502nNlwyokCX3P_oE3sHA
// const SHEET_ID = '1k8JqJooRpIbHBhgQS3-lSw502nNlwyokCX3P_oE3sHA';
// const API_KEY = '';

// Cache system
let cache: {
  content: ContentItem[];
  settings: WebsiteSettings | null;
  contact: ContactSettings | null;
  timestamp: number;
} = {
  content: [],
  settings: null,
  contact: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Placeholder data for demo
const PLACEHOLDER_CONTENT: ContentItem[] = [
  // Video Editing
  {
    id: '1', contentType: 'Video Editing', category: 'Commercial', title: 'Luminex — Brand Film',
    subtitle: 'Premium brand film for smart lighting company', description: 'A cinematic brand film showcasing Luminex smart lighting products in elegant interior settings. Shot and edited with a focus on warmth and sophistication.',
    thumbnailUrl: assetUrl('images/thumb-video-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Commercial', 'Brand Film'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-15', notes: ''
  },
  {
    id: '2', contentType: 'Video Editing', category: 'Narrative', title: 'City of Echoes — Short Film',
    subtitle: 'An atmospheric short film about urban solitude', description: 'A moody narrative short exploring themes of connection and isolation in a bustling metropolis.',
    thumbnailUrl: assetUrl('images/thumb-video-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Narrative', 'Short Film'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-02-20', notes: ''
  },
  {
    id: '3', contentType: 'Video Editing', category: 'Music Video', title: 'Neon Dreams — Music Video',
    subtitle: 'Abstract visual journey for electronic artist', description: 'Kinetic visual effects and light painting create a mesmerizing audio-visual experience.',
    thumbnailUrl: assetUrl('images/thumb-video-3.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Music Video', 'VFX'], featured: true, uploadStatus: 'Uploaded', displayOrder: 3, uploadDate: '2024-03-10', notes: ''
  },
  {
    id: '4', contentType: 'Video Editing', category: 'Documentary', title: "The Maker's Hand — Documentary",
    subtitle: 'Craftsmanship documentary series', description: 'An intimate portrait of artisans and their dedication to traditional crafts in the modern age.',
    thumbnailUrl: assetUrl('images/thumb-video-4.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Documentary'], featured: false, uploadStatus: 'Uploaded', displayOrder: 4, uploadDate: '2024-04-05', notes: ''
  },
  {
    id: '5', contentType: 'Video Editing', category: 'Reels & Shorts', title: 'Product Launch Reel',
    subtitle: 'High-energy product launch for tech startup', description: 'Fast-paced social media reel designed for maximum engagement and conversion.',
    thumbnailUrl: assetUrl('images/thumb-video-5.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Reels', 'Product'], featured: false, uploadStatus: 'Uploaded', displayOrder: 5, uploadDate: '2024-05-12', notes: ''
  },
  {
    id: '6', contentType: 'Video Editing', category: 'Motion Graphics', title: 'Motion Typography Pack',
    subtitle: 'Kinetic typography showcase', description: 'A collection of dynamic typography animations for commercial and editorial use.',
    thumbnailUrl: assetUrl('images/thumb-video-6.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Motion Graphics', 'Typography'], featured: false, uploadStatus: 'Uploaded', displayOrder: 6, uploadDate: '2024-06-01', notes: ''
  },
  // UIUX Design
  {
    id: '7', contentType: 'UIUX Design', category: 'Dashboard', title: 'Luminex Analytics Dashboard',
    subtitle: 'Complete analytics dashboard redesign', description: 'Redesigned the analytics experience resulting in 42% reduction in user task time.',
    thumbnailUrl: assetUrl('images/uiux-case-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Dashboard', 'SaaS'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-20', notes: ''
  },
  {
    id: '8', contentType: 'UIUX Design', category: 'Mobile App', title: 'FlowState Mobile App',
    subtitle: 'Productivity app with focus timer', description: 'Designed a clean, intuitive productivity app that reached 50K+ downloads in the first month.',
    thumbnailUrl: assetUrl('images/uiux-case-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Mobile', 'Productivity'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-03-15', notes: ''
  },
  // Illustrations
  {
    id: '9', contentType: 'Illustration', category: 'Digital Art', title: 'Digital Fragments',
    subtitle: 'Abstract geometric portrait study', description: 'Exploring the intersection of human identity and digital fragmentation.',
    thumbnailUrl: assetUrl('images/illustration-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Digital Art', 'Abstract'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-02-10', notes: ''
  },
  {
    id: '10', contentType: 'Illustration', category: 'Digital Art', title: 'Orbital Harmony',
    subtitle: 'Cosmic orbital rings composition', description: 'A meditation on cosmic order and the beauty of orbital mechanics.',
    thumbnailUrl: assetUrl('images/illustration-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Digital Art', 'Cosmic'], featured: false, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-04-20', notes: ''
  },
  // Website Projects
  {
    id: '11', contentType: 'Website Project', category: 'SaaS', title: 'Luminex.io',
    subtitle: 'Brand website for smart lighting company', description: 'An immersive brand experience with 3D elements, achieving 92 Lighthouse performance score.',
    thumbnailUrl: assetUrl('images/web-project-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: 'https://luminex.io', caseStudyUrl: '',
    tags: ['React', 'Next.js', 'GSAP', 'Three.js'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-25', notes: ''
  },
  {
    id: '12', contentType: 'Website Project', category: 'Web App', title: 'EvoFit.co',
    subtitle: 'Fitness platform web application', description: 'Full-stack fitness tracking platform with social features and real-time data.',
    thumbnailUrl: assetUrl('images/web-project-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: 'https://evofit.co', caseStudyUrl: '',
    tags: ['React', 'Node.js', 'MongoDB'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-03-20', notes: ''
  },
  // Certifications
  {
    id: '13', contentType: 'Certification', category: 'Professional', title: 'Top Rated Plus — Upwork',
    subtitle: 'Top 3% of freelancers globally', description: 'Maintained Top Rated Plus status for 3+ years with 100% job success score.',
    thumbnailUrl: '', previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Freelance', 'Platform'], featured: false, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-01', notes: ''
  },
  {
    id: '14', contentType: 'Certification', category: 'Technical', title: 'Adobe Certified Professional',
    subtitle: 'Premiere Pro Certification', description: 'Official Adobe certification validating professional video editing expertise.',
    thumbnailUrl: '', previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Adobe', 'Video Editing'], featured: false, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2023-08-15', notes: ''
  },
  // Achievements
  {
    id: '15', contentType: 'Achievement', category: 'Milestone', title: '340+ Commercial Videos',
    subtitle: 'Edited for D2C brands worldwide', description: 'Completed over 340 commercial video projects across fashion, tech, and lifestyle sectors.',
    thumbnailUrl: '', previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Milestone', 'Video Editing'], featured: false, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-06-01', notes: ''
  },
  {
    id: '16', contentType: 'Achievement', category: 'Milestone', title: '25+ Websites Delivered',
    subtitle: 'Production-ready web applications', description: 'Designed and developed over 25 websites and web applications for global clients.',
    thumbnailUrl: '', previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Milestone', 'Web Development'], featured: false, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-06-01', notes: ''
  },
];

const PLACEHOLDER_SETTINGS: WebsiteSettings = {
  name: 'Muhammad Saimoon Hassan',
  title: 'Muhammad Saimoon Hassan — Digital Universe',
  tagline: 'Where creativity meets technology',
  geminiApiKey: '',
  aiSystemPrompt: `You are ORBIT, the in-site guide for Muhammad Saimoon Hassan's portfolio. You are calm, precise, and quietly confident — never hype-driven. You know the site's full structure (Career, Video Universe, Design Universe, Web Universe, Contact) and can suggest navigation. You answer visitor questions about Saimoon's work, process, and availability using only information provided to you in the site's content database — never invent facts, pricing, or commitments. If a visitor expresses serious interest in hiring Saimoon, ask at most two clarifying questions, then guide them to the Contact Experience. Keep responses under 3 sentences unless asked for detail.`,
  seoTitle: 'Muhammad Saimoon Hassan — Portfolio',
  seoDescription: 'Senior Video Editor, Motion Designer, UI/UX Designer, Web Developer, and AI Automation Founder.',
  seoKeywords: 'video editor, motion designer, ui/ux designer, web developer, ai automation',
};

const PLACEHOLDER_CONTACT: ContactSettings = {
  email: 'muhammadsaimoonhassan@gmail.com / helixonixcorp@gmail.com',
  phone: '+8801778011899',
  whatsapp: '+8801778011899',
  address: 'Bangladesh, Dhaka 1207',
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/saimoonhassan' },
    { platform: 'Behance', url: 'https://behance.net/saimoonhassan' },
    { platform: 'Dribbble', url: 'https://dribbble.com/saimoonhassan' },
    { platform: 'GitHub', url: 'https://github.com/saimoonhassan' },
  ],
  businessName: 'www.helixonix.xyz',
  ctaText: 'Let\'s create something amazing together',
  footerText: 'Crafted with passion in Dhaka, Bangladesh',
};

class GoogleSheetsService {
  private async fetchSheet(): Promise<ContentItem[]> {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1lkc5llkD_zYwDbFTgn-YV9ITotvSu81zlC9sGiE5dwA/export?format=csv';
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        console.error('Failed to fetch CSV', response.status);
        return PLACEHOLDER_CONTENT;
      }
      const csvText = await response.text();
      
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      if (!parsed.data || parsed.data.length === 0) {
         return PLACEHOLDER_CONTENT;
      }
      
      const items: ContentItem[] = [];
      let order = 1;
      
      parsed.data.forEach((row: any, index: number) => {
        const rawType = (row['Type'] || '').trim();
        const rawStatus = (row['Status'] || '').trim();
        const rawLinkType = (row['Link Type'] || '').trim();
        
        if (rawStatus.toLowerCase() !== 'update') {
          return;
        }

        let contentType: any = 'Video Editing';
        if (rawType.toLowerCase() === 'video') contentType = 'Video Editing';
        else if (rawType.toLowerCase() === 'website') contentType = 'Website Project';
        else if (rawType.toLowerCase() === 'ui ux' || rawType.toLowerCase() === 'ui/ux') contentType = 'UIUX Design';
        else if (rawType.toLowerCase() === 'post') contentType = 'Post Design';
        else if (rawType.toLowerCase() === 'images') contentType = 'Illustration';
        
        const title = (row['Title '] || row['Title'] || '').trim() || `Item ${index + 1}`;
        const description = (row['Description '] || row['Description'] || '').trim();
        const link = (row['Link'] || '').trim();
        let thumbnail = (row['Thumbnail '] || row['Thumbnail'] || '').trim();
        
        // Handle fallback thumbnails
        if (!thumbnail || thumbnail.toLowerCase() === 'thumbnail') {
            if (contentType === 'Video Editing') thumbnail = assetUrl('images/thumb-video-1.jpg');
            else if (contentType === 'Website Project') thumbnail = assetUrl('images/web-project-1.jpg');
            else thumbnail = assetUrl('images/illustration-1.jpg');
        } else if (thumbnail.includes('drive.google.com/file/d/')) {
            // Convert Google Drive view links to direct image links
            const match = thumbnail.match(/\/file\/d\/([^\/]+)/);
            if (match && match[1]) {
                thumbnail = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        } else if (thumbnail.includes('drive.google.com/open?id=')) {
            const match = thumbnail.match(/id=([^&]+)/);
            if (match && match[1]) {
                thumbnail = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        }

        let videoUrl = '';
        let websiteUrl = '';
        
        if (contentType === 'Video Editing') {
          videoUrl = link;
        } else if (contentType === 'Website Project') {
          websiteUrl = link;
        } else {
          websiteUrl = link;
        }

        items.push({
          id: `sheet-${items.length}-${index}`,
          contentType: contentType,
          category: rawLinkType || 'General',
          title: title,
          subtitle: rawLinkType,
          description: description,
          thumbnailUrl: thumbnail,
          previewImageUrl: '',
          videoUrl: videoUrl,
          websiteUrl: websiteUrl,
          caseStudyUrl: '',
          tags: [rawLinkType, rawType].filter(Boolean),
          featured: true,
          uploadStatus: 'Uploaded',
          displayOrder: order++,
          uploadDate: new Date().toISOString(),
          notes: ''
        });
      });
      
      if (items.length > 0) {
        return items;
      }
      return PLACEHOLDER_CONTENT;
    } catch (e) {
      console.error('Error parsing sheet:', e);
      return PLACEHOLDER_CONTENT;
    }
  }

  private async fetchSettings(): Promise<WebsiteSettings> {
    // In production: fetch from Website Settings sheet
    return PLACEHOLDER_SETTINGS;
  }

  private async fetchContact(): Promise<ContactSettings> {
    // In production: fetch from Contact Settings sheet
    return PLACEHOLDER_CONTACT;
  }

  async getContent(): Promise<ContentItem[]> {
    const now = Date.now();
    if (now - cache.timestamp < CACHE_TTL && cache.content.length > 0) {
      return cache.content;
    }

    const content = await this.fetchSheet();
    cache.content = content;
    cache.timestamp = now;
    return content;
  }

  async getContentByType(type: ContentItem['contentType']): Promise<ContentItem[]> {
    const all = await this.getContent();
    return all
      .filter(item => item.contentType === type && item.uploadStatus === 'Uploaded')
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getFeaturedContent(): Promise<ContentItem[]> {
    const all = await this.getContent();
    return all.filter(item => item.featured && item.uploadStatus === 'Uploaded');
  }

  async getSettings(): Promise<WebsiteSettings> {
    if (cache.settings) return cache.settings;
    const settings = await this.fetchSettings();
    cache.settings = settings;
    return settings;
  }

  async getContactSettings(): Promise<ContactSettings> {
    if (cache.contact) return cache.contact;
    const contact = await this.fetchContact();
    cache.contact = contact;
    return contact;
  }

  async refresh(): Promise<void> {
    cache.timestamp = 0;
    await this.getContent();
    await this.getSettings();
    await this.getContactSettings();
  }

  // Poll for updates every 60 seconds
  startPolling(callback: () => void): ReturnType<typeof setInterval> {
    return setInterval(async () => {
      await this.refresh();
      callback();
    }, 60000);
  }
}

export const sheetsService = new GoogleSheetsService();

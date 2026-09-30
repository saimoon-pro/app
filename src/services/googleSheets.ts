// Google Sheets CMS Service
// For demo purposes, this returns placeholder data.
// In production, replace SHEET_ID with actual Google Sheet ID and fetch via Google Sheets API

import Papa from 'papaparse';
import type { ContentItem, WebsiteSettings, ContactSettings } from '@/types/content';
import { assetUrl } from '@/lib/assetUrl';
import {
  extractGoogleDriveId,
  getGoogleDriveDirectImageUrl,
  getYouTubeId,
  getVideoBestThumbnail,
  resolveItemImageUrl,
} from '@/lib/mediaHelper';

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

const CACHE_TTL = 10 * 1000; // 10 seconds for live Google Sheets updates

// Placeholder data for demo
const PLACEHOLDER_CONTENT: ContentItem[] = [
  // Video Editing
  {
    id: '1', contentType: 'Video Editing', category: 'Promotional Videos', title: 'Luminex — Brand Film',
    subtitle: 'Promotional Videos', description: 'A cinematic brand film showcasing Luminex smart lighting products in elegant interior settings. Shot and edited with a focus on warmth and sophistication.',
    thumbnailUrl: assetUrl('images/thumb-video-1.jpg'), previewImageUrl: '', videoUrl: 'https://www.youtube.com/watch?v=hQtqUoAib-I', websiteUrl: '', caseStudyUrl: '',
    tags: ['Promotional Videos', 'Brand Film'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-15', notes: '',
    album: 'Portfolio', videoFilter: 'Promotional Videos'
  },
  {
    id: '2', contentType: 'Video Editing', category: 'TVC & OVC', title: 'City of Echoes — Short Film',
    subtitle: 'TVC & OVC', description: 'A moody narrative short exploring themes of connection and isolation in a bustling metropolis.',
    thumbnailUrl: assetUrl('images/thumb-video-2.jpg'), previewImageUrl: '', videoUrl: 'https://www.youtube.com/watch?v=mKOdf7hXpWY', websiteUrl: '', caseStudyUrl: '',
    tags: ['TVC & OVC', 'Commercial'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-02-20', notes: '',
    album: 'USA Clients', videoFilter: 'TVC & OVC'
  },
  {
    id: '3', contentType: 'Video Editing', category: 'Motion Graphics', title: 'Neon Dreams — Motion Visuals',
    subtitle: 'Motion Graphics', description: 'Kinetic visual effects and light painting create a mesmerizing audio-visual experience.',
    thumbnailUrl: assetUrl('images/thumb-video-3.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Motion Graphics', 'VFX'], featured: true, uploadStatus: 'Uploaded', displayOrder: 3, uploadDate: '2024-03-10', notes: '',
    album: 'UK Clients', videoFilter: 'Motion Graphics'
  },
  {
    id: '4', contentType: 'Video Editing', category: 'Documentary', title: "The Maker's Hand — Documentary",
    subtitle: 'Documentary', description: 'An intimate portrait of artisans and their dedication to traditional crafts in the modern age.',
    thumbnailUrl: assetUrl('images/thumb-video-4.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Documentary'], featured: false, uploadStatus: 'Uploaded', displayOrder: 4, uploadDate: '2024-04-05', notes: '',
    album: 'Canada Clients', videoFilter: 'Documentary'
  },
  {
    id: '5', contentType: 'Video Editing', category: 'AI Contents', title: 'AI Automation Video Showcase',
    subtitle: 'AI Contents', description: 'Next-generation AI generated visuals and video workflows for social media.',
    thumbnailUrl: assetUrl('images/thumb-video-5.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['AI Contents', 'Reels'], featured: false, uploadStatus: 'Uploaded', displayOrder: 5, uploadDate: '2024-05-12', notes: '',
    album: 'BD Clients', videoFilter: 'AI Contents'
  },
  {
    id: '6', contentType: 'Video Editing', category: 'Motion Graphics', title: 'Motion Typography Pack',
    subtitle: 'Motion Graphics', description: 'A collection of dynamic typography animations for commercial and editorial use.',
    thumbnailUrl: assetUrl('images/thumb-video-6.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Motion Graphics', 'Typography'], featured: false, uploadStatus: 'Uploaded', displayOrder: 6, uploadDate: '2024-06-01', notes: '',
    album: 'Germany Clients', videoFilter: 'Motion Graphics'
  },
  {
    id: '6b', contentType: 'Video Editing', category: 'Promotional Videos', title: 'Viral E-Commerce Ad',
    subtitle: 'Promotional Videos', description: 'Cinematic ad tailored for fashion and lifestyle brand.',
    thumbnailUrl: assetUrl('images/thumb-video-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Promotional Videos', 'Social'], featured: true, uploadStatus: 'Uploaded', displayOrder: 7, uploadDate: '2024-06-10', notes: '',
    album: 'Indian & Pakistani Clients', videoFilter: 'Promotional Videos'
  },
  // UIUX Design
  {
    id: '7', contentType: 'UIUX Design', category: 'UI UX', title: 'Luminex Analytics Dashboard',
    subtitle: 'Complete analytics dashboard redesign', description: 'Redesigned the analytics experience resulting in 42% reduction in user task time.',
    thumbnailUrl: assetUrl('images/uiux-case-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Dashboard', 'SaaS'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-20', notes: '',
    album: 'USA Clients', graphicsFilter: 'UI UX'
  },
  {
    id: '8', contentType: 'UIUX Design', category: 'UI UX', title: 'FlowState Mobile App',
    subtitle: 'Productivity app with focus timer', description: 'Designed a clean, intuitive productivity app that reached 50K+ downloads in the first month.',
    thumbnailUrl: assetUrl('images/uiux-case-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Mobile', 'Productivity'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-03-15', notes: '',
    album: 'Portfolio', graphicsFilter: 'UI UX'
  },
  // Illustrations
  {
    id: '9', contentType: 'Illustration', category: 'Illustration', title: 'Digital Fragments',
    subtitle: 'Abstract geometric portrait study', description: 'Exploring the intersection of human identity and digital fragmentation.',
    thumbnailUrl: assetUrl('images/illustration-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Digital Art', 'Abstract'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-02-10', notes: '',
    album: 'Portfolio', graphicsFilter: 'Illustration'
  },
  {
    id: '10', contentType: 'Illustration', category: 'Illustration', title: 'Orbital Harmony',
    subtitle: 'Cosmic orbital rings composition', description: 'A meditation on cosmic order and the beauty of orbital mechanics.',
    thumbnailUrl: assetUrl('images/illustration-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Digital Art', 'Cosmic'], featured: false, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-04-20', notes: '',
    album: 'UK Clients', graphicsFilter: 'Illustration'
  },
  // Post Design / Statics
  {
    id: '10b', contentType: 'Post Design', category: 'Statics', title: 'Social Media Campaign Creatives',
    subtitle: 'High engagement brand creatives', description: 'Visual branding system and promotional social media posts for global brand.',
    thumbnailUrl: assetUrl('images/post-design-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: '', caseStudyUrl: '',
    tags: ['Statics', 'Social Media'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-05-01', notes: '',
    album: 'BD Clients', graphicsFilter: 'Statics'
  },
  // Website Projects
  {
    id: '11', contentType: 'Website Project', category: 'SaaS', title: 'Luminex.io',
    subtitle: 'Brand website for smart lighting company', description: 'An immersive brand experience with 3D elements, achieving 92 Lighthouse performance score.',
    thumbnailUrl: assetUrl('images/web-project-1.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: 'https://luminex.io', caseStudyUrl: '',
    tags: ['React', 'Next.js', 'GSAP', 'Three.js'], featured: true, uploadStatus: 'Uploaded', displayOrder: 1, uploadDate: '2024-01-25', notes: '',
    album: 'USA Clients'
  },
  {
    id: '12', contentType: 'Website Project', category: 'Web App', title: 'EvoFit.co',
    subtitle: 'Fitness platform web application', description: 'Full-stack fitness tracking platform with social features and real-time data.',
    thumbnailUrl: assetUrl('images/web-project-2.jpg'), previewImageUrl: '', videoUrl: '', websiteUrl: 'https://evofit.co', caseStudyUrl: '',
    tags: ['React', 'Node.js', 'MongoDB'], featured: true, uploadStatus: 'Uploaded', displayOrder: 2, uploadDate: '2024-03-20', notes: '',
    album: 'Portfolio'
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



function getRowField(row: any, ...fieldNames: string[]): string {
  if (!row) return '';
  for (const name of fieldNames) {
    if (row[name] !== undefined && row[name] !== null) {
      const val = String(row[name]).trim();
      if (val !== '') return val;
    }
  }
  const rowKeys = Object.keys(row);
  for (const name of fieldNames) {
    const target = name.trim().toLowerCase();
    const foundKey = rowKeys.find(k => k.trim().toLowerCase() === target);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      const val = String(row[foundKey]).trim();
      if (val !== '') return val;
    }
  }
  return '';
}

class GoogleSheetsService {
  private async fetchSheet(): Promise<ContentItem[]> {
    const timestamp = Date.now();
    const primaryUrl = `https://docs.google.com/spreadsheets/d/1lkc5llkD_zYwDbFTgn-YV9ITotvSu81zlC9sGiE5dwA/export?format=csv&_t=${timestamp}`;
    const fallbackUrl = `https://docs.google.com/spreadsheets/d/1lkc5llkD_zYwDbFTgn-YV9ITotvSu81zlC9sGiE5dwA/gviz/tq?tqx=out:csv&sheet=Contents&_t=${timestamp}`;
    
    try {
      let response = await fetch(primaryUrl, { cache: 'no-store' });
      if (!response.ok) {
        console.warn('Primary Google Sheets export endpoint failed, trying fallback gviz endpoint...');
        response = await fetch(fallbackUrl, { cache: 'no-store' });
      }
      if (!response.ok) {
        console.error('Failed to fetch CSV from both endpoints', response.status);
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
        const rawType = getRowField(row, 'Type');
        const rawStatus = getRowField(row, 'Status');
        const rawLinkType = getRowField(row, 'Link Type');
        const rawVideoFilter = getRowField(row, 'Video Filter', 'VideoFilter', 'Filter');
        const rawGraphicsFilter = getRowField(row, 'Graphics Filter', 'GraphicsFilter');
        const rawAlbum = getRowField(row, 'Album', 'Album Name');
        const title = getRowField(row, 'Title') || `Item ${index + 1}`;
        const description = getRowField(row, 'Description');
        const link = getRowField(row, 'Link');
        const thumbnail = getRowField(row, 'Thumbnail');

        // Check status: accept 'update', 'uploaded', 'published', 'active', 'yes', 'show'
        const statusLower = rawStatus.toLowerCase();
        if (statusLower && !['update', 'uploaded', 'published', 'active', 'yes', 'show'].includes(statusLower)) {
          return;
        }
        if (!statusLower && !link && !title) {
          return;
        }

        // Section / Content Type Classification
        const typeLower = rawType.toLowerCase();
        const videoFilterLower = rawVideoFilter.toLowerCase();
        const graphicsFilterLower = rawGraphicsFilter.toLowerCase();

        let contentType: ContentItem['contentType'] = 'Video Editing';

        const isExplicitWebsite = 
          typeLower.includes('web') || 
          typeLower.includes('site') || 
          typeLower.includes('app') || 
          typeLower.includes('software');

        const isExplicitUIUX = 
          typeLower.includes('ui') || 
          typeLower.includes('ux') || 
          graphicsFilterLower.includes('ui') || 
          graphicsFilterLower.includes('ux');

        const isExplicitPost = 
          typeLower.includes('post') || 
          typeLower.includes('static') || 
          typeLower.includes('social') || 
          graphicsFilterLower.includes('post') || 
          graphicsFilterLower.includes('static');

        const isExplicitIllustration = 
          typeLower.includes('image') || 
          typeLower.includes('illustration') || 
          typeLower.includes('graphic') || 
          typeLower.includes('art') || 
          typeLower.includes('draw') || 
          typeLower.includes('vector') || 
          graphicsFilterLower.includes('illustration') || 
          graphicsFilterLower.includes('graphic');

        const isExplicitVideo = 
          typeLower.includes('video') || 
          typeLower.includes('reel') || 
          typeLower.includes('motion') || 
          typeLower.includes('tvc') || 
          typeLower.includes('ovc') || 
          typeLower.includes('film') || 
          typeLower.includes('documentary') || 
          videoFilterLower.length > 0 || 
          getYouTubeId(link) !== null;

        if (isExplicitWebsite) {
          contentType = 'Website Project';
        } else if (isExplicitUIUX) {
          contentType = 'UIUX Design';
        } else if (isExplicitPost) {
          contentType = 'Post Design';
        } else if (isExplicitIllustration) {
          contentType = 'Illustration';
        } else if (isExplicitVideo) {
          contentType = 'Video Editing';
        } else if (graphicsFilterLower.length > 0) {
          if (graphicsFilterLower.includes('ui') || graphicsFilterLower.includes('ux')) {
            contentType = 'UIUX Design';
          } else if (graphicsFilterLower.includes('post') || graphicsFilterLower.includes('static')) {
            contentType = 'Post Design';
          } else {
            contentType = 'Illustration';
          }
        } else {
          // Fallback based on link structure
          if (getYouTubeId(link)) {
            contentType = 'Video Editing';
          } else if (typeLower === 'website') {
            contentType = 'Website Project';
          } else {
            contentType = 'Video Editing';
          }
        }

        // Resolving Thumbnail and Media URLs
        let finalThumbnail = '';
        let previewImageUrl = '';
        let videoUrl = '';
        let websiteUrl = '';

        if (contentType === 'Video Editing') {
          videoUrl = link;
          // Extract the video's best frame if no explicit custom thumbnail is set
          finalThumbnail = getVideoBestThumbnail(videoUrl, thumbnail, assetUrl('images/thumb-video-1.jpg'));
          
          const driveId = extractGoogleDriveId(videoUrl);
          if (driveId) {
            previewImageUrl = getGoogleDriveDirectImageUrl(driveId);
          }
        } else if (contentType === 'Website Project') {
          websiteUrl = link;
          finalThumbnail = resolveItemImageUrl(link, thumbnail, assetUrl('images/web-project-1.jpg'));
          const driveId = extractGoogleDriveId(link) || extractGoogleDriveId(thumbnail);
          if (driveId) {
            previewImageUrl = getGoogleDriveDirectImageUrl(driveId);
          }
        } else {
          // Graphical Works (UIUX, Illustration, Post Design)
          websiteUrl = link;
          const defaultAsset = 
            contentType === 'UIUX Design' ? assetUrl('images/uiux-case-1.jpg') :
            contentType === 'Post Design' ? assetUrl('images/post-design-1.jpg') :
            assetUrl('images/illustration-1.jpg');
            
          finalThumbnail = resolveItemImageUrl(link, thumbnail, defaultAsset);
          const driveId = extractGoogleDriveId(link) || extractGoogleDriveId(thumbnail);
          if (driveId) {
            previewImageUrl = getGoogleDriveDirectImageUrl(driveId);
          }
        }

        // Category & Subtitle determination
        let category = '';
        if (contentType === 'Video Editing') {
          if (rawVideoFilter) {
            category = rawVideoFilter;
          } else {
            // Intelligent category from title (preventing 'gd drive' pill in UI)
            const titleLower = title.toLowerCase();
            if (titleLower.includes('reel') || titleLower.includes('short')) {
              category = 'Reels & Shorts';
            } else if (titleLower.includes('doc') || titleLower.includes('documentary')) {
              category = 'Documentary';
            } else if (titleLower.includes('motion') || titleLower.includes('animation') || titleLower.includes('graphic')) {
              category = 'Motion Graphics';
            } else if (titleLower.includes('ai') || titleLower.includes('automation')) {
              category = 'AI Contents';
            } else if (titleLower.includes('tvc') || titleLower.includes('ovc') || titleLower.includes('commercial')) {
              category = 'TVC & OVC';
            } else if (titleLower.includes('promo') || titleLower.includes('brand')) {
              category = 'Promotional Videos';
            } else {
              category = 'Commercial Videos';
            }
          }
        } else if (rawGraphicsFilter) {
          category = rawGraphicsFilter;
        } else if (contentType === 'UIUX Design') {
          category = 'UI/UX';
        } else if (contentType === 'Post Design') {
          category = 'Statics';
        } else if (contentType === 'Illustration') {
          category = 'Illustration';
        } else {
          category = (rawLinkType && !rawLinkType.toLowerCase().includes('drive')) ? rawLinkType : 'General';
        }

        const subtitle = 
          rawVideoFilter || 
          rawGraphicsFilter || 
          (category !== 'gd drive' && category !== 'youtube' ? category : '') ||
          (contentType === 'Video Editing' ? 'Video Project' : contentType);

        items.push({
          id: `sheet-${items.length}-${index}`,
          contentType: contentType,
          category: category,
          title: title,
          subtitle: subtitle,
          description: description,
          thumbnailUrl: finalThumbnail,
          previewImageUrl: previewImageUrl,
          videoUrl: videoUrl,
          websiteUrl: websiteUrl,
          caseStudyUrl: '',
          tags: [category, rawVideoFilter, rawGraphicsFilter, rawAlbum, rawType].filter(
            (t): t is string => Boolean(t && !t.toLowerCase().includes('drive'))
          ),
          featured: true,
          uploadStatus: 'Uploaded',
          displayOrder: order++,
          uploadDate: new Date().toISOString(),
          notes: '',
          album: rawAlbum,
          videoFilter: rawVideoFilter || (contentType === 'Video Editing' ? category : ''),
          graphicsFilter: rawGraphicsFilter || (contentType !== 'Video Editing' && contentType !== 'Website Project' ? category : ''),
        });
      });
      
      if (items.length > 0) {
        // If the sheet doesn't have design items yet, keep placeholder design items
        const hasDesignItems = items.some(
          i => i.contentType === 'UIUX Design' || i.contentType === 'Illustration' || i.contentType === 'Post Design'
        );
        if (!hasDesignItems) {
          const designPlaceholders = PLACEHOLDER_CONTENT.filter(
            p => p.contentType === 'UIUX Design' || p.contentType === 'Illustration' || p.contentType === 'Post Design'
          );
          items.push(...designPlaceholders);
        }
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

  async forceRefresh(): Promise<ContentItem[]> {
    cache.timestamp = 0;
    return this.getContent();
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

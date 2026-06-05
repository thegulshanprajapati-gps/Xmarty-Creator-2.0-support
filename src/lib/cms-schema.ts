export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'json' | 'list' | 'select';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: string[];
  allowCustom?: boolean;
  itemFields?: FieldSchema[]; // used for 'list' type
}

export interface SectionSchema {
  key: string;
  label: string;
  description?: string;
  fields: FieldSchema[];
}

export const PAGE_SCHEMAS: Record<string, SectionSchema[]> = {
  home: [
    {
      key: 'hero',
      label: 'Hero Section',
      description: 'Configure the main landing section values that appear above the fold.',
      fields: [
        { key: 'title', label: 'Main Title', type: 'richtext', placeholder: 'Learn skills that actually ship.' },
        { key: 'subtitle', label: 'Hero Subtitle', type: 'richtext', placeholder: 'XmartyCreator helps creators learn...' },
        { key: 'image', label: 'Hero Asset', type: 'image' },
        { key: 'primaryCta', label: 'Primary Button', type: 'text', placeholder: 'Explore Courses' },
        { key: 'secondaryCta', label: 'Secondary Button', type: 'text', placeholder: 'Join Community' },
        { key: 'loginCta', label: 'Login Button', type: 'text', placeholder: 'Login / Register' },
        { key: 'imageBadgeTitle', label: 'Hero Image Badge Title', type: 'text', placeholder: 'Vasant AI Mentor' },
        { key: 'imageBadgeSubtitle', label: 'Hero Image Badge Subtitle', type: 'text', placeholder: 'Always-on help for your learning path.' },
        { 
          key: 'stats', 
          label: 'Hero Statistics', 
          type: 'list',
          itemFields: [
            { key: 'value', label: 'Stat Value (e.g. 50K+)', type: 'text' },
            { key: 'label', label: 'Stat Label (e.g. Active Learners)', type: 'text' }
          ]
        }
      ]
    },
    {
      key: 'pathways',
      label: 'Learning Pathways',
      description: 'Manage the learning pathways content section.',
      fields: [
        { key: 'tag', label: 'Section Tag/Badge', type: 'text', placeholder: 'LEARNING PATH' },
        { key: 'heading', label: 'Section Heading', type: 'richtext', placeholder: 'Everything connects.' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'richtext', placeholder: 'Courses, AI guidance, community practice...' },
        { 
          key: 'items', 
          label: 'Pathways Configuration', 
          type: 'list',
          itemFields: [
            { key: 'title', label: 'Pathway Title', type: 'richtext' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'icon', label: 'Icon Name (e.g. Code, Database)', type: 'text' },
            { key: 'color', label: 'Accent Color (e.g. bg-blue-500)', type: 'text' },
            { key: 'link', label: 'Redirect Route / Link', type: 'text', placeholder: '/courses' }
          ]
        }
      ]
    },
    {
      key: 'testimonials',
      label: 'Student Testimonials',
      description: 'Manage student testimonials and reviews.',
      fields: [
        { key: 'heading', label: 'Section Heading', type: 'richtext', placeholder: 'What our students say' },
        { key: 'subtitle', label: 'Section Subtitle', type: 'richtext', placeholder: 'Real reviews from creators who built real projects.' },
        {
          key: 'list',
          label: 'Testimonials List',
          type: 'list',
          itemFields: [
            { key: 'name', label: 'Student Name', type: 'text' },
            { 
              key: 'role', 
              label: 'Student Role / Job', 
              type: 'select',
              options: ['student', 'visitor'],
              allowCustom: true
            },
            { key: 'avatar', label: 'Avatar Image', type: 'image' },
            { key: 'rating', label: 'Rating (e.g. 5)', type: 'text' },
            { key: 'review', label: 'Review Text', type: 'textarea' }
          ]
        }
      ]
    },
    {
      key: 'community',
      label: 'Community Section',
      description: 'Configure the community invitation section.',
      fields: [
        { key: 'heading', label: 'Community Heading', type: 'richtext', placeholder: 'You do not learn alone here.' },
        { key: 'subtitle', label: 'Community Subtitle', type: 'richtext', placeholder: 'Get discussions, live reviews, creator circles...' },
        { key: 'cta', label: 'Explore Community Link Text', type: 'text', placeholder: 'Explore Community' }
      ]
    },
    {
      key: 'seo',
      label: 'SEO Metadata',
      description: 'Configure SEO titles, descriptions, and keywords for search engines.',
      fields: [
        { key: 'title', label: 'Meta Title', type: 'text', placeholder: 'XmartyCreator - Learn Skills that Actually Ship' },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'XmartyCreator helps creators learn production-grade development, build real projects, and grow with AI guidance.' },
        { key: 'keywords', label: 'Meta Keywords', type: 'text', placeholder: 'edtech, courses, learning paths, AI guidance, engineering' }
      ]
    }
  ],
  about: [
    {
      key: 'hero',
      label: 'About Hero',
      description: 'The top section of the About page.',
      fields: [
        { key: 'title', label: 'Page Title', type: 'richtext', placeholder: 'About XmartyCreator' },
        { key: 'subtitle', label: 'Subtitle', type: 'richtext' },
        { key: 'image', label: 'Hero Image', type: 'image' }
      ]
    },
    {
      key: 'story',
      label: 'Our Story',
      description: 'The main story content.',
      fields: [
        { key: 'heading', label: 'Story Heading', type: 'richtext' },
        { key: 'content', label: 'Story Content', type: 'richtext' }
      ]
    },
    {
      key: 'seo',
      label: 'SEO Metadata',
      description: 'Configure SEO metadata for the About page.',
      fields: [
        { key: 'title', label: 'Meta Title', type: 'text', placeholder: 'About Us - XmartyCreator' },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Learn about XmartyCreator, our story, mission, and how we help creators build real software.' },
        { key: 'keywords', label: 'Meta Keywords', type: 'text', placeholder: 'about us, mission, story, xmartycreator' }
      ]
    }
  ],
  courses: [
    {
      key: 'catalog',
      label: 'Catalog Headers',
      description: 'Headers for the curriculum catalog page.',
      fields: [
        { key: 'title', label: 'Catalog Title', type: 'richtext', placeholder: 'Explore Our Curriculum' },
        { key: 'subtitle', label: 'Subtitle', type: 'richtext' }
      ]
    },
    {
      key: 'seo',
      label: 'SEO Metadata',
      description: 'Configure SEO metadata for the Curriculum page.',
      fields: [
        { key: 'title', label: 'Meta Title', type: 'text', placeholder: 'Curriculum - Explore Our Courses' },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Explore the XmartyCreator curriculum. Practical frontend, backend, design and software courses.' },
        { key: 'keywords', label: 'Meta Keywords', type: 'text', placeholder: 'curriculum, coding courses, next.js, web development' }
      ]
    }
  ],
  footer: [
    {
      key: 'content',
      label: 'Footer Configuration',
      description: 'Global footer settings.',
      fields: [
        { key: 'aboutText', label: 'About Text', type: 'richtext' },
        { key: 'newsletterHeading', label: 'Newsletter Heading', type: 'richtext' }
      ]
    }
  ],
  contact: [
    {
      key: 'info',
      label: 'Contact Information',
      description: 'Contact details shown on the contact page.',
      fields: [
        { key: 'email', label: 'Support Email', type: 'text' },
        { key: 'address', label: 'Office Address', type: 'richtext' }
      ]
    },
    {
      key: 'seo',
      label: 'SEO Metadata',
      description: 'Configure SEO metadata for the Contact page.',
      fields: [
        { key: 'title', label: 'Meta Title', type: 'text', placeholder: 'Contact Us - XmartyCreator' },
        { key: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Get in touch with the XmartyCreator support and admissions team.' },
        { key: 'keywords', label: 'Meta Keywords', type: 'text', placeholder: 'contact, support, help, email, address' }
      ]
    }
  ]
};

export interface LinkEntry {
  label: string;
  url: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  links?: LinkEntry[];
  profilePhoto?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets?: string[];
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface SkillEntry {
  name: string;
  level: number;
}

export interface LanguageEntry {
  name: string;
  level: number; // 1–5
}

export interface ResumeData {
  id: string;
  name?: string;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
  projects: ProjectEntry[];
  selectedTemplate: TemplateId;
  language?: ResumeLanguage;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export type TemplateId = 'classic' | 'modern' | 'minimal';

export type ResumeLanguage = 'en' | 'de';

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  description: string;
}

export interface CoverLetterData {
  id: string;
  name?: string;
  resumeId: string;
  contact: ContactInfo;
  targetJob: string;
  targetCompany: string;
  date: string;
  opening: string;
  body: string;
  closing: string;
  language?: ResumeLanguage;
  updatedAt: string;
}

export interface CoverLetterSummary {
  id: string;
  name?: string;
  resumeId: string;
  updatedAt: string;
}

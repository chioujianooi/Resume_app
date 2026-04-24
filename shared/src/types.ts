export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  profilePhoto?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
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

export interface ResumeData {
  id: string;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  selectedTemplate: TemplateId;
  updatedAt: string;
}

export type TemplateId = 'classic' | 'modern' | 'minimal';

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  description: string;
}

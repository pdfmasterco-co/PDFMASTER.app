import React from 'react';
import { DocumentTextIcon, FileIcon, LockIcon, PencilIcon } from '../components/icons';

export interface Template {
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const templatesData: Template[] = [
  {
    slug: 'invoice',
    title: 'Invoice',
    description: 'A professional and clean invoice template for billing clients.',
    icon: DocumentTextIcon,
  },
  {
    slug: 'resume',
    title: 'Resume',
    description: 'A modern resume template to help you land your next job.',
    icon: FileIcon,
  },
  {
    slug: 'nda',
    title: 'NDA',
    description: 'A standard non-disclosure agreement to protect sensitive information.',
    icon: LockIcon,
  },
  {
    slug: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'An organized template for capturing key discussion points and action items.',
    icon: PencilIcon,
  },
];
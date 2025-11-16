import React from 'react';
import { User } from 'firebase/auth';

export interface FullTool {
  name: string;
  description: string;
  slug: string; // e.g., 'merge-pdf'
  apiHint: string;
  icon: React.ComponentType<{ className?: string }>;
  
  // Properties for the dedicated tool page
  pageTitle?: string;
  pageDescription?: string;
  actionButtonText?: string;
  minFiles?: number;
  acceptsMultipleFiles?: boolean;
  settingsComponent?: React.ComponentType;
  successMessage?: string;
  downloadButtonText?: string;
}

export enum ProcessingState {
  UPLOADING,
  PROCESSING,
  COMPLETE,
}

// FIX: Add 'ai-pdf-dashboard' to the Page type to allow navigation from the sidebar.
export type Page = 'home' | 'all-tools' | 'contact' | 'about' | 'thank-you' | 'pricing' | 'scan-to-pdf' | 'transcribe-audio' | 'pdf-assist' | 'my-pdfs' | 'ai-pdf-dashboard';

// FIX: Added missing type definitions for ChatMessage, MessageAuthor, Insight, and AiChatMessage to resolve import errors.
export enum MessageAuthor {
  USER,
  AI,
  SYSTEM,
}

export interface Insight {
  icon: string;
  title: string;
  value: string;
  isWarning?: boolean;
}

export interface SmartSummaryData {
  documentType: string;
  keyDates: string;
  numbersAndAmounts: string;
  peopleAndOrgs: string;
  flags: string;
  summaryText: string;
  isScanned?: boolean;
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  actions?: string[];
  insights?: Insight[];
}

export interface AiChatMessage {
  id: string; // Unique ID for React keys
  author: 'user' | 'ai';
  type: 'text' | 'image' | 'thinking' | 'error' | 'summary';
  content: string | string[]; // string for text, array for summary bullets
  audioData?: string; // base64 audio
  citation?: string;
  insights?: Insight[];
  showStudyAids?: boolean; // flag to show study aid buttons
  isPlayingAudio?: boolean;
}

export type StoredPdf = {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  size: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export type FirebaseUser = User;
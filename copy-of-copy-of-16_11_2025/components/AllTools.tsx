import React from 'react';
import { FullTool } from '../types';
import { allToolsData } from '../data/tools';
import ToolCard from './ToolCard';
import {
  MergeIcon, ScissorsIcon, BoxArrowDownIcon, RotateIcon, OrganizeIcon,
  HashIcon, CropIcon, WrenchSolidIcon, ArchiveIcon, EyeSolidIcon,
  ImageIcon, CameraIcon, DocumentTextIcon, FileIcon, SpreadsheetIcon,
  PresentationIcon, GlobeIcon, LockIcon, UnlockIcon, WatermarkIcon
} from './icons';

interface AllToolsProps {
  onToolSelect: (tool: FullTool) => void;
}

// Map tool slugs to their corresponding SVG icon component
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'merge-pdf': MergeIcon,
  'split-pdf': ScissorsIcon,
  'compress-pdf': BoxArrowDownIcon,
  'rotate-pdf': RotateIcon,
  'organize-pdf': OrganizeIcon,
  'page-numbers': HashIcon,
  'crop-pdf': CropIcon,
  'repair-pdf': WrenchSolidIcon,
  'pdf-to-pdfa': ArchiveIcon,
  'ocr-pdf': EyeSolidIcon,
  'pdf-to-jpg': ImageIcon,
  'jpg-to-pdf': CameraIcon,
  'pdf-to-word': DocumentTextIcon,
  'word-to-pdf': FileIcon,
  'pdf-to-excel': SpreadsheetIcon,
  'excel-to-pdf': FileIcon,
  'pdf-to-powerpoint': PresentationIcon,
  'powerpoint-to-pdf': FileIcon,
  'html-to-pdf': GlobeIcon,
  'protect-pdf': LockIcon,
  'unlock-pdf': UnlockIcon,
  'watermark-pdf': WatermarkIcon,
};


const toolCategories = [
  {
    title: "Organize & Convert",
    tools: [
      { slug: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one file.' },
      { slug: 'split-pdf', name: 'Split PDF', description: 'Separate pages or page ranges into new files.' },
      { slug: 'compress-pdf', name: 'Compress PDF', description: 'Reduce file size without losing quality.' },
      { slug: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate pages by 90, 180, or 270 degrees.' },
      { slug: 'organize-pdf', name: 'Organize PDF', description: 'Rearrange, delete, or extract pages.' },
      { slug: 'page-numbers', name: 'Page Numbers', description: 'Add automatic page numbers to any PDF.' },
      { slug: 'crop-pdf', name: 'Crop PDF', description: 'Trim margins or unwanted areas from PDF pages.' },
      { slug: 'repair-pdf', name: 'Repair PDF', description: 'Fix corrupted or damaged PDF files.' },
      { slug: 'pdf-to-pdfa', name: 'PDF to PDF/A', description: 'Convert to archival format for long-term storage.' },
      { slug: 'ocr-pdf', name: 'OCR PDF', description: 'Make scanned PDFs searchable and editable.' },
    ],
  },
  {
    title: "Convert To & From PDF",
    tools: [
      { slug: 'pdf-to-jpg', name: 'PDF → JPG', description: 'Convert PDF pages to JPG images.' },
      { slug: 'jpg-to-pdf', name: 'JPG → PDF', description: 'Turn images into PDF documents.' },
      { slug: 'pdf-to-word', name: 'PDF → DOCX', description: 'Convert PDFs to editable Word documents.' },
      { slug: 'word-to-pdf', name: 'DOCX → PDF', description: 'Convert Word (.docx) to PDF instantly.' },
      { slug: 'pdf-to-excel', name: 'PDF → XLSX', description: 'Convert PDF tables to Excel spreadsheets.' },
      { slug: 'excel-to-pdf', name: 'XLSX → PDF', description: 'Convert Excel (.xlsx) to PDF.' },
      { slug: 'pdf-to-powerpoint', name: 'PDF → PPTX', description: 'Convert PDFs to PowerPoint slides.' },
      { slug: 'powerpoint-to-pdf', name: 'PPTX → PDF', description: 'Convert PowerPoint (.pptx) to PDF.' },
      { slug: 'html-to-pdf', name: 'HTML → PDF', description: 'Save webpages as clean PDFs.' },
    ]
  },
  {
    title: "Secure & Protect",
    tools: [
      { slug: 'protect-pdf', name: 'Protect PDF', description: 'Add password protection to your PDF.' },
      { slug: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password from protected PDFs.' },
      { slug: 'watermark-pdf', name: 'Watermark PDF', description: 'Add text or image watermarks to protect content.' },
    ]
  }
];

const AllTools: React.FC<AllToolsProps> = ({ onToolSelect }) => {
  const findToolData = (slug: string) => {
    return allToolsData.find(t => t.slug === slug)!;
  };

  return (
    <main className="px-5 md:px-10 py-10 flex-grow bg-[#0F0F1A]">
      <div className="max-w-[1200px] mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white" style={{ fontSize: '36px' }}>All PDF Tools</h1>
          <p className="text-lg text-[#A0A0C0] mt-4 max-w-3xl mx-auto" style={{ fontSize: '18px' }}>
            22 powerful, free tools to convert, edit, secure, and optimize your PDFs.
          </p>
        </header>

        {toolCategories.map((category) => (
          <section key={category.title} className="mt-10 first:mt-0" style={{ marginTop: '40px' }}>
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontSize: '20px' }}>{category.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gap: '24px' }}>
              {category.tools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={{
                    name: tool.name,
                    description: tool.description,
                    icon: iconMap[tool.slug]
                  }}
                  onClick={() => onToolSelect(findToolData(tool.slug))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default AllTools;
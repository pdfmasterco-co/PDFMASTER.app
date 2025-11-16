import { GoogleGenAI, Modality, FunctionDeclaration, Type } from "@google/genai";
import { SmartSummaryData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Add type declaration for pdfjsLib from the CDN script
declare const pdfjsLib: any;

// --- PDF.co API Integration ---
const PDF_CO_API_KEY = 'douirii.amine@gmail.com_OQ1YG5IH1vlnf95as1469fH4in7NPZQU3KCrOb2p4uNsaBeBnX41VhMzfwQWBRmx';
const PDF_CO_BASE_URL = 'https://api.pdf.co/v1';

const pdfCoHeaders = {
  'x-api-key': PDF_CO_API_KEY,
  'Content-Type': 'application/json',
};

// Step 1: Upload file to PDF.co's secure storage and get a working URL
const uploadFileToPdfCo = async (file: File): Promise<string> => {
  // Get presigned URL for upload
  const presignedUrlResponse = await fetch(`${PDF_CO_BASE_URL}/file/upload/get-presigned-url?name=${encodeURIComponent(file.name)}`, {
    headers: { 'x-api-key': PDF_CO_API_KEY }
  });
  if (!presignedUrlResponse.ok) throw new Error('Failed to get PDF.co upload URL.');
  const presignedData = await presignedUrlResponse.json();
  if (presignedData.error) throw new Error(presignedData.message);

  const { presignedUrl, url } = presignedData;

  // Upload file to the presigned URL
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
  if (!uploadResponse.ok) throw new Error('File upload to PDF.co failed.');
  
  return url;
};


const pollPdfCoJob = async (jobId: string): Promise<string> => {
    let jobStatus = '';
    let resultUrl = '';
    let retries = 0;
    const maxRetries = 20; // Poll for a maximum of 20 seconds

    while (jobStatus !== 'success' && jobStatus !== 'failed' && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before polling
        retries++;

        const jobCheckResponse = await fetch(`${PDF_CO_BASE_URL}/job/check?jobid=${jobId}`, { headers: { 'x-api-key': PDF_CO_API_KEY }});
        const jobData = await jobCheckResponse.json();
        
        if (jobData.error) throw new Error(jobData.message);

        jobStatus = jobData.status;
        
        if (jobStatus === 'success') {
            resultUrl = jobData.url;
        } else if (jobStatus === 'failed') {
            throw new Error('PDF.co processing job failed.');
        }
    }

    if(jobStatus !== 'success') {
        throw new Error('PDF.co job timed out.');
    }
    return resultUrl;
};


export const processFileWithPdfCo = async (tool: string, files: File[], options: any = {}): Promise<string> => {
    const fileUrls = await Promise.all(files.map(file => uploadFileToPdfCo(file)));
    
    let endpoint = '';
    let body: any = {};
    const outputName = `${tool}_result`;

    switch (tool) {
        case 'merge':
            endpoint = '/pdf/merge';
            body = { url: fileUrls.join(','), name: `merged_files.pdf` };
            break;
        case 'split':
            endpoint = '/pdf/split';
            body = { url: fileUrls[0], pages: options.pages || "1-", name: `split_${files[0].name}` };
            break;
        case 'compress':
            endpoint = '/pdf/optimize';
            body = { url: fileUrls[0], name: `compressed_${files[0].name}` };
            break;
        case 'pdf-to-word':
            endpoint = '/pdf/convert/to/doc';
            body = { url: fileUrls[0], name: outputName + '.doc' };
            break;
        case 'word-to-pdf':
             endpoint = '/pdf/convert/from/doc';
             body = { url: fileUrls[0], name: outputName + '.pdf' };
             break;
        case 'excel-to-pdf':
            endpoint = '/pdf/convert/from/xlsx';
            body = { url: fileUrls[0], name: outputName + '.pdf' };
            break;
        case 'pdf-to-jpg':
            endpoint = '/pdf/convert/to/jpg';
            body = { url: fileUrls[0], pages: options.pages || "0-", name: outputName + '.jpg' };
            break;
        case 'protect':
            endpoint = '/pdf/security/add';
            body = { url: fileUrls[0], userPassword: options.password || '1234', ownerPassword: options.password || '1234', name: `protected_${files[0].name}` };
            break;
        case 'unlock':
            endpoint = '/pdf/security/remove';
            body = { url: fileUrls[0], password: options.password, name: `unlocked_${files[0].name}` };
            break;
        case 'rotate':
            endpoint = '/pdf/rotate';
            body = { url: fileUrls[0], angle: options.angle || 90, name: `rotated_${files[0].name}` };
            break;
        case 'watermark':
            endpoint = '/pdf/edit/add';
            body = { 
                url: fileUrls[0], 
                name: `watermarked_${files[0].name}`,
                text: [{
                    text: options.text || "SAMPLE",
                    x: 50,
                    y: 50,
                    size: 24,
                    color: "FF0000"
                }]
            };
            break;
        default:
            throw new Error(`Unknown tool: ${tool}`);
    }

    const processResponse = await fetch(`${PDF_CO_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: pdfCoHeaders,
        body: JSON.stringify({ ...body, async: true }) // Use async processing
    });

    const processData = await processResponse.json();
    if (processData.error) throw new Error(processData.message);

    const { jobId } = processData;
    return await pollPdfCoJob(jobId);
};

// --- Gemini AI for Tool Detection ---

const toolFunctionDeclarations: FunctionDeclaration[] = [
    { name: 'merge', description: 'Combine multiple PDF files into one.' },
    { name: 'split', description: 'Extract specific pages or page ranges from a PDF.', parameters: { type: Type.OBJECT, properties: { pages: { type: Type.STRING, description: 'e.g., "1-3, 5"' } } } },
    { name: 'compress', description: 'Reduce the file size of a PDF.' },
    { name: 'pdf-to-word', description: 'Convert a PDF to a Word document (.doc).' },
    { name: 'word-to-pdf', description: 'Convert a Word document (.doc or .docx) to a PDF.' },
    { name: 'excel-to-pdf', description: 'Convert an Excel spreadsheet (.xlsx) to a PDF.' },
    { name: 'pdf-to-jpg', description: 'Convert PDF pages to JPG images.' },
    { name: 'unlock', description: 'Remove a password from a PDF.', parameters: { type: Type.OBJECT, properties: { password: { type: Type.STRING, description: 'The password to unlock the PDF.' } } } },
    { name: 'protect', description: 'Add a password to a PDF.', parameters: { type: Type.OBJECT, properties: { password: { type: Type.STRING, description: 'The password to protect the PDF.' } } } },
    { name: 'rotate', description: 'Rotate pages in a PDF.', parameters: { type: Type.OBJECT, properties: { angle: { type: Type.NUMBER, description: 'The angle to rotate by (e.g., 90, 180, 270).' } } } },
    { name: 'watermark', description: 'Add a text watermark to a PDF.', parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING, description: 'The watermark text.' } } } },
];

export const detectPdfTool = async (prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: toolFunctionDeclarations }],
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const { name, args } = call;

            let needsFiles = 1;
            let message = `Great! I can help you **${name}** your file.`;

            if (name === 'merge') {
                needsFiles = 2;
                message = `Great! I can help you **merge** your files. Please upload at least 2 files.`;
            } else if (name === 'split') {
                message += ` You want to split pages: "${args.pages}".`;
            } else if (name === 'protect' || name === 'unlock') {
                if (args.password) message += ` The password is set.`;
                else message += ` You can set a password in the options if needed.`;
            } else if (name === 'rotate') {
                message += ` We'll rotate by ${args.angle || 90} degrees.`;
            }
            message += `\n\nPlease upload the file(s) you'd like to process.`;

            return { tool: name, args, needsFiles, message };
        }
        return null;
    } catch (error) {
        console.error("Error detecting PDF tool:", error);
        return null;
    }
};

// --- Other Missing AI Service Functions ---

// FIX: Added 'answerStyle' parameter to support different response lengths. This resolves an error in ChatPage.tsx and AiChatPage.tsx.
export const getChatResponse = async (prompt: string, context: string = "", fileName: string = "", answerStyle: 'detailed' | 'simple' = 'detailed') => {
    try {
        let systemInstruction = `You are an expert AI document assistant named PDF Assist. Your task is to answer user questions based *only* on the provided document text from the file named "${fileName}".
- Your response must be accurate.
- Ground every part of your answer in the document.
- For each piece of information you provide, you MUST include a citation on a new line in the format: 📄 Page X: 'a short, relevant quote from that page'.
- If the document does not contain the answer, you MUST state that the information is not in the document and do not provide any external information.
- Avoid conversational fluff.`;

        if (answerStyle === 'simple') {
            systemInstruction += "\n- Keep your answer to 1-2 sentences.";
        } else {
            systemInstruction += "\n- Provide a comprehensive, detailed answer.";
        }
        
        const fullPrompt = `Document context:\n${context.substring(0, 1000000)}\n\nUser query: ${prompt}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: context ? fullPrompt : prompt,
            config: {
                systemInstruction: systemInstruction
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        throw new Error("Failed to get response from AI.");
    }
};

export const extractTextWithOcr = async (file: File): Promise<string> => {
    try {
        const uploadedUrl = await uploadFileToPdfCo(file);

        const processResponse = await fetch(`${PDF_CO_BASE_URL}/pdf/convert/to/text-simple`, {
            method: 'POST',
            headers: pdfCoHeaders,
            body: JSON.stringify({ url: uploadedUrl, async: true, ocrLanguage: "eng" }),
        });

        const processData = await processResponse.json();
        if (processData.error) throw new Error(processData.message);

        const { jobId } = processData;
        const resultUrl = await pollPdfCoJob(jobId);

        const textResponse = await fetch(resultUrl);
        if (!textResponse.ok) throw new Error('Failed to fetch extracted text from PDF.co.');

        return await textResponse.text();
    } catch (error) {
        console.error("Error extracting text with OCR via PDF.co, falling back:", error);
        try {
            return await extractTextFromPdf(file);
        } catch (fallbackError) {
            console.error("Fallback text extraction failed:", fallbackError);
            throw new Error("Failed to extract text from the document using all available methods.");
        }
    }
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += `\n\n--- Page ${i} ---\n\n`;
        textContent += text.items.map((item: any) => item.str).join(' ');
    }
    return textContent;
};

// FIX: Added generateSummary function to resolve import error in ChatPage.tsx and AiChatPage.tsx.
export const generateSummary = async (file: File): Promise<string[]> => {
    try {
        const text = await extractTextFromPdf(file);
        if (text.trim().length < 100) {
            return ["* This appears to be a scanned or image-only document.", "* Analysis is limited."];
        }
        const prompt = `Generate a concise, structured summary of the following document as a bulleted list (3-4 key points). Text: ${text.substring(0, 4000)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
    } catch (error) {
        console.error("Error generating summary:", error);
        return ["* Could not generate a summary for this document."];
    }
};

// FIX: Added generateStructuredSummary function to resolve import error in AiChatPage.tsx.
export const generateStructuredSummary = async (documentText: string, fileName: string): Promise<SmartSummaryData> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        documentType: { type: Type.STRING, description: "Classify the document type (e.g., 'Contract', 'Invoice', 'Report'). If unknown, use 'General Document'." },
        keyDates: { type: Type.STRING, description: "Extract key dates. If none, use 'N/A'." },
        numbersAndAmounts: { type: Type.STRING, description: "Extract important numbers or monetary amounts. If none, use 'N/A'." },
        peopleAndOrgs: { type: Type.STRING, description: "List people or organizations mentioned. If none, use 'N/A'." },
        flags: { type: Type.STRING, description: "Identify any potential warnings or items needing attention (e.g., 'Missing Signature'). If none, use 'None'." },
        summaryText: { type: Type.STRING, description: "Provide a concise, one-paragraph summary of the document's main purpose." }
      },
      required: ['documentType', 'keyDates', 'numbersAndAmounts', 'peopleAndOrgs', 'flags', 'summaryText']
    };
  
    const prompt = `Analyze the following document text from a file named "${fileName}". Extract key information and provide a summary. Text: \n\n\`\`\`\n${documentText.substring(0, 15000)}\n\`\`\``;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
  
      const parsedJson = JSON.parse(response.text);
      return parsedJson as SmartSummaryData;
  
    } catch (error) {
      console.error("Error generating structured summary:", error);
      return {
        documentType: 'Document',
        keyDates: 'N/A',
        numbersAndAmounts: 'N/A',
        peopleAndOrgs: 'N/A',
        flags: 'Analysis could not be completed.',
        summaryText: 'Could not generate a summary for this document.',
        isScanned: false,
      };
    }
};
  
export const getInitialAnalysis = async (documentText: string): Promise<{
    documentType: string;
    keyDate: string;
    amount: string;
    parties: string;
    quote: string;
    pageNumber: number;
}> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        documentType: { type: Type.STRING, description: "e.g., 'Contract', 'Invoice'. If unknown, use 'Document'." },
        keyDate: { type: Type.STRING, description: "e.g., 'August 30, 2025'. If none, use 'N/A'." },
        amount: { type: Type.STRING, description: "e.g., '$1,250'. If none, use 'N/A'." },
        parties: { type: Type.STRING, description: "e.g., 'John Doe & Acme Corp'. If none, use 'N/A'." },
        quote: { type: Type.STRING, description: "A short, significant quote from the text." },
        pageNumber: { type: Type.NUMBER, description: "The page number for the quote." },
      },
      required: ['documentType', 'keyDate', 'amount', 'parties', 'quote', 'pageNumber']
    };
  
    const prompt = `Analyze the following document text and return a JSON object with: 'documentType', 'keyDate', 'amount', 'involvedParties' (as 'parties'), and a 'significantQuote' with its corresponding 'pageNumber'. Find the first and most relevant data for each field. Text: \n\n\`\`\`\n${documentText.substring(0, 15000)}\n\`\`\``;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
  
      const parsedJson = JSON.parse(response.text);
      return parsedJson;
  
    } catch (error) {
      console.error("Error generating initial analysis:", error);
      // Provide a structured fallback
      return {
        documentType: 'Document',
        keyDate: 'N/A',
        amount: 'N/A',
        parties: 'N/A',
        quote: 'Analysis could not be completed.',
        pageNumber: 1
      };
    }
};


export const getSpeechResponse = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // This is a placeholder as direct audio transcription with genai isn't straightforward here.
    // In a real scenario, this would involve a more complex setup or a different API.
    console.log("Simulating transcription for blob:", audioBlob);
    return Promise.resolve("This is a simulated transcription of your audio recording.");
};


export const analyzeTranscription = async (text: string, prompt: string): Promise<string> => {
    return getChatResponse(`${prompt}\n\nTEXT: "${text}"`, '', '', );
};
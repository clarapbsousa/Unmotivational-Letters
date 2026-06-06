import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// pdfjs-dist v4 uses a worker thread. We load the matching worker from CDN so bundling
// doesn't need to handle the .mjs worker file. This only runs in the browser.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

function extractTextFromDocxXml(xmlString: string): string {
  // Quick-and-dirty text extraction from word/document.xml.
  // DOCX text lives inside <w:t> tags.
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const textNodes = xmlDoc.getElementsByTagName('w:t');
  let text = '';
  for (let i = 0; i < textNodes.length; i++) {
    text += textNodes[i].textContent;
  }
  return text;
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      if (fullText.trim().length > 20) {
        return fullText.trim().substring(0, 8000);
      }
      throw new Error('Could not extract text from this PDF. It may be a scanned image. Please paste the text manually.');
    }

    if (ext === 'docx') {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const documentXml = await zip.file('word/document.xml')?.async('string');
      if (!documentXml) {
        throw new Error('Could not read DOCX structure. Please paste the text manually.');
      }
      const text = extractTextFromDocxXml(documentXml);
      if (text.length > 20) {
        return text.substring(0, 8000);
      }
      throw new Error('Could not extract text from this DOCX file. Please paste the text manually.');
    }

    // Fallback for plain text files
    const text = await readFileAsText(file);
    if (text.length > 20) {
      return text.substring(0, 8000);
    }

    throw new Error('Could not extract text from this file. Please paste the text manually.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('paste')) {
      throw error;
    }
    throw new Error('Could not read file. Please paste your CV text manually.');
  }
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result !== undefined) {
        resolve(result.substring(0, 8000));
      } else {
        reject(new Error('Could not read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

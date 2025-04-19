import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source path to use the local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export { pdfjsLib }; 
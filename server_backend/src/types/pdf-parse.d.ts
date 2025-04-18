declare module 'pdf-parse' {
  interface PageInfo {
    width: number;
    height: number;
  }

  interface PdfData {
    pageInfo: PageInfo[];
  }

  function parse(buffer: Buffer): Promise<PdfData>;
  export = parse;
} 
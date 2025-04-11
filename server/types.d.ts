declare module 'html-pdf-node' {
  interface Options {
    format?: string;
    path?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    landscape?: boolean;
    scale?: number;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    preferCSSPageSize?: boolean;
  }

  interface FileOptions {
    content?: string;
    url?: string;
    path?: string;
  }

  function generatePdf(file: FileOptions, options: Options): Promise<Buffer>;
  function generatePdfs(files: FileOptions[], options: Options): Promise<Buffer[]>;
  
  export { generatePdf, generatePdfs };
}

declare module 'html-to-text' {
  interface Options {
    wordwrap?: number | null;
    noLinkBrackets?: boolean;
    tables?: string[];
    ignoreHref?: boolean;
    ignoreImage?: boolean;
    preserveNewlines?: boolean;
    uppercaseHeadings?: boolean;
    baseElement?: string | string[];
    returnDomByDefault?: boolean;
    hideLinkHrefIfSameAsText?: boolean;
    linkHrefBaseUrl?: string;
    noAnchorUrl?: boolean;
    formatters?: any;
    decodeOptions?: { isAttributeValue: boolean; strict: boolean };
    limits?: { maxInputLength?: number; ellipsis?: string };
    selectors?: Array<{
      selector: string;
      format?: string;
      options?: any;
    }>;
  }

  function convert(html: string, options?: Options): string;
  
  export { convert, Options };
}

// Fix for JSON content in proposal content field
interface ProposalContent {
  executiveSummary?: string;
  scopeOfWork?: string;
  deliverables?: string[] | string;
  timeline?: string;
  pricingDetails?: string;
  terms?: string;
  [key: string]: any;
}
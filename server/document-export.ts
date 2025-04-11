import puppeteer from 'puppeteer';
import * as htmlPdf from 'html-pdf-node';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { convert } from 'html-to-text';
import fs from 'fs';
import path from 'path';
import { Proposal, Client, Template } from '@shared/schema';

export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html'
}

// Function to convert proposal data to HTML
function generateProposalHTML(proposal: Proposal, client?: Client, template?: Template): string {
  // Extract client and company details
  const clientName = client?.companyName || 'Client';
  const clientAddress = [
    client?.address,
    client?.city,
    client?.state,
    client?.postalCode
  ].filter(Boolean).join(', ');
  
  // Proposal details
  const proposalDate = new Date(proposal.createdAt || new Date()).toLocaleDateString();
  const proposalAmount = proposal.amount || 'TBD';
  
  // Content from template or proposal
  const content = (proposal.content || template?.content || {}) as ProposalContent;
  
  // Create HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${proposal.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .proposal-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .proposal-meta {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .client-info, .company-info {
          width: 48%;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f2f7ff;
        }
        .amount {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="proposal-title">${proposal.title}</div>
        <div>Proposal #${proposal.id} | ${proposalDate} | ${proposal.status || 'Draft'}</div>
      </div>
      
      <div class="proposal-meta">
        <div class="client-info">
          <h3>Client</h3>
          <div>${clientName}</div>
          <div>${clientAddress}</div>
          <div>${client?.contactName || ''}</div>
          <div>${client?.email || ''}</div>
          <div>${client?.phone || ''}</div>
        </div>
        
        <div class="company-info">
          <h3>Our Company</h3>
          <div>ProposalPro, Inc.</div>
          <div>123 Business Ave, Suite 200</div>
          <div>San Francisco, CA 94107</div>
          <div>contact@proposalpro.example</div>
          <div>(555) 123-4567</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Executive Summary</div>
        <p>${content.executiveSummary || 'This proposal outlines our plan to fulfill your requirements efficiently and effectively.'}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Scope of Work</div>
        <p>${content.scopeOfWork || 'We will provide comprehensive services as detailed in the following sections.'}</p>
      </div>
      
      ${content.deliverables ? `
      <div class="section">
        <div class="section-title">Deliverables</div>
        <ul>
          ${Array.isArray(content.deliverables) 
            ? content.deliverables.map((item: string) => `<li>${item}</li>`).join('') 
            : `<li>${content.deliverables}</li>`}
        </ul>
      </div>` : ''}
      
      ${content.timeline ? `
      <div class="section">
        <div class="section-title">Timeline</div>
        <p>${content.timeline}</p>
      </div>` : ''}
      
      <div class="section">
        <div class="section-title">Pricing</div>
        <p>Total Amount: <span class="amount">$${proposalAmount}</span></p>
        ${content.pricingDetails || ''}
      </div>
      
      <div class="section">
        <div class="section-title">Terms & Conditions</div>
        <p>${content.terms || 'Standard terms and conditions apply to this proposal.'}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for considering our proposal. We look forward to the opportunity to work with you.</p>
        <p>This proposal is valid for 30 days from the date of issue.</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

// Function to export proposal as PDF
export async function exportToPdf(proposal: Proposal, client?: Client, template?: Template): Promise<Buffer> {
  const html = generateProposalHTML(proposal, client, template);
  
  const options = { 
    format: 'A4',
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  };
  
  return new Promise((resolve, reject) => {
    htmlPdf.generatePdf({ content: html }, options)
      .then(pdfBuffer => {
        resolve(pdfBuffer);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Function to export proposal as DOCX
export async function exportToDocx(proposal: Proposal, client?: Client, template?: Template): Promise<Buffer> {
  const html = generateProposalHTML(proposal, client, template);
  
  // Convert HTML to plain text for easier processing
  const text = convert(html, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { baseUrl: '#' } },
      { selector: 'img', format: 'skip' }
    ]
  });
  
  // Create DOCX document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: proposal.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 }
        }),
        
        new Paragraph({
          text: `Proposal #${proposal.id} | ${new Date(proposal.createdAt || new Date()).toLocaleDateString()} | ${proposal.status || 'Draft'}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        // Client and Company Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "Client Information" })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Our Company" })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: client?.companyName || 'Client' }),
                    new Paragraph({ 
                      text: [
                        client?.address,
                        client?.city,
                        client?.state,
                        client?.postalCode
                      ].filter(Boolean).join(', ')
                    }),
                    new Paragraph({ text: client?.contactName || '' }),
                    new Paragraph({ text: client?.email || '' }),
                    new Paragraph({ text: client?.phone || '' }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "ProposalPro, Inc." }),
                    new Paragraph({ text: "123 Business Ave, Suite 200" }),
                    new Paragraph({ text: "San Francisco, CA 94107" }),
                    new Paragraph({ text: "contact@proposalpro.example" }),
                    new Paragraph({ text: "(555) 123-4567" }),
                  ],
                }),
              ],
            }),
          ],
        }),
        
        // Executive Summary
        new Paragraph({
          text: "Executive Summary",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: typeof proposal.content === 'object' && proposal.content !== null 
            ? (proposal.content as any).executiveSummary || 'This proposal outlines our plan to fulfill your requirements efficiently and effectively.'
            : 'This proposal outlines our plan to fulfill your requirements efficiently and effectively.'
        }),
        
        // Scope of Work
        new Paragraph({
          text: "Scope of Work",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: typeof proposal.content === 'object' && proposal.content !== null 
            ? (proposal.content as any).scopeOfWork || 'We will provide comprehensive services as detailed in the following sections.'
            : 'We will provide comprehensive services as detailed in the following sections.'
        }),
        
        // Pricing
        new Paragraph({
          text: "Pricing",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: `Total Amount: $${proposal.amount || 'TBD'}`,
          spacing: { after: 200 }
        }),
        
        // Terms
        new Paragraph({
          text: "Terms & Conditions",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: typeof proposal.content === 'object' && proposal.content !== null 
            ? (proposal.content as any).terms || 'Standard terms and conditions apply to this proposal.'
            : 'Standard terms and conditions apply to this proposal.'
        }),
        
        // Footer
        new Paragraph({
          text: "Thank you for considering our proposal. We look forward to the opportunity to work with you.",
          spacing: { before: 400 }
        }),
        new Paragraph({
          text: "This proposal is valid for 30 days from the date of issue.",
        }),
      ],
    }],
  });
  
  // Generate buffer
  return await Packer.toBuffer(doc);
}

// Function to handle HTML export
export function exportToHtml(proposal: Proposal, client?: Client, template?: Template): Buffer {
  const html = generateProposalHTML(proposal, client, template);
  return Buffer.from(html, 'utf-8');
}

// Main export function that handles different formats
export async function exportProposal(
  proposal: Proposal, 
  format: ExportFormat, 
  client?: Client, 
  template?: Template
): Promise<{buffer: Buffer, filename: string, contentType: string}> {
  let buffer: Buffer;
  let contentType: string;
  let fileExt: string;
  
  try {
    switch (format) {
      case ExportFormat.PDF:
        buffer = await exportToPdf(proposal, client, template);
        contentType = 'application/pdf';
        fileExt = 'pdf';
        break;
        
      case ExportFormat.DOCX:
        buffer = await exportToDocx(proposal, client, template);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExt = 'docx';
        break;
        
      case ExportFormat.HTML:
        buffer = exportToHtml(proposal, client, template);
        contentType = 'text/html';
        fileExt = 'html';
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    const sanitizedTitle = proposal.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `proposal_${proposal.id}_${sanitizedTitle}.${fileExt}`;
    
    return { buffer, filename, contentType };
  } catch (error) {
    console.error(`Error exporting proposal to ${format}:`, error);
    throw error;
  }
}
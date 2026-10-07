import { Document, AnswerResponse, Page } from '../types';

const API_BASE = 'http://localhost:8005/api';

export const api = {
  async getDocuments(): Promise<Document[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocument(docId: string): Promise<Document> {
    const res = await fetch(`${API_BASE}/documents/${docId}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  async getDocumentPages(docId: string): Promise<Page[]> {
    const res = await fetch(`${API_BASE}/documents/${docId}/pages`);
    if (!res.ok) throw new Error('Failed to fetch pages');
    return res.json();
  },

  getPageImageUrl(docId: string, pageNum: number): string {
    return `${API_BASE}/documents/${docId}/pages/${pageNum}/image`;
  },

  async getDocumentMap(docId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${docId}/map`);
    if (!res.ok) throw new Error('Failed to fetch document map');
    return res.json();
  },

  async uploadDocument(file: File, title?: string): Promise<{ status: string; document: Document }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async askQuestion(question: string, documentIds?: string[]): Promise<AnswerResponse> {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, document_ids: documentIds }),
    });
    if (!res.ok) throw new Error('Failed to submit question');
    return res.json();
  },

  async runLiveDemo(): Promise<{ status: string; demo_mode: boolean; signature_question: string; result: AnswerResponse }> {
    const res = await fetch(`${API_BASE}/demo/run`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to execute live demo');
    return res.json();
  },

  async getDemoStatus(): Promise<{ indexed_documents: number; demo_files_available: number; is_ready: boolean; signature_question: string }> {
    const res = await fetch(`${API_BASE}/demo/status`);
    if (!res.ok) throw new Error('Failed to check demo status');
    return res.json();
  },
};

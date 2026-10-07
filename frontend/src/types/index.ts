export interface BoundingBox {
  x: number;      // [0, 1] normalized
  y: number;      // [0, 1] normalized
  width: number;  // [0, 1] normalized
  height: number; // [0, 1] normalized
}

export type ElementType = 'TEXT' | 'TABLE' | 'CHART' | 'GRAPH' | 'IMAGE' | 'SCANNED_TEXT' | 'DIAGRAM';

export interface DocumentElement {
  id: string;
  document_id: string;
  page_number: number;
  element_type: ElementType;
  content: string;
  bounding_box: BoundingBox;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface Page {
  id: string;
  document_id: string;
  page_number: number;
  width: number;
  height: number;
  image_path: string;
  ocr_confidence: number;
  is_scanned: boolean;
  elements: DocumentElement[];
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  file_size: number;
  page_count: number;
  file_type: string;
  status: string;
  created_at: string;
  pages?: Page[];
}

export interface Citation {
  id: string;
  citation_number: number;
  document_id: string;
  document_name: string;
  page_number: number;
  element_id: string;
  element_type: ElementType;
  snippet: string;
  extracted_value?: string;
  bounding_box: BoundingBox;
  confidence: number;
  relevance_score: number;
}

export interface Claim {
  id: string;
  claim_text: string;
  support_status: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_EVIDENCE';
  confidence: number;
  citations: Citation[];
  reasoning: string;
}

export interface NumericalCalculation {
  operation: string;
  inputs: Record<string, any>;
  result: number;
  formatted_result: string;
  explanation: string;
}

export interface TimelineStep {
  id: string;
  stage: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
  details?: Record<string, any>;
}

export interface EvidenceNode {
  id: string;
  node_type: 'document' | 'page' | 'element' | 'fact' | 'claim' | 'calculation' | 'answer' | 'question';
  label: string;
  document_id?: string;
  document_name?: string;
  page_number?: number;
  element_id?: string;
  element_type?: ElementType;
  content?: string;
  value?: string;
  bounding_box?: BoundingBox;
  confidence: number;
}

export interface EvidenceEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation: string;
  weight: number;
  description: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export interface AnswerResponse {
  id: string;
  question: string;
  subquestions: string[];
  answer: string;
  reasoning: string;
  claims: Claim[];
  citations: Citation[];
  evidence_graph: EvidenceGraph;
  timeline: TimelineStep[];
  calculations: NumericalCalculation[];
  confidence_score: number;
  confidence_quality: 'High' | 'Medium' | 'Low';
  confidence_explanation: string;
  sources_count: number;
  pages_analyzed: number;
}

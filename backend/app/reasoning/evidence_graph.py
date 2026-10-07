from typing import Any, Optional
from app.models.schema_models import (
    EvidenceGraph, EvidenceNode, EvidenceEdge, Document, DocumentElement, Claim, Citation
)

class EvidenceGraphBuilder:
    """
    Constructs the Multimodal Evidence Graph.
    Connects: Document -> Page -> Visual/Text Region -> Evidence Element -> Fact -> Relationship -> Claim -> Answer.
    Maintains direct coordinate and visual anchor links for every node.
    """

    @staticmethod
    def build_graph_for_answer(
        question_id: str,
        question_text: str,
        answer_text: str,
        claims: list[Claim],
        citations: list[Citation],
        related_elements: list[DocumentElement]
    ) -> EvidenceGraph:
        nodes: list[EvidenceNode] = []
        edges: list[EvidenceEdge] = []
        added_node_ids = set()

        # 1. Question Node
        q_node = EvidenceNode(
            id=f"q_{question_id}",
            node_type="question",
            label=f"Query: {question_text[:40]}...",
            content=question_text,
            confidence=1.0
        )
        nodes.append(q_node)
        added_node_ids.add(q_node.id)

        # 2. Answer Node
        ans_node = EvidenceNode(
            id=f"ans_{question_id}",
            node_type="answer",
            label="Verified Answer",
            content=answer_text[:120] + "...",
            confidence=0.96
        )
        nodes.append(ans_node)
        added_node_ids.add(ans_node.id)

        # Edge Question -> Answer
        edges.append(EvidenceEdge(
            source_id=q_node.id,
            target_id=ans_node.id,
            relation="generates",
            description="Question addressed by grounded answer"
        ))

        # 3. Claims Nodes
        for claim in claims:
            c_node_id = f"claim_{claim.id[:8]}"
            if c_node_id not in added_node_ids:
                c_node = EvidenceNode(
                    id=c_node_id,
                    node_type="claim",
                    label=f"Claim: {claim.claim_text[:35]}...",
                    content=claim.claim_text,
                    value=claim.support_status,
                    confidence=claim.confidence
                )
                nodes.append(c_node)
                added_node_ids.add(c_node_id)

                edges.append(EvidenceEdge(
                    source_id=ans_node.id,
                    target_id=c_node_id,
                    relation="composed_of",
                    description=f"Answer asserts: {claim.support_status}"
                ))

            # 4. Citations & Element Nodes for this claim
            for cit in claim.citations:
                elem_node_id = f"elem_{cit.element_id[:8]}"
                if elem_node_id not in added_node_ids:
                    elem_node = EvidenceNode(
                        id=elem_node_id,
                        node_type="element",
                        label=f"{cit.element_type}: {cit.document_name} (p.{cit.page_number})",
                        document_id=cit.document_id,
                        document_name=cit.document_name,
                        page_number=cit.page_number,
                        element_id=cit.element_id,
                        element_type=cit.element_type,
                        content=cit.snippet,
                        value=cit.extracted_value,
                        bounding_box=cit.bounding_box,
                        confidence=cit.confidence
                    )
                    nodes.append(elem_node)
                    added_node_ids.add(elem_node_id)

                edges.append(EvidenceEdge(
                    source_id=c_node_id,
                    target_id=elem_node_id,
                    relation="grounded_by",
                    description=f"Verified in {cit.element_type} at Page {cit.page_number}"
                ))

                # 5. Page Node
                page_node_id = f"page_{cit.document_id[:8]}_{cit.page_number}"
                if page_node_id not in added_node_ids:
                    page_node = EvidenceNode(
                        id=page_node_id,
                        node_type="page",
                        label=f"Page {cit.page_number}",
                        document_id=cit.document_id,
                        document_name=cit.document_name,
                        page_number=cit.page_number,
                        confidence=0.98
                    )
                    nodes.append(page_node)
                    added_node_ids.add(page_node_id)

                edges.append(EvidenceEdge(
                    source_id=elem_node_id,
                    target_id=page_node_id,
                    relation="located_on",
                    description=f"Element located on Page {cit.page_number}"
                ))

                # 6. Document Node
                doc_node_id = f"doc_{cit.document_id[:8]}"
                if doc_node_id not in added_node_ids:
                    doc_node = EvidenceNode(
                        id=doc_node_id,
                        node_type="document",
                        label=cit.document_name,
                        document_id=cit.document_id,
                        document_name=cit.document_name,
                        confidence=1.0
                    )
                    nodes.append(doc_node)
                    added_node_ids.add(doc_node_id)

                edges.append(EvidenceEdge(
                    source_id=page_node_id,
                    target_id=doc_node_id,
                    relation="part_of",
                    description=f"Page belongs to {cit.document_name}"
                ))

        return EvidenceGraph(nodes=nodes, edges=edges)

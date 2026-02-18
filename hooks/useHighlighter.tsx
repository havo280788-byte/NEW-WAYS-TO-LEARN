import React, { useState, useCallback } from 'react';

export interface Highlight {
    start: number;
    end: number;
    text: string;
}

export interface HighlightMap {
    [passageId: string]: {
        [paragraphIndex: number]: Highlight[];
    };
}

export const useHighlighter = () => {
    // State to store highlights: passageId -> paragraphIndex -> array of highlights
    const [highlights, setHighlights] = useState<HighlightMap>({});
    const [isHighlighterActive, setIsHighlighterActive] = useState(false);

    const toggleHighlighter = useCallback(() => {
        setIsHighlighterActive(prev => !prev);
    }, []);

    const addHighlight = useCallback((passageId: string, paragraphIndex: number, textContent: string) => {
        if (!isHighlighterActive) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        // We need to find the offset relative to the paragraph text.
        // The selection might be across multiple nodes (if there are already highlights).
        // This is the tricky part.

        // Strategy:
        // 1. Get the paragraph element (we'll need to rely on the event target or a ref, 
        //    but for now let's assume the selection is within the paragraph container).
        // 2. We can try to get the start offset relative to the text content.

        // Simplified robust approach for this specific app:
        // We can use the `anchorNode` and `focusNode` to find the position.
        // However, since we are rendering the text as a mix of spans and text nodes, 
        // Getting the absolute offset is hard without a refined approach.

        // Better approach for the MVP fix:
        // We will use a library or a robust function to get the selection range relative to a container.
        // But to keep dependencies low, let's implement a helper.

        // For now, let's try to get the container element from the selection.

        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) { // Text node
            container = container.parentElement!;
        }

        // Check if the container is our paragraph or a child of it.
        // In our render, the paragraph is the block element.
        // If we highlight inside a span, the container is the span.

        // We need the offset relative to the *original text content*.
        // This is hard if we don't store the original text or have a clean way to map it.

        // ALTERNATIVE:
        // If we assume the `textContent` passed to this function is the source of truth,
        // we can try to find where the selected string exists.
        // But the selected string might appear multiple times.

        // Let's use a "Range to Offset" helper.

        const preSelectionRange = range.cloneRange();

        // Find the actual paragraph element (p tag)
        // We can walk up from the focusNode until we find a P tag or reach the root.
        let pNode: Node | null = selection.anchorNode;
        while (pNode && pNode.nodeName !== 'P') {
            pNode = pNode.parentNode;
        }

        if (!pNode) return; // Selection not in a paragraph

        preSelectionRange.selectNodeContents(pNode);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selectedText.length;

        const newHighlight: Highlight = { start, end, text: selectedText };

        setHighlights((prev: HighlightMap) => {
            const passageHighlights = prev[passageId] || {};
            const paragraphHighlights = passageHighlights[paragraphIndex] || [];

            // Merge overlaps? For now, let's just push and handle rendering carefully.
            // Or better: flatten/merge highlights on render or here.
            // Let's just add it and sort later.
            const updatedParagraphHighlights: Highlight[] = [...paragraphHighlights, newHighlight];

            return {
                ...prev,
                [passageId]: {
                    ...passageHighlights,
                    [paragraphIndex]: updatedParagraphHighlights
                }
            };
        });

        selection.removeAllRanges();
    }, [isHighlighterActive]);

    const removeHighlight = useCallback((passageId: string, paragraphIndex: number, highlightProp: Highlight) => {
        setHighlights((prev: HighlightMap) => {
            const passageHighlights = prev[passageId] || {};
            const paragraphHighlights = passageHighlights[paragraphIndex] || [];

            return {
                ...prev,
                [passageId]: {
                    ...passageHighlights,
                    [paragraphIndex]: paragraphHighlights.filter((h: Highlight) => h.start !== highlightProp.start || h.end !== highlightProp.end)
                }
            };
        });
    }, []);

    const renderHighlightedText = (text: string, passageId: string, paragraphIndex: number) => {
        const passageHighlights = highlights[passageId] || {};
        const paragraphHighlights = passageHighlights[paragraphIndex] || [];

        if (paragraphHighlights.length === 0) return text;

        // Clean up and merge highlights for rendering
        // Sort by start position
        const sorted = [...paragraphHighlights].sort((a, b) => a.start - b.start);

        // Merge overlaps
        const merged: Highlight[] = [];
        if (sorted.length > 0) {
            let current = sorted[0];
            for (let i = 1; i < sorted.length; i++) {
                const next = sorted[i];
                if (next.start < current.end) {
                    // Overlap
                    current.end = Math.max(current.end, next.end);
                    current.text = text.substring(current.start, current.end);
                } else {
                    merged.push(current);
                    current = next;
                }
            }
            merged.push(current);
        }

        const parts = [];
        let lastIndex = 0;

        merged.forEach((h, idx) => {
            if (h.start > lastIndex) {
                parts.push(<span key={`text-${idx}`}> {text.substring(lastIndex, h.start)} </span>);
            }
            parts.push(
                <span
                    key={`highlight-${idx}`}
                    className="bg-yellow-200 text-slate-900 rounded-sm cursor-pointer hover:bg-yellow-300 transition-colors"
                    onClick={(e) => {
                        // Optional: Click to remove?
                        // e.stopPropagation();
                        // removeHighlight(passageId, paragraphIndex, h);
                    }}
                >
                    {text.substring(h.start, h.end)}
                </span>
            );
            lastIndex = h.end;
        });

        if (lastIndex < text.length) {
            parts.push(<span key="text-end" > {text.substring(lastIndex)} </span>);
        }

        return parts;
    };

    return {
        highlights,
        isHighlighterActive,
        toggleHighlighter,
        addHighlight,
        removeHighlight,
        renderHighlightedText
    };
};

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Citation, CitationFormat } from '../types/citation';
import { CitationComponent } from '../components/CitationComponent';

export interface CitationOptions {
  HTMLAttributes: Record<string, any>;
  citations: Citation[];
  formatCitation: (citation: Citation, format: CitationFormat) => string;
  defaultFormat: CitationFormat;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      /**
       * Add a citation node
       */
      insertCitation: (citationId: string, format?: CitationFormat) => ReturnType;
    };
  }
}

export const CitationExtension = Node.create<CitationOptions>({
  name: 'citation',
  
  group: 'inline',
  
  inline: true,
  
  atom: true,
  
  addOptions() {
    return {
      HTMLAttributes: {},
      citations: [],
      formatCitation: () => '',
      defaultFormat: 'apa',
    };
  },
  
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-citation-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          
          return {
            'data-citation-id': attributes.id,
          };
        },
      },
      format: {
        default: this.options.defaultFormat,
        parseHTML: element => element.getAttribute('data-citation-format'),
        renderHTML: attributes => {
          return {
            'data-citation-format': attributes.format,
          };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span[data-citation-id]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CitationComponent);
  },
  
  addCommands() {
    return {
      insertCitation:
        (id, format = this.options.defaultFormat) =>
        ({ chain }) => {
          // Find the citation in the list
          const citation = this.options.citations.find(c => c.id === id);
          
          if (!citation) {
            return false;
          }
          
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                id,
                format,
              },
            })
            .run();
        },
    };
  },
});

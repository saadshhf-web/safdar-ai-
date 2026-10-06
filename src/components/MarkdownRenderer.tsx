import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple and safe parsing of markdown blocks: code blocks, headings, bold, bullet points, blockquotes
  const parseBlocks = () => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trimEnd(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return parts;
  };

  const renderInlineFormatted = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lIdx) => {
      // Heading
      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="text-base font-bold text-slate-100 mt-4 mb-2">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={lIdx} className="text-lg font-bold text-slate-100 mt-5 mb-2.5">
            {line.substring(3)}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={lIdx} className="text-xl font-extrabold text-slate-100 mt-6 mb-3">
            {line.substring(2)}
          </h2>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={lIdx}
            className="border-l-3 border-indigo-500/80 bg-indigo-950/20 px-3.5 py-1.5 my-2 text-slate-300 italic rounded-r text-sm"
          >
            {line.substring(2)}
          </blockquote>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemContent = line.trim().substring(2);
        return (
          <li key={lIdx} className="ml-5 list-disc my-1 text-slate-200">
            {renderInlineSpans(itemContent)}
          </li>
        );
      }

      // Numbered list
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={lIdx} className="ml-5 flex gap-2 my-1 text-slate-200">
            <span className="font-semibold text-indigo-400">{numMatch[1]}.</span>
            <span>{renderInlineSpans(numMatch[2])}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-1.5 text-slate-200 leading-relaxed">
          {renderInlineSpans(line)}
        </p>
      );
    });
  };

  const renderInlineSpans = (text: string) => {
    // Replace inline code, bold, italic
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const segments = text.split(regex);

    return segments.map((seg, sIdx) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={sIdx}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700/60"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={sIdx} className="font-semibold text-slate-100">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return (
          <em key={sIdx} className="italic text-slate-300">
            {seg.slice(1, -1)}
          </em>
        );
      }
      // Links
      const linkMatch = seg.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return (
          <a
            key={sIdx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={sIdx}>{seg}</span>;
    });
  };

  const blocks = parseBlocks();

  return (
    <div className="space-y-2 text-sm leading-relaxed select-text">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          const isCopied = copiedIndex === idx;
          return (
            <div
              key={idx}
              className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 shadow-sm"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-indigo-400" />
                  <span>{block.language || 'code'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(block.content, idx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                  title="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-normal selection:bg-indigo-500/40">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        return <div key={idx}>{renderInlineFormatted(block.content)}</div>;
      })}
    </div>
  );
};

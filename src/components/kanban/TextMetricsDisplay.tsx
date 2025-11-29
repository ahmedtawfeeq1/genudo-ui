import React from "react";

interface Props {
  wordCount: number;
  charCount: number;
  className?: string;
}

const TextMetricsDisplay: React.FC<Props> = ({ wordCount, charCount, className }) => {
  return (
    <div className={`flex justify-end text-xs text-muted-foreground ${className || ''}`}>
      <span>
        {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
      </span>
    </div>
  );
};

export default TextMetricsDisplay;

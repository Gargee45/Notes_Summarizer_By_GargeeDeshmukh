import React from 'react';

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NoteInput({ value, onChange, disabled }: NoteInputProps) {
  return (
    <div className="w-full">
      <label htmlFor="notes" className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-[0.15em]">
        <span>Direct Text Entry</span>
      </label>
      <div className="relative group">
        <textarea
          id="notes"
          rows={7}
          className="block w-full p-6 text-base text-slate-800 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 resize-none transition-all duration-300 shadow-xl shadow-slate-200/20"
          placeholder="Paste high-level notes, transcripts, or meeting minutes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-300">
          {value.length} characters
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-700 overflow-hidden",
            isDragging 
              ? "border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)]" 
              : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-700" />
          
          <div className="relative flex flex-col items-center justify-center p-8 text-center">
            <div className={cn(
              "p-5 mb-5 rounded-3xl transition-all duration-700",
              isDragging ? "bg-blue-600 text-white scale-125 rotate-12 shadow-2xl shadow-blue-500/40" : "bg-white/5 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-500/20"
            )}>
              <Upload className="w-10 h-10" />
            </div>
            <p className="mb-2 text-xl font-black text-white tracking-tight">
              Push your knowledge
            </p>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              PDF / TXT • MAX 10MB
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.txt" 
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/50 blur-xl rounded-full" />
              <div className="relative p-4 bg-blue-600 text-white rounded-2xl shadow-xl">
                <FileText className="w-7 h-7" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-white truncate max-w-[200px] tracking-tight">
                {selectedFile.name}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">Ready</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isProcessing && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 text-blue-400 rounded-2xl border border-white/5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Distilling</span>
              </div>
            )}
            <button
              onClick={clearFile}
              className="p-3 hover:bg-red-500/10 rounded-2xl text-slate-500 hover:text-red-400 transition-all duration-300"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

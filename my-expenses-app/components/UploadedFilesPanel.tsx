"use client";

import React, { useState, useEffect } from "react";
import { getUserFiles, formatFileSize, UploadedFile } from "@/lib/fileStorage";
import { FiDownload, FiFile, FiFileText, FiX, FiEye } from "react-icons/fi";

interface UploadedFilesPanelProps {
  userEmail: string;
  month: string;
}

const UploadedFilesPanel: React.FC<UploadedFilesPanelProps> = ({
  userEmail,
  month,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const userFiles = await getUserFiles(userEmail, month);
        setFiles(userFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail && month) {
      fetchFiles();
    }
  }, [userEmail, month]);

  const handleDownload = (file: UploadedFile) => {
    window.open(file.downloadURL, "_blank");
  };

  const handleView = (file: UploadedFile) => {
    window.open(file.downloadURL, "_blank");
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FiFile className="h-5 w-5 text-red-400" />;
    } else if (fileType.includes("csv")) {
      return <FiFileText className="h-5 w-5 text-green-400" />;
    }
    return <FiFile className="h-5 w-5 text-text-tertiary" />;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-text-tertiary">
            Loading uploaded files...
          </p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-5 shadow-lg">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            📎 Uploaded Files ({files.length})
          </h3>
          <p className="text-xs text-text-tertiary mt-1">
            {month} - Click to {isExpanded ? "collapse" : "expand"}
          </p>
        </div>
        <button className="text-text-tertiary hover:text-text-primary transition">
          {isExpanded ? <FiX size={20} /> : <FiEye size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="group flex items-center justify-between rounded-lg border border-border-secondary/50 bg-background-secondary/30 p-3 transition-all hover:border-primary-500 hover:bg-background-secondary/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatFileSize(file.fileSize)} •{" "}
                    {new Date(file.uploadDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(file)}
                  className="rounded-lg bg-secondary-500 p-2 text-text-primary transition hover:bg-secondary-600 opacity-0 group-hover:opacity-100"
                  title="View file"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="rounded-lg bg-primary-500 p-2 text-text-primary transition hover:bg-primary-600"
                  title="Download file"
                >
                  <FiDownload size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedFilesPanel;

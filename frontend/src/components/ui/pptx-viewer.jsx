"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const PPTXViewer = ({ 
  presentationUrl, 
  downloadUrl, 
  title, 
  slideCount, 
  status = 'SUCCESS',
  errorMessage 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handlePreview = () => {
    if (presentationUrl) {
      window.open(presentationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl && !presentationUrl) return;
    
    setIsLoading(true);
    try {
      const url = downloadUrl || presentationUrl;
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error('Download failed:', error);
      setPreviewError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'FAILURE') {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm text-red-500 dark:text-red-300">
                {errorMessage || 'An error occurred while generating the presentation'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'PENDING') {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div>
              <p className="font-medium">Generating Presentation...</p>
              <p className="text-sm text-yellow-500 dark:text-yellow-300">
                This may take a few minutes. Please wait.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Presentation Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {slideCount} slides
              </span>
              <span>PPTX Format</span>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Preview & Download
            </h4>
            
            {/* Embedded preview attempt */}
            {presentationUrl && !previewError && (
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentationUrl)}`}
                  className="w-full h-full border-0"
                  onError={() => setPreviewError(true)}
                  title="Presentation Preview"
                />
              </div>
            )}

            {(previewError || !presentationUrl) && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Preview not available. Download to view the presentation.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {presentationUrl && (
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Browser
              </Button>
            )}
            
            <Button
              onClick={handleDownload}
              disabled={isLoading || (!downloadUrl && !presentationUrl)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PPTX
                </>
              )}
            </Button>
          </div>

          {/* Technical Details */}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>Generated with SlideSpeak AI • Supports PowerPoint, Google Slides, and more</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PPTXViewer;


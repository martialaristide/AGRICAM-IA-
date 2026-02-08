/**
 * AGRICAM IA - Export Button Component
 * Reusable button for exporting data to PDF, Word, CSV
 */
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { exportToPDF, exportToWord, exportToCSV } from '../services/exportService';
import { toast } from 'sonner';

export default function ExportButton({ data, type, title, className = '' }) {
  const [loading, setLoading] = useState(false);
  
  const handleExport = async (format) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    
    setLoading(true);
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(data, type, title);
          toast.success('PDF exporté avec succès');
          break;
        case 'word':
          await exportToWord(data, type, title);
          toast.success('Document Word exporté avec succès');
          break;
        case 'csv':
          exportToCSV(Array.isArray(data) ? data : [data], `agricam-${type}`);
          toast.success('CSV exporté avec succès');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          disabled={loading}
          data-testid="export-button"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          data-testid="export-pdf"
        >
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          data-testid="export-word"
        >
          <FileText className="w-4 h-4 mr-2 text-blue-500" />
          Exporter en Word
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          data-testid="export-csv"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-500" />
          Exporter en CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

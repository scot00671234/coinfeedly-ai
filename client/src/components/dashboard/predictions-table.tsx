import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon, FileSpreadsheetIcon, FileTextIcon, DatabaseIcon } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Commodity, AiModel, Prediction } from "@shared/schema";

interface PredictionsTableProps {
  commodity: Commodity;
  aiModels: AiModel[];
}

interface PredictionRow {
  id: string;
  date: string;
  aiModel: string;
  timeframe: string;
  predictedPrice: string;
  confidence: string;
  currentPrice?: number;
  accuracy?: string;
  status: 'active' | 'expired';
}

export function PredictionsTable({ commodity, aiModels }: PredictionsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch predictions data
  const { data: predictions, isLoading } = useQuery<PredictionRow[]>({
    queryKey: [`/api/commodities/${commodity.id}/predictions-table`],
    enabled: !!commodity.id,
  });

  // Simple display of recent predictions
  const displayData = predictions?.slice(0, 20) || []; // Show latest 20

  const handleExportExcel = () => {
    if (!displayData.length) return;

    // Prepare data for Excel
    const excelData = displayData.map(row => ({
      'Date': new Date(row.date).toLocaleDateString(),
      'AI Model': row.aiModel,
      'Timeframe': row.timeframe,
      'Predicted Price': `$${parseFloat(row.predictedPrice).toFixed(2)}`,
      'Confidence': `${parseFloat(row.confidence) * 100}%`,
      'Status': row.status
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // AI Model
      { wch: 12 }, // Timeframe
      { wch: 15 }, // Predicted Price
      { wch: 12 }, // Confidence
      { wch: 10 }  // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([
      { Property: 'Commodity', Value: commodity.name },
      { Property: 'Symbol', Value: commodity.symbol },
      { Property: 'Total Predictions', Value: predictions?.length || 0 },
      { Property: 'Exported At', Value: new Date().toLocaleString() },
      { Property: 'Data Range', Value: `Latest ${displayData.length} predictions` }
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Predictions');
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

    // Download file
    XLSX.writeFile(workbook, `${commodity.symbol}_predictions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportJSON = () => {
    if (!displayData.length) return;

    // Prepare data for JSON export
    const jsonData = {
      metadata: {
        commodity: {
          name: commodity.name,
          symbol: commodity.symbol
        },
        totalPredictions: predictions?.length || 0,
        exportedRecords: displayData.length,
        exportedAt: new Date().toISOString(),
        dataRange: `Latest ${displayData.length} predictions`
      },
      predictions: displayData.map(row => ({
        id: row.id,
        date: row.date,
        aiModel: row.aiModel,
        timeframe: row.timeframe,
        predictedPrice: parseFloat(row.predictedPrice),
        confidence: parseFloat(row.confidence) * 100, // Convert to percentage
        currentPrice: row.currentPrice,
        accuracy: row.accuracy,
        status: row.status
      }))
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${commodity.symbol}_predictions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!displayData.length) return;

    const doc = new jsPDF();

    // Add title and metadata
    doc.setFontSize(20);
    doc.text(`${commodity.name} (${commodity.symbol}) - Predictions Report`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Total Predictions: ${predictions?.length || 0}`, 20, 45);
    doc.text(`Showing Latest: ${displayData.length} predictions`, 20, 55);

    // Prepare table data
    const tableData = displayData.map(row => [
      new Date(row.date).toLocaleDateString(),
      row.aiModel,
      row.timeframe,
      `$${parseFloat(row.predictedPrice).toFixed(2)}`,
      `${Math.round(parseFloat(row.confidence) * 100)}%`,
      row.status
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['Date', 'AI Model', 'Timeframe', 'Predicted Price', 'Confidence', 'Status']],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 30 }, // AI Model
        2: { cellWidth: 25 }, // Timeframe
        3: { cellWidth: 30 }, // Predicted Price
        4: { cellWidth: 25 }, // Confidence
        5: { cellWidth: 20 }  // Status
      }
    });

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Download file
    doc.save(`${commodity.symbol}_predictions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/30 rounded w-32"></div>
          <div className="h-3 bg-muted/20 rounded w-24"></div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-muted/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="font-medium text-foreground">Predictions Data</h3>
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {predictions?.length || 0} predictions available
          </p>
        </div>
        
        {isExpanded && displayData.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" 
                size="sm"
                className="text-xs"
              >
                <DownloadIcon className="h-3 w-3 mr-1" />
                Export
                <ChevronDownIcon className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <DatabaseIcon className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {displayData.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No predictions available
            </div>
          ) : (
            <div className="space-y-2">
              {displayData.map((row) => (
                <div 
                  key={row.id} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors text-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-muted-foreground text-xs">
                      {new Date(row.date).toLocaleDateString()}
                    </div>
                    <div className="font-medium">
                      {row.aiModel}
                    </div>
                    <div className="text-muted-foreground">
                      {row.timeframe}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-semibold">
                      ${parseFloat(row.predictedPrice).toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {Math.round(parseFloat(row.confidence) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
              
              {predictions && predictions.length > 20 && (
                <div className="text-center pt-3">
                  <p className="text-xs text-muted-foreground">
                    Showing latest 20 predictions • {predictions.length} total
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
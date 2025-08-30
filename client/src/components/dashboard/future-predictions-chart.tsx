import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, TrendingUpIcon, BrainIcon, RefreshCwIcon, DownloadIcon, FileSpreadsheetIcon, FileTextIcon, DatabaseIcon, ChevronDownIcon } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";
import type { Commodity, AiModel } from "@shared/schema";

interface FuturePrediction {
  timeframe: string;
  targetDate: string;
  predictions: Record<string, {
    value: number;
    confidence: number;
    modelName: string;
    color: string;
    reasoning: string;
  }>;
}

interface FuturePredictionsData {
  commodity: Commodity;
  aiModels: AiModel[];
  futurePredictions: FuturePrediction[];
  totalPredictions: number;
  availableTimeframes: string[];
}

interface FuturePredictionsChartProps {
  commodityId: string;
}

export function FuturePredictionsChart({ commodityId }: FuturePredictionsChartProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);

  const handleExportJSON = () => {
    if (!data?.futurePredictions.length) return;

    const jsonData = {
      metadata: {
        commodity: {
          name: data.commodity.name,
          symbol: data.commodity.symbol
        },
        totalPredictions: data.totalPredictions,
        availableTimeframes: data.availableTimeframes,
        exportedAt: new Date().toISOString(),
        selectedTimeframe: selectedTimeframe || 'all'
      },
      predictions: data.futurePredictions.map(prediction => ({
        timeframe: prediction.timeframe,
        targetDate: prediction.targetDate,
        models: Object.entries(prediction.predictions).map(([modelId, pred]) => ({
          modelId,
          modelName: pred.modelName,
          predictedPrice: pred.value,
          confidence: Math.round(pred.confidence * 100), // Convert to percentage
          reasoning: pred.reasoning,
          color: pred.color
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.commodity.symbol}_future_predictions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!data?.futurePredictions.length) return;

    const excelData = data.futurePredictions.flatMap(prediction => 
      Object.entries(prediction.predictions).map(([modelId, pred]) => ({
        'Timeframe': prediction.timeframe.toUpperCase(),
        'Target Date': new Date(prediction.targetDate).toLocaleDateString(),
        'AI Model': pred.modelName,
        'Predicted Price': `$${pred.value.toFixed(2)}`,
        'Confidence': `${Math.round(pred.confidence * 100)}%`,
        'Reasoning': pred.reasoning
      }))
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const columnWidths = [
      { wch: 12 }, // Timeframe
      { wch: 15 }, // Target Date
      { wch: 15 }, // AI Model
      { wch: 18 }, // Predicted Price
      { wch: 12 }, // Confidence
      { wch: 50 }  // Reasoning
    ];
    worksheet['!cols'] = columnWidths;

    const metadataSheet = XLSX.utils.json_to_sheet([
      { Property: 'Commodity', Value: data.commodity.name },
      { Property: 'Symbol', Value: data.commodity.symbol },
      { Property: 'Total Predictions', Value: data.totalPredictions },
      { Property: 'Exported At', Value: new Date().toLocaleString() },
      { Property: 'Selected Timeframe', Value: selectedTimeframe || 'All' }
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Future Predictions');
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

    XLSX.writeFile(workbook, `${data.commodity.symbol}_future_predictions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!data?.futurePredictions.length) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`${data.commodity.name} (${data.commodity.symbol}) - Future Predictions`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Total Predictions: ${data.totalPredictions}`, 20, 45);
    doc.text(`Selected Timeframe: ${selectedTimeframe || 'All'}`, 20, 55);

    const tableData = data.futurePredictions.flatMap(prediction => 
      Object.entries(prediction.predictions).map(([modelId, pred]) => [
        prediction.timeframe.toUpperCase(),
        new Date(prediction.targetDate).toLocaleDateString(),
        pred.modelName,
        `$${pred.value.toFixed(2)}`,
        `${Math.round(pred.confidence * 100)}%`
      ])
    );

    (doc as any).autoTable({
      head: [['Timeframe', 'Target Date', 'AI Model', 'Predicted Price', 'Confidence']],
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
      }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    doc.save(`${data.commodity.symbol}_future_predictions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const { data, isLoading, error } = useQuery<FuturePredictionsData>({
    queryKey: ['/api/commodities', commodityId, 'future-predictions', selectedTimeframe],
    queryFn: async () => {
      const url = selectedTimeframe 
        ? `/api/commodities/${commodityId}/future-predictions?timeframe=${selectedTimeframe}`
        : `/api/commodities/${commodityId}/future-predictions`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/predictions/generate-monthly`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate monthly predictions');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Generated",
        description: "New AI predictions have been generated for this commodity.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/commodities', commodityId, 'future-predictions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate predictions",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Future AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Future AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {error ? "Failed to load quarterly predictions" : "No quarterly predictions available"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Predictions are generated monthly on the 1st for 3, 6, 9, and 12-month horizons
            </p>
            <Button 
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending}
              data-testid="button-generate-predictions"
            >
              {generatePredictionsMutation.isPending ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Generate Monthly Predictions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { commodity, aiModels, futurePredictions, totalPredictions, availableTimeframes } = data;

  // Format data for chart - organize by timeframe
  const chartData = futurePredictions.map(item => {
    const formatted: any = {
      timeframe: item.timeframe,
      label: `${item.timeframe.toUpperCase()} Forecast`,
      targetDate: new Date(item.targetDate).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: "numeric"
      }),
    };

    // Add each model's prediction
    Object.entries(item.predictions).forEach(([modelId, prediction]) => {
      formatted[prediction.modelName] = prediction.value;
      formatted[`${prediction.modelName}_confidence`] = prediction.confidence;
    });

    return formatted;
  });

  // Get the 12-month prediction values for summary (or longest timeframe available)
  const longestTimeframePrediction = futurePredictions.find(p => p.timeframe === '12mo') || 
                                     futurePredictions[futurePredictions.length - 1] || null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const confidence = chartData.find(d => d.date === label)?.[`${entry.dataKey}_confidence`];
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.dataKey}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${entry.value?.toFixed(2)}</div>
                  {confidence && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round(confidence * 100)}% confidence
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="h-5 w-5" />
              Future AI Predictions
            </CardTitle>
            <CardDescription>
              {commodity.name} • {totalPredictions} quarterly predictions • Updated monthly
            </CardDescription>
            {availableTimeframes && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant={selectedTimeframe === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(null)}
                >
                  All Timeframes
                </Button>
                {availableTimeframes.map(timeframe => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe.toUpperCase()}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {data?.futurePredictions?.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending}
              data-testid="button-refresh-predictions"
            >
              {generatePredictionsMutation.isPending ? (
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart" data-testid="tab-chart">Chart View</TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            {chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {aiModels.map((model) => (
                      <Bar
                        key={model.id}
                        dataKey={model.name}
                        fill={model.color}
                        stroke={model.color}
                        strokeWidth={1}
                        opacity={0.8}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No future predictions available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            {longestTimeframePrediction ? (
              <div className="grid gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Quarterly Predictions Summary</h3>
                  <Badge variant="outline">
                    {longestTimeframePrediction.timeframe.toUpperCase()} Forecast
                  </Badge>
                </div>
                
                <div className="grid gap-3">
                  {Object.entries(longestTimeframePrediction.predictions).map(([modelId, prediction]) => {
                    const model = aiModels.find(m => m.id === modelId);
                    if (!model) return null;
                    
                    return (
                      <div 
                        key={modelId} 
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`prediction-${model.name.toLowerCase()}`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: model.color }}
                          />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ${prediction.value.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Prediction Range
                    </div>
                    <div className="text-lg font-semibold">
                      ${Math.min(...Object.values(longestTimeframePrediction.predictions).map(p => p.value)).toFixed(2)} - 
                      ${Math.max(...Object.values(longestTimeframePrediction.predictions).map(p => p.value)).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Available Timeframes
                    </div>
                    <div className="text-lg font-semibold">
                      3mo, 6mo, 9mo, 12mo
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BrainIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quarterly predictions available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Predictions are generated monthly on the 1st for 3, 6, 9, and 12-month horizons
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Expand } from "lucide-react";
import EnhancedChartDialog from "./enhanced-chart-dialog";
import type { ChartDataPoint, Commodity, AiModel, LatestPrice } from "@shared/schema";

export default function PriceChart() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: commodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"],
  });

  const { data: aiModels } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  // Use first commodity as default
  const defaultCommodityId = commodities?.[0]?.id;
  const activeCommodityId = selectedCommodityId || defaultCommodityId;

  const { data: chartData, isLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/commodities", activeCommodityId, "chart", selectedDays],
    enabled: !!activeCommodityId,
  });

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", activeCommodityId, "latest-price"],
    enabled: !!activeCommodityId,
  });

  const selectedCommodity = commodities?.find(c => c.id === activeCommodityId);

  const formattedData = useMemo(() => {
    if (!chartData || !aiModels) return [];

    return chartData.map(point => {
      const formattedPoint: any = {
        date: new Date(point.date).toLocaleDateString(),
        actualPrice: point.actualPrice,
      };

      // Add prediction data for each AI model
      aiModels.forEach(model => {
        if (point.predictions[model.id]) {
          formattedPoint[model.name] = point.predictions[model.id];
        }
      });

      return formattedPoint;
    });
  }, [chartData, aiModels]);

  const aiModelColors = {
    "Claude": "#10B981",
    "ChatGPT": "#3B82F6", 
    "Deepseek": "#8B5CF6"
  };

  if (isLoading) {
    return (
      <Card className="glass-card hover-lift smooth-transition">
        <CardHeader className="border-b border-border-subtle pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex space-x-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Skeleton className="h-80 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-lift smooth-transition" data-testid="price-chart">
      <CardHeader className="border-b border-border-subtle pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {selectedCommodity?.name || "Commodity"} Price Tracking
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              <span className="font-mono text-xs">{selectedCommodity?.symbol}</span> 
              {latestPrice?.price && (
                <span className="ml-3">
                  Current: <span className="font-semibold text-primary" data-testid="current-price">
                    ${latestPrice.price}
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {[7, 30, 90].map(days => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedDays(days)}
                className={`${selectedDays === days ? "bg-primary text-white" : "btn-minimal"} micro-transition`}
                data-testid={`button-days-${days}`}
              >
                {days}D
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="btn-minimal micro-transition"
              title="Expand chart with detailed analysis"
            >
              <Expand className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div 
          className="h-80 w-full cursor-pointer hover:bg-muted/30 rounded-lg transition-colors" 
          onClick={() => setDialogOpen(true)}
          title="Click to expand chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any, name: string) => {
                  if (name === 'Actual Price') {
                    return [`$${value?.toFixed(2)}`, 'Actual (Yahoo Finance)'];
                  }
                  return [`$${value?.toFixed(2)}`, `${name} Prediction`];
                }}
              />
              <Legend />
              
              {/* Actual Price Line with Enhanced Dots */}
              <Line
                type="monotone"
                dataKey="actualPrice"
                stroke="var(--foreground)"
                strokeWidth={3}
                dot={{ 
                  fill: 'var(--foreground)', 
                  strokeWidth: 2, 
                  r: 4,
                }}
                activeDot={{ 
                  r: 8, 
                  fill: 'var(--primary)',
                  stroke: 'var(--primary-foreground)',
                  strokeWidth: 3,
                }}
                name="Actual Price"
              />
              
              {/* AI Model Prediction Lines */}
              {aiModels?.map(model => (
                <Line
                  key={model.id}
                  type="monotone"
                  dataKey={model.name}
                  stroke={model.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: model.color, strokeWidth: 2, r: 3 }}
                  name={model.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        

      </CardContent>
      
      {/* Enhanced Chart Dialog */}
      {selectedCommodity && aiModels && (
        <EnhancedChartDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          commodity={selectedCommodity}
          aiModels={aiModels}
        />
      )}
    </Card>
  );
}

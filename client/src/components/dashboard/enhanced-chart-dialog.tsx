import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import ModelAccuracyRanking from "./model-accuracy-ranking";
import UnifiedChart from "./unified-chart";
import { PredictionsTable } from "./predictions-table";
import type { Commodity, AiModel, TimePeriod, LatestPrice } from "@shared/schema";

interface EnhancedChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  commodity: Commodity;
  aiModels: AiModel[];
}

const TIME_PERIODS: Array<{ value: TimePeriod; label: string; group: string }> = [
  { value: "1d", label: "1D", group: "Short" },
  { value: "5d", label: "5D", group: "Short" },
  { value: "1w", label: "1W", group: "Short" },
  { value: "1mo", label: "1M", group: "Medium" },
  { value: "3mo", label: "3M", group: "Medium" },
  { value: "6mo", label: "6M", group: "Medium" },
  { value: "1y", label: "1Y", group: "Long" },
  { value: "2y", label: "2Y", group: "Long" },
  { value: "5y", label: "5Y", group: "Long" },
  { value: "10y", label: "10Y", group: "Long" },
  { value: "max", label: "MAX", group: "Long" },
];



export default function EnhancedChartDialog({ isOpen, onClose, commodity, aiModels }: EnhancedChartDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("3mo");

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/commodities", commodity.id, "latest-price"],
    enabled: isOpen && !!commodity.id,
  });




  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price).replace(/\.00$/, ''); // Remove trailing .00 zeros
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto bg-background border border-border/50 backdrop-blur-md">
        <DialogHeader className="border-b border-border/30 pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
            <div className="space-y-4">
              <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-normal tracking-wide flex items-center space-x-3">
                {/* Triangle icon matching the logo */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-black dark:border-b-white"></div>
                <span>{commodity.name} Price Analysis</span>
              </DialogTitle>
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground font-light">Symbol:</span>
                  <span className="font-mono text-sm bg-muted/50 px-3 py-1 rounded-md font-medium border border-border/50">{commodity.symbol}</span>
                </div>
                {latestPrice && (
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl md:text-3xl font-normal text-foreground">
                        {formatPrice(latestPrice.price)}
                      </div>
                      <div className="text-sm text-muted-foreground font-light">Current Price</div>
                    </div>
                    {latestPrice.changePercent != null && latestPrice.changePercent !== 0 && (
                      <div className="text-right">
                        <div className="text-lg font-medium">
                          {formatChange(latestPrice.changePercent)}
                        </div>
                        <div className="text-xs text-muted-foreground font-light">24h Change</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-8">
          {/* Time Period Selection */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TIME_PERIODS.map(period => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className="h-8 px-3"
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Professional Trading Chart */}
          <div className="space-y-6">
            <div className="bg-card/50 border border-border/40 rounded-xl overflow-hidden backdrop-blur-sm p-6">
              <UnifiedChart 
                commodityId={commodity.id} 
                period={selectedPeriod} 
                height={500}
              />
            </div>

            {/* Model Accuracy Rankings */}
            <div className="bg-card/30 border border-border/40 rounded-xl p-6 backdrop-blur-sm">
              <ModelAccuracyRanking 
                commodity={commodity}
                aiModels={aiModels}
                period="30d"
              />
            </div>

            {/* Predictions Data Table */}
            <div className="bg-card/30 border border-border/40 rounded-xl backdrop-blur-sm">
              <PredictionsTable 
                commodity={commodity}
                aiModels={aiModels}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
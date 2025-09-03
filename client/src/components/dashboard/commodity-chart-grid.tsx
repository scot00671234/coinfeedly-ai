import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import EnhancedChartDialog from "./enhanced-chart-dialog";
import type { ChartDataPoint, Cryptocurrency, AiModel, LatestPrice } from "@shared/schema";

interface CryptocurrencyChartGridProps {
  filteredCryptocurrencies?: Cryptocurrency[];
}

export default function CryptocurrencyChartGrid({ filteredCryptocurrencies }: CryptocurrencyChartGridProps) {
  const [selectedCryptocurrency, setSelectedCryptocurrency] = useState<Cryptocurrency | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: allCryptocurrencies } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
  });

  const cryptocurrencies = filteredCryptocurrencies || allCryptocurrencies;

  const { data: aiModels } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  const handleChartClick = (cryptocurrency: Cryptocurrency) => {
    setSelectedCryptocurrency(cryptocurrency);
    setDialogOpen(true);
  };

  if (!cryptocurrencies || !aiModels) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {cryptocurrencies.map(cryptocurrency => (
          <div key={cryptocurrency.id} id={`cryptocurrency-${cryptocurrency.id}`}>
            <CryptocurrencyChartCard
              cryptocurrency={cryptocurrency}
              aiModels={aiModels}
              onClick={() => handleChartClick(cryptocurrency)}
            />
          </div>
        ))}
      </div>

      {selectedCryptocurrency && (
        <EnhancedChartDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          cryptocurrency={selectedCryptocurrency}
          aiModels={aiModels}
        />
      )}
    </>
  );
}

interface CryptocurrencyChartCardProps {
  cryptocurrency: Cryptocurrency;
  aiModels: AiModel[];
  onClick: () => void;
}

function CryptocurrencyChartCard({ cryptocurrency, aiModels, onClick }: CryptocurrencyChartCardProps) {
  // AI Model color mapping
  const getModelColor = (modelName: string) => {
    const colors: Record<string, string> = {
      'Claude': '#10B981',
      'ChatGPT': '#3B82F6', 
      'Deepseek': '#8B5CF6',
      'Gemini': '#F59E0B'
    };
    return colors[modelName] || '#6B7280';
  };

  const { data: latestPrice } = useQuery<LatestPrice>({
    queryKey: ["/api/cryptocurrencies", cryptocurrency.id, "latest-price"],
  });

  // Fetch accuracy data for this cryptocurrency
  const { data: accuracyData } = useQuery<{
    aiModel: AiModel;
    accuracy: number;
    totalPredictions: number;
    trend: number;
    rank: number;
  }[]>({
    queryKey: ["/api/accuracy-metrics", cryptocurrency.id, "30d"],
    enabled: !!cryptocurrency.id,
  });

  const calculateChange = () => {
    if (!latestPrice?.changePercent) return { percentage: 0 };
    return { percentage: latestPrice.changePercent };
  };

  const change = calculateChange();
  const isPositive = change.percentage >= 0;

  return (
    <Card 
      className="glass-card hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{cryptocurrency.name}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{cryptocurrency.symbol}</p>
          </div>
          {latestPrice && (
            <div className="text-right ml-3 flex-shrink-0">
              <p className="text-base font-bold leading-tight">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(latestPrice.price)}</p>
              <div className={`flex items-center justify-end text-xs mt-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPositive ? '+' : ''}{change.percentage.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Current Price and AI Predictions */}
        {latestPrice ? (
          <div className="space-y-3">
            {/* Model Accuracy Scores Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Model Accuracy Scores</h4>
              <div className="grid grid-cols-1 gap-2">
                {accuracyData && accuracyData.length > 0 ? (
                  accuracyData.slice(0, 3).map(modelData => (
                    <div key={modelData.aiModel.id} className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getModelColor(modelData.aiModel.name) }}
                        />
                        <span className="text-sm font-medium">{modelData.aiModel.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{modelData.accuracy.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          Rank #{modelData.rank}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback when no accuracy data is available
                  aiModels.slice(0, 3).map(model => (
                    <div key={model.id} className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getModelColor(model.name) }}
                        />
                        <span className="text-sm font-medium">{model.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-muted-foreground">--</div>
                        <div className="text-xs text-muted-foreground">No data</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click for detailed analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
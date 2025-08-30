import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { AccuracyMetric, AiModel } from "@shared/schema";

export default function AccuracyMetrics() {
  const { data: metrics, isLoading } = useQuery<AccuracyMetric[]>({
    queryKey: ["/api/accuracy/30d"],
  });

  const { data: aiModels } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  if (isLoading) {
    return (
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getModelColor = (modelId: string) => {
    const model = aiModels?.find(m => m.id === modelId);
    return model?.color || "#6B7280";
  };

  const getModelName = (modelId: string) => {
    const model = aiModels?.find(m => m.id === modelId);
    return model?.name || "Unknown";
  };

  const getBestCategories = (modelId: string) => {
    const modelName = getModelName(modelId);
    // Mock data for best categories - in real app this would come from analysis
    switch (modelName) {
      case "Claude":
        return "Precious Metals, Energy";
      case "ChatGPT":
        return "Agricultural, Industrial Metals";
      case "Deepseek":
        return "Soft Commodities, Lumber";
      default:
        return "Various";
    }
  };

  return (
    <Card className="glass-card hover-lift smooth-transition" data-testid="accuracy-metrics">
      <CardHeader className="border-b border-border-subtle pb-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {metrics?.map((metric, index) => {
            const modelName = getModelName(metric.aiModelId);
            const modelColor = getModelColor(metric.aiModelId);
            const accuracy = parseFloat(metric.accuracy);
            
            return (
              <div 
                key={metric.id} 
                className="space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`metric-${modelName.toLowerCase()}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold text-lg" data-testid={`metric-name-${index}`}>
                    {modelName}
                  </span>
                  <span 
                    className="font-semibold text-xl"
                    style={{ color: modelColor }}
                    data-testid={`metric-accuracy-${index}`}
                  >
                    {accuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={accuracy} 
                  className="w-full h-3"
                  style={{ 
                    '--progress-background': modelColor 
                  } as React.CSSProperties}
                />
                <div className="text-sm text-muted-foreground font-medium" data-testid={`metric-categories-${index}`}>
                  Best at: {getBestCategories(metric.aiModelId)}
                </div>
              </div>
            );
          })}
          
          {(!metrics || metrics.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No performance data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import type { AiModel, Commodity } from "@shared/schema";

interface ModelAccuracyRankingProps {
  commodity: Commodity;
  aiModels: AiModel[];
  period?: string;
}

interface ModelAccuracy {
  aiModel: AiModel;
  accuracy: number;
  totalPredictions: number;
  trend: number; // 1 for up, -1 for down, 0 for stable
  rank: number;
}

export default function ModelAccuracyRanking({ 
  commodity, 
  aiModels, 
  period = "30d" 
}: ModelAccuracyRankingProps) {
  
  // Fetch accuracy data for this specific commodity
  const { data: accuracyData, isLoading } = useQuery<ModelAccuracy[]>({
    queryKey: ["/api/accuracy-metrics", commodity.id, period],
    enabled: !!commodity.id,
  });

  // Generate mock data with realistic accuracy patterns if no data available
  // Mock data generation removed - using authentic data only

  const rankingData = accuracyData || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-light text-foreground">Model Performance Rankings</h3>
          <div className="text-xs text-muted-foreground font-light">for {commodity.name}</div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-4 w-6 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-light text-foreground">Model Performance Rankings</h3>
        <div className="text-xs text-muted-foreground font-light">for {commodity.name}</div>
      </div>
      
      <div className="space-y-2">
        {rankingData.map((data: ModelAccuracy, index: number) => (
          <div key={data.aiModel.id} className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className={`w-1.5 h-1.5 rounded-full ${
                data.aiModel.name === 'Claude' ? 'bg-green-500' :
                data.aiModel.name === 'ChatGPT' ? 'bg-blue-500' :
                data.aiModel.name === 'Deepseek' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-sm font-light text-foreground">
                {data.aiModel.name}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-light text-foreground">
                {data.accuracy}%
              </span>
              <span className="text-xs font-light text-muted-foreground">#{data.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
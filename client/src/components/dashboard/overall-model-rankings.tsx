import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { AiModel } from "@shared/schema";

interface OverallModelRanking {
  rank: number;
  aiModel: AiModel;
  accuracy: number;
  totalPredictions: number;
  trend: number; // 1 for up, -1 for down, 0 for stable
}

export default function OverallModelRankings() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: rankings, isLoading } = useQuery<OverallModelRanking[]>({
    queryKey: ["/api/league-table", selectedPeriod],
    queryFn: () => fetch(`/api/league-table/${selectedPeriod}`).then(res => res.json()),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-1.5 h-1.5 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-light text-foreground">Model Rankings</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 h-8 bg-transparent border border-border/40 text-sm rounded-md font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground font-light">No ranking data available</p>
          <p className="text-xs text-muted-foreground font-light">Start making predictions to see model rankings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-light text-foreground">Model Rankings</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 h-8 bg-transparent border border-border/40 text-sm rounded-md font-light">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {rankings.map((ranking) => (
          <div 
            key={ranking.aiModel.id} 
            className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground font-light">
                #{ranking.rank}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                ranking.aiModel.name === 'Claude' ? 'bg-green-500' :
                ranking.aiModel.name === 'ChatGPT' ? 'bg-blue-500' :
                ranking.aiModel.name === 'Deepseek' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-sm font-light text-foreground">{ranking.aiModel.name}</span>
            </div>

            <div className="text-right">
              <div className="text-base font-light text-foreground">
                {ranking.accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-light">Accuracy</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-light pt-2 border-t border-border/20">
        <span>Based on predictions across all commodities</span>
        <span>Best performer: {rankings?.[0]?.accuracy?.toFixed(1) || '0.0'}% accuracy</span>
      </div>
    </div>
  );
}
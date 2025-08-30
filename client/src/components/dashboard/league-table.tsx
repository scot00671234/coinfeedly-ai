import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeagueTableEntry } from "@shared/schema";
import { TIME_PERIODS } from "@/lib/constants";

export default function LeagueTable() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: leagueTable, isLoading } = useQuery<LeagueTableEntry[]>({
    queryKey: ["/api/league-table", selectedPeriod],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

  return (
    <div className="space-y-4" data-testid="league-table">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-light text-foreground">
          Model Rankings
        </h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 h-8 bg-transparent border border-border/40 text-sm rounded-md font-light" data-testid="select-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIME_PERIODS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {!leagueTable || leagueTable.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground font-light">No ranking data available</p>
          <p className="text-xs text-muted-foreground font-light">Start making predictions to see model rankings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leagueTable.map((entry, index) => {
            // Get model color indicator  
            const getModelColor = (modelName: string) => {
              switch (modelName) {
                case 'Claude': return 'bg-green-500';
                case 'ChatGPT': return 'bg-blue-500'; 
                case 'Deepseek': return 'bg-purple-500';
                default: return 'bg-gray-500';
              }
            };

            return (
              <div 
                key={entry.aiModel.id}
                className="flex items-center justify-between py-2 hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors duration-200"
                data-testid={`league-entry-${entry.rank}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground font-light">
                    #{entry.rank}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${getModelColor(entry.aiModel.name)}`}></div>
                  <span className="text-sm font-light text-foreground" data-testid={`model-name-${entry.rank}`}>
                    {entry.aiModel.name}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-base font-light text-foreground" 
                       data-testid={`accuracy-${entry.rank}`}>
                    {entry.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Accuracy</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground font-light pt-2 border-t border-border/20">
        <span>Based on predictions across all commodities</span>
        <span>Best performer: {leagueTable?.[0]?.accuracy?.toFixed(1) || '0.0'}% accuracy</span>
      </div>
    </div>
  );
}
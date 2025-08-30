import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  model: string;
  commodity: string;
  timestamp: Date;
  prediction: number;
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activity"],
  });

  if (isLoading) {
    return (
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getModelColor = (model: string) => {
    switch (model) {
      case "Claude": return "bg-green-500";
      case "ChatGPT": return "bg-blue-500";
      case "Deepseek": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <Card className="glass-card hover-lift smooth-transition" data-testid="recent-activity">
      <CardHeader className="border-b border-border-subtle pb-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6 custom-scrollbar max-h-64 overflow-y-auto">
          {activities?.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`activity-${index}`}
            >
              <div className={`flex-shrink-0 w-2 h-2 ${getModelColor(activity.model)} rounded-full mt-3`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold" data-testid={`activity-model-${index}`}>
                    {activity.model}
                  </span> predicted{" "}
                  <span className="font-semibold text-primary" data-testid={`activity-commodity-${index}`}>
                    {activity.commodity}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1" data-testid={`activity-timestamp-${index}`}>
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {(!activities || activities.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

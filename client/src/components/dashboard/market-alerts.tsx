import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, InfoIcon, CheckCircleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAlert } from "@shared/schema";

export default function MarketAlerts() {
  const { data: alerts, isLoading } = useQuery<MarketAlert[]>({
    queryKey: ["/api/alerts"],
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
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg">
                <Skeleton className="w-5 h-5 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangleIcon className="text-red-500" />;
      case "warning":
        return <InfoIcon className="text-yellow-500" />;
      case "info":
      default:
        return <CheckCircleIcon className="text-green-500" />;
    }
  };

  const getAlertBgClass = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-700/50";
      case "info":
      default:
        return "bg-green-50 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50";
    }
  };

  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <Card className="glass-card hover-lift smooth-transition" data-testid="market-alerts">
      <CardHeader className="border-b border-border-subtle pb-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Market Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6 custom-scrollbar max-h-80 overflow-y-auto">
          {alerts?.map((alert, index) => (
            <div 
              key={alert.id} 
              className={`flex items-start space-x-4 p-4 rounded-xl border micro-transition hover-lift ${getAlertBgClass(alert.severity)}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`alert-${index}`}
            >
              <div className="mt-1">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground leading-relaxed" data-testid={`alert-title-${index}`}>
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1" data-testid={`alert-description-${index}`}>
                  {alert.description}
                </p>
                <p className={`text-xs mt-2 font-medium ${getAlertTextColor(alert.severity)}`} data-testid={`alert-timestamp-${index}`}>
                  {formatTimestamp(alert.createdAt)}
                </p>
              </div>
            </div>
          ))}
          
          {(!alerts || alerts.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No active alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

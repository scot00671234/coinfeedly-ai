import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MarketStatus {
  isMarketOpen: boolean;
  nextUpdate: string;
  dataFreshness: string;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function MarketStatusCard() {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Update every minute
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // Determine if market hours (9 AM - 5 PM EST, Mon-Fri)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = hour >= 9 && hour <= 17;
      const isMarketOpen = isWeekday && isMarketHours;
      
      // Next update time
      let nextUpdate = 'Next hourly update';
      if (!isMarketOpen) {
        if (isWeekday && hour < 9) {
          nextUpdate = 'Market opens 9 AM';
        } else if (isWeekday && hour > 17) {
          nextUpdate = 'Market opens 9 AM tomorrow';
        } else {
          nextUpdate = 'Market opens Monday 9 AM';
        }
      }
      
      setStatus({
        isMarketOpen,
        nextUpdate,
        dataFreshness: 'Real-time',
        systemHealth: 'healthy'
      });
    } catch (err) {
      console.error('Error fetching market status:', err);
      setStatus({
        isMarketOpen: false,
        nextUpdate: 'System check required',
        dataFreshness: 'Unknown',
        systemHealth: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/40 bg-background h-[280px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-foreground">Market Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs text-muted-foreground">Checking status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (status?.systemHealth === 'error') return <AlertCircle className="h-4 w-4" />;
    if (!status?.isMarketOpen) return <Clock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (status?.systemHealth === 'error') return 'System Issues';
    if (!status?.isMarketOpen) return 'Market Closed';
    return 'Market Open';
  };

  return (
    <Card className="border-border/40 bg-background h-[280px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">Market Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-muted/50 text-foreground border border-border/50">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-xs text-muted-foreground font-medium">Data Source</span>
              <span className="text-xs font-semibold text-foreground">Yahoo Finance</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-xs text-muted-foreground font-medium">Freshness</span>
              <span className="text-xs font-semibold text-foreground">{status?.dataFreshness}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-muted-foreground font-medium">Schedule</span>
              <span className="text-xs font-semibold text-foreground">{status?.nextUpdate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
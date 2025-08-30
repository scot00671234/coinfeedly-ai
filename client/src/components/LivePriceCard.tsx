import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface LivePriceCardProps {
  commodityId: string;
  name: string;
  symbol: string;
  unit: string;
  className?: string;
}

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  cached: boolean;
}

export function LivePriceCard({ commodityId, name, symbol, unit, className = "" }: LivePriceCardProps) {
  const { data: priceData, isLoading } = useQuery<PriceData>({
    queryKey: ['/api/commodities', commodityId, 'latest-price'],
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const formatPrice = (price: number, unit: string) => {
    if (unit.includes('USD')) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Card className={`backdrop-blur-sm bg-white/60 dark:bg-black/40 border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/60 transition-all duration-300 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-12"></div>
            </div>
            <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-6 bg-muted animate-pulse rounded w-20"></div>
            <div className="h-3 bg-muted animate-pulse rounded w-14"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card className={`backdrop-blur-sm bg-white/60 dark:bg-black/40 border-white/20 dark:border-white/10 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground">{symbol}</p>
            </div>
            <MinusIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`backdrop-blur-sm bg-white/60 dark:bg-black/40 border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/60 transition-all duration-300 hover:scale-105 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
          {getTrendIcon(priceData.change || 0)}
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            {formatPrice(priceData.price, unit)}
          </p>
          <div className="flex items-center space-x-2 text-xs">
            <span className={getTrendColor(priceData.change || 0)}>
              {(priceData.change || 0) > 0 ? '+' : ''}{(priceData.change || 0).toFixed(2)}
            </span>
            <span className={getTrendColor(priceData.changePercent || 0)}>
              ({(priceData.changePercent || 0) > 0 ? '+' : ''}{(priceData.changePercent || 0).toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
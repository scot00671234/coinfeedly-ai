import { useQuery } from "@tanstack/react-query";
import { HammerIcon, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cryptocurrency } from "@shared/schema";
import { CRYPTO_CATEGORIES } from "@/lib/constants";

interface CryptocurrencySelectorProps {
  onSelect?: (cryptocurrency: Cryptocurrency) => void;
  selectedCryptocurrencyId?: string;
}

export default function CryptocurrencySelector({ onSelect, selectedCryptocurrencyId }: CryptocurrencySelectorProps) {
  const { data: cryptocurrencies, isLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
  });

  if (isLoading) {
    return (
      <Card className="glass-card glass-shadow smooth-transition">
        <CardHeader className="border-b border-border/50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 2 }).map((_, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center mb-3">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const layer1Cryptos = cryptocurrencies?.filter(c => c.category === CRYPTO_CATEGORIES.LAYER1) || [];
  const defiCryptos = cryptocurrencies?.filter(c => c.category === CRYPTO_CATEGORIES.DEFI) || [];
  const paymentCryptos = cryptocurrencies?.filter(c => c.category === CRYPTO_CATEGORIES.PAYMENT) || [];
  const layer2Cryptos = cryptocurrencies?.filter(c => c.category === CRYPTO_CATEGORIES.LAYER2) || [];
  const memeCryptos = cryptocurrencies?.filter(c => c.category === CRYPTO_CATEGORIES.MEME) || [];

  const handleCryptocurrencySelect = (cryptocurrency: Cryptocurrency) => {
    onSelect?.(cryptocurrency);
  };

  return (
    <Card className="glass-card hover-lift smooth-transition" data-testid="commodity-selector">
      <CardHeader className="border-b border-border-subtle pb-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Cryptocurrencies
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8 custom-scrollbar max-h-96 overflow-y-auto">
        {/* Layer 1 Cryptocurrencies */}
        {layer1Cryptos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 flex items-center tracking-wide uppercase">
            <HammerIcon className="w-3 h-3 mr-2" />
            Layer 1 Blockchain
          </h3>
          <div className="space-y-3">
            {layer1Cryptos.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-4 btn-minimal micro-transition ${
                  selectedCommodityId === commodity.id 
                    ? "ring-1 ring-primary bg-primary/5" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* DeFi Cryptocurrencies */}
        {defiCryptos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 flex items-center tracking-wide uppercase">
            <Sprout className="w-3 h-3 mr-2" />
            DeFi Tokens
          </h3>
          <div className="space-y-3">
            {defiCryptos.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-4 btn-minimal micro-transition ${
                  selectedCommodityId === commodity.id 
                    ? "ring-1 ring-primary bg-primary/5" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* Payment Cryptocurrencies */}
        {paymentCryptos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 flex items-center tracking-wide uppercase">
            <HammerIcon className="w-3 h-3 mr-2" />
            Payment Tokens
          </h3>
          <div className="space-y-3">
            {paymentCryptos.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-4 btn-minimal micro-transition ${
                  selectedCommodityId === commodity.id 
                    ? "ring-1 ring-primary bg-primary/5" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* Meme Cryptocurrencies */}
        {memeCryptos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 flex items-center tracking-wide uppercase">
            <Sprout className="w-3 h-3 mr-2" />
            Meme Coins
          </h3>
          <div className="space-y-3">
            {memeCryptos.map((commodity) => (
              <Button
                key={commodity.id}
                variant="ghost"
                className={`w-full justify-between h-auto p-4 btn-minimal micro-transition ${
                  selectedCommodityId === commodity.id 
                    ? "ring-1 ring-primary bg-primary/5" 
                    : ""
                }`}
                onClick={() => handleCommoditySelect(commodity)}
                data-testid={`commodity-${commodity.symbol.toLowerCase()}`}
              >
                <span className="text-sm text-foreground font-medium">
                  {commodity.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {commodity.symbol}
                </span>
              </Button>
            ))}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

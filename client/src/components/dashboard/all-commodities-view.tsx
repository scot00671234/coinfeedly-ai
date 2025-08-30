import type { Commodity } from "@shared/schema";
import CommodityChartGrid from "./commodity-chart-grid";

interface AllCommoditiesViewProps {
  filteredCommodities?: Commodity[];
}

export default function AllCommoditiesView({ filteredCommodities }: AllCommoditiesViewProps) {
  return (
    <div className="space-y-6 md:space-y-8" data-testid="all-commodities-section">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground mb-4 md:mb-6">
          {filteredCommodities ? 'Search Results' : 'All Commodities Overview'}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tap any chart to view detailed analysis with multiple time periods and Yahoo Finance data
        </p>
      </div>

      <CommodityChartGrid filteredCommodities={filteredCommodities} />
    </div>
  );
}
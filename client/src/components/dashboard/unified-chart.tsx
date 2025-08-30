import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, LineStyle, LineData, Time, LineSeries } from 'lightweight-charts';
import { useTheme } from '@/components/theme-provider';
import { useQuery } from '@tanstack/react-query';

interface UnifiedChartProps {
  commodityId: string;
  period?: string;
  height?: number;
}

interface ChartDataPoint {
  time: Time;
  value: number;
}

// Utility function to prepare data with proper zoom focus
const prepareDataWithZoom = (data: any[], period: string) => {
  if (!data || data.length === 0) return { data, focusRange: null };
  
  // Always return all data, but calculate focus range for chart zoom
  const now = new Date();
  const periodToMilliseconds: Record<string, number | null> = {
    '1d': 24 * 60 * 60 * 1000,
    '5d': 5 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1mo': 30 * 24 * 60 * 60 * 1000,
    '3mo': 90 * 24 * 60 * 60 * 1000,
    '6mo': 180 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
    '2y': 2 * 365 * 24 * 60 * 60 * 1000,
    '5y': 5 * 365 * 24 * 60 * 60 * 1000,
    '10y': 10 * 365 * 24 * 60 * 60 * 1000,
    'max': null // null means no specific focus, show all data
  };
  
  const filterMs = periodToMilliseconds[period];
  
  if (filterMs === null) {
    // MAX period - show all data without specific focus
    return { data, focusRange: null };
  }
  
  // Calculate focus range but return all data
  const cutoffDate = new Date(now.getTime() - filterMs);
  const focusStartTime = Math.floor(cutoffDate.getTime() / 1000);
  const focusEndTime = Math.floor(now.getTime() / 1000);
  
  return { 
    data, // Always return ALL data
    focusRange: { from: focusStartTime, to: focusEndTime }
  };
};

const UnifiedChart: React.FC<UnifiedChartProps> = ({ 
  commodityId, 
  period = "1mo", 
  height = 400 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chart data with predictions - always fetch max data
  const { data: rawChartData, isLoading: dataLoading } = useQuery({
    queryKey: [`/api/commodities/${commodityId}/chart-with-predictions/max`],
    queryFn: () => fetch(`/api/commodities/${commodityId}/chart-with-predictions/max`).then(res => res.json()),
    enabled: !!commodityId,
    staleTime: 300000, // Cache for 5 minutes since we're fetching max data
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Prepare data with zoom focus (always show all data, but with focus range)
  const { data: chartData, focusRange } = prepareDataWithZoom(rawChartData, period);

  // Fetch AI models for colors
  const { data: aiModels } = useQuery({
    queryKey: ['/api/ai-models'],
  });

  // Fetch the true current price (separate from historical data)
  const { data: currentPrice } = useQuery({
    queryKey: [`/api/commodities/${commodityId}/latest-price`],
    enabled: !!commodityId,
    staleTime: 60000, // Cache for 1 minute
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Log for debugging
    console.log('Chart render attempt - Loading:', dataLoading, 'Data:', chartData?.length, 'points');
    
    if (dataLoading) {
      setIsLoading(true);
      return;
    }
    
    setIsLoading(false);
    
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      console.log('No chart data available');
      return;
    }

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#ffffff' : '#000000',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          style: LineStyle.Dotted,
        },
        horzLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      ...chartOptions,
    });

    chartRef.current = chart;

    // Process and add data
    if (chartData && Array.isArray(chartData) && chartData.length > 0) {
      // Separate historical and prediction data
      const historicalData: ChartDataPoint[] = [];
      const predictionData: { [modelName: string]: ChartDataPoint[] } = {};

      chartData.forEach((item: any, index: number) => {
        try {
          const timeStamp = Math.floor(new Date(item.date).getTime() / 1000); // Convert to Unix timestamp in seconds
          
          // Validate timestamp
          if (!timeStamp || isNaN(timeStamp)) return;

          if (item.type === 'historical' && item.actualPrice !== null && item.actualPrice !== undefined && !isNaN(item.actualPrice)) {
            
            historicalData.push({
              time: timeStamp as Time,
              value: Number(item.actualPrice),
            });
          } else if (item.type === 'prediction' && item.predictions) {
            Object.entries(item.predictions).forEach(([modelName, price]) => {
              if (typeof price === 'number' && !isNaN(price)) {
                if (!predictionData[modelName]) {
                  predictionData[modelName] = [];
                }
                predictionData[modelName].push({
                  time: timeStamp as Time,
                  value: price,
                });
              }
            });
          }
        } catch (error) {
          console.warn('Error processing chart data point:', item, error);
        }
      });

      // Add historical data series (main bold black line)
      if (historicalData.length > 0) {
        const historicalSeries = chart.addSeries(LineSeries, {
          color: theme === 'dark' ? '#ffffff' : '#000000',
          lineWidth: 3,
          title: 'Actual Price',
          visible: true
        });
        const sortedHistoricalData = historicalData.sort((a, b) => (a.time as number) - (b.time as number));
        

        
        historicalSeries.setData(sortedHistoricalData);
        
        // Apply zoom focus if specified
        if (focusRange) {
          // Set visible range to focus on the selected period
          chart.timeScale().setVisibleRange({
            from: focusRange.from as Time,
            to: focusRange.to as Time,
          });
        } else {
          // Fit chart to all available data
          chart.timeScale().fitContent();
        }
      }

      // Add prediction series for each AI model with distinct colors and dotted style
      const modelColors = {
        'Claude': '#10b981', // Green
        'ChatGPT': '#3b82f6', // Blue  
        'Deepseek': '#8b5cf6', // Purple
        'GPT-4': '#f59e0b',
      };

      Object.entries(predictionData).forEach(([modelName, data]) => {
        if (data.length > 0) {
          const color = modelColors[modelName as keyof typeof modelColors] || '#6b7280';
          const predictionSeries = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: 2,
            lineStyle: 2, // Dotted line for predictions
            title: `${modelName} Prediction`,
            visible: true
          });
          const sortedPredictionData = data.sort((a, b) => (a.time as number) - (b.time as number));
          predictionSeries.setData(sortedPredictionData);
        }
      });
    } else {
      // Handle case where no data is available
      console.log('No chart data available for period:', period);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, focusRange, theme, height, dataLoading, commodityId, period]);

  // Update chart theme when theme changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          background: { 
            type: ColorType.Solid, 
            color: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
          },
          textColor: theme === 'dark' ? '#ffffff' : '#000000',
        },
        grid: {
          vertLines: { 
            color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          },
          horzLines: { 
            color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          },
        },
        rightPriceScale: {
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        },
        timeScale: {
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        },
      });
    }
  }, [theme]);

  if (dataLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-background border border-border rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-background border border-border rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-muted-foreground">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Chart Header with Legend */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Price Movement & AI Predictions</h3>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-black dark:bg-white"></div>
            <span className="text-foreground font-medium">Actual Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 border-t-2 border-dotted border-green-500"></div>
            <span className="text-muted-foreground">Claude</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 border-t-2 border-dotted border-blue-500"></div>
            <span className="text-muted-foreground">ChatGPT</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 border-t-2 border-dotted border-purple-500"></div>
            <span className="text-muted-foreground">Deepseek</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full border border-border rounded-lg bg-background"
        style={{ height: `${height}px` }}
      />
      
      {/* Chart Footer */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Data from Yahoo Finance • Updated {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  );
};

export default UnifiedChart;

export { UnifiedChart };
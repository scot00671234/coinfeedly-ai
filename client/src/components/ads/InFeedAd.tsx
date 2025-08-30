import AdBanner from './AdBanner';

export default function InFeedAd() {
  return (
    <div className="w-full my-6 p-4 bg-muted/20 border border-border/30 rounded-lg">
      <div className="text-xs text-muted-foreground mb-3 text-center">Sponsored</div>
      <AdBanner
        adSlot="0987654321" // You'll get this from AdSense dashboard
        adFormat="fluid"
        style={{ display: 'block', minHeight: '200px' }}
        className="w-full"
      />
    </div>
  );
}
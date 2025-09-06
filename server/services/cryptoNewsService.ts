// Crypto News Service - Aggregates news from multiple sources
import { db } from "../db.js";
import { newsArticles, newsSources, newsCategories, type NewsArticle, type NewsFilters, type NewsSortOption, type SortDirection, type NewsApiResponse } from "../../shared/schema.js";
import { eq, desc, asc, and, or, like, gte, lte, sql, inArray } from "drizzle-orm";

interface CryptoPanicArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  source: {
    title: string;
    url: string;
  };
  kind: string;
  votes?: {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  currencies?: Array<{
    code: string;
    title: string;
    slug: string;
    url: string;
  }>;
}

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author: string;
}

interface CryptoNewsAPIArticle {
  id: string;
  title: string;
  text: string;
  summary: string;
  url: string;
  image: string;
  published_at: string;
  source: string;
  type: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class CryptoNewsService {
  private baseUrls = {
    cryptoPanic: "https://cryptopanic.com/api/v1",
    newsAPI: "https://newsapi.org/v2",
    cryptoNewsAPI: "https://cryptonews-api.com",
  };

  private rssFeeds = [
    { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', reliability: 9 },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk', reliability: 10 },
    { url: 'https://decrypt.co/feed', name: 'Decrypt', reliability: 8 },
    { url: 'https://blockworks.co/feed/', name: 'Blockworks', reliability: 7 },
    { url: 'https://www.theblock.co/rss.xml', name: 'The Block', reliability: 9 },
    { url: 'https://bitcoinmagazine.com/feed', name: 'Bitcoin Magazine', reliability: 8 }
  ];
  
  private lastRequestTime: { [key: string]: number } = {};
  private minDelay = 1000; // 1 second between requests

  private async enforceRateLimit(service: string): Promise<void> {
    const now = Date.now();
    const lastRequest = this.lastRequestTime[service] || 0;
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    this.lastRequestTime[service] = Date.now();
  }

  private extractTags(title: string, content: string = ''): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'cardano', 'ada', 'polkadot', 'dot',
      'chainlink', 'link', 'solana', 'sol', 'avalanche', 'avax', 'polygon', 'matic',
      'cosmos', 'atom', 'fantom', 'ftm', 'near', 'algorand', 'algo', 'tezos', 'xtz',
      'defi', 'nft', 'dao', 'web3', 'blockchain', 'crypto', 'cryptocurrency',
      'mining', 'staking', 'yield', 'dex', 'cex', 'wallet', 'metaverse', 'gamefi'
    ];
    
    return cryptoKeywords.filter(keyword => text.includes(keyword));
  }

  private categorizeArticle(title: string, content: string = ''): string {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('regulation') || text.includes('sec') || text.includes('law') || text.includes('legal')) {
      return 'regulation';
    }
    if (text.includes('defi') || text.includes('yield') || text.includes('liquidity')) {
      return 'defi';
    }
    if (text.includes('nft') || text.includes('collectible') || text.includes('opensea')) {
      return 'nft';
    }
    if (text.includes('gaming') || text.includes('metaverse') || text.includes('gamefi')) {
      return 'gaming';
    }
    if (text.includes('technology') || text.includes('blockchain') || text.includes('protocol')) {
      return 'technology';
    }
    if (text.includes('price') || text.includes('market') || text.includes('trading')) {
      return 'market';
    }
    
    return 'market'; // default category
  }

  private calculateSentimentScore(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return '0.7';
      case 'negative': return '-0.7';
      case 'neutral': return '0';
      default: return '0';
    }
  }

  private calculateImpactScore(votes?: any): string {
    if (!votes) return '5'; // default medium impact
    
    const important = votes.important || 0;
    const positive = votes.positive || 0;
    const negative = votes.negative || 0;
    const total = important + positive + negative;
    
    if (total === 0) return '5';
    
    const score = ((important * 3 + positive * 2 - negative) / total) * 10;
    return String(Math.max(1, Math.min(10, score)));
  }

  async fetchFromCryptoPanic(): Promise<Partial<NewsArticle>[]> {
    await this.enforceRateLimit('cryptoPanic');
    
    try {
      // Try public endpoint first (limited)
      let url = `${this.baseUrls.cryptoPanic}/posts/?kind=news&page=1`;
      
      // Use API key if available for better access
      if (process.env.CRYPTOPANIC_API_KEY) {
        url = `${this.baseUrls.cryptoPanic}/posts/?auth_token=${process.env.CRYPTOPANIC_API_KEY}&kind=news&page=1`;
      } else {
        console.log('CryptoPanic API key not configured, using public endpoint...');
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AIForecast-Hub/1.0)'
        }
      });

      if (!response.ok) {
        console.error(`CryptoPanic API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const articles: CryptoPanicArticle[] = data.results || [];

      return articles.map(article => ({
        title: article.title,
        url: article.url,
        source: 'cryptopanic',
        sourceName: article.source.title,
        category: this.categorizeArticle(article.title),
        tags: this.extractTags(article.title),
        impactScore: this.calculateImpactScore(article.votes),
        publishedAt: new Date(article.published_at),
      }));
    } catch (error) {
      console.error('Error fetching from CryptoPanic:', error);
      return [];
    }
  }

  async fetchFromRSSFeeds(): Promise<Partial<NewsArticle>[]> {
    const allArticles: Partial<NewsArticle>[] = [];
    
    // Fetch from multiple RSS sources for better content variety
    for (const feed of this.rssFeeds.slice(0, 3)) { // Limit to 3 sources to avoid rate limits
      try {
        await this.enforceRateLimit('rss');
        
        console.log(`📰 Fetching from ${feed.name}...`);
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AIForecast-Hub/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          }
        });
        
        if (!response.ok) {
          console.log(`❌ ${feed.name} RSS feed not available: ${response.status}`);
          continue;
        }

        const rssText = await response.text();
        const articles: Partial<NewsArticle>[] = [];
        
        // Enhanced RSS parsing for XML with better regex patterns
        const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/g);
        
        if (itemMatches) {
          for (const item of itemMatches.slice(0, 15)) { // More articles per source
            let titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
            let linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/);
            let descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
            let pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/);
            
            // Try alternative tag patterns
            if (!titleMatch) titleMatch = item.match(/<title>(.*?)<\/title>/);
            if (!linkMatch) linkMatch = item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
            
            if (titleMatch && linkMatch) {
              const title = titleMatch[1].trim();
              const url = linkMatch[1].trim();
              
              // Skip if already exists (basic deduplication)
              const isDuplicate = allArticles.some(existing => 
                existing.url === url || existing.title === title
              );
              
              if (!isDuplicate) {
                articles.push({
                  title,
                  summary: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : null,
                  url,
                  source: 'rss',
                  sourceName: feed.name,
                  category: this.categorizeArticle(title),
                  tags: this.extractTags(title),
                  impactScore: feed.reliability.toString(),
                  publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
                });
              }
            }
          }
        }

        console.log(`✅ ${feed.name}: ${articles.length} new articles`);
        allArticles.push(...articles);
        
      } catch (error) {
        console.error(`Error fetching from ${feed.name}:`, error);
        continue; // Continue with other feeds
      }
    }

    console.log(`📊 Total RSS articles collected: ${allArticles.length}`);
    return allArticles;
  }

  async fetchFromNewsAPI(): Promise<Partial<NewsArticle>[]> {
    await this.enforceRateLimit('newsAPI');
    
    try {
      const cryptoQuery = encodeURIComponent('(cryptocurrency OR bitcoin OR ethereum OR crypto) NOT scam');
      const url = `${this.baseUrls.newsAPI}/everything?q=${cryptoQuery}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`;
      
      if (!process.env.NEWS_API_KEY) {
        console.log('NewsAPI key not configured, using RSS fallback...');
        return [];
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AIForecast-Hub/1.0)'
        }
      });

      if (!response.ok) {
        console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const articles: NewsAPIArticle[] = data.articles || [];

      return articles
        .filter(article => article.title && article.url && article.publishedAt)
        .map(article => ({
          title: article.title,
          summary: article.description,
          content: article.content,
          url: article.url,
          imageUrl: article.urlToImage,
          source: 'newsapi',
          sourceName: article.source.name || 'NewsAPI',
          author: article.author,
          category: this.categorizeArticle(article.title, article.description),
          tags: this.extractTags(article.title, article.description),
          impactScore: '5', // Default medium impact
          publishedAt: new Date(article.publishedAt),
        }));
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  async fetchSampleNews(): Promise<Partial<NewsArticle>[]> {
    // NO MORE SAMPLE DATA - Return empty array to prevent mock articles
    return [];
  }

  async fetchFromCryptoNewsAPI(): Promise<Partial<NewsArticle>[]> {
    await this.enforceRateLimit('cryptoNewsAPI');
    
    try {
      const url = `${this.baseUrls.cryptoNewsAPI}/v1/category?section=general&items=50&token=${process.env.CRYPTO_NEWS_API_KEY}`;
      
      if (!process.env.CRYPTO_NEWS_API_KEY) {
        console.log('Crypto News API key not configured, using sample data...');
        return this.fetchSampleNews();
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AIForecast-Hub/1.0)'
        }
      });

      if (!response.ok) {
        console.error(`Crypto News API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const articles: CryptoNewsAPIArticle[] = data.data || [];

      return articles.map(article => ({
        title: article.title,
        summary: article.summary,
        content: article.text,
        url: article.url,
        imageUrl: article.image,
        source: 'cryptonews',
        sourceName: article.source,
        category: this.categorizeArticle(article.title, article.text),
        tags: this.extractTags(article.title, article.text),
        sentiment: article.sentiment,
        sentimentScore: this.calculateSentimentScore(article.sentiment),
        impactScore: '6', // Slightly higher as it's curated crypto news
        publishedAt: new Date(article.published_at),
      }));
    } catch (error) {
      console.error('Error fetching from Crypto News API:', error);
      return [];
    }
  }

  async aggregateAllNews(): Promise<void> {
    console.log('🔄 Starting news aggregation from all sources...');
    
    try {
      // Fetch from all sources in parallel
      const [cryptoPanicNews, newsAPINews, cryptoNewsAPINews] = await Promise.all([
        this.fetchFromCryptoPanic(),
        this.fetchFromNewsAPI(),
        this.fetchFromCryptoNewsAPI(),
      ]);

      // If no articles from APIs, add sample data
      const allNews = [...cryptoPanicNews, ...newsAPINews, ...cryptoNewsAPINews];
      if (allNews.length === 0) {
        console.log('📰 No articles from external APIs, adding sample news data...');
        const sampleNews = await this.fetchSampleNews();
        allNews.push(...sampleNews);
      }

      // Use the combined articles (includes sample data if needed)
      const allArticles = allNews;

      console.log(`📰 Fetched ${allArticles.length} articles from all sources`);

      // Insert articles into database
      let inserted = 0;
      for (const articleData of allArticles) {
        try {
          // Check if article already exists
          const existing = await db
            .select()
            .from(newsArticles)
            .where(eq(newsArticles.url, articleData.url!))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(newsArticles).values({
              title: articleData.title!,
              summary: articleData.summary,
              content: articleData.content,
              url: articleData.url!,
              imageUrl: articleData.imageUrl,
              source: articleData.source!,
              sourceName: articleData.sourceName!,
              author: articleData.author,
              category: articleData.category!,
              tags: articleData.tags,
              sentiment: articleData.sentiment,
              sentimentScore: articleData.sentimentScore,
              impactScore: articleData.impactScore,
              publishedAt: articleData.publishedAt!,
            });
            inserted++;
          }
        } catch (error) {
          console.error('Error inserting article:', error);
        }
      }

      console.log(`✅ Inserted ${inserted} new articles into database`);
    } catch (error) {
      console.error('Error in news aggregation:', error);
    }
  }

  async getNews(
    filters: NewsFilters = {},
    sort: NewsSortOption = 'publishedAt',
    direction: SortDirection = 'desc',
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsApiResponse> {
    const offset = (page - 1) * pageSize;
    
    // Build WHERE conditions
    const conditions = [eq(newsArticles.isActive, 1)];
    
    if (filters.sources && filters.sources.length > 0) {
      conditions.push(inArray(newsArticles.source, filters.sources));
    }
    
    if (filters.categories && filters.categories.length > 0) {
      conditions.push(inArray(newsArticles.category, filters.categories));
    }
    
    if (filters.sentiment !== undefined) {
      if (filters.sentiment === '') {
        // Handle empty/null sentiment
        conditions.push(or(
          eq(newsArticles.sentiment, ''),
          sql`${newsArticles.sentiment} IS NULL`
        ));
      } else {
        conditions.push(eq(newsArticles.sentiment, filters.sentiment));
      }
    }
    
    if (filters.dateFrom) {
      conditions.push(gte(newsArticles.publishedAt, new Date(filters.dateFrom)));
    }
    
    if (filters.dateTo) {
      conditions.push(lte(newsArticles.publishedAt, new Date(filters.dateTo)));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(newsArticles.title, `%${filters.search}%`),
          like(newsArticles.summary, `%${filters.search}%`)
        )
      );
    }

    // Build ORDER BY
    let orderBy;
    switch (sort) {
      case 'publishedAt':
        orderBy = direction === 'desc' ? desc(newsArticles.publishedAt) : asc(newsArticles.publishedAt);
        break;
      case 'impact':
        orderBy = direction === 'desc' ? desc(newsArticles.impactScore) : asc(newsArticles.impactScore);
        break;
      case 'sentiment':
        orderBy = direction === 'desc' ? desc(newsArticles.sentimentScore) : asc(newsArticles.sentimentScore);
        break;
      case 'source':
        orderBy = direction === 'desc' ? desc(newsArticles.source) : asc(newsArticles.source);
        break;
      default:
        orderBy = desc(newsArticles.publishedAt);
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsArticles)
      .where(and(...conditions));
    
    const total = totalResult[0].count;

    // Get articles
    const articles = await db
      .select()
      .from(newsArticles)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    return {
      articles,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    };
  }

  async getCategories(): Promise<any[]> {
    // Get actual category values from articles, not configured categories
    const result = await db
      .selectDistinct({ category: newsArticles.category })
      .from(newsArticles)
      .where(eq(newsArticles.isActive, 1));
    
    return result.map(r => ({
      id: r.category,
      name: r.category,
      displayName: r.category.charAt(0).toUpperCase() + r.category.slice(1)
    }));
  }

  async getSources(): Promise<any[]> {
    // Get actual source values from articles, not configured sources
    const result = await db
      .selectDistinct({ 
        name: newsArticles.source,
        displayName: newsArticles.sourceName 
      })
      .from(newsArticles)
      .where(eq(newsArticles.isActive, 1));
    
    // Group by source name to prevent duplicates
    const sourceMap = new Map();
    result.forEach(r => {
      if (!sourceMap.has(r.name)) {
        sourceMap.set(r.name, {
          id: r.name,
          name: r.name,
          displayName: r.displayName || r.name.charAt(0).toUpperCase() + r.name.slice(1)
        });
      }
    });
    
    return Array.from(sourceMap.values());
  }

  async getNewsStats() {
    const [total, sources, categories, latest] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(newsArticles).where(eq(newsArticles.isActive, 1)),
      this.getSources(),
      this.getCategories(),
      db.select({ date: newsArticles.crawledAt }).from(newsArticles).orderBy(desc(newsArticles.crawledAt)).limit(1)
    ]);

    return {
      totalArticles: total[0].count,
      sourcesCount: sources.length,
      categoriesCount: categories.length,
      lastUpdate: latest[0]?.date?.toISOString() || new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const cryptoNewsService = new CryptoNewsService();
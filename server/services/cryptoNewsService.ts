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
    await this.enforceRateLimit('rss');
    
    try {
      // Fetch from free RSS feeds
      const response = await fetch('https://cointelegraph.com/rss');
      
      if (!response.ok) {
        console.log('RSS feed not available, trying alternative...');
        return this.fetchSampleNews();
      }

      const rssText = await response.text();
      // Basic RSS parsing for XML
      const articles: Partial<NewsArticle>[] = [];
      
      // Simple regex parsing for RSS (basic implementation)
      const itemMatches = rssText.match(/<item[^>]*>(.*?)<\/item>/gs);
      
      if (itemMatches) {
        for (const item of itemMatches.slice(0, 10)) { // Limit to 10 articles
          const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/);
          const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/);
          const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/);
          const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/);
          
          if (titleMatch && linkMatch) {
            articles.push({
              title: titleMatch[1].trim(),
              summary: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : null,
              url: linkMatch[1].trim(),
              source: 'rss',
              sourceName: 'CoinTelegraph',
              category: this.categorizeArticle(titleMatch[1]),
              tags: this.extractTags(titleMatch[1], descMatch?.[1] || ''),
              impactScore: '6',
              publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
            });
          }
        }
      }
      
      return articles;
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return this.fetchSampleNews();
    }
  }

  async fetchFromNewsAPI(): Promise<Partial<NewsArticle>[]> {
    await this.enforceRateLimit('newsAPI');
    
    try {
      const cryptoQuery = encodeURIComponent('(cryptocurrency OR bitcoin OR ethereum OR crypto) NOT scam');
      const url = `${this.baseUrls.newsAPI}/everything?q=${cryptoQuery}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`;
      
      if (!process.env.NEWS_API_KEY) {
        console.log('NewsAPI key not configured, using RSS fallback...');
        return this.fetchFromRSSFeeds();
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
    // Sample news data to demonstrate the UI when no API keys are available
    return [
      {
        title: "Bitcoin Reaches New All-Time High as Institutional Adoption Soars",
        summary: "Bitcoin has reached unprecedented levels as more institutions embrace cryptocurrency as a store of value and hedge against inflation.",
        url: "https://example.com/bitcoin-ath",
        source: 'sample',
        sourceName: 'Crypto Times',
        category: 'market',
        tags: ['bitcoin', 'institutional', 'ath'],
        sentiment: 'positive',
        sentimentScore: '0.8',
        impactScore: '9',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        title: "Ethereum 2.0 Staking Rewards Hit Record High",
        summary: "Ethereum's transition to proof-of-stake continues to show impressive returns for validators as network security strengthens.",
        url: "https://example.com/eth2-staking",
        source: 'sample',
        sourceName: 'DeFi Daily',
        category: 'technology',
        tags: ['ethereum', 'staking', 'pos'],
        sentiment: 'positive',
        sentimentScore: '0.7',
        impactScore: '7',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        title: "New DeFi Protocol Launches with Revolutionary Yield Farming Features",
        summary: "A groundbreaking decentralized finance protocol introduces innovative yield farming mechanisms that could reshape the DeFi landscape.",
        url: "https://example.com/new-defi-protocol",
        source: 'sample',
        sourceName: 'Blockchain Weekly',
        category: 'defi',
        tags: ['defi', 'yield-farming', 'protocol'],
        sentiment: 'neutral',
        sentimentScore: '0.1',
        impactScore: '6',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        title: "SEC Provides Clarity on Cryptocurrency Regulations",
        summary: "The Securities and Exchange Commission has issued new guidance that brings much-needed clarity to the cryptocurrency regulatory landscape.",
        url: "https://example.com/sec-crypto-regulations",
        source: 'sample',
        sourceName: 'Regulatory Report',
        category: 'regulation',
        tags: ['sec', 'regulation', 'compliance'],
        sentiment: 'positive',
        sentimentScore: '0.5',
        impactScore: '8',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        title: "NFT Market Shows Signs of Recovery with New Gaming Projects",
        summary: "The NFT marketplace is experiencing renewed interest as blockchain-based gaming projects introduce utility-focused collections.",
        url: "https://example.com/nft-gaming-recovery",
        source: 'sample',
        sourceName: 'NFT News',
        category: 'nft',
        tags: ['nft', 'gaming', 'recovery'],
        sentiment: 'positive',
        sentimentScore: '0.6',
        impactScore: '5',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        title: "Major Exchange Implements Advanced Security Measures",
        summary: "Leading cryptocurrency exchange announces implementation of cutting-edge security protocols to protect user assets.",
        url: "https://example.com/exchange-security",
        source: 'sample',
        sourceName: 'Security Today',
        category: 'technology',
        tags: ['security', 'exchange', 'protection'],
        sentiment: 'positive',
        sentimentScore: '0.4',
        impactScore: '7',
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      }
    ];
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
    
    return result.map(r => ({
      id: r.name,
      name: r.name,
      displayName: r.displayName || r.name.charAt(0).toUpperCase() + r.name.slice(1)
    }));
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
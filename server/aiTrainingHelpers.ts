import { storage } from "./storage";

export const fetchTopPerformingPosts = async (userId: string) => {
  try {
    const posts = await storage.getPostsByUserId(userId);
    
    return posts
      .filter(post => post.performanceScore && post.performanceScore >= 7)
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 5)
      .map(post => ({
        message: post.message,
        performanceScore: post.performanceScore,
        totalEngagement: post.totalEngagement,
        createdAt: post.createdAt
      }));
  } catch (error) {
    console.error('Error fetching top performing posts:', error);
    return [];
  }
};

export const analyzeUserPerformancePatterns = async (userId: string) => {
  try {
    const posts = await storage.getPostsByUserId(userId);
    
    if (posts.length === 0) {
      return {
        hasData: false,
        averageScore: 0,
        topPerformers: 0,
        patterns: []
      };
    }

    const validPosts = posts.filter(p => p.performanceScore);
    const averageScore = validPosts.length > 0 
      ? validPosts.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / validPosts.length 
      : 0;
    
    const topPerformers = validPosts.filter(p => (p.performanceScore || 0) >= 7).length;
    
    // Analyze patterns in high-performing content
    const patterns = analyzeContentPatterns(validPosts.filter(p => (p.performanceScore || 0) >= 7));
    
    return {
      hasData: true,
      averageScore: Math.round(averageScore * 10) / 10,
      topPerformers,
      totalPosts: posts.length,
      patterns
    };
  } catch (error) {
    console.error('Error analyzing user performance patterns:', error);
    return {
      hasData: false,
      averageScore: 0,
      topPerformers: 0,
      patterns: []
    };
  }
};

function analyzeContentPatterns(highPerformingPosts: any[]) {
  const patterns = [];
  
  if (highPerformingPosts.length === 0) return patterns;
  
  // Analyze common words and phrases
  const allText = highPerformingPosts.map(p => p.message.toLowerCase()).join(' ');
  const words = allText.split(/\s+/).filter(w => w.length > 3);
  const wordCounts = words.reduce((acc: any, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  const topWords = Object.entries(wordCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
  
  if (topWords.length > 0) {
    patterns.push({
      type: 'common_keywords',
      data: topWords,
      insight: `Your top-performing posts frequently use: ${topWords.map(w => w.word).join(', ')}`
    });
  }
  
  // Analyze post length patterns
  const lengths = highPerformingPosts.map(p => p.message.length);
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  
  patterns.push({
    type: 'optimal_length',
    data: { average: Math.round(avgLength), range: [Math.min(...lengths), Math.max(...lengths)] },
    insight: `Your best posts average ${Math.round(avgLength)} characters`
  });
  
  return patterns;
}

export const getTrainingDataQuality = async (userId: string) => {
  try {
    const analysis = await analyzeUserPerformancePatterns(userId);
    
    let quality = 'insufficient';
    let recommendation = 'Create more content to build training data';
    
    if (analysis.topPerformers >= 5) {
      quality = 'excellent';
      recommendation = 'Ready for advanced AI fine-tuning';
    } else if (analysis.topPerformers >= 2) {
      quality = 'good';
      recommendation = 'Good foundation, create more high-performing content';
    } else if (analysis.totalPosts >= 10) {
      quality = 'basic';
      recommendation = 'Focus on improving content quality for better performance';
    }
    
    return {
      quality,
      recommendation,
      metrics: analysis
    };
  } catch (error) {
    console.error('Error assessing training data quality:', error);
    return {
      quality: 'unknown',
      recommendation: 'Unable to assess training data',
      metrics: { hasData: false, averageScore: 0, topPerformers: 0, patterns: [] }
    };
  }
};
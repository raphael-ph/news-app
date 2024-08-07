import { news } from '@/types'

export const removeDuplicateData = (articles: news[]) => {
    const filterArticles = articles.filter(article => article.source_domain != null);
    
    const uniqueArticles = Array.from(new Map(filterArticles.map(article => [article.news_url, article])).values());

    return uniqueArticles;
}

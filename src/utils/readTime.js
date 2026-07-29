/**
 * Calculate estimated reading time in minutes based on ~200 words per minute.
 */
export function calculateReadTime(content, summary = '') {
  const fullText = `${summary || ''} ${content || ''}`;
  if (!fullText.trim()) return 1;

  // Strip HTML tags to get pure word count
  const plainText = fullText.replace(/<[^>]+>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  
  return Math.max(1, Math.ceil(words / 200));
}

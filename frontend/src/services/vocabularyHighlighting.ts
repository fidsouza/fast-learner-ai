export interface KnownVocabularyItem {
  text_content: string;
  translation: string;
  item_type: 'word' | 'sentence';
}

export interface HighlightMatch {
  text: string;
  translation: string;
  startIndex: number;
  endIndex: number;
  type: 'word' | 'sentence';
}

export class VocabularyHighlighter {
  private knownVocabulary: KnownVocabularyItem[] = [];

  setVocabulary(vocabulary: KnownVocabularyItem[]) {
    this.knownVocabulary = vocabulary;
  }

  findMatches(text: string): HighlightMatch[] {
    const matches: HighlightMatch[] = [];
    const processedRanges: Array<[number, number]> = [];

    // Sort vocabulary by length (descending) to prioritize longer matches
    const sortedVocab = [...this.knownVocabulary].sort((a, b) => 
      b.text_content.length - a.text_content.length
    );

    // First pass: find sentence matches
    for (const item of sortedVocab.filter(v => v.item_type === 'sentence')) {
      const regex = new RegExp(this.escapeRegExp(item.text_content), 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        // Check if this range overlaps with already processed ranges
        if (!this.hasOverlap(startIndex, endIndex, processedRanges)) {
          matches.push({
            text: match[0],
            translation: item.translation,
            startIndex,
            endIndex,
            type: 'sentence'
          });
          processedRanges.push([startIndex, endIndex]);
        }
      }
    }

    // Second pass: find word matches (only in unprocessed areas)
    for (const item of sortedVocab.filter(v => v.item_type === 'word')) {
      // Create word boundary regex for more accurate matching
      const regex = new RegExp(`\\b${this.escapeRegExp(item.text_content)}\\b`, 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        // Check if this range overlaps with already processed ranges
        if (!this.hasOverlap(startIndex, endIndex, processedRanges)) {
          matches.push({
            text: match[0],
            translation: item.translation,
            startIndex,
            endIndex,
            type: 'word'
          });
          processedRanges.push([startIndex, endIndex]);
        }
      }
    }

    // Sort matches by start index
    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private hasOverlap(start: number, end: number, ranges: Array<[number, number]>): boolean {
    return ranges.some(([rangeStart, rangeEnd]) => 
      (start < rangeEnd && end > rangeStart)
    );
  }

  // Helper method to get translation for a specific text
  getTranslation(text: string): string | null {
    const item = this.knownVocabulary.find(v => 
      v.text_content.toLowerCase() === text.toLowerCase()
    );
    return item?.translation || null;
  }
}
import type { SkedPalSyncSettings } from './settings';

export interface ParsedTask {
  raw: string;
  lineNumber: number;
  shouldSync: boolean;
  subject: string;
  startDate?: string;
  dueDate?: string;
  bodyExtras: string;
}

export function parseSyncableTasks(lines: string[], settings: SkedPalSyncSettings): ParsedTask[] {
  const tasks: ParsedTask[] = [];

  lines.forEach((line, index) => {
    const taskMatch = line.match(/^\s*-\s*\[ \]\s+(.*)/);
    if (!taskMatch) return;

    const content = taskMatch[1];

    console.log('🔍 Parsing:', content);
    // Must include global filter tag (if set)
    var gtfRegex = new RegExp(`(^|\\s)${escapeRegex(settings.globalTaskFilter)}(\\s|$|[.,;!?])`);
    console.log('🔍 Global filter regex:', gtfRegex);
    if (
      settings.globalTaskFilter &&
      !gtfRegex.test(content)
    ) return;

    console.log('✅ Passed global filter');
    // Must include required tag for sync (if set)
    if (
      settings.requiredTagForSync &&
      !new RegExp(`(^|\\s)${escapeRegex(settings.requiredTagForSync)}(\\s|$|[.,;!?])`).test(content)
    ) return;

    console.log('✅ Passed required tag');
    // Extract and remove start and due metadata (whole-word match, absorb spaces)
    const startMatch = content.match(/\s*🛫\s*(\d{4}-\d{2}-\d{2})\b/);
    const dueMatch = content.match(/\s*📅\s*(\d{4}-\d{2}-\d{2})\b/);

    let cleaned = content
      .replace(/\s*🛫\s*\d{4}-\d{2}-\d{2}\b/, ' ')
      .replace(/\s*📅\s*\d{4}-\d{2}-\d{2}\b/, ' ');

    // Remove globalTaskFilter and requiredTagForSync tags from cleaned
    if (settings.globalTaskFilter) {
      cleaned = cleaned.replace(new RegExp(`(^|\\s)${escapeRegex(settings.globalTaskFilter)}(\\s|$|[.,;!?])`, 'g'), ' ');
    }
    if (settings.requiredTagForSync) {
      cleaned = cleaned.replace(new RegExp(`(^|\\s)${escapeRegex(settings.requiredTagForSync)}(\\s|$|[.,;!?])`, 'g'), ' ');
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Guess where the bracketed extras start
    const bracketIndex = cleaned.indexOf('[');
    const timeIndex = cleaned.search(/\d+[hm]/i);
    const splitIndex = bracketIndex > -1 ? bracketIndex : timeIndex > -1 ? timeIndex : cleaned.length;

    const subject = cleaned.slice(0, splitIndex).trim();
    const bodyExtras = cleaned.slice(subject.length).trim();

    tasks.push({
      raw: line,
      lineNumber: index,
      shouldSync: true,
      subject,
      startDate: startMatch?.[1],
      dueDate: dueMatch?.[1],
      bodyExtras,
    });
  });

  return tasks;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { parseSyncableTasks } from './task-parser';
import type { SkedPalSyncSettings } from './settings';

export function runTestParser() {
  const mockLines = [
    '- [ ] #task Write proposal for plugin 🛫 2025-03-27 📅 2025-03-30 [#Work Tasks] [@mornings] 1h30m ⏫',
    '- [ ] #task Fix bug in parser 📅 2025-03-28 [#Dev] 45m',
    '- [ ] Unrelated task',
  ];

  const mockSettings: SkedPalSyncSettings = {
    skedpalEmail: 'yourname@skedpal.com',
    defaultPriority: 'Medium',
    defaultParentTask: 'Inbox',
    defaultTags: '#obsidian',
    defaultDuration: '30m',
    autoSendOnSave: false,
    priorityMap: {
      Lowest: 'Low',
      Low: 'Low',
      Normal: 'Medium',
      Medium: 'Medium',
      High: 'High',
      Highest: 'Crit',
    },
    requiredTagForSync: '',
    globalTaskFilter: '',
  };

  const parsed = parseSyncableTasks(mockLines, mockSettings);
  console.log('🧪 Parsed Tasks:', parsed);
}

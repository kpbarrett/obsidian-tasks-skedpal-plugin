export interface PriorityMap {
    [key: string]: string;
  };

export interface SkedPalSyncSettings {
  skedpalEmail: string;
  defaultPriority: string;
  defaultProject: string;
  defaultTags: string;
  defaultEstimate: string;
  autoSendOnSave: boolean;
  priorityMap: PriorityMap;
  requiredTagForSync: string;
};

export const DEFAULT_SETTINGS: SkedPalSyncSettings = {
  skedpalEmail: '',
  defaultPriority: 'Medium',
  defaultProject: '',
  defaultTags: '',
  defaultEstimate: '',
  autoSendOnSave: false,
  priorityMap: {
    Lowest: 'Low',
    Low: 'Low',
    Normal: 'Medium',
    Medium: 'Medium',
    High: 'High',
    Highest: 'High',
  },
  requiredTagForSync: '',  // Leave empty by default to allow all tasks
};

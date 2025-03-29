export interface PriorityMap {
    [key: string]: string;
}

export interface SkedPalSyncSettings {
    skedpalEmail: string;
    defaultPriority: string;
    defaultParentTask: string;
    defaultTags: string;
    defaultDuration: string;
    autoSendOnSave: boolean;
    priorityMap: PriorityMap;
    requiredTagForSync: string;
    globalTaskFilter: string;
}

export const DEFAULT_SETTINGS: SkedPalSyncSettings = {
    skedpalEmail: "",
    defaultPriority: "Medium",
    defaultParentTask: "",
    defaultTags: "",
    defaultDuration: "",
    autoSendOnSave: false,
    priorityMap: {
        Lowest: "Low",
        Low: "Low",
        Normal: "Medium",
        Medium: "Medium",
        High: "High",
        Highest: "High",
    },
    requiredTagForSync: "",
    globalTaskFilter: "#task",
};

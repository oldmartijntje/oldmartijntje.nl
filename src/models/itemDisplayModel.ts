export interface ItemDisplay {
    _id?: string;
    title: string;
    thumbnailImage?: string;
    description?: string;
    link?: string;
    infoPages: InfoPage[];
    lastUpdated?: Date;
    hidden: boolean;
    spoiler: boolean;
    nsfw: boolean;
    tags: string[];
    displayItemType: string;
}

export interface ProjectData {
    _id?: string;
    projectId: string;
    attributes: string | any;
    clearanceLevelNeeded: number;
}

export const displayItemTypes = ['project', 'blog', 'url', 'random'];


export interface InfoPage {
    title: string;
    content: string;
}

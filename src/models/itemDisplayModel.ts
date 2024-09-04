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

export interface InfoPage {
    title: string;
    content: string;
}

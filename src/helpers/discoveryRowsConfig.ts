import { ItemDisplay } from '../models/itemDisplayModel';

export interface DiscoveryDisplay {
    dataList: ItemDisplay[];
    title: string;
    appliedFilters: string[];
    showOnHome: boolean;
}

let seedRotations = Math.random() * 10000;

export function seededRandom(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    seedRotations = (seedRotations * a + c) % m;
    const answer = seedRotations / m;
    seedRotations = (seedRotations * 9301 + 49297) % 233280
    return answer;
}

export function setSeededRandom(seed: number) {
    seedRotations = seed;
}

export function getDiscoveryRows(
    mainProjects: ItemDisplay[],
    mainBlog: ItemDisplay[],
    justPosts: ItemDisplay[],
    mainWebposts: ItemDisplay[],
    mainRandomPosts: ItemDisplay[]
): DiscoveryDisplay[] {
    return [
        {
            dataList: [...mainProjects],
            title: 'Top Picks',
            appliedFilters: ['favourite'],
            showOnHome: true
        },
        {
            dataList: [...mainProjects].sort(() => {
                return seededRandom() - 0.5;
            }),
            title: 'Website Projects',
            appliedFilters: ['website'],
            showOnHome: false
        },
        {
            dataList: [...mainBlog],
            title: 'Blog Posts',
            appliedFilters: [],
            showOnHome: true
        },
        {
            dataList: [...justPosts],
            title: 'Updates',
            appliedFilters: ['update'],
            showOnHome: false
        },
        {
            dataList: [...mainProjects],
            title: 'Games etc.',
            appliedFilters: ['game', '!playthrough'],
            showOnHome: false
        },
        {
            dataList: [...mainWebposts],
            title: 'Weblinks',
            appliedFilters: [],
            showOnHome: false
        },
        {
            dataList: [...justPosts],
            title: 'General Posts',
            appliedFilters: ['!update'],
            showOnHome: false
        },
        {
            dataList: [...mainProjects],
            title: 'Side Projects',
            appliedFilters: ['side-project'],
            showOnHome: false
        },
        {
            dataList: [...mainProjects].sort((a: ItemDisplay, b: ItemDisplay) => {
                const dateA = new Date(a.publishDate || 0).getTime();
                const dateB = new Date(b.publishDate || 0).getTime();
                return dateB - dateA;
            }),
            title: 'All Projects',
            appliedFilters: [],
            showOnHome: false
        },
        {
            dataList: [...mainRandomPosts].sort(() => {
                return seededRandom() - 0.5;
            }),
            title: 'Random Things',
            appliedFilters: [],
            showOnHome: false
        }
    ];
}

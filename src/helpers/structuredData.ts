export const STRUCTURED_DATA_DEFAULTS = {
    username: 'OldMartijntje',
    siteName: 'OldMartijntje.nl',
    siteUrl: 'https://oldmartijntje.nl',
    siteDescription: "OldMartijntje's personal webcorner",
    rssUrl: 'https://api.oldmartijntje.nl/getData/blogs/rss.xml',
};

export interface BlogListStructuredDataInput {
    blogs: Array<{
        title: string;
        description: string;
        blogIdentifier: string;
        pubDate: string;
        editDate: string;
    }>;
    currentPage: number;
    totalPages: number;
}

export interface BlogArticleStructuredDataInput {
    title: string;
    description: string;
    content: string;
    blogIdentifier: string;
    pubDate: string;
    editDate: string;
}

const buildAbsoluteUrl = (pathname: string) => `${STRUCTURED_DATA_DEFAULTS.siteUrl}${pathname}`;

const getCommonWebsiteData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: STRUCTURED_DATA_DEFAULTS.siteName,
    url: STRUCTURED_DATA_DEFAULTS.siteUrl,
    description: STRUCTURED_DATA_DEFAULTS.siteDescription,
    publisher: {
        '@type': 'Person',
        name: STRUCTURED_DATA_DEFAULTS.username,
    },
});

export const buildBlogListStructuredData = ({
    blogs,
    currentPage,
    totalPages,
}: BlogListStructuredDataInput) => {
    const listUrl = buildAbsoluteUrl('/blogs');

    return [
        getCommonWebsiteData(),
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Blogs',
            description: 'Blog listing page',
            url: listUrl,
            isPartOf: {
                '@type': 'WebSite',
                name: STRUCTURED_DATA_DEFAULTS.siteName,
                url: STRUCTURED_DATA_DEFAULTS.siteUrl,
            },
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: blogs.length,
                itemListElement: blogs.map((blog, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: buildAbsoluteUrl(`/blogs/${encodeURIComponent(blog.blogIdentifier)}`),
                    item: {
                        '@type': 'BlogPosting',
                        headline: blog.title,
                        description: blog.description,
                        datePublished: blog.pubDate,
                        dateModified: blog.editDate,
                        author: {
                            '@type': 'Person',
                            name: STRUCTURED_DATA_DEFAULTS.username,
                        },
                    },
                })),
            },
            pagination: {
                '@type': 'WebPage',
                currentPage,
                totalPages,
            },
        },
    ];
};

export const buildBlogArticleStructuredData = ({
    title,
    description,
    content,
    blogIdentifier,
    pubDate,
    editDate,
}: BlogArticleStructuredDataInput) => {
    const articleUrl = buildAbsoluteUrl(`/blogs/${encodeURIComponent(blogIdentifier)}`);

    return [
        getCommonWebsiteData(),
        {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            description,
            articleBody: content,
            url: articleUrl,
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': articleUrl,
            },
            author: {
                '@type': 'Person',
                name: STRUCTURED_DATA_DEFAULTS.username,
            },
            publisher: {
                '@type': 'Person',
                name: STRUCTURED_DATA_DEFAULTS.username,
            },
            datePublished: pubDate,
            dateModified: editDate,
        },
    ];
};

export const getHardcodedPageStructuredData = (pathname: string) => {
    const pageMap: Record<string, { title: string; description: string }> = {
        '/': {
            title: 'Home',
            description: 'Homepage of OldMartijntje.nl',
        },
        '/discovery': {
            title: 'Discovery',
            description: 'Discovery feed and featured projects',
        },
        '/events': {
            title: 'Events',
            description: 'Events and announcements',
        },
        '/signup': {
            title: 'Signup',
            description: 'Create an account',
        },
        '/console': {
            title: 'Console App',
            description: 'Console app page and experiments',
        },
        '/api-test': {
            title: 'API Test',
            description: 'Internal API testing page',
        },
        '/user': {
            title: 'User Page',
            description: 'User account details and actions',
        },
        '/registerCode': {
            title: 'Registration Code Manager',
            description: 'Manage registration codes',
        },
        '/api/DisplayItems': {
            title: 'Display Items Manager',
            description: 'Manage display items',
        },
        '/api/projectDataManager': {
            title: 'Project Data Manager',
            description: 'Manage project data entries',
        },
        '/api/security-flags': {
            title: 'Security Flags',
            description: 'Manage security flags',
        },
        '/api/blogs': {
            title: 'Blogs Editor',
            description: 'Manage blog entries',
        },
    };

    const pageInfo = pageMap[pathname] || {
        title: 'Page',
        description: 'OldMartijntje.nl page',
    };

    return [
        getCommonWebsiteData(),
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: pageInfo.title,
            description: pageInfo.description,
            url: buildAbsoluteUrl(pathname),
            inLanguage: 'en',
            isPartOf: {
                '@type': 'WebSite',
                name: STRUCTURED_DATA_DEFAULTS.siteName,
                url: STRUCTURED_DATA_DEFAULTS.siteUrl,
            },
            about: {
                '@type': 'Person',
                name: STRUCTURED_DATA_DEFAULTS.username,
            },
        },
    ];
};

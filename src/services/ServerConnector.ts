class ServerConnector {
    sessionToken: string | null = null;

    constructor(sessionToken: string | null = null) {
        this.sessionToken = sessionToken;
    }

    fetchData = async (url: string, method: string, body: string = '{}', onSuccess: any, onFail: any) => {
        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (method !== 'GET' && method !== 'DELETE') {
                options.body = body;
            }
            const response = await fetch(url, options);
            if (!response) {
                return;
            }
            if (response.status !== 200) {
                console.log('response', response);
                if (response.status === 429) {
                    localStorage.setItem('rateLimit', Date.now().toString());
                }
                onFail(response);
                return;
            }
            const data = await response.json();
            onSuccess(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            onFail(error);
        }
    }

    loginRequest = async (username: string, password: string, onSuccess: any, onFail: any) => {
        const url = 'https://api.oldmartijntje.nl/login';
        const body = JSON.stringify({ username, password });
        this.fetchData(url, 'POST', body, onSuccess, (response: any) => {
            if (response.status === 401) {
                localStorage.removeItem('UserLogin');
                onFail(response);
            }
        });
    }

}

export default ServerConnector;
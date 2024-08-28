class ServerConnector {
    sessionToken: string | null = null;

    constructor(sessionToken: string | null = null) {
        this.sessionToken = sessionToken;
    }

    fetchData = async (url: string, method: string, body: string = '{}', onSuccess: any = () => { }, onFail: any = () => { }) => {
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
                    onFail(response);
                    return;
                }
            }
            const data = await response.json();
            if (!data || data.error || data.success === false) {
                onFail(data);
                return;
            }
            onSuccess(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            onFail(error);
        }
    }

    getUserData = () => {
        const localStorageData = localStorage.getItem('UserLogin')
        let userData = JSON.parse(localStorageData || '{}');
        return userData;
    }

    /**
     * Login request
     * 
     * @param username - username or sessionToken. Grabs sessiontoken from localstorage if undefined
     * @param password - Password, If undefined => do sessiontoken validation / login instead of username + password
     * @param onSuccess - Callback function on success
     * @param onFail - Callback function on fail
     */
    loginRequest = async (username: string | null = null, password: string | null = null, onSuccess: any = () => { }, onFail: any = () => { }) => {
        const url = 'https://api.oldmartijntje.nl/login';
        let body;
        if (!username) {
            username = this.getUserData().sessionToken;
        }
        if (!password) {
            body = JSON.stringify({ sessionToken: username });
        } else {
            body = JSON.stringify({ username, password });
        }
        this.fetchData(url, 'POST', body, (response: any) => {
            const localStorageData = localStorage.getItem('UserLogin')
            let userData = JSON.parse(localStorageData || '{}');
            userData.sessionToken = response.sessionToken;
            userData.username = username;
            localStorage.setItem('UserLogin', JSON.stringify(userData));
            onSuccess(response);

        }, (response: any) => {
            if (response.status === 401) {
                localStorage.removeItem('UserLogin');
                onFail(response);
            }
        });
    }

}

export default ServerConnector;
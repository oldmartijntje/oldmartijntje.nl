import { allEvents } from './EventsSystem';

class ServerConnector {

    constructor() {
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
            const data = await response.json();
            if (response.status === 429) {
                localStorage.setItem('rateLimit', Date.now().toString());
                onFail({ ...data, status: response.status, networkResponse: response });
                return;
            }
            if (!data || data.error || data.success === false) {
                onFail({ ...data, status: response.status, networkResponse: response });
                return;
            }
            onSuccess({ ...data, status: response.status, networkResponse: response });
        } catch (error) {
            console.error('Error fetching data:', error);
            onFail(error);
        }
    }

    static encodeQueryData = (data: { [key: string]: string }, url: string) => {
        let stringData = ''
        for (let key in data) {
            if (stringData !== '') {
                stringData += '&';
            }
            stringData += key + '=' + encodeURIComponent(data[key]);
        }
        return url + '?' + stringData;
    }

    static getUserData = () => {
        const localStorageData = localStorage.getItem('UserLogin')
        let userData = JSON.parse(localStorageData || '{}');
        return userData;
    }

    /**
     * Login request
     * 
     * @param username - username.
     * @param password - Password or sessionToken.
     * @param loginType - Type of login (password, sessionToken) true for password, false for sessionToken
     * @param onSuccess - Callback function on success
     * @param onFail - Callback function on fail
     */
    loginRequest = async (username: string | null = null, password: string | null = null, loginType: boolean, onSuccess: any = () => { }, onFail: any = () => { }) => {
        let url = 'https://api.oldmartijntje.nl/login';
        let body;
        if (!username) {
            username = ServerConnector.getUserData().username;
        }
        if (!password) {
            if (loginType) {
                password = 'root';
            } else {
                password = ServerConnector.getUserData().sessionToken;
            }
        }
        if (loginType) {
            body = JSON.stringify({
                username: username,
                password: password
            });
        } else {
            body = JSON.stringify({
                username: username,
                sessionToken: password
            });
            url += '/validateToken';
        }
        this.fetchData(url, 'POST', body, (response: any) => {
            const localStorageData = localStorage.getItem('UserLogin')
            let userData = JSON.parse(localStorageData || '{}');
            if (loginType) {
                userData.sessionToken = response.sessionToken;
            } else {
                userData.sessionToken = password;
            }
            userData.username = username;
            userData.role = response.data?.role;
            userData.clearanceLevel = response.data?.clearanceLevel;
            localStorage.setItem('UserLogin', JSON.stringify(userData));
            onSuccess(response);

        }, (response: any) => {
            if (response.status === 401) {
                localStorage.removeItem('UserLogin');
                allEvents.emit('logout');
                onFail(response);
            }
        });
    }

}

export default ServerConnector;
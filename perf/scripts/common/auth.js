import http from 'k6/http';
import { check } from 'k6';

export function login(baseUrl, userId, password) {
    const url = `${baseUrl}/api/v1/auth/login`;
    const payload = JSON.stringify({
        userId: userId,
        password: password,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    const success = check(res, {
        'login success (200)': (r) => r.status === 200,
    });

    if (!success) {
        console.error(`Login failed for ${userId}: ${res.status} ${res.body}`);
        return null;
    }

    return {
        cookie: res.cookies['ITSMSession'][0].value,
        user: res.json(),
    };
}

export const authFetch = async (url: string, options: RequestInit = {}) => {
    // クッキーベースの認証へ移行（ブラウザが自動送信）
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // クッキーを送信するために必要
    });

    if (response.status === 401) {
        console.error('Unauthorized access');
    }

    return response;
};

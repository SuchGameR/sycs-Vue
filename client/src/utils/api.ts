export const authFetch = async (url: string, options: RequestInit = {}) => {
    // クッキーベースの認証へ移行（ブラウザが自動送信）
    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };

    // FormDataの場合はContent-Typeを設定しない(ブラウザが自動でmultipart/form-dataを設定)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

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

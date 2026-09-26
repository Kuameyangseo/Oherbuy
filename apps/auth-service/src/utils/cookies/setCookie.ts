import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string, options: any = {}) => {
    const isProd = process.env.NODE_ENV === 'production';
    // In production we require secure cookies and cross-site cookies to be 'none'.
    // During local development (HTTP) disable secure and use 'lax' so the browser accepts the cookie.
    const cookieOptions: any = {
        // allow callers to override httpOnly (used for `active-role` which must be readable by client)
        httpOnly: options.httpOnly === false ? false : true,
        secure: !!isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        ...options,
    };

    res.cookie(name, value, cookieOptions);
}
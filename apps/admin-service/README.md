# Admin service

The admin service owns platform-level catalog and operations APIs. It runs on port `6004` and is exposed through the API gateway under `/admin`.

Configure these environment variables before starting it:

- `ADMIN_EMAIL`: administrator login email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the administrator password. `ADMIN_PASSWORD` is supported for local development only.
- `ADMIN_ACCESS_TOKEN_SECRET`: dedicated JWT secret. If omitted, `ACCESS_TOKEN_SECRET` is used.
- `ALLOWED_ORIGINS`: comma-separated browser origins.

Example local setup:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>
ADMIN_ACCESS_TOKEN_SECRET=<long-random-secret>
```

Endpoints:

- `POST /admin/api/auth/login`
- `GET /admin/api/auth/me`
- `GET /admin/api/dashboard`
- `GET /admin/api/products`
- `GET /admin/api/products/:id`
- `PATCH /admin/api/products/:id`
- `PATCH /admin/api/products/:id/status`
- `POST /admin/api/products/:id/archive`
- `POST /admin/api/products/:id/restore`
- `GET /admin/api/sellers`
- `GET /admin/api/orders`

All endpoints except login require `Authorization: Bearer <token>`.

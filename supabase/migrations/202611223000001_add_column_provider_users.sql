-- 1. Cho phép mật khẩu NULL (tài khoản Google không có password)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'hash_password'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN hash_password DROP NOT NULL;
    END IF;
END $$;

-- 2. Thêm provider, avatar_url và google_sub (KHÔNG có dấu phẩy ở dòng cuối)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255);

-- 3. Đặt ràng buộc UNIQUE cho google_sub (PostgreSQL cho phép nhiều dòng NULL với user LOCAL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_google_sub'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT uk_users_google_sub UNIQUE (google_sub);
    END IF;
END $$;
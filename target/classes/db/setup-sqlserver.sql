USE master;
GO

IF DB_ID(N'webgym') IS NULL
BEGIN
    CREATE DATABASE webgym COLLATE Vietnamese_CI_AS;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.server_principals
    WHERE name = N'webgym_login'
)
BEGIN
    CREATE LOGIN webgym_login
        WITH PASSWORD = 'WebGym@2026',
             CHECK_POLICY = ON,
             CHECK_EXPIRATION = OFF;
END;
GO

USE webgym;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_principals
    WHERE name = N'webgym_user'
)
BEGIN
    CREATE USER webgym_user FOR LOGIN webgym_login;
END;
GO

IF ISNULL(IS_ROLEMEMBER(N'db_owner', N'webgym_user'), 0) <> 1
BEGIN
    ALTER ROLE db_owner ADD MEMBER webgym_user;
END;
GO


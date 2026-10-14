USE webgym;
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id NVARCHAR(50) NOT NULL,
        username NVARCHAR(50) NOT NULL,
        hashPassword NVARCHAR(255) NOT NULL,
        role NVARCHAR(30) NOT NULL,
        email NVARCHAR(120) NULL,
        displayName NVARCHAR(120) NOT NULL,
        avatarUrl NVARCHAR(500) NULL,
        avatarId NVARCHAR(100) NULL,
        createdAt DATETIME2 NOT NULL CONSTRAINT df_users_createdAt DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL CONSTRAINT df_users_updatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk_users PRIMARY KEY (id),
        CONSTRAINT uq_users_username UNIQUE (username),
        CONSTRAINT uq_users_email UNIQUE (email)
    );
END;
GO

IF OBJECT_ID(N'dbo.customer', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.customer (
        id NVARCHAR(50) NOT NULL,
        userId NVARCHAR(50) NOT NULL,
        name NVARCHAR(120) NOT NULL,
        dateOfBirth DATE NULL,
        gender BIT NOT NULL,
        address NVARCHAR(500) NULL,
        phone NVARCHAR(20) NULL,

        CONSTRAINT pk_customer PRIMARY KEY (id),
        CONSTRAINT uq_customer_userId UNIQUE (userId),
        CONSTRAINT fk_customer_users
            FOREIGN KEY (userId) REFERENCES dbo.users(id)
    );
END;
GO

IF OBJECT_ID(N'dbo.product', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.product (
        id NVARCHAR(50) NOT NULL,
        name NVARCHAR(150) NOT NULL,
        price BIGINT NOT NULL,
        stockQuantity BIGINT NOT NULL,
        description NVARCHAR(1000) NULL,
        imageUrl NVARCHAR(500) NULL,
        status BIT NOT NULL CONSTRAINT df_product_status DEFAULT 1,

        CONSTRAINT pk_product PRIMARY KEY (id),
        CONSTRAINT ck_product_price CHECK (price >= 0),
        CONSTRAINT ck_product_stockQuantity CHECK (stockQuantity >= 0)
    );
END;
GO

IF COL_LENGTH(N'dbo.product', N'status') IS NULL
BEGIN
    ALTER TABLE dbo.product
        ADD status BIT NOT NULL
            CONSTRAINT df_product_status DEFAULT 1;
END;
GO

IF OBJECT_ID(N'dbo.package', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.package (
        id NVARCHAR(50) NOT NULL,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(1000) NULL,
        durationInDays BIGINT NOT NULL,
        price BIGINT NOT NULL,
        status BIT NOT NULL,

        CONSTRAINT pk_package PRIMARY KEY (id),
        CONSTRAINT ck_package_durationInDays CHECK (durationInDays > 0),
        CONSTRAINT ck_package_price CHECK (price >= 0)
    );
END;
GO

IF COL_LENGTH(N'dbo.package', N'price') IS NULL
BEGIN
    ALTER TABLE dbo.package
        ADD price BIGINT NOT NULL
            CONSTRAINT df_package_price DEFAULT 0;

    ALTER TABLE dbo.package
        ADD CONSTRAINT ck_package_price CHECK (price >= 0);
END;
GO

IF OBJECT_ID(N'dbo.orders', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.orders (
        id NVARCHAR(50) NOT NULL,
        customerId NVARCHAR(50) NOT NULL,
        totalAmount BIGINT NOT NULL,
        status NVARCHAR(30) NOT NULL,
        createdAt DATETIME2 NOT NULL CONSTRAINT df_orders_createdAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk_orders PRIMARY KEY (id),
        CONSTRAINT fk_orders_customer
            FOREIGN KEY (customerId) REFERENCES dbo.customer(id),
        CONSTRAINT ck_orders_totalAmount CHECK (totalAmount >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.order_items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.order_items (
        id NVARCHAR(50) NOT NULL,
        orderId NVARCHAR(50) NOT NULL,
        packageId NVARCHAR(50) NULL,
        productId NVARCHAR(50) NULL,
        quantity BIGINT NOT NULL,
        price BIGINT NOT NULL,

        CONSTRAINT pk_order_items PRIMARY KEY (id),
        CONSTRAINT fk_order_items_orders
            FOREIGN KEY (orderId) REFERENCES dbo.orders(id),
        CONSTRAINT fk_order_items_package
            FOREIGN KEY (packageId) REFERENCES dbo.package(id),
        CONSTRAINT fk_order_items_product
            FOREIGN KEY (productId) REFERENCES dbo.product(id),
        CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),
        CONSTRAINT ck_order_items_price CHECK (price >= 0),
        CONSTRAINT ck_order_items_reference CHECK (
            (packageId IS NOT NULL AND productId IS NULL)
            OR (packageId IS NULL AND productId IS NOT NULL)
        )
    );
END;
GO

IF OBJECT_ID(N'dbo.payment', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.payment (
        id NVARCHAR(50) NOT NULL,
        orderId NVARCHAR(50) NOT NULL,
        totalAmount BIGINT NOT NULL,
        paymentMethod NVARCHAR(30) NOT NULL,
        paymentStatus NVARCHAR(30) NOT NULL,
        paymentDate DATETIME2 NULL,

        CONSTRAINT pk_payment PRIMARY KEY (id),
        CONSTRAINT fk_payment_orders
            FOREIGN KEY (orderId) REFERENCES dbo.orders(id),
        CONSTRAINT ck_payment_totalAmount CHECK (totalAmount >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.subscription', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.subscription (
        id NVARCHAR(50) NOT NULL,
        customerId NVARCHAR(50) NOT NULL,
        packageId NVARCHAR(50) NOT NULL,
        startDate DATETIME2 NOT NULL,
        endDate DATETIME2 NOT NULL,
        status NVARCHAR(30) NOT NULL,

        CONSTRAINT pk_subscription PRIMARY KEY (id),
        CONSTRAINT fk_subscription_customer
            FOREIGN KEY (customerId) REFERENCES dbo.customer(id),
        CONSTRAINT fk_subscription_package
            FOREIGN KEY (packageId) REFERENCES dbo.package(id),
        CONSTRAINT ck_subscription_dates CHECK (endDate >= startDate)
    );
END;
GO

IF OBJECT_ID(N'dbo.invoices', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.invoices (
        id NVARCHAR(50) NOT NULL,
        invoiceNumber NVARCHAR(50) NOT NULL,
        orderId NVARCHAR(50) NOT NULL,
        totalPaid BIGINT NOT NULL,
        issuedDate DATETIME2 NOT NULL CONSTRAINT df_invoices_issuedDate DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk_invoices PRIMARY KEY (id),
        CONSTRAINT uq_invoices_invoiceNumber UNIQUE (invoiceNumber),
        CONSTRAINT uq_invoices_orderId UNIQUE (orderId),
        CONSTRAINT fk_invoices_orders
            FOREIGN KEY (orderId) REFERENCES dbo.orders(id),
        CONSTRAINT ck_invoices_totalPaid CHECK (totalPaid >= 0)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ix_orders_customerId_createdAt'
      AND object_id = OBJECT_ID(N'dbo.orders')
)
    CREATE INDEX ix_orders_customerId_createdAt
        ON dbo.orders(customerId, createdAt DESC);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ix_order_items_orderId'
      AND object_id = OBJECT_ID(N'dbo.order_items')
)
    CREATE INDEX ix_order_items_orderId
        ON dbo.order_items(orderId);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ix_payment_orderId_paymentStatus'
      AND object_id = OBJECT_ID(N'dbo.payment')
)
    CREATE INDEX ix_payment_orderId_paymentStatus
        ON dbo.payment(orderId, paymentStatus);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ix_subscription_customerId_status_endDate'
      AND object_id = OBJECT_ID(N'dbo.subscription')
)
    CREATE INDEX ix_subscription_customerId_status_endDate
        ON dbo.subscription(customerId, status, endDate);
GO

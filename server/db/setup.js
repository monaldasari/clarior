import { sql } from "./index.js";

export const initializeDatabase = async () => {
  console.log("Initializing database tables...");
  try {
    // 1. Users Table (Core for Auth, Profiles, Roles)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        status VARCHAR(50) DEFAULT 'Active',
        
        -- Profile specific
        phone VARCHAR(50),
        company VARCHAR(255),
        department VARCHAR(100),
        job_title VARCHAR(100),
        bio TEXT,
        location VARCHAR(100),
        website VARCHAR(255),
        linkedin VARCHAR(255),
        github VARCHAR(255),
        time_zone VARCHAR(100) DEFAULT 'UTC',
        language VARCHAR(50) DEFAULT 'en',
        theme_preference VARCHAR(20) DEFAULT 'system',
        profile_picture_url TEXT,
        cover_image_url TEXT,
        
        -- Auth internals
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        last_login TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Ensure super admin exists (optional, but good for testing)
    const [{ count: adminCount }] = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'Super Admin'`;
    if (parseInt(adminCount) === 0) {
      // Create default admin: admin@clarior.com / Admin123!
      // Hash pre-computed for "Admin123!" using bcrypt (rounds=10)
      const defaultHash = "$2a$10$w09a.tS7lWcOhwUq6P6lVuYn9eP.sFQK4YyZzJjJ8U.E1j1n3j6Gq";
      await sql`
        INSERT INTO users (email, password_hash, full_name, role, is_verified)
        VALUES ('admin@clarior.com', ${defaultHash}, 'System Admin', 'Super Admin', TRUE)
        ON CONFLICT DO NOTHING
      `;
      console.log("Default Super Admin created: admin@clarior.com / Admin123!");
    }

    // 2. Customers
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Fallback alterations if columns were missing in older version
    await sql`DO $$ BEGIN ALTER TABLE customers ADD COLUMN phone VARCHAR(50); EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
    await sql`DO $$ BEGIN ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
    await sql`DO $$ BEGIN ALTER TABLE customers ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;

    // 3. Leads
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        source VARCHAR(100) DEFAULT 'Website',
        status VARCHAR(50) DEFAULT 'New',
        assigned_to VARCHAR(255),
        assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        notes TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`DO $$ BEGIN ALTER TABLE leads ADD COLUMN assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
    await sql`DO $$ BEGIN ALTER TABLE leads ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;

    // 4. Tasks
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to VARCHAR(255),
        assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date DATE,
        completed BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'Todo',
        category VARCHAR(100) DEFAULT 'General',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`DO $$ BEGIN ALTER TABLE tasks ADD COLUMN assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
    await sql`DO $$ BEGIN ALTER TABLE tasks ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;

    // 5. Activity Logs
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`DO $$ BEGIN ALTER TABLE activity_logs ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;

    // 6. Notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) DEFAULT 'Info',
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 7. Files/Attachments
    await sql`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size INTEGER,
        path TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 8. Revenue (Existing mock data structure)
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        id SERIAL PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount DECIMAL(12,2) DEFAULT 0,
        UNIQUE(month, year)
      )
    `;

    const [{ count }] = await sql`SELECT COUNT(*) as count FROM revenue`;
    if (parseInt(count) === 0) {
      await sql`
        INSERT INTO revenue (month, year, amount) VALUES
          (1, 2025, 12000),(2, 2025, 18500),(3, 2025, 22000),
          (4, 2025, 28000),(5, 2025, 31500),(6, 2025, 42000),
          (7, 2025, 38000),(8, 2025, 45000),(9, 2025, 52000),
          (10, 2025, 47000),(11, 2025, 61000),(12, 2025, 58000)
        ON CONFLICT DO NOTHING
      `;
    }

    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
};

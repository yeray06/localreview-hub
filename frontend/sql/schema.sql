CREATE TABLE users (
    id SERIAL PRIMARY KEY,                 -- identificador único
    name VARCHAR(100) NOT NULL,            -- nombre del usuario
    email VARCHAR(100) UNIQUE NOT NULL,    -- email, no se puede repetir
    password_hash VARCHAR(255) NOT NULL,   -- contraseña encriptada (más adelante)
    created_at TIMESTAMP DEFAULT NOW()     -- fecha de creación del usuario
);

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,                                
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- user_id enlaza con la tabla users (un usuario propietario)
    name VARCHAR(150) NOT NULL,           -- nombre del negocio
    category VARCHAR(100),                -- categoría (restaurante, peluquería…)
    address VARCHAR(255),                 -- dirección
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    -- business_id enlaza con el negocio al que pertenece la reseña
    customer_name VARCHAR(100),           -- nombre del cliente (opcional)
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    -- rating debe estar entre 1 y 5
    comment TEXT,                         -- comentario de la reseña
    created_at TIMESTAMP DEFAULT NOW(),   -- cuándo se dejó la reseña
    responded BOOLEAN DEFAULT FALSE       -- si el negocio ha respondido o no
);

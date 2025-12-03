# LocalReview Hub
Plataforma de gestión de reseñas internas para pequeños negocios.

## Contenido aprendido
Este proyecto me ha permitido trabajar con una arquitectura completa y profesional:

- Separación frontend/backend.
- Backend con Node.js y Express.
- Autenticación con contraseñas encriptadas (bcrypt) y JWT.
- API REST con CRUD completo.
- Conexión real a PostgreSQL usando Docker.
- Consultas SQL y modelado de tablas.
- Frontend en HTML, CSS y JavaScript conectado al backend mediante fetch.
- Protección de rutas y flujo de sesión real.
- Dashboard con métricas dinámicas y filtrado.

## Tecnologías utilizadas

### Frontend
- HTML5  
- CSS3  
- JavaScript  
- Live Server  

### Backend
- Node.js  
- Express  
- bcrypt  
- jsonwebtoken  
- pg  
- cors  

### Base de datos
- PostgreSQL 16 en Docker  
- DBeaver  

## Funcionalidades principales
- Registro y login de usuarios con autenticación real.
- Creación automática del perfil del negocio.
- Dashboard con estadísticas reales:
  - Puntuación media  
  - Reseñas totales  
  - Porcentaje de reseñas positivas  
- CRUD completo de reseñas:
  - Crear  
  - Listar  
  - Editar  
  - Eliminar  
- Filtrado por puntuación.
- Protección de rutas privadas mediante token JWT.
- Almacenamiento de todos los datos en PostgreSQL.

## Estructura del proyecto
LocalReviewHub/
frontend/
index.html
login.html
register.html
dashboard.html
css/
base.css
js/
api.js
auth.js
dashboard.js
sql/
schema.sql
backend/
server.js
db.js
package.json
package-lock.json
routes/
auth.js
reviews.js

markdown
Copiar código

## Cómo arrancarlo

### Backend
1. Abrir terminal dentro de la carpeta `backend`:
cd backend

markdown
Copiar código
2. Instalar dependencias:
npm install

markdown
Copiar código
3. Ejecutar el servidor:
node server.js

yaml
Copiar código
Salida esperada:
Conectado a PostgreSQL correctamente
Servidor backend funcionando en http://localhost:4000

markdown
Copiar código

### Base de datos (Docker)
El contenedor debe estar corriendo en:
- Host: localhost  
- Puerto: 5433  
- Usuario: yeray  
- Contraseña: yeray123  
- Base de datos: localreviewhub  

### Frontend
1. Abrir la carpeta `frontend` en VS Code.
2. Abrir `index.html` con Live Server.

## Flujo de uso
1. Registrar usuario y negocio.
2. Iniciar sesión.
3. Acceder al dashboard.
4. Crear y gestionar reseñas.
5. Ver métricas y filtrar resultados.

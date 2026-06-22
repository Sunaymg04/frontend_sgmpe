# Manual de instalacion

Este documento explica los requisitos y pasos necesarios para instalar y ejecutar el proyecto `frontend_sgmpe` despues de descargar el codigo.

## 1. Requisitos previos

Antes de iniciar, la persona que vaya a usar el proyecto debe tener instalado:

- Node.js
- npm
- Git
- Un editor de codigo, por ejemplo Visual Studio Code
- El backend o las APIs que consume el frontend

Para comprobar que Node.js y npm estan instalados correctamente, ejecutar:

```bash
node -v
npm -v
```

Si ambos comandos muestran una version, la instalacion esta correcta.

## 2. Descargar el proyecto

Clonar el repositorio desde Git:

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar a la carpeta del proyecto:

```bash
cd frontend_sgmpe
```

Si el codigo fue entregado en un archivo comprimido, descomprimirlo y abrir una terminal dentro de la carpeta `frontend_sgmpe`.

## 3. Instalar dependencias

Este proyecto usa npm y tiene el archivo `package-lock.json`, por lo que las dependencias se instalan con:

```bash
npm install
```

Este comando crea la carpeta `node_modules`, que contiene las librerias necesarias para ejecutar el proyecto.

## 4. Configurar y levantar los servicios backend

El frontend consume servicios locales mediante Axios. Actualmente se usan estas URLs:

```txt
http://localhost:8000/api
http://127.0.0.1:8001/api
```

Antes de usar todas las funciones del sistema, se deben iniciar los proyectos backend correspondientes en esos puertos.

Si el backend esta configurado en otra direccion o puerto, se deben actualizar las URLs en estos archivos:

```txt
src/services/api.js
src/services/usersApi.js
```

## 5. Ejecutar el proyecto en desarrollo

Para iniciar el frontend en modo desarrollo:

```bash
npm run serve
```

Cuando el comando termine de compilar, la terminal mostrara una direccion local similar a:

```txt
http://localhost:8080/
```

Abrir esa direccion en el navegador.

## 6. Generar version de produccion

Para compilar el proyecto y generar los archivos finales:

```bash
npm run build
```

El resultado se genera en la carpeta:

```txt
dist
```

Esa carpeta contiene los archivos que se pueden publicar en un servidor web.

## 7. Revisar errores de formato o codigo

Para ejecutar el linter del proyecto:

```bash
npm run lint
```

Este comando ayuda a detectar y corregir errores de estilo o estructura en el codigo.

## 8. Comandos principales

```bash
npm install
```

Instala las dependencias del proyecto.

```bash
npm run serve
```

Ejecuta el proyecto en modo desarrollo.

```bash
npm run build
```

Genera la version final para produccion.

```bash
npm run lint
```

Revisa errores de estilo o codigo.

## 9. Problemas comunes

### El comando `npm install` falla

Verificar que Node.js y npm esten instalados:

```bash
node -v
npm -v
```

Si no aparecen versiones, instalar Node.js nuevamente.

### El proyecto abre, pero no carga informacion

Verificar que el backend este encendido y funcionando en:

```txt
http://localhost:8000/api
http://127.0.0.1:8001/api
```

Tambien revisar que las URLs configuradas en `src/services/api.js` y `src/services/usersApi.js` coincidan con las del backend.

### El puerto 8080 esta ocupado

Cerrar el proceso que este usando ese puerto o ejecutar el proyecto en otro puerto. Vue CLI puede solicitar usar un puerto diferente automaticamente.

### Se descargaron cambios nuevos del repositorio

Despues de actualizar el codigo, ejecutar nuevamente:

```bash
npm install
```

Luego iniciar el proyecto:

```bash
npm run serve
```

## 10. Flujo recomendado para una instalacion nueva

Ejecutar estos pasos en orden:

```bash
git clone URL_DEL_REPOSITORIO
cd frontend_sgmpe
npm install
npm run serve
```

Despues, abrir en el navegador la URL local que indique la terminal.

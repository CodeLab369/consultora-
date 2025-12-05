# Guía de Despliegue en GitHub Pages

Esta guía te muestra cómo desplegar la aplicación en GitHub Pages.

## Método 1: Despliegue Automático con GitHub Actions (Recomendado)

### Configuración Inicial

1. **Crear un repositorio en GitHub:**
   - Ve a https://github.com/new
   - Crea un nuevo repositorio (puede ser público o privado)

2. **Subir el código al repositorio:**
   ```bash
   cd c:\Users\ntarq\Desktop\CREACIONES\consultora
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

3. **Configurar GitHub Pages:**
   - Ve a Settings > Pages en tu repositorio
   - En "Source", selecciona "GitHub Actions"
   - Guarda los cambios

4. **El despliegue se ejecutará automáticamente:**
   - Cada vez que hagas push a la rama `main`, se desplegará automáticamente
   - Puedes ver el progreso en la pestaña "Actions"
   - La URL será: `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

## Método 2: Despliegue Manual

### Opción A: Usando la carpeta dist

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

2. **Crear rama gh-pages:**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **Configurar GitHub Pages:**
   - Ve a Settings > Pages
   - En "Source", selecciona "Deploy from a branch"
   - Selecciona la rama `gh-pages` y carpeta `/ (root)`

### Opción B: Usando gh-pages package

1. **Instalar gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Agregar scripts en package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Desplegar:**
   ```bash
   npm run deploy
   ```

## Actualizar el Despliegue

### Con GitHub Actions:
Simplemente haz push a la rama main:
```bash
git add .
git commit -m "Actualización"
git push origin main
```

### Con despliegue manual:
Repite el proceso de compilación y push a la rama gh-pages.

## Verificar el Despliegue

1. Ve a la pestaña "Actions" en tu repositorio
2. Verifica que el workflow haya completado exitosamente
3. Accede a tu aplicación en: `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

## Solución de Problemas

### La página muestra 404:
- Verifica que la rama/carpeta configurada en Settings > Pages sea correcta
- Espera unos minutos después del despliegue
- Verifica que el archivo `.nojekyll` esté en la carpeta `public`

### Los assets no cargan:
- Verifica que `base: './'` esté configurado en `vite.config.ts`
- Verifica que no haya errores en la consola del navegador

### Error en el workflow de GitHub Actions:
- Revisa los logs en la pestaña "Actions"
- Verifica que las dependencias se instalen correctamente
- Asegúrate de que el proyecto compile sin errores localmente

## Credenciales por Defecto

Recuerda que las credenciales iniciales son:
- **Usuario:** Nestor
- **Contraseña:** 1005

Puedes cambiarlas desde la sección de Ajustes una vez que accedas a la aplicación.

## Almacenamiento de Datos

Todos los datos se almacenan localmente en el navegador del usuario usando IndexedDB. Esto significa que:
- La aplicación funciona completamente offline
- Los datos no se sincronizan entre dispositivos
- Los datos persisten mientras no se limpie el almacenamiento del navegador
- Se puede crear un backup desde la sección de Ajustes

## Soporte

Si encuentras problemas durante el despliegue, verifica:
1. Que todas las dependencias estén instaladas correctamente
2. Que el proyecto compile sin errores: `npm run build`
3. Que la configuración de GitHub Pages esté correcta
4. Los logs del workflow en la pestaña "Actions"

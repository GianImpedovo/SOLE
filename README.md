# SOLE - Sistema de Optimización Logística Enpolex

Demo web del producto SOLE para presentar el flujo operativo documentado:

- ingreso como Admin o Chofer;
- backoffice logistico para pedidos, choferes, rutas, mapa operativo, metricas e incidencias;
- app de chofer para ruta diaria, paradas, confirmacion de entrega, evidencia digital, incidencias, modo offline y sincronizacion.

La app es estatica y no requiere instalar dependencias.

## Requisitos

- Windows con PowerShell.
- Python instalado y disponible en consola.

Para verificar Python:

```powershell
python --version
```

Si ese comando no funciona, probar:

```powershell
py --version
```

## Como levantar la app

1. Abrir PowerShell.

2. Ir a la carpeta del proyecto:

```powershell
cd "C:\Users\{user}\{ruta-proyecto}\DP-APP"
```

3. Levantar un servidor local:

```powershell
python -m http.server 4173
```

Si `python` no funciona pero `py` si:

```powershell
py -m http.server 4173
```

4. Abrir en el navegador:

```text
http://localhost:4173
```

Mientras la terminal este abierta, la app queda corriendo. Para detenerla, presionar `Ctrl + C` en PowerShell.

## No abrir con doble click

Evitar abrir `index.html` directamente como archivo local (`file:///...`).

La app puede funcionar asi, pero para presentar conviene usar `localhost` porque se comporta mas parecido a una aplicacion real y evita bloqueos del navegador con almacenamiento local.

## Flujo sugerido para la demo

1. Entrar como `Admin / Backoffice`.
2. Mostrar pedidos del dia, choferes, mapa operativo y metricas.
3. Seleccionar un chofer.
4. Asignar pedidos pendientes.
5. Usar `Optimizar ruta` para mostrar la planificacion operativa.
6. Entrar como `Chofer`.
7. Ver la ruta diaria y las paradas.
8. Iniciar una entrega.
9. Confirmar entrega con evidencia digital.
10. Simular modo offline, registrar un cambio y luego sincronizar.
11. Volver al Admin para ver el estado actualizado.

## Datos de demo

Los pedidos, choferes, vehiculos y estados estan precargados en `app.js`.

Para reiniciar la demo desde la app, usar el boton:

```text
Reiniciar demo
```

Tambien se puede limpiar el estado desde el navegador eliminando los datos del sitio `localhost:4173`.

## Estructura de archivos

```text
DP-APP/
  index.html    Pantalla principal
  styles.css    Estilos visuales y responsive
  app.js        Datos, estado y logica de la demo
  README.md     Instrucciones para ejecutar la app
```

## Que se puede explicar si preguntan

- La integracion con Tango queda del lado backend, invisible para el usuario.
- En esta demo los pedidos estan precargados, pero representan pedidos ya sincronizados desde Tango.
- Mapbox se usaria para geocodificar direcciones, mostrar mapas y calcular recorridos.
- La asignacion operativa de pedidos a choferes/rutas la decide SOLE segun reglas de negocio, no Mapbox.
- El modo offline simula el caso documentado de baja conectividad en campo: el chofer registra eventos localmente y luego sincroniza.

## Problemas comunes

### La pagina aparece en blanco

Verificar que no se haya abierto como `file:///...`.

Usar:

```text
http://localhost:4173
```

### El puerto esta ocupado

Usar otro puerto:

```powershell
python -m http.server 5173
```

Y abrir:

```text
http://localhost:5173
```

### PowerShell dice que Python no existe

Probar:

```powershell
py -m http.server 4173
```

Si tampoco funciona, instalar Python o usar la version de Python incluida en el entorno de desarrollo.

Architecting with Google Kubernetes Engine: Workloads


## Deployments en GKE

Los **Deployments** son el método principal para desplegar aplicaciones contenerizadas en GKE.  
Pero antes de entender qué es un Deployment, es importante conocer qué son los **Pods**.

Un **Deployment** es un recurso de Kubernetes que describe el **estado deseado** de un conjunto de Pods.  
Este estado es supervisado por un **built in controller**, un proceso que se ejecuta constantemente para asegurar que el estado actual del clúster coincida con el deseado.

---

## ¿Cómo funciona el proceso de Deployment?

De forma general, el proceso ocurre así:

- El estado deseado se define en un archivo YAML del Deployment.
- Este archivo se envía al plano de control de Kubernetes.
- Se crea un **Deployment Controller** que:
  - Convierte el estado deseado en el estado actual.
  - Mantiene ese estado en el tiempo.
- El Deployment crea y gestiona un **ReplicaSet**.
- El ReplicaSet se encarga de instanciar y mantener las réplicas de los Pods especificados en el deployment.

---

## ¿Qué incluye un Deployment?

Un Deployment suele definirse mediante un archivo en formato YAML que contiene:

- Versión de la API.
- Tipo de recurso (`Deployment`).
- Nombre del Deployment.
- Número de réplicas.
- Plantilla del Pod (metadata y especificaciones).
- Imagen del contenedor.
- Puerto expuesto para aceptar tráfico en el contendor.
Image01

---

## Estados del ciclo de vida del Deployment

Un Deployment puede encontrarse en tres estados:

- **Processing**: indica que acción se está realizando (crear, escalar, actualizar).
- **Complete**: indica que todas las réplicas están disponibles y actualizadas.
- **Failed**: indica que ocurre un error en los replicaSets, por ejemplo:
  - No se pueden descargar imágenes para los nuevos pods.
  - El usuario no tiene permisos suficientes.

---

## Usos principales de los Deployments

Los Deployments permiten:
- Actualizar aplicaciones.
- Hacer rollback a versiones anteriores.
- Escalar o autoescalar Pods.

Están pensados para aplicaciones **stateless**, es decir, que no almacenan estado ni datos persistentes.

Ejemplos de aplicaciones stateless:
- Servidores API.
- Páginas web sin contenido dinámico.

---

## Formas de crear un Deployment

### 1. Método declarativo

Se crea un archivo YAML y se aplica con:

kubectl apply -f deployment.yaml

Aquí defines el estado deseado y Kubernetes se encarga de crear el resto de objetos para alcanzar dicho estado.

### 2. Método imperativo

Se crea directamente con el comando:

kubectl create deployment name --image image:tag --replicas x --lables key=value --port --generator deploymet/apps.v1 --save-conmfi

En este caso debes especificar:
- Imagen y etiqueta del contenedor.
- Número de réplicas.
- Puerto.
- Versión de la API.
- Si deseas guardar esta configuración.

### 3. Desde Google Cloud Console

Desde el menú GKE Workloads, puedes crear un Deployment gráficamente introduciendo:
- Imagen del contenedor.
- Variables de entorno.
- Comandos de inicialización.

La consola también permite visualizar la configuración generada en formato YAML.

# Inspección del estado de un Deployment en Kubernetes

## Comandos principales

Dos comandos útiles para inspeccionar el estado de un **Deployment** son:

- `kubectl get`
- `kubectl describe`

---

## 1. `kubectl get deployment`

El comando `kubectl get deployment` muestra el estado de todos los ReplicaSets dentro de un Deployment, incluyendo:

- **Ready**: Cuántas réplicas de la aplicación están disponibles para los usuarios.  
- **Up-to-date**: Número de réplicas completamente actualizadas según la especificación actual del Deployment.  
- **Available**: Número de réplicas disponibles para los usuarios.  
- **Age**: Tiempo que las réplicas han estado disponibles para los usuarios.

Este comando también puede usarse para mostrar la configuración del Deployment en formato **YAML**.

Esto es útil si inicialmente creaste un Deployment usando `kubectl run`, pero luego decides convertirlo en una parte permanente y administrada de tu infraestructura.

Editando ese archivo YAML para eliminar los detalles únicos del Deployment original, puedes guardarlo en tu repositorio de archivos YAML para futuros Deployments.

---

## 2. `kubectl describe deployment`

Otra forma de inspeccionar el estado de un Deployment es utilizando:


kubectl describe deployment <nombre-del-deployment>

# Actualización de Deployments en Kubernetes

Las actualizaciones de Deployments son muy comunes y **no afectan la disponibilidad** de otras aplicaciones y servicios dentro del clúster.

Existen varias formas de actualizar un Deployment.

---

## Formas de actualizar un Deployment

### 1. `kubectl apply -f deploy.yaml`
Permite actualizar la especificación de un Deployment usando un archivo YAML modificado.

Sirve especialmente para cambiar valores **fuera del template del Pod**, como:
- Número de réplicas
- Configuraciones generales del Deployment

---

### 2. `kubectl set image deployment "deployment name" "iamge" "image:tag"`
Permite modificar especificaciones **dentro del template del Pod**, como:
- Imagen del contenedor
- Recursos (CPU/memoria)
- Valores del selector

---

### 3. `kubectl edit deployment/"deployment name"`
Este comando abre directamente la configuración del Deployment en un editor de texto.

Por defecto usa **Vim**, un editor de texto en pantalla de código abierto.

Después de guardar los cambios, `kubectl` aplicará automáticamente las actualizaciones.

---

### 4. Consola de Google Cloud

También puedes actualizar Deployments desde la consola web de **Google Cloud**.

---

## Rolling Updates (Actualizaciones gradualizadas)

Imagina actualizar tu aplicación sin que nadie se dé cuenta.  
Esto se logra gracias a las **rolling updates** (*estrategia escalonada* o *ramped strategy*).

Cuando se actualiza un Deployment:

1. Se crea un nuevo ReplicaSet con nuevos Pods.
2. Cuando los nuevos Pods están listos, los Pods antiguos se eliminan gradualmente.
3. Siempre hay al menos un Pod en ejecución, evitando tiempos de inactividad.

En GKE, los Pods se actualizan **uno a la vez**, garantizando cero interrupciones.

---

## Parámetros de Rolling Update

### `maxSurge`
Número máximo de Pods adicionales que pueden ejecutarse temporalmente durante la actualización.

### `maxUnavailable`
Número máximo de Pods que pueden estar indisponibles al mismo tiempo.

Estos valores pueden ser:
- **Números absolutos** (ej: 1, 2, 3)
- **Porcentajes** (ej: 10%, 25%)

---

## Ejemplo práctico

Supongamos:
- Deployment con **10 Pods**
- `maxUnavailable: 10%`
- `maxSurge: 5`

### Proceso:

1. Inicialmente hay 10 Pods del ReplicaSet antiguo.
2. Se crean 5 Pods nuevos (gracias a `maxSurge`).
   - Total ahora: 15 Pods.
3. Como `maxUnavailable` es 10%, el mínimo de Pods que deben estar activos es:
   - 10 - 10% = **9 Pods**
4. Entonces se pueden eliminar hasta 6 Pods antiguos:
   - Quedan: 5 nuevos + 4 antiguos = 9 Pods.
5. Se crean 5 Pods más en el nuevo ReplicaSet:
   - Nuevo ReplicaSet: 10 Pods
   - Total temporal: 14 Pods
6. Finalmente, se eliminan los 4 Pods antiguos restantes.
7. El ReplicaSet antiguo queda vacío, pero se conserva para posibles *rollbacks*.

---

## Recursos: Requests y Limits

Durante una actualización, los recursos del clúster (CPU y memoria) cambian.  
Para controlarlo, Kubernetes usa:

### Requests
Indican la **cantidad mínima** de CPU y memoria que necesita un contenedor.

- El scheduler solo asignará el Pod a un nodo si tiene suficientes recursos.
- Si pides más recursos de los disponibles, **el Pod nunca se programará**.

---

### Limits
Definen el **máximo** de CPU y memoria que puede usar un contenedor.

- Previene que un contenedor consuma todo el recurso del nodo.
- El `limit` **no puede ser menor que el `request`**.

⚠️ Requests y limits deben configurarse **en cada contenedor individual**.

Los Pods se programan como un grupo, por lo que debes **sumar** los requests y limits de todos los contenedores.

---

## Componentes involucrados

### kube-scheduler
- Decide en qué nodo se ejecutará el Pod.
- Si no encuentra un nodo adecuado, reintenta más tarde.

### kubelet
- Hace cumplir los límites de recursos.
- Reserva los recursos solicitados.
- Evita que un contenedor exceda su límite.

---

## Medición de CPU

La CPU se mide en **millicores (m)**:

- 1 core completo = `1000m`
- 2 cores = `2000m`
- 1/4 de core = `250m`

---

# Estrategias de Deployment en GKE y gestión de rollouts

GKE admite múltiples estrategias de despliegue que te brindan flexibilidad y control sobre cómo introduces cambios y actualizaciones en tus aplicaciones.

En esta sección veremos tres estrategias principales:
- Recreate
- Blue/Green
- Canary

Y también cómo manejar los **rollouts** y **rollbacks**.

---

## 1. Estrategias de despliegue

### 🔁 Recreate Deployment

En la estrategia **Recreate**, primero se eliminan todos los Pods antiguos y luego se crean los nuevos.

A diferencia del rolling update, donde conviven Pods antiguos y nuevos, aquí:
- Primero se **eliminan todos los Pods antiguos**.
- Luego se crean los nuevos Pods.

✅ Ventaja:
- Todos los usuarios acceden a la nueva versión al mismo tiempo.

❌ Desventaja:
- Puede haber **tiempo de inactividad (downtime)** mientras se levantan los nuevos Pods.

---

### 🔵🟢 Blue/Green Deployment

En esta estrategia se crea un Deployment completamente nuevo:

- **Blue** = versión antigua  
- **Green** = versión nueva  

Cuando los Pods de la versión green están listos, el tráfico se redirige desde la versión blue a la green.

✅ Ventajas:
- El cambio es **instantáneo**.
- Permite probar la versión nueva internamente antes de exponerla a todos.

❌ Desventajas:
- Duplica el uso de recursos durante el despliegue.
- Puede generar mayores costos y problemas de capacidad.

---

### 🐤 Canary Deployment

En esta estrategia, el tráfico se mueve **gradualmente** a la nueva versión.

✅ Ventajas:
- Reduce el uso excesivo de recursos.
- Permite detectar errores antes de afectar a todos los usuarios.

❌ Desventajas:
- Es más lento.
- Requiere herramientas adicionales, como **Anthos Service Mesh**, para dirigir el tráfico con precisión.

---

## 2. Rollbacks y gestión de versiones

### Revertir un Deployment

Si una actualización presenta problemas, puedes volver a una versión anterior usando:

kubectl rollout undo deployment <nombre>

yaml
Copiar código

Este comando:
- Restaura el Deployment a la versión anterior.
- O a una versión específica que indiques.

---

### Ver historial de versiones

Puedes ver el historial de despliegues con:

kubectl rollout history deployment <nombre>

markdown
Copiar código

Por defecto:
- Kubernetes almacena los últimos **10 ReplicaSets**.

Puedes modificar este valor usando el parámetro:

revisionHistoryLimit

yaml
Copiar código

en la especificación del Deployment.

---

## 3. Control del Rollout

### Pausar un rollout

Si hay muchos cambios y es difícil identificar cuál causó un problema, puedes pausar el despliegue:

kubectl rollout pause deployment <nombre>

yaml
Copiar código

Cualquier cambio nuevo **no se aplicará** hasta que se reanude.

---

### Reanudar un rollout

Para continuar:

kubectl rollout resume deployment <nombre>

yaml
Copiar código

Todos los cambios pendientes se aplicarán en una nueva versión.

---

### Ver estado del rollout

Para monitorear el progreso:

kubectl rollout status deployment <nombre>

yaml
Copiar código

---

## 4. Eliminar un Deployment

Para eliminar un rollout completo (y todos sus recursos):

kubectl delete deployment <nombre>

markdown
Copiar código

Kubernetes eliminará:
- El Deployment  
- Todos los Pods asociados  
- Todos los recursos administrados por ese Deployment  

También puedes hacerlo desde la **consola de Google Cloud**.


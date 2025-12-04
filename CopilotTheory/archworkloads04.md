# 💾 Abstracciones de Almacenamiento en GKE

En GKE, el almacenamiento se gestiona a través de una **capa de abstracción**. Esto significa que interactúas con el almacenamiento de una forma consistente (software), sin importar si detrás hay un disco duro físico, un SSD en la nube o un sistema de archivos en red.

**Beneficios:**
* Simplifica el aprovisionamiento.
* Ofrece una interfaz unificada.
* Te da flexibilidad para cambiar de proveedor de almacenamiento sin cambiar tu código.

Las dos abstracciones principales son **Volumes** y **PersistentVolumes (PVs)**.

---

## 1. Volumes (Volúmenes)
En Kubernetes, un Volumen es simplemente un directorio accesible para **todos los contenedores** dentro de un mismo Pod.

* **Vinculación:** Los volúmenes se adjuntan al **Pod**, no al contenedor individual.
* **Ciclo de Vida:**
    * Generalmente son **efímeros**. Duran exactamente lo mismo que el Pod.
    * Si el Pod se elimina, el Volumen se desmonta y (dependiendo del tipo) los datos suelen perderse.
    * Si el Pod no está programado en un nodo, el volumen tampoco existe.

---

## 2. PersistentVolumes (PVs)
Son recursos del clúster que existen **independientemente** de los Pods. Están diseñados para gestionar almacenamiento duradero.

* **Respaldo:** En GKE, un PV suele estar respaldado por un **Persistent Disk** (Disco Persistente de Google Cloud).
* **Ciclo de Vida:**
    * Son **duraderos**.
    * Los datos y el disco continúan existiendo aunque el Pod se elimine, se reinicie o el clúster cambie.
* **Aprovisionamiento:**
    1. **Estático:** Un administrador crea el PV manualmente apuntando a un disco existente.
    2. **Dinámico:** Se crean automáticamente mediante *PersistentVolumeClaims*.

---

### 🆚 Resumen: Volume vs. PersistentVolume

| Característica | Volume (Estándar) | PersistentVolume (PV) |
| :--- | :--- | :--- |
| **Ciclo de Vida** | Atado al Pod (muere con él). | Independiente (sobrevive al Pod). |
| **Uso Principal** | Cache, datos temporales, compartir datos entre contenedores del mismo Pod. | Bases de datos, archivos de usuarios, logs históricos. |
| **Naturaleza** | Parte de la especificación del Pod. | Recurso global del clúster. |

# 📂 Tipos de Volúmenes Efímeros en GKE

Kubernetes ofrece varios tipos de almacenamiento. Los **volúmenes efímeros** son aquellos diseñados para durar solo lo que dura el Pod. Si el Pod se elimina, estos datos desaparecen.

## 1. emptyDir (El Espacio Temporal)
Es el tipo más básico de volumen.

* **¿Qué hace?:** Crea un directorio vacío en el sistema de archivos del Pod al arrancar.
* **Ciclo de vida:**
    * Existe mientras el **Pod** esté corriendo en el nodo.
    * **⚠️ Importante:** Si un *contenedor* individual falla (crashea) y se reinicia, los datos en `emptyDir` **se mantienen a salvo**. Solo se borran si el *Pod* completo es eliminado o movido del nodo.
* **Casos de Uso Comunes:**
    * Espacio temporal ("scratch space") para algoritmos que usan disco (ej. ordenamiento mergesort).
    * Checkpoints de una computación larga para recuperación de fallos.
    * Compartir archivos entre dos contenedores (ej. un contenedor que descarga contenido y un servidor web que lo muestra).


---

## 2. Volúmenes de Inyección de Datos
Estos volúmenes no se usan para "guardar" datos generados por la app, sino para inyectar datos existentes de Kubernetes dentro del Pod.

### A. DownwardAPI
Sirve para la "autoconsciencia" del contenedor.
* **Función:** Expone información sobre el propio Pod y el entorno hacia el interior de la aplicación.
* **Datos disponibles:** Etiquetas (labels), anotaciones, límites de recursos y la IP del Pod.
* **Uso:** Configurar la aplicación basándose en su contexto de despliegue.

### B. ConfigMap
Diseñado para desacoplar la configuración del código.
* **Función:** Inyecta datos de configuración no sensibles (pares clave-valor).
* **Estructura:** Se monta dentro del Pod como un árbol de archivos y directorios.
* **Persistencia:** Aunque el volumen en el Pod es efímero, el *Objeto ConfigMap* original en el clúster es duradero y se puede compartir entre múltiples Pods.

### C. Secret
Diseñado específicamente para datos sensibles.
* **Función:** Almacena contraseñas, tokens, claves API o certificados.
* **Seguridad:**
    * Google encripta estos datos en reposo.
    * **En el Pod:** Los Secrets se montan en **memoria (tmpfs)**, nunca se escriben en el almacenamiento no volátil (disco duro) del nodo.
* **Diferencia con ConfigMap:** La intención (sensible vs. no sensible) y el manejo de seguridad subyacente.



---

### 🆚 Resumen de Persistencia

| Elemento | ¿Es Efímero? | Detalle |
| :--- | :--- | :--- |
| **El Volumen en el Pod** | **SÍ** | Cuando el Pod muere, el acceso a los datos desaparece. |
| **Los Datos en `emptyDir`** | **SÍ** | Se borran físicamente al morir el Pod. |
| **El Objeto `ConfigMap` / `Secret`** | **NO** | Estos objetos siguen existiendo en la base de datos de Kubernetes (etcd) aunque el Pod desaparezca. |

# 💾 Almacenamiento Persistente: PV y PVC

A diferencia de los volúmenes efímeros, Kubernetes ofrece un sistema robusto para datos que deben sobrevivir a reinicios de Pods o fallos de Nodos. Este sistema se basa en dos piezas fundamentales que separan responsabilidades.

## 1. Conceptos Clave

### A. PersistentVolume (PV) → "La Provisión"
* **Qué es:** Una pieza de almacenamiento real en el clúster (un disco duro).
* **Rol:** Es un recurso administrado por el **Administrador del Clúster**.
* **Durabilidad:** Existe independientemente de cualquier Pod. Si el Pod muere, el PV sigue ahí con los datos.

### B. PersistentVolumeClaim (PVC) → "La Solicitud"
* **Qué es:** Una petición de almacenamiento hecha por un usuario.
* **Rol:** Es creado por el **Desarrollador**.
* **Funcionamiento:** El desarrollador pide: "Necesito 10GB de disco rápido". Kubernetes busca un PV que cumpla esos requisitos y los "ata" (bind).
* **Abstracción:** El desarrollador no necesita saber si detrás hay un disco de Google, AWS o físico; solo pide capacidad y características.



---

## 2. StorageClass (Clases de Almacenamiento)
Es el "pegamento" que define qué tipo de disco se está solicitando o creando.

* **Default en GKE:** Si creas un PVC sin especificar clase, GKE usa la clase `standard` (Discos Persistentes HDD estándar).
* **Personalizado (SSD):** Si quieres discos SSD, debes definir una `StorageClass` nueva (ej. `pd-ssd`) y usar ese nombre en tu PVC.
* **Diferenciación:** No confundir *Kubernetes StorageClass* con *Google Cloud Storage* (buckets). Son cosas distintas.

### 📝 Ejemplo YAML: StorageClass (SSD)
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: disco-rapido-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd  # Especifica SSD de Google Cloud
  ```

  ## 3. AccessModes (Modos de Acceso)
Definen cuántos nodos pueden montar el volumen a la vez y con qué permisos.

| Modo | Abreviatura | Descripción | Soporte GKE Discos |
| :--- | :--- | :--- | :--- |
| **ReadWriteOnce** | **RWO** | Montura de Lectura/Escritura por un **solo Nodo**. (Varios pods en *ese* mismo nodo pueden usarlo). | ✅ Estándar (Default) |
| **ReadOnlyMany** | **ROX** | Montura de Solo Lectura por **múltiples Nodos** simultáneamente. | ✅ |
| **ReadWriteMany** | **RWX** | Montura de Lectura/Escritura por **múltiples Nodos** simultáneamente. | ❌ **NO soportado** por Discos Persistentes básicos de GCE (requiere soluciones como Filestore/NFS). |

---

## 4. Aprovisionamiento: Estático vs. Dinámico

### A. Estático (Manual)
1. El Administrador provisiona el disco en la nube manualmente.
2. Crea el objeto `PersistentVolume` en Kubernetes apuntando a ese disco.
3. El Desarrollador crea el `PVC` que encaja con ese volumen.

### B. Dinámico (Automático - La Magia de GKE) ✨
Este es el método preferido en la nube.
1. El Desarrollador crea un `PVC` solicitando almacenamiento.
2. Si no existe un PV libre, Kubernetes contacta con la API de GKE.
3. GKE **crea automáticamente** un disco persistente nuevo en la nube.
4. GKE crea el objeto PV y lo asigna al PVC al instante.

> **Política de Recuperación (Reclaim Policy):**
> * **Delete (Default):** Si borras el PVC, el disco en la nube **se borra automáticamente**.
> * **Retain:** Si borras el PVC, el disco y los datos **se mantienen** para recuperación manual.

---

## 5. Flujo de Uso
Para que un Pod use almacenamiento persistente:
1. El Pod **no** referencia el disco directo.
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mi-peticion-de-disco
spec:
  storageClassName: disco-rapido-ssd  # Debe coincidir con una StorageClass existente
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
2. El Pod referencia al **PVC** por su nombre dentro de su configuración de volúmenes.
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-con-base-de-datos
spec:
  containers:
    - name: mysql
      image: mysql
      volumeMounts:
        - mountPath: "/var/lib/mysql"
          name: almacenamiento-db
  volumes:
    - name: almacenamiento-db
      persistentVolumeClaim:
        claimName: mi-peticion-de-disco  # Referencia al PVC de arriba
```
3. Kubernetes se encarga de montar el disco real (PV) asociado a ese PVC.

# 🏛️ StatefulSets: Gestionando Aplicaciones con Estado

## 1. El Problema con los Deployments
Los **Deployments** estándar están diseñados para aplicaciones *stateless* (sin estado), donde los Pods son intercambiables (como servidores web). Si intentas usarlos para aplicaciones que guardan datos (bases de datos), surgen problemas:
* **Deadlocks (Bloqueos):** Al actualizar, si múltiples réplicas intentan adjuntar/desadjuntar el mismo volumen dinámicamente, pueden bloquearse.
* **Falta de Identidad:** No garantizan qué Pod específico obtiene qué disco, lo cual es fatal para una base de datos distribuida.

## 2. La Solución: StatefulSets
Un **StatefulSet** es el controlador diseñado específicamente para aplicaciones que requieren mantener su memoria y estado (ej. MySQL, Kafka, Zookeeper, Redis).

Su función principal es mantener una **Identidad Persistente** para cada Pod. Cada réplica tiene una "personalidad" única compuesta por tres elementos:

1. **Índice Ordinal:** Un número secuencial único que empieza en 0 (0, 1, 2...).
2. **Nombre de Red Estable:** El nombre del host es predecible y fijo (ej. `mi-app-0` siempre será `mi-app-0`).
3. **Almacenamiento Estable:** El disco está vinculado al índice. Si el Pod `web-0` muere y se recrea en otro nodo, el nuevo Pod se llamará igual y se conectará automáticamente al **mismo disco** que tenía su predecesor.

## 3. Orden Estricto (Ordering)
A diferencia de los Deployments que crean/borran réplicas en paralelo, los StatefulSets son estrictos y ordenados:

* **Creación (Escalado hacia arriba):** Secuencial (0 → 1 → 2).
    * **Regla de Oro:** El Pod anterior (ej. 0) debe estar en estado *Running and Ready* antes de que el sistema intente crear el siguiente (ej. 1).
* **Eliminación (Escalado hacia abajo):** Orden inverso (2 → 1 → 0). Se borra el último primero para asegurar que no se pierda quórum de datos.
* **Excepción (Parallel):** Si configuras la política `PodManagementPolicy` a "Parallel", puedes hacer que arranquen todos a la vez, perdiendo la garantía de orden (útil si solo te importa la identidad del disco pero no el orden de inicio).

## 4. Gestión del Almacenamiento: VolumeClaimTemplates
Esta es la característica técnica más diferenciadora. Un StatefulSet no usa un PVC simple, usa una **Plantilla (Template)**.

* **Funcionamiento:**
    1. Defines la plantilla de volumen una sola vez en la configuración del StatefulSet.
    2. El sistema crea automáticamente un **PVC único** para cada réplica que nace.
    3. **Resultado:** Cada Pod tiene su propio disco exclusivo donde nadie más escribe (generalmente configurado en modo *ReadWriteOnce*).

## 5. Networking y Headless Services
Para aprovechar la identidad de red estable, los StatefulSets requieren un tipo especial de servicio llamado **Headless Service**.

* **Headless Service (Servicio sin Cabeza/IP):**
    * Se configura definiendo el `ClusterIP` como **"None"**.
    * **No** balancea la carga a una sola IP virtual.
    * **Sí** devuelve las IPs directas de los Pods asociadas a sus nombres DNS.
    * **Uso:** Permite contactar a una instancia específica (ej. "quiero hablar específicamente con la réplica maestra `db-0`").
* **Configuración:** Debes asegurarte de que el campo `serviceName` en el StatefulSet coincida con el nombre de este servicio Headless.

# ⚙️ ConfigMaps: Gestión de Configuración

## 1. ¿Qué es un ConfigMap?
Es un objeto de la API de Kubernetes diseñado para almacenar datos de configuración en formato de pares **clave-valor**.

* **Objetivo Principal:** Desacoplar la configuración de la imagen del contenedor (Pod).
* **Fuente de la Verdad:** Actúa como una "single source of truth" (fuente única de verdad), evitando la discrepancia de configuraciones (*configuration drift*).
* **Portabilidad:** Al separar la configuración, la misma imagen del contenedor puede usarse en Desarrollo, Test y Producción simplemente cambiando el ConfigMap vinculado.

## 2. Métodos de Creación
Existen varias formas de generar un ConfigMap:

* **Valores Literales:** Se definen directamente en la línea de comandos (ej. `lab.difficulty=easy`).
* **Desde Archivos (`--from-file`):**
    * Toma un archivo de propiedades completo y lo convierte en un ConfigMap.
    * **Recomendación:** Se aconseja guardar estos archivos en un sistema de control de versiones (como Git) para mantener un historial de cambios.
* **Renombrando Claves:** Puedes importar un archivo pero asignarle una clave distinta dentro del ConfigMap (ej. importar el contenido de `color.properties` bajo la clave `Color`).
* **Desde Manifiesto:** Usando un archivo YAML estándar y aplicándolo con `kubectl apply`.



## 3. ¿Cómo consumen los Pods un ConfigMap?
Una vez creado, el Pod puede acceder a esos datos de tres formas distintas:

### A. Como Variables de Entorno
* Se definen en el campo `env` del contenedor.
* Se usa la referencia `configMapKeyRef` para apuntar a la clave específica.
* **Limitación:** Si cambias el ConfigMap original, las variables de entorno dentro del Pod **NO** se actualizan automáticamente (el kubelet no puede modificarlas una vez que el proceso arranca; requiere reinicio).

### B. En Comandos del Pod
* Puedes usar las variables de entorno definidas anteriormente como argumentos para el comando de inicio del contenedor.
* **Sintaxis:** Se usa el formato `$(NOMBRE_VARIABLE)`.
* Esto mantiene la imagen del contenedor agnóstica a la configuración de Kubernetes.

### C. Como un Volumen (ConfigMap Volume) 📂
Esta es la opción más flexible para archivos de configuración complejos (como `nginx.conf` o `settings.json`).

1. Creas un volumen en el Pod referenciando el ConfigMap.
2. Lo "montas" en un directorio del contenedor (usando `mountPath`).
3. **Resultado:** Cada clave del ConfigMap se convierte en un **archivo** dentro de ese directorio.
4. **Actualización en Caliente:** Si modificas el ConfigMap original, los archivos en el volumen **SÍ se actualizan** automáticamente (aunque puede haber un pequeño retraso), sin necesidad de reiniciar el Pod.
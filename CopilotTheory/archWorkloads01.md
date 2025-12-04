# Jobs y CronJobs en Kubernetes

Al igual que un Deployment, un **Job** es un recurso de Kubernetes.

Un Job crea uno o más Pods para ejecutar una tarea específica y, una vez que la tarea finaliza, elimina automáticamente los Pods.

A diferencia de otros controladores de Kubernetes, un Job **no mantiene un estado deseado**, sino que gestiona una tarea **hasta que se completa**.

---

## ¿Cómo funciona un Job?

En su forma más simple, un Job:

- Crea un solo Pod.
- Ejecuta una tarea dentro de ese Pod.
- Supervisa la tarea hasta que finaliza.
- Elimina el Pod al terminar.

Si un Pod falla:
- El Job controller detecta que la tarea no terminó.
- Reprograma un nuevo Pod en otro nodo.
- Continúa hasta que la tarea se complete con éxito.

Ejemplo:  
Un usuario sube un video para ser convertido (transcoding).  
Ese proceso es una tarea que puede ejecutarse mediante un Job.
Image02.png

---

## Tipos de Jobs

### 1. Jobs no paralelos

Son el tipo más simple.

Características:
- Ejecutan una tarea una sola vez.
- Solo usan un Pod.
- El Job finaliza cuando el Pod termina exitosamente o se alcanza el número requerido de completions.

Ejemplos:
- Procesamiento de imágenes
- Migración de datos

Si el Pod falla, se recrea automáticamente.

---

### 2. Jobs paralelos

Ejecutan múltiples Pods en paralelo.

Características:
- Varios Pods trabajan de forma independiente.
- Existe un numero predefinido para limitir el numero de finalizaciones.
- El Job finaliza cuando se alcanza el número total de tareas completadas exitosas.

Son útiles cuando las tareas se tienen que realizar más de una vez:
- Redimensionamiento masivo de imágenes
- Cálculos científicos en paralelo

Existen otros subtipos, como:
- Work queues
- Indexed jobs  
(no incluidos en este nivel).

---

## Componentes del manifiesto de un Job

Image03.png

El **tipo de objeto** se define en el campo kind: Job, este define que tipo de proceso en lotes el job representa y como debería ser tratado.

El comportamiento del Job se define en spec

Dentro del `spec` encontramos:

**Pod template**: el molde que define cómo serán los Pods creados por el Job.

**RestartPolicy**: define qué ocurre si falla un contenedor. Valores posibles:
- `Never`:  
  Si un contenedor falla, el Pod completo falla.
  El Job controller crea un Pod nuevo.

- `OnFailure`:  
  El Pod se mantiene en el nodo y el contenedor se reinicia.

**backOffLimit**: define cuántos intentos fallidos se permiten antes de que Kubernetes marque el Job como fallido.

## Jobs paralelos: completions y parallelism

Image04.png

Para ejecutar un Job en paralelo se usan dos valores:

- `parallelism`:  
  Número de Pods que se ejecutan al mismo tiempo.

- `completions`:  
  Número total de tareas exitosas requeridas.

Funcionamiento:
1. Kubernetes crea tantos Pods como indique `parallelism`.
2. Cuando un Pod termina, se crea otro nuevo.
3. Esto continúa hasta alcanzar el número indicado en `completions`.

---

## Inspección y eliminación de Jobs

Puedes ver el estado de un Job con:

kubectl describe job <nombre>

Puedes ver los Pods del Job usando selectores de etiquetas:

kubectl get pods -l job-name=<nombre>

También puedes acceder a esta información desde la consola de Google Cloud.

---

## Eliminar un Job

Para eliminar un Job:

kubectl delete job <nombre>

Esto elimina:
- El Job
- Sus Pods asociados

Si quieres conservar los Pods:

kubectl delete job <nombre> --cascade=false

También puedes hacerlo desde la consola de Google Cloud.

---

## CronJobs

Los **CronJobs** permiten ejecutar Jobs automáticamente en horarios específicos.

Se basan en el formato **cron**, un lenguaje de programación de tiempos.

---

## Sintaxis Cron

La sintaxis cron se compone de varios campos separados por espacios y cada uno controla un aspecto del tiempo de ejecución.

Ejemplo general:

Cada parte representa:
- Minuto
- Hora
- Día del mes
- Mes
- Día de la semana

---

## Características del formato Cron

### Asterisco (*)
Representa todos los valores posibles.

Ejemplos:
- Cada minuto
- Todas las horas

---

### Listas y rangos

Para valores específicos: 1,3,7
Para rangos: 1-5
---
### Intervalos con /
Para repetir en intervalos:*/5 Significa: cada 5 unidades (minutos, horas, etc.).

También funciona con rangos:1-10/2

Ejecuta cada 2 unidades dentro del rango.

---
# 🚀 Escalado de Clústeres en GKE (Google Kubernetes Engine)

## 1. Modos de Operación
Existen dos formas principales de gestionar el escalado en GKE:

* **Autopilot Mode:** Escala el clúster automáticamente según la demanda (manos libres).
* **Standard Mode:** Te da el control total. Tú decides si escalas manualmente o configuras el escalador automático.

## 2. Conceptos Clave: Node Pools (Grupos de Nodos)
Un clúster se compone de uno o más **Node Pools**.

* **Definición:** Un grupo de nodos con la misma configuración (tipo de máquina, disco, etc.) dentro de un clúster.
* **Creación:** Al crear un clúster, se genera un node pool por defecto. Puedes agregar pools personalizados con diferentes tamaños y tipos después.
* **Regla de Escalado a Cero:**
    * Los *node pools* individuales pueden escalarse a **0**.
    * El *clúster* en sí **no** puede cerrarse totalmente; necesita al menos 1 nodo activo para correr los Pods del sistema.

## 3. Tipos de Escalado en Standard Mode

### A. Escalado Manual
Se realiza a través de la consola de Google Cloud o Cloud Shell.
* **Comando:** `gcloud container clusters resize`.
* **Comportamiento:**
    * Elimina instancias de forma aleatoria.
    * Los Pods en ejecución terminan de forma ordenada (*gracefully*).

### B. Cluster Autoscaler (Escalado Automático)
Característica opcional (desactivada por defecto) que ajusta el tamaño del pool según la demanda de recursos.

#### ¿Cómo funciona el "Scale Up" (Aumento)?
1. Si los Pods no tienen recursos suficientes, el programador (*scheduler*) no puede asignarlos.
2. El estado del Pod se marca como **Unschedulable** (No programable).
3. El Autoscaler detecta esto y **añade nuevos nodos** automáticamente.

#### ¿Cómo funciona el "Scale Down" (Reducción)?
El Autoscaler busca nodos "prescindibles" cada **10 segundos**. Un nodo es candidato a eliminación si cumple **todas** estas condiciones:
1. Uso de CPU y Memoria es **menor al 50%** de la capacidad asignable.
2. Todos los Pods en ese nodo pueden moverse a otros nodos.
3. El escalado hacia abajo (*scale-down*) no está desactivado en la configuración.
4. **Tiempo de espera:** Si el nodo sigue siendo innecesario durante **10 minutos**, se elimina.

## 4. Límites y Capacidad

| Característica | Límite / Detalle | Notas |
| :--- | :--- | :--- |
| **Cluster Autoscaler** | Soporta hasta **15,000 nodos** | |
| **Pods por Nodo** | Máximo **256 pods** | |
| **Límite Global de Pods** | **200,000 pods** | Límite a nivel de clúster usando Autoscaler. |
| **Grandes Clústeres (AI)** | Hasta **65,000 nodos** | Requiere GKE v1.31+. Usa tecnología Spanner. <br>⚠️ **No soporta Cluster Autoscaler** (debe ser manual vía API). |

> **⚠️ Importante sobre Cuotas:** Los límites estándar de **Compute Engine** siguen aplicando. Si tu Autoscaler intenta crear nodos pero no tienes suficiente cuota de CPU/IPs en tu proyecto, los nuevos VMs no iniciarán y habrá interrupciones.

## 5. Comandos Clave (`gcloud`)

* **Crear clúster con autoscaling:**
    `... --enable-autoscaling`
* **Crear node pool con autoscaling:**
    `... --enable-autoscaling`
* **Actualizar pool existente (Activar/Desactivar):**
    `... --enable-autoscaling` o `... --no-enable-autoscaling`

## 6. Topología Zonal
* **Por defecto:** Todos los recursos (nodos y plano de control) están en la misma zona.
* **Zonas secundarias:** Si se habilitan, todos los *node pools* se duplican en la zona secundaria (similar a los clústeres regionales).
# 📍 Colocación de Pods en GKE (Pod Placement)

El "Pod Placement" es el proceso de controlar en qué nodos se ejecutan tus aplicaciones dentro del clúster. Esto es crucial para optimizar el rendimiento, asegurar la alta disponibilidad y gestionar la asignación de recursos.

## 1. Comportamiento por Defecto
En **GKE Standard**, el programador (*kube-scheduler*) toma decisiones automáticas basándose en:
* **Especificaciones del Pod:** Solicitudes (*Requests*) y límites (*Limits*) de recursos.
* **Capacidad del Nodo:** El scheduler dispersa los Pods automáticamente en nodos que tengan espacio libre.
* **Etiquetas de Zona:** Al iniciarse, los nodos reciben etiquetas automáticas (ej. zona geográfica) para facilitar el rastreo, incluso en clústeres multizonales.

---

## 2. nodeSelector (La forma sencilla/rígida)
Es el método más básico para forzar a un Pod a ir a un nodo específico. Funciona como una "lista de verificación" simple.
Insert Image05.png
* **Cómo funciona:** Especificas una etiqueta (Label) en la configuración del Pod. Si el nodo no tiene esa etiqueta exacta, el Pod **no** se programa (se queda en estado `Pending`).
* **Uso Manual:** Puedes etiquetar nodos manualmente para identificar características (ej. `disco=ssd`).
* **Autopilot:** Puedes usar `nodeSelector` para solicitar clases de cómputo específicas (ej. "Balanced") usando la etiqueta `cloud.google.com/compute-class`.
Insert Image06.png
---

## 3. Node Affinity (Afinidad de Nodo)
Es la evolución de `nodeSelector`. Permite reglas mucho más expresivas y flexibles. A diferencia del selector simple, aquí puedes definir **preferencias** (soft) además de **requisitos** (hard).

### Palabras Clave de Configuración
Es vital entender estos términos para configurar el YAML:

| Término | Tipo | Comportamiento |
| :--- | :--- | :--- |
| **requiredDuringSchedulingIgnoredDuringExecution** | **Obligatorio (Hard)** | Si no hay un nodo que cumpla la regla, el Pod no se programa. (Equivalente estricto a `nodeSelector`). |
| **preferredDuringSchedulingIgnoredDuringExecution** | **Preferible (Soft)** | GKE intentará cumplir la regla. Si no puede, programará el Pod en cualquier otro nodo disponible. |
| **...IgnoredDuringExecution** | **Estático** | Si las etiquetas de un nodo cambian *después* de que el Pod ya está corriendo, el Pod **no** se verá afectado (no se moverá). |
Image07.png


### Sistema de Pesos (Weights)
En las reglas "Preferidas" (`Preferred`), puedes asignar un peso del **1 al 100**:
* **1:** Preferencia débil.
* **100:** Preferencia muy fuerte.
* El scheduler evalúa los nodos, suma los puntajes y asigna el Pod al nodo con mayor puntuación.

---

## 4. Lógica de Selección y Operadores
Las reglas de afinidad utilizan lógica booleana para filtrar nodos:

* **AND Lógico:** Si usas `NodeSelectorTerms`, el nodo debe cumplir **todas** las expresiones listadas (matchExpressions).
* **Operador `In`:** El valor de la etiqueta del nodo debe coincidir con *uno* de los valores listados en tu regla.
* **Operador `NotIn`:** Se usa para configurar reglas de **Anti-Affinity** (evitar ciertos nodos).

> **Consejo:** Se recomienda nombrar los *Node Pools* describiendo su hardware (ej. `n1-highmem-4`). GKE etiqueta automáticamente los nodos con el nombre del pool, facilitando crear reglas de afinidad hacia ese hardware específico.

Las reglas de afinidad de nodos en este ejemplo están configuradas para expresar una fuerte preferencia por los nodos que están en los grupos de nodos n1-highmem-4 o n1-highmem-8.Se recomienda que los nombres de los grupos de nodos indiquen el tipo de instancias de cómputo que se usarán para crear los nodos. 
Image08.png 
---

## 5. Topología y Afinidad Inter-Pod
Las reglas no se limitan a nodos individuales; pueden trabajar a mayor escala o basarse en la ubicación de *otros* Pods.

### A. TopologyKeys (Dominio de Topología)
Permite definir reglas basadas en dominios de infraestructura más amplios, como zonas o regiones.
* *Ejemplo:* "No programar este Pod en la Zona A si ya hay réplicas corriendo allí" (para maximizar disponibilidad).

### B. Inter-Pod Affinity / Anti-Affinity
En lugar de mirar las etiquetas del *Nodo*, el scheduler mira las etiquetas de los *Pods* que ya están ejecutándose en ese nodo.

* **Affinity (Atracción):** "Quiero que mi Pod *Frontend* corra en el mismo nodo que mi Pod *Cache*" (para reducir latencia de red).
* **Anti-Affinity (Repulsión):** "No quiero dos Pods de mi *Base de Datos* en el mismo nodo físico" (para evitar que un fallo de nodo tumbe toda la DB).

# ⛔ Taints y Tolerations (Manchas y Tolerancias)

Mientras que *Affinity* y *nodeSelector* sirven para **atraer** Pods a ciertos nodos, los **Taints** sirven para **repelerlos**. Es un mecanismo de restricción.

## 1. Concepto Básico
* **Taint (en el Nodo):** Es una "mancha" o etiqueta especial aplicada al nodo que dice: "No acepto Pods aquí, a menos que tengan un permiso especial".
* **Toleration (en el Pod):** Es la excepción o "permiso especial" configurado en el Pod que le permite ignorar el Taint y aterrizar en ese nodo.

> **Diferencia Clave:** Los Taints se configuran en los **Nodos**, mientras que Affinity/Selectors se configuran en los **Pods**.



## 2. Anatomía de un Taint
Se aplica con el comando: `kubectl taint nodes ...`
Consta de tres partes:
1.  **Key (Clave):** Nombre descriptivo.
2.  **Value (Valor):** Información opcional.
3.  **Effect (Efecto):** Qué pasa si el Pod no tolera el Taint.

## 3. Lógica de Coincidencia (Matching)
Para que un Pod entre en un nodo con Taint, su *Toleration* debe coincidir en **Key** y **Effect**.
La validación del **Value** depende del operador usado, pero debe pasar el **value check**:

* **Operator "Equal" (Por defecto):** El valor del Pod debe ser **idéntico** al valor del Taint.
* **Operator "Exists":** Solo verifica que la Key y el Effect existan (actúa como un comodín), ignorando el contenido del valor.

Y si se aplican múltiples taints a un nodo, se impedirá que los nuevos Pods aterricen en el nodo, y los Pods en ejecución serán desalojados.

## 4. Los 3 Efectos de Taint (Importantísimo)

| Efecto | Comportamiento sobre Pods NUEVOS | Comportamiento sobre Pods EXISTENTES |
| :--- | :--- | :--- |
| **`NoSchedule`** | **Bloquea.** No se programan si no tienen tolerancia. | **Ignora.** Los que ya estaban corriendo siguen ahí felices. |
| **`PreferNoSchedule`** | **Evita (Soft).** Intenta no ponerlos ahí, pero si no hay espacio en otro lado, los acepta. | **Ignora.** No afecta a los existentes. |
| **`NoExecute`** | **Bloquea.** No entran nuevos. | **Desaloja (Evict).** Expulsa inmediatamente a los Pods que no tengan la tolerancia marcada como NOExecute. |

## 5. Gestión en GKE con Node Pools
Gestionar Taints nodo por nodo es complejo. GKE simplifica esto usando **Node Pools**:

1.  Creas un pool con hardware específico (ej. "High CPU").
2.  GKE etiqueta automáticamente esos nodos con el nombre del pool.
3.  Puedes usar `nodeSelector` o `Taints` a nivel de creación del pool para asegurar que solo las cargas de trabajo correctas (ej. Servidores Web que necesitan mucha CPU) caigan en ese hardware.

# 📦 Herramientas de Despliegue y Gestión de Software

Aunque Google provee las herramientas, **tú eres responsable** de definir los patrones de despliegue para asegurar operaciones eficientes.

## 1. El Flujo de CI/CD en Google Cloud

### A. Cloud Build (Construcción)
* **Qué es:** Herramienta **serverless** para CI/CD (Integración y Despliegue Continuo).
* **Función:** Permite construir, probar y desplegar software en varios lenguajes y entornos.
* **Ventaja:** No necesitas gestionar servidores de build (como Jenkins tradicionales).

### B. Artifact Registry (Almacenamiento)
* **Qué es:** Un repositorio centralizado y seguro para tus artefactos de construcción.
* **Uso principal:** Almacenar **imágenes de contenedor**.
* **Integración:** GKE descarga ("fetches") las imágenes directamente desde aquí para ejecutarlas en los Pods.

---

## 2. Helm (Gestor de Paquetes)

Helm es una herramienta de código abierto fundamental para Kubernetes.

* **Analogía:** Funciona igual que `apt-get` o `yum` en Linux, pero para aplicaciones de Kubernetes.
* **Función:** Simplifica la instalación, actualización, consulta y eliminación de recursos en el clúster hablando con el API Server.

### Concepto Clave: Helm Charts
* **Definición:** Son paquetes que agrupan múltiples objetos de Kubernetes (Deployments, Services, ConfigMaps, etc.) necesarios para una aplicación.
* **Ventajas:**
    * Gestionan **dependencias** automáticamente.
    * Permiten versionado, publicación y uso compartido de aplicaciones complejas.
    * Reducen el error humano en despliegues manuales.
    
---

## 3. Google Cloud Marketplace
* **Qué ofrece:** Soluciones, "stacks" de desarrollo y servicios listos para usar.
* **Despliegue:** La instalación está automatizada gracias al uso de comandos `kubectl` y **Helm Charts** por detrás.
## Conceptos de Kubernetes

Modelo de objetos de Kubernetes. Cada cosa que Kubernetes gestiona está representada por un objeto, y puedes ver y cambiar estos objetos, sus atributos y su estado. Un objeto de Kubernetes se define como una entidad persistente que representa el estado de algo que se ejecuta en un clúster, su estado deseado y su estado actual. Los objetos representan aplicaciones en contenedores, los recursos disponibles para ellas y las políticas que afectan su comportamiento.

Los objetos de Kubernetes tienen dos elementos importantes:
- **Object spec:** para cada objeto que quieras crear, define el estado deseado proporcionando las características que buscas.
- **Object status:** es simplemente el estado actual del objeto proporcionado por el plano de control de Kubernetes.

Cada objeto es de un cierto tipo o 'Kind' (Tipo) como los llama Kubernetes.
Los **Pods** son el bloque de construcción básico del modelo estándar de Kubernetes, y son el objeto de Kubernetes desplegable más pequeño. Un Pod encarna el entorno donde viven los contenedores y ese entorno puede acomodar uno o más contenedores. Cada contenedor dentro de un Pod comparte el namespace de red, incluyendo la dirección IP y los puertos de red. Los contenedores dentro del mismo Pod pueden comunicarse a través de localhost 127.0.0.1. Un Pod también puede especificar un conjunto de volúmenes de almacenamiento para ser compartidos entre sus contenedores. Los Pods no se auto-reparan (self-healing).
Image arch06.png

**El principio de gestión declarativa:** Kubernetes espera que le digas cuál quieres que sea el estado de los objetos bajo su gestión, y trabajará para llevar ese estado a la realidad y mantenerlo allí.

## Componentes de Kubernetes

En GKE, los ordenadores que componen tus clústeres son máquinas virtuales. Un ordenador se llama **plano de control** (control plane) y los otros simplemente se llaman **nodos**. El trabajo de los nodos es ejecutar las cargas de trabajo.
El trabajo del plano de control es coordinar todo el clúster.

Varios componentes críticos de Kubernetes se ejecutan en el plano de control.
El único componente con el que interactúas directamente se llama **kube-apiserver**. El trabajo de este componente es aceptar comandos que ven o cambian el estado del clúster, incluido el lanzamiento de pods. El trabajo de `kubectl` es conectarse al kube-apiserver y comunicarse usando la API de Kubernetes. Cualquier consulta o cambio hacia el estado del clúster debe dirigirse al kube-apiserver.

**etcd** es la base de datos del clúster.
Su trabajo es almacenar de manera confiable el estado del clúster, los datos de configuración, qué pods deberían estar ejecutándose y dónde. El kube-apiserver interactúa con la base de datos en nombre del resto del sistema.

**kube-scheduler** es responsable de programar (scheduling) los pods en los nodos. Siempre que descubre un objeto pod que aún no tiene una asignación a un nodo, elige un nodo y simplemente escribe el nombre de ese nodo en el objeto pod. Conoce el estado de todos los nodos y obedecerá las restricciones que definas sobre dónde puede ejecutarse un pod, basándose en hardware, software y políticas; de esta manera decide dónde se ejecuta un pod.

**kube-controller-manager** tiene un trabajo más amplio. Monitoriza continuamente el estado del clúster a través del kube-apiserver. El kube-controller-manager intentará realizar cambios para lograr el estado deseado. Se llama administrador de controladores porque muchos objetos de Kubernetes son gestionados por bucles de código llamados controladores. Los controladores pueden agrupar contenedores y gestionar cargas de trabajo.
Otros tipos de controladores tienen responsabilidades a nivel de sistema. Por ejemplo, el trabajo del controlador de nodo es monitorizar y responder cuando un nodo está desconectado.

**cloud-controller-manager** gestiona controladores que interactúan con los proveedores de nube subyacentes, responsables de traer características de Google Cloud como balanceadores de carga y volúmenes de almacenamiento cuando los necesitas.

Cada nodo ejecuta también una pequeña familia de componentes del plano de control. Por ejemplo, cada nodo ejecuta un **kubelet**. Puedes pensar en un kubelet como el agente de Kubernetes en cada nodo. Cuando el kube-apiserver quiere iniciar un pod en un nodo, se conecta al kubelet de ese nodo. El kubelet usa el tiempo de ejecución de contenedores (container runtime) para iniciar el pod y monitoriza su ciclo de vida, incluyendo pruebas de disponibilidad (readiness) y vitalidad (liveness), e informa al kube-apiserver.

El mundo de Kubernetes ofrece varias opciones para tiempos de ejecución de contenedores. Pero la distribución de Linux que GKE usa para sus nodos lanza contenedores usando **Containerd**, el componente de tiempo de ejecución de Docker. El trabajo de **kube-proxy** es mantener la conectividad de red entre los pods en el clúster.
Image arch07.png

## Conceptos de Google Kubernetes Engine

`kubeadm` puede automatizar gran parte de la configuración inicial de un clúster. Pero si un nodo falla o necesita mantenimiento, un administrador humano tiene que responder manualmente.

GKE está disponible en dos modos de operación: **Autopilot** y **Standard**.

**Autopilot** es un modo de operación en GKE que gestiona toda la infraestructura del clúster, incluyendo el plano de control, los grupos de nodos (node pools) y los nodos. Al gestionar todo el clúster, Google monitoriza y gestiona todos los aspectos operativos, incluyendo el plano de control, los nodos de trabajo y los componentes principales del sistema Kubernetes, asegurando que tus cargas de trabajo siempre tengan un lugar donde ejecutarse.

El modo **Standard** tiene toda la misma funcionalidad que Autopilot, pero tú eres responsable de la configuración, gestión y optimización del clúster según tus requisitos.

Google Cloud aconseja que, a menos que tengas una razón específica para necesitar el nivel de control de configuración que ofrece Standard, siempre deberías usar el modo Autopilot.

Así es como nuestro diagrama de Kubernetes difiere para GKE. GKE gestiona todos los componentes del plano de control por nosotros. Todavía expone una dirección IP a la que enviamos todas nuestras solicitudes de API de Kubernetes, pero GKE asume la responsabilidad de aprovisionar y gestionar toda la infraestructura del plano de control detrás de ella. También abstrae el tener un plano de control separado.

En cualquier entorno de Kubernetes, los nodos son creados externamente por administradores del clúster, no por Kubernetes en sí. GKE automatiza este proceso por ti. Lanza instancias de máquinas virtuales de Compute Engine y las registra como nodos. Pagas por hora de vida de tus nodos (sin contar el plano de control). También puedes seleccionar múltiples tipos de máquinas de nodo creando múltiples **node pools**. Un node pool es un subconjunto de nodos dentro de un clúster que comparten una configuración, como su cantidad de memoria o su generación de CPU. Los node pools también proporcionan una manera fácil de asegurar que las cargas de trabajo se ejecuten en el hardware correcto dentro de tu clúster: simplemente las etiquetas con un node pool deseado. Los node pools son una característica de GKE más que una característica de Kubernetes.
Image arch08.png

Puedes habilitar actualizaciones automáticas de nodos, reparaciones automáticas de nodos y autoescalado del clúster a nivel de node pool. Parte de la CPU y memoria de cada nodo se necesita para ejecutar los componentes de GKE y Kubernetes que le permiten funcionar como parte de tu clúster.

Por defecto, un clúster se lanza en una sola zona de cómputo de Google Cloud con tres nodos idénticos, todos en un node pool.

Los **clústeres regionales** tienen un único punto final de API para el clúster. Sin embargo, sus planos de control y nodos están distribuidos en múltiples zonas de Compute Engine dentro de una región. Los clústeres regionales aseguran que la disponibilidad de la aplicación se mantenga a través de múltiples zonas en una sola región. El número de nodos tiene que permanecer igual en todas las regiones y, una vez que construyes un clúster zonal, no puedes convertirlo en un clúster regional, ni viceversa.
Image arch09.png

## Kubernetes Object Management

Kubernetes gestiona objetos declarativos definidos mediante archivos de manifiesto. Cada objeto tiene un **nombre único** y un **identificador único (UID)** que lo distinguen dentro del clúster.

- Los objetos se definen con **manifest files** escritos en YAML o JSON (YAML suele ser preferido por su legibilidad).  
- Cada manifiesto declara el **estado deseado** del objeto, por ejemplo un Pod con una imagen nginx.  
- Campos obligatorios en un YAML:  
  - **apiVersion:** versión de la API usada para crear el objeto.  
  - **kind:** tipo de objeto (Pod, Deployment, etc.).  
  - **metadata:** nombre, UID, y namespace (opcional).  
- Es una buena práctica incluir varios objetos relacionados en un mismo archivo YAML.  
- Los manifiestos deben guardarse en **repositorios con control de versiones**, ya que esto facilita revertir cambios y reconstruir clústeres si es necesario.

### Nombres, UID y etiquetas

Cada objeto tiene un **nombre único dentro de su namespace** (metadata nombre).

- Solo se permiten letras, números, guiones y puntos, hasta 253 caracteres.  
- Si un objeto se elimina, su nombre puede reutilizarse.  
- Todos los objetos reciben un **UID** único que no cambia ni se repite en la vida del clúster.  

Los objetos pueden tener **labels**, que son pares clave-valor usados para identificar, organizar y seleccionar recursos.

- Ejemplos: `app=nginx`, `env=prod`, `tier=backend`.  
- Las etiquetas permiten seleccionar objetos mediante label selectors:  
  - Con un valor específico.  
  - Sin un valor específico.  
  - Con un valor dentro de un conjunto.  
- Ejemplo con kubectl:  
Image arch10.png
---

## Pods vs Controllers

Crear manualmente varios Pods (por ejemplo, 3 nginx) funciona para escalas pequeñas, pero no es práctico ni seguro:

- Los Pods son **efímeros** y no se auto-reparan.  
- Gestionar decenas o cientos de Pods con YAML individuales es ineficiente.  

En lugar de eso, Kubernetes utiliza **controller objects**, cuya función es gestionar el estado deseado.

- Ejemplos de controllers: **Deployments**, **StatefulSets**, **DaemonSets**, **Jobs**, **ReplicaSets**, **Replication Controllers**.  
### ReplicaSet
Un **ReplicaSet** asegura que una población de Pods, todos **idénticos entre sí**, estén ejecutándose al mismo tiempo.

### Deployment
Los **Deployments** permiten realizar actualizaciones **declarativas** sobre ReplicaSets y Pods.  
De hecho, los Deployments **gestionan sus propios ReplicaSets** para lograr el estado deseado, por lo que normalmente trabajarás directamente con Deployments.

Un Deployment te permite:
- Crear Pods
- Actualizarlos
- Realizar rollbacks
- Escalarlos
- Usar ReplicaSets automáticamente cuando se necesite. **Ejemplo:**  Durante un *rolling update*, el Deployment crea un segundo ReplicaSet:  
    - Aumenta gradualmente los Pods del nuevo ReplicaSet  
    - Disminuye los Pods del ReplicaSet inicial  

### ReplicationController
Los **Replication Controllers** son una versión más antigua y ofrecen un rol similar.  
Su uso **ya no es recomendado**, ya que los Deployments proporcionan una capa superior más flexible y moderna.

### StatefulSet
Si necesitas ejecutar aplicaciones que **mantienen estado local**, usa un **StatefulSet**.

Similar a un Deployment en los que los pods usan el mismo container spec, pero…
- Los Pods tienen **identidades persistentes y únicas**
- Conservan identidad de red estable
- Pueden usar almacenamiento persistente asociado a cada Pod

### DaemonSet
Un **DaemonSet** asegura que ciertos Pods se ejecuten en **todos** los nodos del clúster, o un subconjunto específico de nodos

Si se agregan nuevos nodos, el DaemonSet crea automáticamente los Pods necesarios allí.

Uso común:
- Ejecutar agentes como **fluentd** o recolectores de logs en todos los nodos.

### Job y CronJob
- Un **Job** crea uno o más Pods para ejecutar una **tarea puntual**.  
  Cuando la tarea termina, el Job finaliza los Pods.
- Un **CronJob** ejecuta Jobs siguiendo una **programación basada en tiempo**, como tareas cron tradicionales.

### ¿Cómo trabaja un Deployment?

- El scheduler crea Pods y notifica cambios al API server.  
- El Deployment controller monitoriza continuamente:  
- Si un Pod falla, detecta el cambio en el estado actual.  
- Crea un nuevo Pod para restaurar el estado deseado.  
- Un Deployment permite especificar:  
    - Número de réplicas.  
    - Especificación de los Pods (containers, puertos, volúmenes).  
    - Políticas de actualización.  

---

## Recursos del Pod y uso eficiente del clúster

Para garantizar que los contenedores funcionen correctamente, se pueden definir **requests** y **limits** de recursos.

- Recursos más comunes: CPU y memoria (RAM).  
- Requests garantizan que el Pod tenga lo mínimo necesario.  
- Limits evitan que una aplicación consuma más recursos de los permitidos.  

Esto previene situaciones como:

- Un nodo quedándose sin memoria o CPU.  
- Equipos subiendo réplicas innecesarias.  
- Aplicaciones mal configuradas consumiendo el 100% del CPU.

---

## Namespaces

Los namespaces permiten dividir un clúster físico en múltiples entornos lógicos.

- Proveen un ámbito de nombres para Pods, Deployments y otros recursos.  
- Puedes crear objetos con el mismo nombre siempre que estén en namespaces distintos.  
- Facilitan la organización, control de acceso y pruebas aisladas.  

### Usos típicos de namespaces

- Separar entornos: `test`, `stage`, `prod`.  
- Evitar colisiones de nombres.  
- Implementar **resource quotas**, que limitan el consumo de recursos por namespace.  
- Crear despliegues temporales sin interferir con los existentes.
Image arch11.png
### Namespaces iniciales del clúster

- **default:** donde van los recursos que no especifican un namespace.  
- **kube-system:** contiene objetos internos de Kubernetes.  
- **kube-public:** accesible públicamente y útil para compartir información común en el clúster.

### Buenas prácticas con namespaces

- Preferir aplicar el namespace desde la línea de comando (ej. `-n test apply -f mypod.yaml`) en lugar de especificarlo en YAML.  
- Esto mantiene los YAML reutilizables en múltiples entornos.  
- Incrustar el namespace en el YAML dificulta mantener instancias independientes del mismo despliegue.

## Servicios en Kubernetes

Los **Services** proporcionan acceso balanceado y estable a un conjunto de Pods, ofreciendo un punto de entrada consistente aunque los Pods cambien de IP o se reinicien.

### Tipos de Services

- **ClusterIP**  
  Expone el servicio en una IP accesible **solo dentro del clúster**.  
  - Es el tipo **por defecto**.  
  - Uso típico: comunicación interna entre microservicios.

- **NodePort**  
  Expone el servicio en la IP de **cada nodo** del clúster, usando un puerto fijo.  
  - Permite acceso externo vía `<NodeIP>:<NodePort>`.  
  - Útil para pruebas o cuando no hay un balanceador externo.

- **LoadBalancer**  
  Expone el servicio **externamente** usando el balanceador del proveedor cloud.  
  - En GKE crea un **Network Load Balancer regional**.  
  - Uso típico: servicios públicos que necesitan IP externa y balanceo de red.

### Nota sobre Ingress en GKE

Si necesitas balanceo global o capacidades HTTP(S) de capa 7 (rutas, TLS gestionado, reglas basadas en host/path), utiliza un **Ingress**.  
En GKE, un Ingress se integra con el **HTTP(S) Load Balancer global**, ofreciendo enroutamiento avanzado frente al LoadBalancer regional por defecto.

## Migrate for Anthos
**Migrate for Anthos** mueve tus aplicaciones existentes hacia un entorno Kubernetes. Lo mejor: **el proceso es completamente automatizado**.

### Flujo general
Image arch12.png
1. **Crear un pipeline de migración**
   El primer paso consiste en permitir que **Migrate for Compute Engine** cree un pipeline para transmitir o migrar datos desde entornos *on-premises* u otros proveedores de la nube hacia Google Cloud.

2. **Uso de Migrate for Compute Engine**
   - Esta herramienta permite traer aplicaciones existentes hacia máquinas virtuales en Google Cloud.

3. **Instalar Migrate for Anthos**
   - Se instala en un **cluster de procesamiento GKE**.
   - Está compuesto por múltiples recursos de Kubernetes.

4. **Generación de artefactos de despliegue**
   - Migrate for Anthos genera artefactos como:
     - Archivos de configuración de Kubernetes
     - Dockerfile
   - Estos artefactos se usan para crear el **VM wrapping container** (contenedor que envuelve la VM).

5. **Almacenamiento de artefactos**
   - El contenedor resultante se almacena en **Cloud Storage**.
   - Las imágenes de contenedor se almacenan en **Container Registry**.

6. **Despliegue en el cluster destino**
   - Una vez generados los artefactos, se pueden aplicar directamente al cluster objetivo.
   - Al aplicar la configuración generada:
     - Se crean todos los elementos de Kubernetes necesarios para ejecutar la aplicación.

## Migrate for Anthos – Flujo de Migración de una Aplicación

Ahora que conoces la arquitectura general necesaria para una migración, veamos qué ocurre paso a paso cuando migras una aplicación usando **Migrate for Anthos**.

### 1. Crear el *processing cluster*
Lo primero es crear el **cluster de procesamiento**, que será donde ocurrirá la conversión de la máquina virtual a contenedor.

### 2. Instalar los componentes de Migrate for Anthos
Una vez creado el cluster, debes **instalar los componentes** de Migrate for Anthos en él. Estos componentes incluyen los recursos y controladores necesarios para analizar y convertir workloads.

### 3. Añadir una fuente de migración (*migration source*)
Puedes migrar desde distintas plataformas, otras nubes u on-prem.

### 4. Crear un objeto de migración (*Migration object*)
Debes crear un objeto Migration con detalles del origen, configuración del workload y opciones de conversión. Al crear este objeto, se genera automáticamente una **plantilla de plan (plan template)** en un archivo YAML.

### 5. Ajustar la plantilla (opcional)
Puedes **editar el YAML generado** si necesitas personalizar:
- Configuraciones del contenedor  
- Parámetros del runtime  
- Opciones de almacenamiento  
- Configuraciones de red  

### 6. Generar los artefactos de migración
Cuando el plan está listo, generas los artefactos:
- **Imágenes de contenedor** que representan tu aplicación convertida desde la VM  
- **Archivos YAML** necesarios para desplegar en Kubernetes  

### 7. Probar los artefactos generados
Antes del despliegue final, es necesario probarlo.

### 8. Desplegar en clústeres de producción
Finalmente, si las pruebas son exitosas, puedes usar los artefactos generados para
- Desplegar la aplicación  
- En uno o varios clusters de producción  
- Utilizando kubectl o pipelines automatizados  

---

## Migrate for Anthos – Ejemplo Completo de Instalación y Migración

En esta sección se muestra un ejemplo práctico de cómo instalar las herramientas necesarias y ejecutar un proceso de migración usando **Migrate for Anthos**.

### 1. Configurar el *processing cluster*
Antes de crear el cluster:

- Debes ser **administrador de GKE**.  
- Debes tener reglas de **firewall** que permitan la comunicación entre  
  **Migrate for Anthos** y **Migrate for Compute Engine**.
Image arch13.png

## 2. Instalar Migrate for Anthos en el cluster
Cuando el processing cluster está listo, instala los componentes utilizando el comando `migctl install`.
Image arch14.png
Image15.png

## 3. Crear el plan de migración 
Image arch16.png
Este comando genera el **plan de migración** y define:
- La VM origen.  
- Qué datos excluir.  
- El tipo de intención (*migration intent*):
  - `image`
  - `image-and-data`
  - `data`
  - `pv` (PV-based container)

El resultado es un archivo **YAML**, que puedes personalizar.

## 5. Generar los artefactos de migración
Image arch17.png
Este proceso:
- Copia los archivos y directorios de la VM a un **Container Image Registry**.  
- Crea **dos imágenes**:
   - **Imagen ejecutable** para desplegar en un cluster.
   - **Imagen no ejecutable** que sirve como base para futuras actualizaciones.
- Genera los **archivos YAML** de configuración para el despliegue.
- Copia los YAML generados a un **bucket de Cloud Storage**.

## 6. Obtener los artefactos generados
Image arch18.png
kubectl apply command para desplegar la spec definida







# Introducción a Contenedores
## Evolución hacia la virtualización

Antes, cada aplicación se ejecutaba en su propio servidor físico, lo que hacía el despliegue lento, costoso, con mucho desperdicio de recursos y poca portabilidad.

La virtualización introdujo el hipervisor, permitiendo crear varias máquinas virtuales sobre un mismo hardware. Esto aceleró los despliegues y aprovechó mejor los recursos, pero las VMs seguían siendo pesadas: cada una incluye su propio sistema operativo, tarda en arrancar y no se mueve fácilmente entre distintos hipervisores.

Ejecutar varias apps dentro de una misma VM tampoco funcionaba bien: no había aislamiento, podían estorbarse con recursos o dependencias, y actualizar una podía romper otra.

La alternativa de usar **una VM por aplicación** resolvió el aislamiento, pero escalaba muy mal porque cada VM duplicaba un sistema operativo completo.

Imagen arch01.png

Una forma más eficiente de resolver los problemas de dependencias es abstraer solo el espacio de usuario, sin virtualizar toda la máquina ni el sistema operativo. Esto permite empaquetar la aplicación junto con sus dependencias sin incluir un sistema operativo completo. A esta técnica se le conoce como contenedores, y representa un avance clave frente a las VMs al ser más ligeros, rápidos y portables.

## Contenedores e Imagenes
Imagen arch02.png
Los contenedores no son una característica primitiva de Linux; su capacidad para **aislar cargas de trabajo** proviene de la combinación de varias tecnologías fundamentales.

- **Procesos de Linux:** cada proceso tiene su propio espacio de memoria virtual, separado de los demás, y se crean y destruyen rápidamente.  
- **Namespaces de Linux:** controlan lo que una aplicación puede ver, como identificadores de proceso, árboles de directorios, direcciones IP y más.  
  - Nota: los namespaces de Linux **no son lo mismo** que los namespaces de Kubernetes.  
- **cgroups (control groups):** limitan los recursos que una aplicación puede usar, incluyendo CPU, memoria, ancho de banda de I/O y otros.  
- **Sistemas de archivos en capas (union file systems):** permiten encapsular aplicaciones y sus dependencias en capas limpias y mínimas.

#### Imágenes de contenedor

Una **imagen de contenedor** está estructurada en capas. Se construye usando instrucciones de un archivo de manifiesto (por ejemplo, un **Dockerfile** en Docker).  

- Cada instrucción del Dockerfile genera una **capa dentro de la imagen**, que es de solo lectura.  
- Cuando se ejecuta el contenedor, se añade una **capa superior temporal y escribible**, permitiendo cambios efímeros sin afectar la imagen base.

## Capas en un Dockerfile

Un **Dockerfile** crea una imagen de contenedor a partir de varias capas, cada una generada por un comando diferente. Aunque este ejemplo es simplificado, ilustra cómo se estructuran las imágenes modernas.

- **FROM:** crea la capa base, generalmente obtenida de un repositorio público. En este caso, se usa un entorno de ejecución de Ubuntu de una versión específica.  
- **COPY:** agrega una nueva capa con archivos copiados desde el directorio actual del build tool.  
- **RUN:** construye la aplicación usando un comando como `make` y coloca los resultados en una tercera capa.  
- **CMD (o ENTRYPOINT):** define qué comando se ejecutará dentro del contenedor al iniciarlo.  

#### Detalles importantes

- Cada capa representa solo **las diferencias respecto a la capa anterior**, lo que hace que las imágenes sean eficientes.  
- Al escribir un Dockerfile, se recomienda **ordenar las instrucciones desde las capas menos propensas a cambiar hasta las más propensas a cambiar**, para optimizar la reutilización de capas en futuras construcciones.

Image arch03.png
### Buenas prácticas y capas escribibles en contenedores

Actualmente, la mejor práctica es **no construir tu aplicación en el mismo contenedor que vas a desplegar y ejecutar**. Esto evita que herramientas de construcción innecesarias aumenten la complejidad o se conviertan en un vector de ataque.

- **Construcción multi-stage:** un contenedor se encarga de construir la aplicación, mientras que otro contenedor recibe solo lo necesario para ejecutarla.  
- **Capa escribible del contenedor:** al iniciar un contenedor, el runtime agrega una nueva capa superior donde se pueden hacer cambios.  
  - Escribiendo nuevos archivos, modificando existentes o eliminando archivos.  
  - Esta capa es **efímera**: al eliminar el contenedor, los cambios se pierden.  
- **Integridad de la imagen base:** la imagen subyacente permanece inalterada, incluso después de modificar la capa escribible.  
- **Almacenamiento de datos persistente:** para guardar datos de manera permanente, deben almacenarse fuera del contenedor en ejecución.  
- **Compartición de imágenes:** múltiples contenedores pueden usar la misma imagen base mientras mantienen estados de datos independientes en sus capas escribibles.

### Uso de imágenes de contenedor y herramientas de construcción

Cuando se construye un contenedor, **no se copia toda la imagen**, sino solo una capa con las diferencias. Esto hace que la construcción, ejecución y actualización de contenedores sea mucho más rápida que usar máquinas virtuales completas.

- **Capas de diferencias:**  
  - Al ejecutar un contenedor, el runtime descarga únicamente las capas necesarias.  
  - Al actualizar una imagen, solo se copian las diferencias, acelerando los despliegues.  
- **Imágenes base públicas:** se suelen usar imágenes open-source como punto de partida o para uso directo.  
  - Ejemplos: `ubuntu` (entorno Linux), `alpine` (Linux muy ligero), `nginx` (servidor web).  
- **Registro de imágenes:**  
  - **Artifact Registry:** almacena imágenes de contenedor, paquetes de lenguaje y de sistema operativo.  
  - Integración con otros servicios de Google Cloud: IAM (control de acceso), KMS (encriptación), Cloud Build (CI/CD), Container Analysis (análisis de vulnerabilidades).  
  - Otras fuentes públicas: Docker Hub, GitLab, y más.  
- **Construcción de contenedores:**  
  - La herramienta `docker` es muy popular y ampliamente usada, pero requiere confiar en la máquina donde se realizan los builds.  
  - Google Cloud ofrece **Cloud Build**, un servicio gestionado integrado con IAM que automatiza la construcción de contenedores.  
- **Cloud Build:**  
  - Recupera código de repositorios como Cloud Source Repositories, GitHub o Bitbucket.  
  - Permite definir pasos de build: instalar dependencias, compilar código, ejecutar tests o usar herramientas como Docker, Gradle o Maven.  
  - Cada paso se ejecuta en un contenedor Docker.  
  - Puede entregar las imágenes construidas a entornos de ejecución como GKE, App Engine o Cloud Functions.

Image arch04.png

## Kubernetes

Kubernetes automatiza el despliegue, escalado, balanceo de carga, logging, monitoreo y otras tareas de gestión de aplicaciones en contenedores. Estas capacidades son comunes en soluciones tipo Platform as a Service, pero Kubernetes también ofrece flexibilidad cercana a Infrastructure as a Service.

- **Automatización declarativa:** Kubernetes mantiene el estado deseado de tu sistema de forma automática.  
- **Soporte para múltiples tipos de cargas:**  
  - Aplicaciones **stateless** como Nginx o Apache.  
  - Aplicaciones **stateful** con almacenamiento persistente.  
  - Trabajos por lotes (batch jobs) y daemon tasks.  
- **Escalado automático:** permite escalar aplicaciones basándose en la utilización de recursos.  
- **Recursos configurables:** puedes especificar límites y solicitudes de CPU y memoria.

---

### Google Kubernetes Engine (GKE)

Google Cloud ofrece **GKE**, una solución Kubernetes completamente gestionada que utiliza sistemas operativos optimizados para contenedores mantenidos por Google.

- **Modo Autopilot:** Google gestiona la configuración del clúster, nodos, seguridad y escalado.  
- **Nodos:** las máquinas virtuales que ejecutan tus contenedores; con *auto-repair*, GKE repara nodos defectuosos automáticamente.  
- **Actualizaciones automáticas:** *auto-upgrade* mantiene la versión estable más reciente de Kubernetes.  
- **Escalado de clúster:** además del escalado de workloads, GKE puede escalar el tamaño del clúster.  
- **Integraciones clave:**  
  - IAM para control de acceso.  
  - VPC y capacidades de red de Google Cloud.  
  - Cloud Monitoring para métricas y visibilidad.  
  - Cloud Build y Artifact Registry para pipelines CI/CD.

GKE es ideal para aplicaciones contenerizadas, sistemas distribuidos cloud-native y entornos híbridos sin vendor lock-in.

---

## Compute Options (GCP)

Image arch05.png

### Compute Engine

Compute Engine ofrece máquinas virtuales altamente configurables.

- **Opciones de almacenamiento:**  
  - *Persistent disks*: almacenamiento de red hasta 64 TB, con snapshots sencillos.  
  - *Local SSDs*: rendimiento IOPS extremadamente alto.  
- **Infraestructura avanzada:**  
  - Global load balancers con autoscaling.  
  - Managed Instance Groups.  
  - Facturación por segundo para control granular de costos.  
- **VMs preemptibles:** ideales para cargas tolerantes a interrupciones con costos reducidos.  
- **Casos de uso:** cuando necesitas VMs tradicionales o arquitecturas que no encajan en las opciones serverless o gestionadas.

---

### App Engine

App Engine es una plataforma totalmente gestionada, ideal si no quieres ocuparte de servidores o despliegues manuales.

- Sin gestión de servidores: solo subes tu código.  
- Soporte para cargas contenerizadas.  
- Integración con Monitoring, Logging y Error Reporting.  
- Control de versiones y división de tráfico integrada.  
- **Casos de uso:** sitios web, backends móviles, APIs RESTful, aplicaciones con workloads fluctuantes.

---

### Google Kubernetes Engine (resumen operativo)

- Automatiza despliegue, escalado, logging y monitoreo.  
- Integración con Cloud Build, Container Registry/Artifact Registry y Stackdriver.  
- Permite migración desde clusters on-premises sin dificultad.  
- Excelente opción para sistemas contenerizados y distribuidos.

---

### Cloud Run

Cloud Run permite ejecutar contenedores *stateless* de forma totalmente serverless mediante HTTP o eventos de Pub/Sub.

- **Infraestructura abstracta:** no gestionas servidores.  
- **Escalado automático desde 0:** escala instantáneamente según tráfico.  
- **Modelo de facturación:** pagas solo por uso, en intervalos de 100 ms.  
- **Modos de despliegue:**  
  - Totalmente gestionado.  
  - Sobre tu propio clúster GKE (misma experiencia de desarrollo).  

Cloud Run es ideal para aplicaciones stateless con cargas irregulares o impredecibles.

---

### Cloud Functions

Cloud Functions es un servicio serverless basado en eventos para funciones simples y de propósito único.

- Escalado automático y alta disponibilidad.  
- Pago solo por el tiempo de ejecución (intervalos de 100 ms).  
- Ideal para lógica reactiva, micro-funciones, automatización y pipelines event-driven.

---

## ¿Qué servicio de cómputo elegir?

- **Migración desde servidores físicos:** usa Compute Engine.  
- **Aplicaciones en VMs tradicionales:** usa Compute Engine.  
- **No quieres gestionar operaciones:** App Engine o Cloud Functions.  
- **Ya trabajas con Kubernetes on-prem:** GKE es la opción natural.  


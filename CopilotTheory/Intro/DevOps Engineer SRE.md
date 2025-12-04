# Apuntes: DevOps Engineer SRE - Google Cloud - Cloud Fundamentals
## Course Introduction

----

## 1. IaaS, PaaS y SaaS

### IaaS (Infraestructura como Servicio)
- **¿Qué es?**: Proporciona acceso a recursos puros de computación, almacenamiento y red.
- **Modelo de pago**: Los clientes pagan por los recursos que **asignan por adelantado**, independientemente de su uso.
- **Ejemplo**: Máquinas virtuales en Compute Engine.

### PaaS (Plataforma como Servicio)
- **¿Qué es?**: Vincula el código a librerías que dan acceso a la infraestructura que la aplicación necesita. Permite centrarse más en la lógica de la aplicación.
- **Modelo de pago**: Los clientes pagan por los recursos que **realmente utilizan**.
- **Ejemplo**: App Engine.

### Diferencia entre PaaS y Serverless
Aunque relacionados, representan distintos niveles de abstracción:

- **PaaS (Plataforma como Servicio)**:
    - **Abstracción**: Te abstrae del sistema operativo y el hardware, pero sigues gestionando *instancias* o *aplicaciones* que están corriendo continuamente.
    - **Escalado**: Escala bien, pero a menudo necesitas configurar reglas de autoescalado y puede que no escale a cero (sigues pagando por una instancia mínima).
    - **Control**: Tienes más control sobre el entorno de ejecución.
    - **Ejemplo**: Desplegar una aplicación completa en App Engine.

- **Serverless (Computación sin servidor)**:
    - **Abstracción**: Es el siguiente nivel. Te abstraes completamente de los servidores. Solo te preocupas por el código (funciones) o el contenedor.
    - **Escalado**: Escala automáticamente desde cero hasta miles de peticiones, y vuelve a cero. Es ideal para cargas de trabajo impredecibles.
    - **Control**: Menos control sobre el entorno, ya que es totalmente gestionado.
    - **Modelo de pago**: **Pago por ejecución**. Si tu código no se ejecuta, no pagas nada.
    - **Ejemplo**: Cloud Functions (código basado en eventos) o Cloud Run (contenedores).

### SaaS (Software como Servicio)
- **¿Qué es?**: Proporciona una aplicación completa basada en la nube que los usuarios finales consumen directamente a través de internet.
- **Ejemplo**: Gmail, Google Docs, Google Drive.

---

## 2. Red de Google Cloud

La red global de Google está diseñada para ofrecer el **máximo rendimiento y la menor latencia posible** utilizando más de 100 nodos de caché de contenido en todo el mundo.

### Regiones y Zonas
- **Región**: Un área geográfica independiente.
- **Zona**: Un área de despliegue de recursos **dentro de una región**. Las zonas están aisladas entre sí para proteger contra fallos.

> **Ejemplo**: La región de Londres (`europe-west2`) se compone de tres zonas: `europe-west2-a`, `europe-west2-b` y `europe-west2-c`.

Desplegar recursos en múltiples zonas o regiones aumenta la disponibilidad y protege contra desastres.

### Recursos Multi-región
Algunos servicios, como **Spanner**, permiten replicar datos no solo en múltiples zonas, sino en múltiples regiones, ofreciendo una resiliencia y disponibilidad globales.

*INSERTAR Spanner.png*

---

## 3. Impacto Medioambiental

Los centros de datos consumen aproximadamente el **2% de la electricidad mundial**. Google se enfoca en la eficiencia energética y la sostenibilidad para minimizar este impacto.

---

## 4. Seguridad por Capas

La infraestructura de seguridad de Google se organiza en capas progresivas:

### 1. Capa de Infraestructura de Hardware
- **Diseño y Procedencia del Hardware**: Google diseña su propio hardware, incluyendo servidores, equipos de red y chips de seguridad personalizados (como el chip Titan).
- **Arranque Seguro (Secure Boot Stack)**: Se utilizan firmas criptográficas en BIOS, bootloader, kernel y el sistema operativo base para asegurar que solo se ejecuta software verificado.
- **Seguridad Física de las Instalaciones**: Google diseña y construye sus propios centros de datos con múltiples capas de protección física.

### 2. Capa de Despliegue de Servicios
- **Cifrado en Tránsito**: La comunicación entre servicios (llamadas RPC) se cifra automáticamente para garantizar la privacidad e integridad de los datos en la red, especialmente cuando viajan entre centros de datos.

*INSERTAR RPC.png*

### 3. Capa de Identidad de Usuario
- **Servicio Central de Identidad**: Gestiona la autenticación de los usuarios y empleados, aplicando medidas como el **segundo factor de autenticación (2FA/U2F)** y analizando el contexto del inicio de sesión (dispositivo, ubicación, etc.).

### 4. Capa de Servicios de Almacenamiento
- **Cifrado en Reposo (Encryption at Rest)**: Todos los datos almacenados en los servicios de Google se cifran por defecto. Se utiliza cifrado por hardware en los discos duros y SSDs para un rendimiento óptimo.

### 5. Capa de Comunicación por Internet
- **Google Front End (GFE)**: Es el servicio que gestiona todo el tráfico entrante desde internet.
    - Termina las conexiones **TLS** de forma segura.
    - Utiliza certificados de autoridades certificadoras (CA).
    - Implementa **Perfect Forward Secrecy**.
    - Aplica protecciones contra ataques de **Denegación de Servicio (DoS)**.

### 6. Capa de Seguridad Operacional
- **Detección de Intrusiones**: Se utilizan reglas y machine learning para alertar a los equipos de seguridad sobre posibles incidentes.
- **Reducción del Riesgo Interno (Insider Risk)**: Se limita y monitoriza activamente el acceso administrativo de los empleados a la infraestructura.
- **Uso de U2F para Empleados**: Para proteger contra ataques de phishing, las cuentas de los empleados requieren el uso de llaves de seguridad compatibles con U2F.
- **Prácticas de Desarrollo de Software Seguras**:
    - Revisión de código por dos personas.
    - Librerías internas para prevenir vulnerabilidades comunes.
    - Programa de recompensas por bugs (Bug Bounty).
    ---

## 5. Ecosistema Open Source

Para evitar el "vendor lock-in" (dependencia de un solo proveedor), Google Cloud se apoya fuertemente en el ecosistema de código abierto, permitiendo a los clientes migrar sus aplicaciones si lo necesitan.

- **TensorFlow**: Librería de software open source para Machine Learning desarrollada por Google.
- **Kubernetes (GKE)**: Permite orquestar microservicios y distribuirlos entre diferentes nubes.
- **Google Cloud Observability**: Permite monitorizar cargas de trabajo que se ejecutan en múltiples proveedores de nube.

---

## 6. Precios y Facturación (Pricing and Billing)

### Modelos de Precios Clave
- **Facturación por segundo**: Google fue pionero en este modelo para sus servicios IaaS. Se aplica a:
    - Compute Engine (IaaS)
    - Google Kubernetes Engine (GKE)
    - Dataproc (Big Data)
    - App Engine Flexible Environment (PaaS)
- **Descuentos por uso continuo (Sustained-use discounts)**: Descuentos automáticos que se aplican al ejecutar una VM durante más del 25% del mes. A más uso, mayor descuento.
- **Tipos de máquinas personalizadas (Custom VM types)**: Permite ajustar con precisión la vCPU y la memoria de una VM para optimizar el coste según la necesidad de la aplicación.

### Herramientas de Control de Costes
- **Presupuestos (Budgets)**:
    - Se pueden definir a nivel de cuenta de facturación o por proyecto.
    - Pueden ser un límite fijo o un porcentaje del gasto del mes anterior.
- **Alertas (Alerts)**:
    - Notifican cuando el gasto se acerca al límite del presupuesto.
    - Se pueden configurar en porcentajes (ej. 50%, 90%, 100%) o valores personalizados.
- **Informes (Reports)**: Herramienta visual en la consola para monitorizar gastos por proyecto o servicio.
- **Calculadora de precios online**: Para estimar costes.

### Cuotas (Quotas)
Las cuotas están diseñadas para prevenir el consumo excesivo de recursos (por error o ataque), protegiendo tanto al cliente como a la comunidad de Google Cloud. Se aplican a nivel de proyecto.

- **Cuotas de Tasa (Rate Quotas)**:
    - Limitan la cantidad de acciones en un período de tiempo.
    - **Ejemplo**: 3.000 llamadas a la API de GKE cada 100 segundos. Se resetea pasado el tiempo.
- **Cuotas de Asignación (Allocation Quotas)**:
    - Limitan el número total de recursos que puedes tener.
    - **Ejemplo**: Un máximo de 15 redes VPC por proyecto.
- **Aumento de Cuotas**: Se puede solicitar un aumento a través del soporte de Google Cloud.

---
# Redes nube privada
VPC= secure individual private cloud_computing model hosted within a public cloud.
they let you de the exact save stuff you would de in a private cloud ( On-prem) , with the advantage of a public cloud ( escalability, isolation ...)
VPCS connect GC resources to each other and to the internet :
- Segmenting networks
- Using firewall rules to restrict traffic to instances
-  forwarding traffic to specific routes
These are global and may have subrete in any Google Cloud regjon - > easy to defire network layouts with global scope
the size of a ubnet con be expanded by increasing the range Of IP addresses allocated to it.
two subnets in the same VPC are considered neighbours even if they are in different Zones/ regions
# Compute Engine
Iaas usado para crear y correr UM en la infra de Google , sin pago por adelantado, con capacidades de crecimiento horizontal y vertical. Pueden correr imagenes windos server o linux o cualquier imagea personalizada que se le indique.
En el marketplace hay paquetes preconfigurados que se pueden utilizar sin coste , pero también exista paquetes que tienen costes mensuales.
La facturación por uso es por segundo y cuenta con descuentos por uso sostenido que se aplican de manera automática, a partir del 25% de la duración del mes. También existen descuentos para usos con comprisos, es decir, para Cargas predecibles que se mantenga en ciertos rangos de consumo como uso de CPU, Memoria etc. Finalmente existen máquinas con descuento "spot" y "preenptible" que se usan para cargas puntuales como ejecuciones por lotes. Estar tienen como condición conin que el job que se gente tenga capacidades para ser restarteado, las spot pueden correr infinito mientras que los otras solo hasta 24h.
Para el almacenamiento el throughput es elevado independientemente de la máquina y no incluye costes extra.
# Escalar máquinas Virtuales
Auto scaling permite añadir o eliminar VMS en runtime, existe un escalado hacia afuera  (más máquinas) O horizontal Imás recursos en las máquinas, pero el máximo número de CPUS por VM "máquina de familias " se limite por la cuota asignada al usuario la scual es zona dependiente.
# Virtual Private Cloud compatibilidades
Tablas de enrontancierto, estas son built-in así que no hace falta ni crearlas ni mantenerlas o gestionarla. Se encargan de hacer forward entre instancias o zonas y no necesita un IP externo.
Tampoco hace falta tener un Firewall porque ya lotienen built-i sin necesidad de routing o gestión, permitiendo restringir el acceso a instacien a travs de reglas las cuales se pueden definir con network tags, por ejemplo,tageas los web servers con "web" y pones we regla para ese tag.
UPC peering permite establecer relaciones ente ellas, recordando que es un servicio global lo que permite conecto diferentes proyectos (revisar gemini)
Shared UPC me puede usar para establecer politicas y controles IAM para definir que o quién puede acceder a que entre la UPC de un proyecto y otro.
# Balanceadores de carga
Permita distribuir el tráfico de usuarios entre varias instancias de me aplicación reduciendo adicionalmente riesgos de sobrecarga de instancias. Es un servicio software, completamente gestionado, puliendo neo de una sola región o de varias incluyendo el multi-region fail over automático
trabaja en:
- Capa 7 appli cation layer (HTTP/S) trabaje de forma externa (global y regional) e interna ( regional y multi-región)
- Capa 4 TCP/ UDP/ othe estos son los balanceadores de carga de red pudiendo ser
-      - Proxy (y proxy inverso) el cual de nuevo puede ser externo o interno
-      - Pass through a diferencia del proxy este ni termina conexiones ni las modifica. Directamente la hacer ca forward al backend manteniendo la IP origen inicial
# Cloud DNS y CDN
DNS se encarga de trasformer IPs en host names. Cloud DNS es un servicio gestionado de baja latencia y alta disponibilidad que permite a los usuarios acceder a tu servicio. La información DNS que publica un USUARIO es servido desde "r edundant" locatio ns de todo el mundo. Este servicio es programable permitiendo controlar millones de zones DNS y registros.
Cloud CDN se have en "edge caches" las cuales almacenar información temporal del contenido que consumer los usuarios en los servidores cercanos a los usuarios. El objetivo es acelerar la entrega de contenido a los usuarios y reducir la carga en los origenes del contenido, lo que puede traducirse en me disminución de costes. Adicionalmente tiene integraciones con CDN externos a google
# Conecto redes a VPC
Una forma de hacerlo es una Cloud VPN la cual te permite creer me conexión a través de internet estableciendo un tunel. Este servicio utiliza cloud router para hacer una conexión dinámica. Para  intercambien la información me utiliza Border Gateway Protocol lo que permite conectar al tunel UPN a las subnets que hay en la UPC de forma automática lo cual puede Levantar preocupaciones en el equipo de seguridad y puede dar problemas de bando de ancha
Otra for maes por " Direct peering" el proceso consiste en colocar un router. en el mismo datacenter público de google el cual se encargará del intercambio de información el punto donde se coloca esa google part of presence (POP).
si no estes en un Pop puedes trabajar con un partner en "Carrier Peering program" para conectarte esto permite de acceso directo desde un on-prem a treves de la red del proveedor del servicio, pero no esta cubierto por ningún acuerdo de servicio de google.
Dedicated inter connect permite me o más conexiones directas con google con un SLA del 99.9a%  y se puede apoyar con me VPN para me mayor fiabilidad.
Partner intorconnect permite connect un onmpren ame UPC a través de un proveedor de servicio, muy util para datecenters que por su localización no llega ran a dedicated interconnect y se puede configurar para servicios críticos en sane a disponibilidad el SLA por parte de Google es de 99,9% pero no me hacer responsables de la porte del service provider
Y la última opción es Cross cloud Inter connect que permite establecer conexiones con alto ancho de banda entre Google cloud y otros cloud providers a través de un aconexión fisica

You can assess those requirements by answering three simple questions.

Do any of your on-premises servers or user computers with private addressing need to connect to Google Cloud resources with private addressing?

Do the bandwidth and performance of your current connection to Google services currently meet your business requirements?

And do you already have, or are you willing to install and manage, access and routing equipment in one of Google’s point of presence locations?
If you need private-to-private connectivity and your internet connection meets your business requirements, then building a Cloud VPN is your best bet.

If you don’t need private access and your Internet connection is meeting your business requirements, then you can simply use public IP addresses to connect to Google services.

If you don’t need private address connectivity and your current connection to Google Cloud isn’t performing well, then peering may be your best connectivity option.

Direct Peering is a good option if you already have a footprint in one of Google’s

points of presence, or you’re willing to lease co-location space and install and support routing equipment.

If installing equipment isn’t an option, or you would prefer to work with a service provider

partner as an intermediary to peer with Google, then Carrier Peering is the way to go.

If you need private, high-performance connectivity to Google Cloud, but installing equipment isn’t an option, or you would

prefer to work with a service provider partner as an intermediary, then Partner Interconnect would be the recommended option.

Last but not least, there’s Dedicated Interconnect, which provides you with a private circuit direct to Google.

This is a good option if you already have a footprint or are willing to lease co-lo space and install and support routing equipment, in a Google point of presence.
# Almacenamiento en la nube
# cloud storage
ofrece "object storage" con alta disponibilidad, escalable y canto administrado . El concepto de storage difiere del tradicional de jerarquía de archivos o de Carpetas, estos se almacenan como comprimidos que contienen la forma binaria de los datos y los metadatos ( fecha de creación, autor, permisos...). Para identificar estos objeto se man URL como clave única esto facilite su uso web. Los más connunes para almacenar  son datos de video, fotos y aaudio, grandes objetos, copian de seguridad ...
Los objetos se organizan en buckets, los cuales deben tener un nombre único a nivel global y a lugar donde almacenarlo, idealmente uno con baja latencia. Estos objetos con inmutables , lo que quiere decir que para hacer un cambio hay que subir una nueva versión Y los admin pueden habilitar un control de versiones, con todas sus ventajas clásicas de un vcs.
se pueden aplicar controles con roles IAM y listas de control de acceso para restringir a que puede acceder cada usuario. Los roles se hereda de proyecto abucket y al objeto. Para no incurrir en costes elevados por recuperación de datos se pueda aplicar políticas de administración del control de vida, politicas de borrado de datos automático.
# clases de almacenamiento
- standard storage uso para decretos activos o de corto espacio de vida
- Nearline storage para datos raramente accedidos
- Cold lane storage datos raramente accedidos en este como I vez cada 10 días como máximo.
- Archive storage para accesos inferiores en 1vez al año como copian de seguridad o recuperación ante desan tres.
Caracteristicas comunes son almacenamiento ilimitado si n restricciones de tamaño mínimo y accesibilidad y ubicación global con baja latencia y alta durabilidad APIS comunes y redundancia multi obi regional.
Auto class traslado auto los objetos a la clase más costeffective según sus patrones de acceso.
Los datos se escripts previamente a ser escritos y en el transporte se usa GHTTPS S Tla
Para traspaso la i nforme puesta bycio los se pueden usar transferencias por lotes desde proveedores de servicios en la nube otras regiones de storage o un extremo HTTPS. sino, transfer appliance es un servidor de almacenamiento en bastidores y de alta capacidad de google cloud que permite subir datos desde tu red a un centro de scargue desde el que irán a google Cloud storage
Otros usos es exporter o importer tablas SQ L O big Query y almacenar registros de App Engine, como imagenes, y objetos usados en Compute Engine


# Cloud SQL
ofrece bases de datos relacionales administradas,  escalando venta 128 núcleos 864 GB de RAM y 64 TB de almacenamiento. Admite réplicas automáticas desde una instancia principal SQL una instancia principal externa O instancias externas de MYSQL.  Admite copión de seguridad administradas, teniendo cada instancia hasta 7 copias de seguridad sin costo.
Incluye encriptación de bases de datos firewall de red que contole el acceso a red ya bares de datos. se puede conectar a estas instancias des otros servicios y algunos externos mientras se usen controladores estándar
# spainer
  Servicio administrado de bases de datos. de escalado horizontal con unabase de SQL. Es ideal para bases de datos relaciones de SQL con indices secundarios y uniones, alta disponibilidad coherencia global y muchas operaciones por segundo
# Firestore
base de datos flexible, escalable y NOSQL apta para soluciones web, móviles y servidores
Los datos se almacenan en documentos organizados en colecciones,  estos documentos pueden tener objetos cuidados complejos Y sub colecciones. un documento son conjuntos de pares clave_valor. se indexan de former predeterminada de tal forma que el rendimiento le ve determinado por los resultados de una consulta y no del conjunto de datos. Cuenta con me caché que le permite consultar, leer y escribir datos sin conexión, realizando sincronizaciónes cuando el dispositivo recupera la conexión.
# Big table
Por administrar cargas de macrodatos con baja latencia y altas capacidades de procesamiento como análisis de usuarios y datos financieros. usar si:
- >1 TB de datos semi O estructurados
-  mucho through put y con datos muy consientes
- se trabaja con NOSOL
- Los datos son time-series o tienen un order semántico
- Muchos datos con dotes asincronos o sincronos en tiempo real .
- Algoritmos de Nadine Learning
se usa para entregar datos aaplicaciones, paneles y servicios de datos. Para la transmisión se pueden usar servicios. de procesamiento como Dataflow,spark, storm... O leer y escribir datos en Bigtable por lotes con Hadoop Dataflow Spark o Map Reduce
#Comparación
Pillar capturas I
## Contenedores Into
# Intro
Iaas permite compartir recursos entre desarrolladores usando máquinas virtuales para virtualizar el hardware.  Permitiendo que cada desarrollador tenga su propio entorno.
  Un contenedor brinde escalabilidad independientemente de los cargas de trabajo en Pa as y una capa de abstracción del s is tema operativo y harderare en Iaas
Todo lo que se necesite es un kernel de so que admite conteniación you entorno de ejecución del contenedor , escalade como Paras pero flexible como Iaas.
Los hosts aumentan o reducen la escala, inician o detienen los contenedores en función de la demanda o cuando hay fallos.
# kubernates
sirve para administrar y escalar aplicaciones algador en contenedores. se puede instanciar con GKE, de esta manera se pueden gestiones clusters ( conjunto de nodos). Este sistema se divide en un grupo de componentes principales que me ejecuten como en plano de control y oto grupo de nodos que ejecutar los contenedores. En hubernetes estos nodos son instancias de procesamiento, como una máquina, mientras que un nodo en google cloud es una vion que se ejecuta en compute regina.
habernetes permite definir los nodos de una app y determinar como interactuan entre si. Implementar contenedores en nodos con un wrapper en uno o más contenedores es un Pod. Siendo esta la unidad más pesquería que se puede crear en Cabernetes. Representa un proceso de ejecución en el cister como un componente de una app o toda la app.
Generalmente, se tiene un contenedor por pod, pero si tienes varios contenedores con desperdicios entre ellos puede s empaquetarlos en un solo Pad para poder compartir recursos de red y de datos de we manera más rencillas. Un Pod proporciona una Iprimicia y conjunto de puertos y opciones configurables para ejecutar los contenedores.
Un deployment es un grupo deréplicas del mismo Pod y los mantiene en ejecución incluso cuando falla los nodos en los que se ejecutan , pudiend oser estos componentes de una appo toda la app.
GKE cre a u n balanceador de cargar de red que enraterci el tráfico.
un service define un conjunto lógico de Pods y una politica para acceder a ellos. Permitan establecer Ips fijar a los Pods
Explico comandos básicos archivo de confiy y como hacer rolloves simplificado
# GKE
Entorno gestionado que consta de varias instanc ia s decomp uteengine que se agrupan para formar clusters. Uno de los objetivos del servicio es simplificar el uso de iubernier administrando de forma autónoma todos los componentes del planco de conto).
Expone una Ip a la que no la envian les solicitudes de la API de hubernetes siendo responsable de aprovisionar toda la cinfraestructura del plano de control detrás de él.   La config y administración de nodes dependen del modo GUE que se use.
- Autopilot (recomendado) la infra subyacente como la configuración de nodos escalado, actuali zaciones y redes son gestionadas por el servicio.
- standard el usuario administra la cifra subyacente y la configuracion de nodos individuales.
## Recursos y accesos 
 ## 1. PJerarquia de recursos
 Google Cloud’s resource hierarchy contains four levels, and starting from the bottom up they are: resources, projects, folders, and an organization node.
 ISERTAR JERARQUIA.PNG
 Resources: these represent virtual machines, Cloud Storage buckets, tables in BigQuery, or anything else in Google Cloud.Resources are organized into projects, which sit on the second level.
Projects can be organized into folders, or even subfolders.
And then at the top level is an organization node, which encompasses all the projects, folders, and resources in your organization.

Policies can be defined at the project, folder, and organization node levels. Policies are also inherited downward.
Some Google Cloud services allow policies to be applied to individual resources, too.

Projects are the basis for enabling and using Google Cloud services, like managing APIs, enabling billing, adding and removing collaborators, and enabling other Google services
Each project is a separate entity under the organization node, and each resource belongs to exactly one project. 
Projects can have different owners and users because they’re billed and managed separately
INSERT PROJECTBASIS.PNG

Each Google Cloud project has three identifying attributes: a project ID, a project name, and a project number.
-The project ID is a globally unique identifier assigned by Google that can’t be changed after creation.
-Project names, however, are user-created. They don’t have to be unique and they can be changed at any time, so they are not immutable.
-oogle Cloud also assigns each project a unique project number. Mainly used internally by GC.

Resource Manager tool is designed to programmatically help you manage projects. It’s an API that can gather a list of all the projects associated with an account, create new projects, update existing projects, and delete projects. It can even recover projects that were previously deleted,and can be accessed through the RPC API and the REST API.

Folders let you assign policies to resources at a level of granularity you choose. The resources in a folder inherit policies and permissions assigned to that folder. A folder can contain projects, other folders, or a combination of both.
INSERT FOLDEREXAMPLE.PNG
Folders also give teams the ability to delegate administrative rights so that they can work independently.

To use folders, you must have an organization node.There are some special roles associated with this top-level organization node. For example, you can designate an organization policy administrator so that only people with privilege can change policies. You can also assign a project creator role, which is a great way to control who can create projects and, therefore, who can spend money.
How a new organization node is created depends on whether your company is also a Google Workspace customer.
-If you have a Workspace domain, Google Cloud projects will automatically belong to your organization node.
-Otherwise, you can use Cloud Identity, Google’s identity, access, application, and endpoint management platform, to generate one.
 ## 2. IAM
 When an organization node contains lots of folders, projects, and resources, a workforce might need to restrict who has access to what. When an organization node contains lots of folders, projects, and resources, a workforce might need to restrict who has access to what.
 The “who” or "princiapl" part of an IAM policy can be a Google account, a Google group, a service account, or a Cloud Identity domain.
 An IAM role is a collection of permissions. For example, to manage virtual machine instances in a project, you must be able to create, delete, start, stop and change virtual machines.resulting policy applies to both the chosen element and all the elements below it in the hierarchy. IAM always checks relevant deny policies before checking relevant allow policies. Deny policies, like allow policies, are inherited through the resource hierarchy.
 There are three kinds of roles in IAM: 
 - basic, When applied to a Google Cloud project, they affect all resources in that project.  include owner, editor, viewer, and billing administrator. In addition, project owners can manage the associated roles and permissions and set up billing. Often companies want someone to control the billing for a project but not be able to change the resources in the project. This is possible through a billing administrator role
 - predefined, Specific Google Cloud services offer sets of predefined roles, and they even define where those roles can be applied.
 - custom. many companies use a “least-privilege” model in which each person in your organization is given the minimal amount of privilege needed to do their job. ou’ll need to manage the permissions that define the custom role you’ve created. Because of this, some organizations decide they’d rather use the predefined roles. And second, custom roles can only be applied to either the project level or organization level.
  ## 3. Service accounts
  
Instead of requiring a person to manually grant access each time the program runs, you can give the virtual machine itself the necessary permissions.
This is where service accounts come in.
Service accounts allow you to assign specific permissions to a virtual machine, so it can interact with other cloud services without human intervention.
Service accounts are named with an email address, but instead of passwords they use cryptographic keys to access resources.
Service accounts do need to be managed.
in addition to being an identity, a service account is also a resource, so it can have IAM policies of its own attached to it.
 ## 4. Cloud Identity
 With a tool called Cloud Identity, organizations can define policies and manage their users and groups using the Google Admin Console. Admins can log in and manage Google Cloud resources using the same usernames and passwords they already use in existing Active Directory or LDAP systems.Using Cloud Identity also means that when someone leaves an organization, an administrator can use the Google Admin Console to disable their account and remove them from groups Cloud Identity is available in a free edition and also in a premium edition that provides capabilities to manage mobile devices.
## 5. Google Cloud
First is the Google Cloud console, which is Google Cloud’s graphical user interface, or GUI, that helps you deploy, scale, and diagnose production issues in a simple web-based interface.00:29
With the Google Cloud console, you can easily find your resources, check their health, have full management control over them, and set budgets to control how much you spend on them.
The Google Cloud console also provides a search facility to quickly find resources and connect to instances via SSH in the browser.

Second is through the Google Cloud SDK and Cloud Shell.
 The Google Cloud SDK is a set of tools that you can use to manage resources and applications hosted on Google Cloud.
These include the Google Cloud CLI, which provides the main command-line interface for Google Cloud products and services, and bq, a command-line tool for BigQuery.
Cloud Shell provides command-line access to cloud resources directly from a browser. With Cloud Shell, the Google Cloud SDK gcloud command and other utilities are always installed, available, up to date, and fully authenticated.

The third way to access Google Cloud is through application programming interfaces, or APIs.

And finally, the fourth way to access and interact with Google Cloud is with the Google Cloud app, which can be used to start, stop, and use SSH to connect to Compute Engine instances and see logs from each instance.It also lets you stop and start Cloud SQL instances. Additionally, you can administer applications deployed on App Engine by viewing errors, rolling back deployments, and changing traffic splitting and billing.

---

## CApplications in the cloud
## Cloud Run
Cloud Run, which is a managed compute platform that runs stateless containers via web requests or Pub/Sub events. Cloud Run is serverless, it removes all infrastructure management tasks so you can focus on developing applications. 

It’s built on Knative, an open API and runtime environment built on Kubernetes, can be fully managed on Google Cloud, on Google Kubernetes Engine, or anywhere Knative runs.
It can automatically scale up and down from zero almost instantaneously, and it charges only for the resources used, calculated down to the nearest 100 milliseconds, so you‘ll never pay for over-provisioned resources.

The Cloud Run developer workflow is a straightforward three-step process.
First, you write your application using your favorite programming language.This application should start a server that listens for web requests.
Second, you build and package your application into a container image.
And third, the container image is pushed to Artifact Registry, where Cloud Run will deploy it.
Once you’ve deployed your container image, you’ll get a unique HTTPS URL back.
Cloud Run then starts your container on demand to handle requests, and ensures that all incoming requests are handled by dynamically adding and removing containers.

You can use a container-based workflow, as well as a source-based workflow.
The source-based approach will deploy source code instead of a container image.
Cloud Run then builds the source and packages the application into a container image.
Cloud Run does this using Buildpacks - an open source project.
You can use Cloud Run to run any binary, as long as it’s compiled for Linux sixty-four bit.
Now, this means you can use Cloud Run to run web applications written using popular languages, such as: Java, Python, Node.js, PHP, Go, C++, Cobol, Haskell, and Perl

<Insertar CRBilling.png>
The pricing model on Cloud Run is unique; as you only pay for the system resources you use
while a container is handling web requests, with a granularity of 100ms, and when it’s starting or shutting down.
You don’t pay for anything if your container doesn’t handle requests.
Additionally, there is a small fee for every one million requests you serve.
The price of container time increases with CPU and memory.
A container with more vCPU and memory is more expensive.

## Development in the cloud
Cloud Run functions is a lightweight, event-based, asynchronous compute solution that allows you to create small, single-purpose functions that respond to cloud events, without the need to manage a server or a runtime environment.
Cloud Run functions can also connect and extend cloud services, ou’re billed to the nearest 100 milliseconds, but only while your code is running.Cloud Run functions supports writing source code in a number of programming languages. These include Node.js, Python, Go, Java, .Net Core, Ruby, and PHP.Events from Cloud Storage and Pub/Sub can trigger Cloud Run functions asynchronously, or you can use HTTP invocation for synchronous execution

## Prompt Engineer
Generative AI encompasses a broader range of models capable of generating various types of content beyondjust text, while LLM specifically refers to a subset of generative AI models focusing on language tasks.

Generative artificial intelligence, which is commonly referred to as gen AI, is a subset of artificial intelligence that is capable of creating text, images, or other data using generative models, often in response to prompts. gen AI models are like conversational programs that can generate content based on the inputs supplied. Gen AI models learn the patterns and structure from input training data and then create new data with similar characteristics.

Large language models refer to large, general-purpose language models that can be pre-trained and then fine-tuned for specific purposes. Parameters are the memories and knowledge that the machine has learned during model training. They determine the ability of a model to solve a problem, such as predicting text, and can reach billions or even trillions in size.General-purpose means that the models can sufficiently solve common problems. When you submit a prompt to an LLM, it calculates the probability of the correct answer from its pre-trained model. Pre-training an LLM involves feeding a massive dataset of text, images, and code to the model so that it can learn the underlying structure and patterns of the language.
But sometimes the LLM gives a completely wrong answer. This is called a hallucination. This happens because LLMs can only understand the information they were trained on. To make matters worse, LLMs only understand the information that is explicitly given to them in the prompt. In other words, they often assume that the prompt is true.
Hallucinations can be caused by a number of factors, including: 
The model is not trained on enough data.
The model is trained on noisy or dirty data.
The model is not given enough context.
The model is not given enough constraints.

A prompt is the text that you feed to the model, and prompt engineering is a way of articulating your prompts to get the best response from the model.
Zero-shot prompts do not contain any context or examples to assist the model. “What’s the capital of France?” for more specific and technical prompts, an example would help refine the scope of the response from Gemini.
One-shot prompts, however, provide one example to the model for context.
And few-shot prompts provide at least two examples to the model for context.
role prompts which require a frame of reference for the model to work from as it answers the questions.

 The preamble refers to the introductory text you provide to give the model context and instructions before your main question or request. Think of it as setting the stage for theLLM to better understand what you want. It can include the context for the task, the task itself, and some examples to guide the model. Theinput is the central request you're making to the LLM. It’s what the instruction or task will act upon, for example “Comment: I don’t know whatto think about the video. The review is:” Based on the preamble, Gemini reviews the input and suggests if the review is positive, neutral, or negative.
 <insert preamble.png>

 The first best practice is to write detailed and explicit instructions.
 define boundaries for the prompt.
 If the model gets stuck, give it a few 'fallback' outputs that work in various situations.
 adopt a persona for your input.
  keep each sentence concise.
# Apuntes: DevOps Engineer SRE - Google Cloud - Cloud Fundamentals

---

## CLOUD FUNDAMENTALS

### INTRODUCCIÓN

#### 1. IaaS, PaaS y SaaS

##### IaaS (Infraestructura como Servicio)
- **¿Qué es?**: Proporciona acceso a recursos puros de computación, almacenamiento y red.
- **Modelo de pago**: Los clientes pagan por los recursos que **asignan por adelantado**, independientemente de su uso.
- **Ejemplo**: Máquinas virtuales en Compute Engine.

##### PaaS (Plataforma como Servicio)
- **¿Qué es?**: Vincula el código a librerías que dan acceso a la infraestructura que la aplicación necesita. Permite centrarse más en la lógica de la aplicación.
- **Modelo de pago**: Los clientes pagan por los recursos que **realmente utilizan**.
- **Ejemplo**: App Engine.

##### Diferencia entre PaaS y Serverless

Aunque relacionados, representan distintos niveles de abstracción:

**PaaS (Plataforma como Servicio)**:
- **Abstracción**: Te abstrae del sistema operativo y el hardware, pero sigues gestionando *instancias* o *aplicaciones* que están corriendo continuamente.
- **Escalado**: Escala bien, pero a menudo necesitas configurar reglas de autoescalado y puede que no escale a cero (sigues pagando por una instancia mínima).
- **Control**: Tienes más control sobre el entorno de ejecución.
- **Ejemplo**: Desplegar una aplicación completa en App Engine.

**Serverless (Computación sin servidor)**:
- **Abstracción**: Es el siguiente nivel. Te abstraes completamente de los servidores. Solo te preocupas por el código (funciones) o el contenedor.
- **Escalado**: Escala automáticamente desde cero hasta miles de peticiones, y vuelve a cero. Es ideal para cargas de trabajo impredecibles.
- **Control**: Menos control sobre el entorno, ya que es totalmente gestionado.
- **Modelo de pago**: **Pago por ejecución**. Si tu código no se ejecuta, no pagas nada.
- **Ejemplo**: Cloud Functions (código basado en eventos) o Cloud Run (contenedores).

##### SaaS (Software como Servicio)
- **¿Qué es?**: Proporciona una aplicación completa basada en la nube que los usuarios finales consumen directamente a través de internet.
- **Ejemplo**: Gmail, Google Docs, Google Drive.

#### 2. Red de Google Cloud

La red global de Google está diseñada para ofrecer el **máximo rendimiento y la menor latencia posible** utilizando más de 100 nodos de caché de contenido en todo el mundo.

##### Regiones y Zonas
- **Región**: Un área geográfica independiente.
- **Zona**: Un área de despliegue de recursos **dentro de una región**. Las zonas están aisladas entre sí para proteger contra fallos.

> **Ejemplo**: La región de Londres (`europe-west2`) se compone de tres zonas: `europe-west2-a`, `europe-west2-b` y `europe-west2-c`.

Desplegar recursos en múltiples zonas o regiones aumenta la disponibilidad y protege contra desastres.

##### Recursos Multi-región
Algunos servicios, como **Spanner**, permiten replicar datos no solo en múltiples zonas, sino en múltiples regiones, ofreciendo una resiliencia y disponibilidad globales.

*INSERTAR Spanner.png*

#### 3. Impacto Medioambiental

Los centros de datos consumen aproximadamente el **2% de la electricidad mundial**. Google se enfoca en la eficiencia energética y la sostenibilidad para minimizar este impacto.

#### 4. Seguridad por Capas

La infraestructura de seguridad de Google se organiza en capas progresivas:

##### 1. Capa de Infraestructura de Hardware
- **Diseño y Procedencia del Hardware**: Google diseña su propio hardware, incluyendo servidores, equipos de red y chips de seguridad personalizados (como el chip Titan).
- **Arranque Seguro (Secure Boot Stack)**: Se utilizan firmas criptográficas en BIOS, bootloader, kernel y el sistema operativo base para asegurar que solo se ejecuta software verificado.
- **Seguridad Física de las Instalaciones**: Google diseña y construye sus propios centros de datos con múltiples capas de protección física.

##### 2. Capa de Despliegue de Servicios
- **Cifrado en Tránsito**: La comunicación entre servicios (llamadas RPC) se cifra automáticamente para garantizar la privacidad e integridad de los datos en la red, especialmente cuando viajan entre centros de datos.

*INSERTAR RPC.png*

##### 3. Capa de Identidad de Usuario
- **Servicio Central de Identidad**: Gestiona la autenticación de los usuarios y empleados, aplicando medidas como el **segundo factor de autenticación (2FA/U2F)** y analizando el contexto del inicio de sesión (dispositivo, ubicación, etc.).

##### 4. Capa de Servicios de Almacenamiento
- **Cifrado en Reposo (Encryption at Rest)**: Todos los datos almacenados en los servicios de Google se cifran por defecto. Se utiliza cifrado por hardware en los discos duros y SSDs para un rendimiento óptimo.

##### 5. Capa de Comunicación por Internet
- **Google Front End (GFE)**: Es el servicio que gestiona todo el tráfico entrante desde internet.
    - Termina las conexiones **TLS** de forma segura.
    - Utiliza certificados de autoridades certificadoras (CA).
    - Implementa **Perfect Forward Secrecy**.
    - Aplica protecciones contra ataques de **Denegación de Servicio (DoS)**.

##### 6. Capa de Seguridad Operacional
- **Detección de Intrusiones**: Se utilizan reglas y machine learning para alertar a los equipos de seguridad sobre posibles incidentes.
- **Reducción del Riesgo Interno (Insider Risk)**: Se limita y monitoriza activamente el acceso administrativo de los empleados a la infraestructura.
- **Uso de U2F para Empleados**: Para proteger contra ataques de phishing, las cuentas de los empleados requieren el uso de llaves de seguridad compatibles con U2F.
- **Prácticas de Desarrollo de Software Seguras**:
    - Revisión de código por dos personas.
    - Librerías internas para prevenir vulnerabilidades comunes.
    - Programa de recompensas por bugs (Bug Bounty).

#### 5. Ecosistema Open Source

Para evitar el "vendor lock-in" (dependencia de un solo proveedor), Google Cloud se apoya fuertemente en el ecosistema de código abierto, permitiendo a los clientes migrar sus aplicaciones si lo necesitan.

- **TensorFlow**: Librería de software open source para Machine Learning desarrollada por Google.
- **Kubernetes (GKE)**: Permite orquestar microservicios y distribuirlos entre diferentes nubes.
- **Google Cloud Observability**: Permite monitorizar cargas de trabajo que se ejecutan en múltiples proveedores de nube.

#### 6. Precios y Facturación (Pricing and Billing)

##### Modelos de Precios Clave
- **Facturación por segundo**: Google fue pionero en este modelo para sus servicios IaaS. Se aplica a:
    - Compute Engine (IaaS)
    - Google Kubernetes Engine (GKE)
    - Dataproc (Big Data)
    - App Engine Flexible Environment (PaaS)
- **Descuentos por uso continuo (Sustained-use discounts)**: Descuentos automáticos que se aplican al ejecutar una VM durante más del 25% del mes. A más uso, mayor descuento.
- **Tipos de máquinas personalizadas (Custom VM types)**: Permite ajustar con precisión la vCPU y la memoria de una VM para optimizar el coste según la necesidad de la aplicación.

##### Herramientas de Control de Costes
- **Presupuestos (Budgets)**:
    - Se pueden definir a nivel de cuenta de facturación o por proyecto.
    - Pueden ser un límite fijo o un porcentaje del gasto del mes anterior.
- **Alertas (Alerts)**:
    - Notifican cuando el gasto se acerca al límite del presupuesto.
    - Se pueden configurar en porcentajes (ej. 50%, 90%, 100%) o valores personalizados.
- **Informes (Reports)**: Herramienta visual en la consola para monitorizar gastos por proyecto o servicio.
- **Calculadora de precios online**: Para estimar costes.

##### Cuotas (Quotas)
Las cuotas están diseñadas para prevenir el consumo excesivo de recursos (por error o ataque), protegiendo tanto al cliente como a la comunidad de Google Cloud. Se aplican a nivel de proyecto.

- **Cuotas de Tasa (Rate Quotas)**:
    - Limitan la cantidad de acciones en un período de tiempo.
    - **Ejemplo**: 3.000 llamadas a la API de GKE cada 100 segundos. Se resetea pasado el tiempo.
- **Cuotas de Asignación (Allocation Quotas)**:
    - Limitan el número total de recursos que puedes tener.
    - **Ejemplo**: Un máximo de 15 redes VPC por proyecto.
- **Aumento de Cuotas**: Se puede solicitar un aumento a través del soporte de Google Cloud.

---

### RECURSOS Y ACCESO A LA NUBE

#### 1. Jerarquía de Recursos

La jerarquía de recursos de Google Cloud contiene cuatro niveles, empezando desde abajo hacia arriba: recursos, proyectos, carpetas y un nodo de organización.

*INSERTAR JERARQUIA.PNG*

##### Recursos
Representan máquinas virtuales, buckets de Cloud Storage, tablas en BigQuery o cualquier otro elemento en Google Cloud. Los recursos se organizan en proyectos, que están en el segundo nivel.

##### Proyectos
Los proyectos pueden organizarse en carpetas o incluso subcarpetas. En el nivel superior está el nodo de organización, que engloba todos los proyectos, carpetas y recursos de tu organización.

Las políticas se pueden definir a nivel de proyecto, carpeta y nodo de organización. Las políticas también se heredan hacia abajo. Algunos servicios de Google Cloud permiten aplicar políticas a recursos individuales también.

Los proyectos son la base para habilitar y usar servicios de Google Cloud, como gestionar APIs, habilitar facturación, agregar y eliminar colaboradores, y habilitar otros servicios de Google. Cada proyecto es una entidad separada bajo el nodo de organización, y cada recurso pertenece exactamente a un proyecto. Los proyectos pueden tener diferentes propietarios y usuarios porque se facturan y gestionan por separado.

*INSERT PROJECTBASIS.PNG*

Cada proyecto de Google Cloud tiene tres atributos de identificación: un ID de proyecto, un nombre de proyecto y un número de proyecto.

- **ID de proyecto**: Es un identificador único global asignado por Google que no se puede cambiar después de la creación.
- **Nombre de proyecto**: Son creados por el usuario. No tienen que ser únicos y se pueden cambiar en cualquier momento, por lo que no son inmutables.
- **Número de proyecto**: Google Cloud también asigna a cada proyecto un número de proyecto único. Utilizado principalmente de forma interna por GC.

##### Resource Manager
La herramienta Resource Manager está diseñada para ayudarte a gestionar proyectos de forma programática. Es una API que puede recopilar una lista de todos los proyectos asociados con una cuenta, crear nuevos proyectos, actualizar proyectos existentes y eliminar proyectos. Incluso puede recuperar proyectos que fueron eliminados previamente, y se puede acceder a través de la API RPC y la API REST.

##### Carpetas (Folders)
Las carpetas te permiten asignar políticas a recursos al nivel de granularidad que elijas. Los recursos en una carpeta heredan políticas y permisos asignados a esa carpeta. Una carpeta puede contener proyectos, otras carpetas o una combinación de ambos.

*INSERT FOLDEREXAMPLE.PNG*

Las carpetas también dan a los equipos la capacidad de delegar derechos administrativos para que puedan trabajar de forma independiente.

##### Nodo de Organización
Para usar carpetas, debes tener un nodo de organización. Hay algunos roles especiales asociados con este nodo de organización de nivel superior. Por ejemplo, puedes designar un administrador de políticas de organización para que solo las personas con privilegios puedan cambiar políticas. También puedes asignar un rol de creador de proyectos, que es una excelente manera de controlar quién puede crear proyectos y, por lo tanto, quién puede gastar dinero.

La forma en que se crea un nuevo nodo de organización depende de si tu empresa también es cliente de Google Workspace.
- Si tienes un dominio de Workspace, los proyectos de Google Cloud pertenecerán automáticamente a tu nodo de organización.
- De lo contrario, puedes usar Cloud Identity, la plataforma de gestión de identidad, acceso, aplicaciones y puntos finales de Google, para generar uno.

#### 2. IAM (Identity and Access Management)

Cuando un nodo de organización contiene muchas carpetas, proyectos y recursos, una fuerza laboral podría necesitar restringir quién tiene acceso a qué.

La parte "quién" o "principal" de una política IAM puede ser una cuenta de Google, un grupo de Google, una cuenta de servicio o un dominio de Cloud Identity.

##### Roles IAM
Un rol IAM es una colección de permisos. Por ejemplo, para gestionar instancias de máquinas virtuales en un proyecto, debes poder crear, eliminar, iniciar, detener y cambiar máquinas virtuales. La política resultante se aplica tanto al elemento elegido como a todos los elementos debajo de él en la jerarquía. IAM siempre verifica las políticas de denegación relevantes antes de verificar las políticas de permiso relevantes. Las políticas de denegación, al igual que las políticas de permiso, se heredan a través de la jerarquía de recursos.

Hay tres tipos de roles en IAM:

- **Básicos (Basic)**: Cuando se aplican a un proyecto de Google Cloud, afectan a todos los recursos en ese proyecto. Incluyen propietario (owner), editor, visor (viewer) y administrador de facturación (billing administrator). Además, los propietarios de proyectos pueden gestionar los roles y permisos asociados y configurar la facturación. A menudo, las empresas quieren que alguien controle la facturación de un proyecto pero no pueda cambiar los recursos del proyecto. Esto es posible a través de un rol de administrador de facturación.

- **Predefinidos (Predefined)**: Servicios específicos de Google Cloud ofrecen conjuntos de roles predefinidos, e incluso definen dónde se pueden aplicar esos roles.

- **Personalizados (Custom)**: Muchas empresas utilizan un modelo de "mínimo privilegio" en el que a cada persona en tu organización se le da el mínimo de privilegio necesario para hacer su trabajo. Necesitarás gestionar los permisos que definen el rol personalizado que has creado. Debido a esto, algunas organizaciones deciden que prefieren usar los roles predefinidos. En segundo lugar, los roles personalizados solo se pueden aplicar a nivel de proyecto u organización.

#### 3. Cuentas de Servicio (Service Accounts)

En lugar de requerir que una persona otorgue acceso manualmente cada vez que se ejecuta el programa, puedes darle a la máquina virtual en sí los permisos necesarios.

Aquí es donde entran las cuentas de servicio. Las cuentas de servicio permiten asignar permisos específicos a una máquina virtual, para que pueda interactuar con otros servicios en la nube sin intervención humana.

Las cuentas de servicio se nombran con una dirección de correo electrónico, pero en lugar de contraseñas utilizan claves criptográficas para acceder a recursos. Las cuentas de servicio necesitan ser gestionadas.

Además de ser una identidad, una cuenta de servicio también es un recurso, por lo que puede tener políticas IAM propias adjuntas a ella.

#### 4. Cloud Identity

Con una herramienta llamada Cloud Identity, las organizaciones pueden definir políticas y gestionar sus usuarios y grupos utilizando la Consola de Administración de Google. Los administradores pueden iniciar sesión y gestionar recursos de Google Cloud utilizando los mismos nombres de usuario y contraseñas que ya usan en sistemas Active Directory o LDAP existentes.

Usar Cloud Identity también significa que cuando alguien deja una organización, un administrador puede usar la Consola de Administración de Google para deshabilitar su cuenta y eliminarlos de grupos. Cloud Identity está disponible en una edición gratuita y también en una edición premium que proporciona capacidades para gestionar dispositivos móviles.

#### 5. Formas de Interactuar con Google Cloud

##### 1. Consola de Google Cloud
La primera es la consola de Google Cloud, que es la interfaz gráfica de usuario (GUI) de Google Cloud, que te ayuda a implementar, escalar y diagnosticar problemas de producción en una interfaz web simple.

Con la consola de Google Cloud, puedes encontrar fácilmente tus recursos, verificar su estado, tener control de gestión completo sobre ellos y establecer presupuestos para controlar cuánto gastas en ellos. La consola de Google Cloud también proporciona una facilidad de búsqueda para encontrar rápidamente recursos y conectarse a instancias a través de SSH en el navegador.

##### 2. Google Cloud SDK y Cloud Shell
El Google Cloud SDK es un conjunto de herramientas que puedes usar para gestionar recursos y aplicaciones alojadas en Google Cloud. Estas incluyen Google Cloud CLI, que proporciona la interfaz de línea de comandos principal para productos y servicios de Google Cloud, y bq, una herramienta de línea de comandos para BigQuery.

Cloud Shell proporciona acceso de línea de comandos a recursos en la nube directamente desde un navegador. Con Cloud Shell, el comando gcloud del SDK de Google Cloud y otras utilidades siempre están instalados, disponibles, actualizados y completamente autenticados.

##### 3. APIs (Interfaces de Programación de Aplicaciones)
La tercera forma de acceder a Google Cloud es a través de interfaces de programación de aplicaciones o APIs.

##### 4. Aplicación de Google Cloud
Y finalmente, la cuarta forma de acceder e interactuar con Google Cloud es con la aplicación de Google Cloud, que se puede usar para iniciar, detener y usar SSH para conectarse a instancias de Compute Engine y ver registros de cada instancia. También te permite detener e iniciar instancias de Cloud SQL. Además, puedes administrar aplicaciones implementadas en App Engine viendo errores, revirtiendo implementaciones y cambiando la división de tráfico y facturación.

---

### MÁQUINAS VIRTUALES Y REDES EN LA NUBE

#### 1. Redes en la Nube Privada (VPC - Virtual Private Cloud)

**VPC** = Modelo de computación en nube privada individual y segura alojado dentro de una nube pública.

Te permiten hacer exactamente las mismas cosas que harías en una nube privada (On-premises), con las ventajas de una nube pública (escalabilidad, aislamiento, etc.).

Las VPCs conectan recursos de Google Cloud entre sí y con internet:
- Segmentación de redes
- Uso de reglas de firewall para restringir el tráfico a instancias
- Reenvío de tráfico a rutas específicas

Las VPCs son globales y pueden tener subredes en cualquier región de Google Cloud, lo que facilita definir diseños de red con alcance global.

El tamaño de una subred se puede expandir aumentando el rango de direcciones IP asignadas a ella. Dos subredes en la misma VPC se consideran vecinas incluso si están en diferentes zonas o regiones.

#### 2. Compute Engine

**Compute Engine** es IaaS utilizado para crear y ejecutar máquinas virtuales en la infraestructura de Google, sin pago por adelantado, con capacidades de crecimiento horizontal y vertical. Pueden ejecutar imágenes de Windows Server, Linux o cualquier imagen personalizada que se le indique.

En el marketplace hay paquetes preconfigurados que se pueden utilizar sin coste, pero también existen paquetes que tienen costes mensuales.

##### Facturación
La facturación por uso es por segundo y cuenta con descuentos por uso sostenido que se aplican de manera automática, a partir del 25% de la duración del mes. 

También existen descuentos para usos con compromisos, es decir, para cargas predecibles que se mantengan en ciertos rangos de consumo como uso de CPU, memoria, etc. 

Finalmente existen máquinas con descuento "spot" y "preemptible" que se usan para cargas puntuales como ejecuciones por lotes. Estas tienen como condición que el job que se ejecute tenga capacidades para ser reiniciado. Las máquinas spot pueden correr indefinidamente, mientras que las preemptible solo hasta 24 horas.

Para el almacenamiento, el throughput es elevado independientemente de la máquina y no incluye costes extra.

#### 3. Escalado de Máquinas Virtuales

**Auto scaling** permite añadir o eliminar VMs en tiempo de ejecución. Existen dos tipos de escalado:
- **Escalado horizontal (hacia afuera)**: Más máquinas
- **Escalado vertical**: Más recursos en las máquinas existentes

El máximo número de CPUs por VM (máquinas de familias) se limita por la cuota asignada al usuario, la cual es dependiente de la zona.

#### 4. Compatibilidades de Virtual Private Cloud

##### Tablas de Enrutamiento
Estas son built-in, así que no hace falta crearlas, mantenerlas ni gestionarlas. Se encargan de hacer el reenvío entre instancias o zonas y no necesitan una IP externa.

##### Firewall
Tampoco hace falta tener un Firewall porque ya lo tienen built-in sin necesidad de enrutamiento o gestión, permitiendo restringir el acceso a instancias a través de reglas las cuales se pueden definir con network tags. Por ejemplo, etiquetas los servidores web con "web" y pones una regla para ese tag.

##### VPC Peering
VPC peering permite establecer relaciones entre VPCs. Recordando que es un servicio global, lo que permite conectar diferentes proyectos.

##### Shared VPC
Shared VPC se puede usar para establecer políticas y controles IAM para definir qué o quién puede acceder a qué entre la VPC de un proyecto y otro.

#### 5. Balanceadores de Carga

Permiten distribuir el tráfico de usuarios entre varias instancias de una aplicación, reduciendo adicionalmente riesgos de sobrecarga de instancias. Es un servicio software, completamente gestionado, pudiendo ser de una sola región o de varias, incluyendo el multi-region fail over automático.

Trabajan en:
- **Capa 7 - Application Layer (HTTP/S)**: Trabaja de forma externa (global y regional) e interna (regional y multi-región)
- **Capa 4 - TCP/UDP/otros**: Estos son los balanceadores de carga de red, pudiendo ser:
    - **Proxy (y proxy inverso)**: El cual de nuevo puede ser externo o interno
    - **Pass through**: A diferencia del proxy, este ni termina conexiones ni las modifica. Directamente hace forward al backend manteniendo la IP origen inicial

#### 6. Cloud DNS y CDN

##### Cloud DNS
DNS se encarga de transformar IPs en host names. Cloud DNS es un servicio gestionado de baja latencia y alta disponibilidad que permite a los usuarios acceder a tu servicio. La información DNS que publica un usuario es servida desde ubicaciones redundantes de todo el mundo. Este servicio es programable, permitiendo controlar millones de zonas DNS y registros.

##### Cloud CDN
Cloud CDN se basa en "edge caches", las cuales almacenan información temporal del contenido que consumen los usuarios en los servidores cercanos a ellos. El objetivo es acelerar la entrega de contenido a los usuarios y reducir la carga en los orígenes del contenido, lo que puede traducirse en una disminución de costes. Adicionalmente tiene integraciones con CDN externos a Google.

#### 7. Conectar Redes a VPC

Puedes evaluar tus requisitos respondiendo tres preguntas simples:

1. ¿Alguno de tus servidores on-premises o computadoras de usuarios con direccionamiento privado necesita conectarse a recursos de Google Cloud con direccionamiento privado?

2. ¿El ancho de banda y el rendimiento de tu conexión actual a los servicios de Google cumplen actualmente con tus requisitos empresariales?

3. ¿Ya tienes, o estás dispuesto a instalar y gestionar, equipos de acceso y enrutamiento en una de las ubicaciones de puntos de presencia de Google?

##### Cloud VPN
Una forma de hacerlo es a través de Cloud VPN, la cual te permite crear una conexión a través de internet estableciendo un túnel. Este servicio utiliza Cloud Router para hacer una conexión dinámica. Para intercambiar información se utiliza Border Gateway Protocol, lo que permite conectar el túnel VPN a las subredes que hay en la VPC de forma automática, lo cual puede levantar preocupaciones en el equipo de seguridad y puede dar problemas de ancho de banda.

**Cuándo usar Cloud VPN**: Si necesitas conectividad privada a privada y tu conexión a internet cumple con tus requisitos empresariales, entonces construir una Cloud VPN es tu mejor opción.

##### Direct Peering
Otra forma es por "Direct peering". El proceso consiste en colocar un router en el mismo datacenter público de Google, el cual se encargará del intercambio de información en el punto donde se coloca, llamado "Google Point of Presence" (POP).

**Cuándo usar Direct Peering**: Es una buena opción si ya tienes presencia en uno de los puntos de presencia de Google, o estás dispuesto a arrendar espacio de co-ubicación e instalar y mantener equipos de enrutamiento.

##### Carrier Peering
Si no estás en un POP, puedes trabajar con un partner en el "Carrier Peering program" para conectarte. Esto permite acceso directo desde un on-prem a través de la red del proveedor del servicio, pero no está cubierto por ningún acuerdo de nivel de servicio de Google.

**Cuándo usar Carrier Peering**: Si instalar equipos no es una opción, o prefieres trabajar con un proveedor de servicios partner como intermediario para hacer peering con Google.

##### Partner Interconnect
Partner Interconnect permite conectar un on-premises a una VPC a través de un proveedor de servicio. Muy útil para datacenters que por su localización no pueden llegar a Dedicated Interconnect. Se puede configurar para servicios críticos en cuanto a disponibilidad. El SLA por parte de Google es del 99,9%, pero no se hacen responsables de la parte del proveedor de servicios.

**Cuándo usar Partner Interconnect**: Si necesitas conectividad privada de alto rendimiento a Google Cloud, pero instalar equipos no es una opción, o prefieres trabajar con un proveedor de servicios partner como intermediario.

##### Dedicated Interconnect
Dedicated Interconnect permite una o más conexiones directas con Google con un SLA del 99,9% y se puede apoyar con una VPN para una mayor fiabilidad.

**Cuándo usar Dedicated Interconnect**: Proporciona un circuito privado directo a Google. Es una buena opción si ya tienes presencia o estás dispuesto a arrendar espacio de co-ubicación e instalar y mantener equipos de enrutamiento en un punto de presencia de Google.

##### Cross-Cloud Interconnect
La última opción es Cross-Cloud Interconnect, que permite establecer conexiones con alto ancho de banda entre Google Cloud y otros proveedores de nube a través de una conexión física.

**Decisión simplificada**:
- Si no necesitas acceso privado y tu conexión a internet cumple con tus requisitos empresariales, simplemente puedes usar direcciones IP públicas para conectarte a los servicios de Google.
- Si no necesitas conectividad de direcciones privadas y tu conexión actual a Google Cloud no está funcionando bien, entonces peering puede ser tu mejor opción de conectividad.

---

### ALMACENAMIENTO EN LA NUBE

#### 1. Cloud Storage

Cloud Storage ofrece "object storage" (almacenamiento de objetos) con alta disponibilidad, escalable y completamente administrado. El concepto de storage difiere del tradicional de jerarquía de archivos o carpetas. Los objetos se almacenan como contenedores comprimidos que contienen la forma binaria de los datos y los metadatos (fecha de creación, autor, permisos, etc.).

Para identificar estos objetos se usan URLs como clave única, lo que facilita su uso web. Los más comunes para almacenar son datos de video, fotos y audio, grandes objetos y copias de seguridad.

##### Buckets
Los objetos se organizan en buckets, los cuales deben tener un nombre único a nivel global y especificar el lugar donde almacenarlos, idealmente uno con baja latencia.

##### Inmutabilidad y Versionado
Estos objetos son inmutables, lo que quiere decir que para hacer un cambio hay que subir una nueva versión. Los administradores pueden habilitar un control de versiones, con todas sus ventajas clásicas de un sistema de control de versiones (VCS).

##### Control de Acceso
Se pueden aplicar controles con roles IAM y listas de control de acceso para restringir a qué puede acceder cada usuario. Los roles se heredan de proyecto a bucket y al objeto.

##### Gestión del Ciclo de Vida
Para no incurrir en costes elevados por recuperación de datos, se pueden aplicar políticas de administración del ciclo de vida, políticas de borrado de datos automático.

#### 2. Clases de Almacenamiento

##### Standard Storage
Uso para datos activos o de corto tiempo de vida.

##### Nearline Storage
Para datos raramente accedidos (menos de una vez al mes).

##### Coldline Storage
Datos raramente accedidos, como máximo una vez cada 90 días.

##### Archive Storage
Para accesos inferiores a 1 vez al año, como copias de seguridad o recuperación ante desastres.

##### Características Comunes
- Almacenamiento ilimitado sin restricciones de tamaño mínimo
- Accesibilidad y ubicación global con baja latencia y alta durabilidad
- APIs comunes
- Redundancia multi-región

##### Autoclass
Autoclass traslada automáticamente los objetos a la clase más cost-effective según sus patrones de acceso.

#### 3. Seguridad

Los datos se encriptan previamente a ser escritos y en el transporte se usa HTTPS/TLS.

#### 4. Transferencia de Datos

Para traspasar información al servicio, se pueden usar:
- Transferencias por lotes desde proveedores de servicios en la nube
- Otras regiones de storage o un extremo HTTPS
- **Transfer Appliance**: Un servidor de almacenamiento en bastidor de alta capacidad de Google Cloud que permite subir datos desde tu red a un centro de carga, desde el que irán a Google Cloud Storage

#### 5. Otros Usos

- Exportar o importar tablas SQL o BigQuery
- Almacenar registros de App Engine
- Almacenar imágenes y objetos usados en Compute Engine

#### 6. Cloud SQL

Cloud SQL ofrece bases de datos relacionales administradas, escalando hasta 128 núcleos, 864 GB de RAM y 64 TB de almacenamiento. Admite réplicas automáticas desde una instancia principal SQL, una instancia principal externa o instancias externas de MySQL. Admite copias de seguridad administradas, teniendo cada instancia hasta 7 copias de seguridad sin costo.

##### Seguridad
Incluye encriptación de bases de datos y firewall de red que controla el acceso a la red y a las bases de datos. Se puede conectar a estas instancias desde otros servicios y algunos externos mientras se usen controladores estándar.

#### 7. Spanner

Servicio administrado de bases de datos de escalado horizontal con una base de SQL. Es ideal para bases de datos relacionales de SQL con índices secundarios y uniones, alta disponibilidad, coherencia global y muchas operaciones por segundo.

#### 8. Firestore

Base de datos flexible, escalable y NoSQL apta para soluciones web, móviles y servidores.

##### Estructura de Datos
Los datos se almacenan en documentos organizados en colecciones. Estos documentos pueden tener objetos anidados complejos y subcolecciones. Un documento son conjuntos de pares clave-valor.

##### Rendimiento
Se indexan de forma predeterminada de tal forma que el rendimiento se ve determinado por los resultados de una consulta y no del conjunto de datos.

##### Modo Offline
Cuenta con una caché que permite consultar, leer y escribir datos sin conexión, realizando sincronizaciones cuando el dispositivo recupera la conexión.

#### 9. BigTable

Para administrar cargas de macrodatos con baja latencia y altas capacidades de procesamiento, como análisis de usuarios y datos financieros.

##### Cuándo Usar BigTable
- Más de 1 TB de datos semi o estructurados
- Mucho throughput y con datos muy consistentes
- Se trabaja con NoSQL
- Los datos son time-series o tienen un orden semántico
- Muchos datos con flujos asíncronos o síncronos en tiempo real
- Algoritmos de Machine Learning

##### Integración
Se usa para entregar datos a aplicaciones, paneles y servicios de datos. Para la transmisión se pueden usar servicios de procesamiento como Dataflow, Spark, Storm, etc. O leer y escribir datos en BigTable por lotes con Hadoop, Dataflow, Spark o MapReduce.

#### 10. Comparación de Opciones de Almacenamiento

*Revisar capturas de comparación*

---

### CONTENEDORES EN LA NUBE

#### 1. Introducción a Contenedores

IaaS permite compartir recursos entre desarrolladores usando máquinas virtuales para virtualizar el hardware, permitiendo que cada desarrollador tenga su propio entorno.

Un contenedor brinda escalabilidad independientemente de las cargas de trabajo en PaaS y una capa de abstracción del sistema operativo y hardware en IaaS.

Todo lo que se necesita es un kernel de sistema operativo que admita contenerización y un entorno de ejecución del contenedor. Escala como PaaS pero es flexible como IaaS.

Los hosts aumentan o reducen la escala, inician o detienen los contenedores en función de la demanda o cuando hay fallos.

#### 2. Kubernetes

Kubernetes sirve para administrar y escalar aplicaciones alojadas en contenedores. Se puede instanciar con GKE (Google Kubernetes Engine), de esta manera se pueden gestionar clusters (conjunto de nodos).

##### Arquitectura
Este sistema se divide en un grupo de componentes principales que se ejecutan como plano de control y otro grupo de nodos que ejecutan los contenedores. En Kubernetes, estos nodos son instancias de procesamiento, como una máquina, mientras que un nodo en Google Cloud es una VM que se ejecuta en Compute Engine.

##### Pods
Kubernetes permite definir los nodos de una aplicación y determinar cómo interactúan entre sí. Implementar contenedores en nodos con un wrapper en uno o más contenedores es un **Pod**. Siendo esta la unidad más pequeña que se puede crear en Kubernetes. Representa un proceso de ejecución en el cluster, como un componente de una aplicación o toda la aplicación.

Generalmente, se tiene un contenedor por pod, pero si tienes varios contenedores con dependencias entre ellos, puedes empaquetarlos en un solo Pod para poder compartir recursos de red y de datos de una manera más sencilla. Un Pod proporciona una IP única y conjunto de puertos y opciones configurables para ejecutar los contenedores.

##### Deployments
Un deployment es un grupo de réplicas del mismo Pod y los mantiene en ejecución incluso cuando fallan los nodos en los que se ejecutan, pudiendo ser estos componentes de una aplicación o toda la aplicación.

##### Services
GKE crea un balanceador de carga de red que enruta el tráfico. Un service define un conjunto lógico de Pods y una política para acceder a ellos. Permiten establecer IPs fijas a los Pods.

#### 3. Google Kubernetes Engine (GKE)

Entorno gestionado que consta de varias instancias de Compute Engine que se agrupan para formar clusters. Uno de los objetivos del servicio es simplificar el uso de Kubernetes administrando de forma autónoma todos los componentes del plano de control.

Expone una IP a la que se envían las solicitudes de la API de Kubernetes, siendo responsable de aprovisionar toda la infraestructura del plano de control detrás de él.

##### Modos de GKE
La configuración y administración de nodos dependen del modo GKE que se use:

- **Autopilot (recomendado)**: La infraestructura subyacente, como la configuración de nodos, escalado, actualizaciones y redes son gestionadas por el servicio.
- **Standard**: El usuario administra la infraestructura subyacente y la configuración de nodos individuales.

#### 4. Cloud Run

Cloud Run es una plataforma de computación gestionada que ejecuta contenedores sin estado a través de solicitudes web o eventos de Pub/Sub. Cloud Run es serverless, elimina todas las tareas de administración de infraestructura para que puedas centrarte en desarrollar aplicaciones.

##### Características
- Está construido en Knative, una API abierta y entorno de ejecución construido sobre Kubernetes
- Puede ser completamente gestionado en Google Cloud, en Google Kubernetes Engine o en cualquier lugar donde se ejecute Knative
- Puede escalar automáticamente hacia arriba y abajo desde cero casi instantáneamente
- Cobra solo por los recursos utilizados, calculados hasta el milisegundo más cercano, por lo que nunca pagarás por recursos sobreaprovisionados

##### Flujo de Trabajo del Desarrollador
El flujo de trabajo del desarrollador de Cloud Run es un proceso directo de tres pasos:

1. **Escribes tu aplicación** usando tu lenguaje de programación favorito. Esta aplicación debe iniciar un servidor que escuche solicitudes web.
2. **Construyes y empaquetas tu aplicación** en una imagen de contenedor.
3. **La imagen del contenedor se envía a Artifact Registry**, donde Cloud Run la implementará.

Una vez que hayas implementado tu imagen de contenedor, obtendrás una URL HTTPS única. Cloud Run luego inicia tu contenedor bajo demanda para manejar solicitudes y asegura que todas las solicitudes entrantes se manejen agregando y eliminando contenedores dinámicamente.

##### Flujo Basado en Código Fuente
Puedes usar un flujo de trabajo basado en contenedores, así como un flujo de trabajo basado en código fuente. El enfoque basado en código fuente implementará código fuente en lugar de una imagen de contenedor. Cloud Run luego construye el código fuente y empaqueta la aplicación en una imagen de contenedor usando Buildpacks, un proyecto de código abierto.

##### Lenguajes Soportados
Puedes usar Cloud Run para ejecutar cualquier binario, siempre que esté compilado para Linux de 64 bits. Esto significa que puedes usar Cloud Run para ejecutar aplicaciones web escritas usando lenguajes populares como: Java, Python, Node.js, PHP, Go, C++, Cobol, Haskell y Perl.

##### Modelo de Precios
*<Insertar CRBilling.png>*

El modelo de precios en Cloud Run es único; solo pagas por los recursos del sistema que usas mientras un contenedor está manejando solicitudes web, con una granularidad de 100 ms, y cuando se está iniciando o cerrando. No pagas nada si tu contenedor no maneja solicitudes. Además, hay una pequeña tarifa por cada millón de solicitudes que sirves. El precio del tiempo del contenedor aumenta con CPU y memoria. Un contenedor con más vCPU y memoria es más costoso.

#### 5. Cloud Run Functions

Cloud Run Functions es una solución de computación ligera, basada en eventos y asíncrona que te permite crear funciones pequeñas de un solo propósito que responden a eventos en la nube, sin la necesidad de gestionar un servidor o un entorno de ejecución.

##### Características
- Cloud Run Functions también puede conectar y extender servicios en la nube
- Se factura al milisegundo más cercano de 100 milisegundos, pero solo mientras tu código se está ejecutando
- Admite escribir código fuente en varios lenguajes de programación, incluyendo: Node.js, Python, Go, Java, .NET Core, Ruby y PHP
- Los eventos de Cloud Storage y Pub/Sub pueden activar Cloud Run Functions de forma asíncrona, o puedes usar invocación HTTP para ejecución síncrona

---

### PROMPT ENGINEERING

#### 1. Introducción a la IA Generativa

La **Inteligencia Artificial Generativa (Gen AI)** abarca una gama más amplia de modelos capaces de generar varios tipos de contenido más allá del texto, mientras que **LLM** se refiere específicamente a un subconjunto de modelos de IA generativa que se centran en tareas de lenguaje.

La inteligencia artificial generativa, comúnmente referida como Gen AI, es un subconjunto de la inteligencia artificial que es capaz de crear texto, imágenes u otros datos usando modelos generativos, a menudo en respuesta a prompts. Los modelos de Gen AI son como programas conversacionales que pueden generar contenido basándose en las entradas suministradas. Los modelos de Gen AI aprenden los patrones y la estructura de los datos de entrenamiento de entrada y luego crean nuevos datos con características similares.

#### 2. Large Language Models (LLM)

Los modelos de lenguaje grandes se refieren a modelos de lenguaje grandes y de propósito general que pueden ser pre-entrenados y luego ajustados para propósitos específicos.

##### Parámetros
Los parámetros son las memorias y el conocimiento que la máquina ha aprendido durante el entrenamiento del modelo. Determinan la capacidad de un modelo para resolver un problema, como predecir texto, y pueden alcanzar billones o incluso trillones en tamaño.

##### Propósito General
Propósito general significa que los modelos pueden resolver suficientemente problemas comunes. Cuando envías un prompt a un LLM, este calcula la probabilidad de la respuesta correcta desde su modelo pre-entrenado.

##### Pre-entrenamiento
El pre-entrenamiento de un LLM implica alimentar un conjunto masivo de datos de texto, imágenes y código al modelo para que pueda aprender la estructura y patrones subyacentes del lenguaje.

#### 3. Alucinaciones en LLMs

A veces el LLM da una respuesta completamente incorrecta. Esto se llama una **alucinación**. Esto sucede porque los LLMs solo pueden entender la información con la que fueron entrenados. Para empeorar las cosas, los LLMs solo entienden la información que se les da explícitamente en el prompt. En otras palabras, a menudo asumen que el prompt es verdadero.

##### Causas de Alucinaciones
Las alucinaciones pueden ser causadas por varios factores, incluyendo:
- El modelo no está entrenado con suficientes datos
- El modelo está entrenado con datos ruidosos o sucios
- Al modelo no se le da suficiente contexto
- Al modelo no se le dan suficientes restricciones

#### 4. Prompt Engineering

Un prompt es el texto que alimentas al modelo, y la ingeniería de prompts es una forma de articular tus prompts para obtener la mejor respuesta del modelo.

##### Tipos de Prompts

**Zero-shot prompts**: No contienen ningún contexto o ejemplos para ayudar al modelo.
- Ejemplo: "¿Cuál es la capital de Francia?"
- Para prompts más específicos y técnicos, un ejemplo ayudaría a refinar el alcance de la respuesta de Gemini.

**One-shot prompts**: Proporcionan un ejemplo al modelo para contexto.

**Few-shot prompts**: Proporcionan al menos dos ejemplos al modelo para contexto.

**Role prompts**: Requieren un marco de referencia para que el modelo trabaje mientras responde las preguntas.

#### 5. Anatomía de un Prompt

##### Preámbulo (Preamble)
El preámbulo se refiere al texto introductorio que proporcionas para dar contexto e instrucciones al modelo antes de tu pregunta o solicitud principal. Piensa en ello como preparar el escenario para que el LLM entienda mejor lo que quieres.

Puede incluir:
- El contexto para la tarea
- La tarea en sí
- Algunos ejemplos para guiar al modelo

##### Input
El input es la solicitud central que estás haciendo al LLM. Es sobre lo que la instrucción o tarea actuará.

**Ejemplo:**
- Preámbulo: "Analiza el siguiente comentario y determina si es positivo, neutral o negativo"
- Input: "Comentario: No sé qué pensar sobre el video. La reseña es:"

Basándose en el preámbulo, Gemini revisa el input y sugiere si la reseña es positiva, neutral o negativa.

*<insert preamble.png>*

#### 6. Mejores Prácticas para Prompt Engineering

1. **Escribe instrucciones detalladas y explícitas**
   - Proporciona contexto claro y específico

2. **Define límites para el prompt**
   - Establece restricciones y parámetros claros

3. **Proporciona salidas de respaldo**
   - Si el modelo se atasca, dale algunas salidas 'de respaldo' que funcionen en varias situaciones

4. **Adopta una persona para tu input**
   - Define un rol o perspectiva para que el modelo lo adopte

5. **Mantén cada oración concisa**
   - Evita oraciones largas y complejas
   - Usa lenguaje claro y directo

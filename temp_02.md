# 🌐 Fundamentos de Networking en GKE

El modelo de red de Kubernetes se basa fuertemente en direcciones IP: cada Pod, contenedor y nodo se comunica a través de ellas, evitando el uso de puertos dinámicos complejos.

## 1. El Modelo "IP-per-Pod"
Kubernetes sigue una regla de oro: **Cada Pod tiene su propia dirección IP única.**
Image09.png

### A. Dentro del Pod (Intra-Pod)
Los contenedores que viven dentro del mismo Pod comparten el mismo **Network Namespace** (espacio de nombres de red).
* Comparten la misma dirección IP.
* Comparten los mismos puertos (`localhost`).

> **Ejemplo:** Tienes un Pod con dos contenedores:
> 1. **App Legacy:** Escucha en el puerto `8000`.
> 2. **Nginx (Proxy):** Escucha en el puerto `80`.
>
> Para que Nginx hable con la App, simplemente conecta a **`localhost:8000`**. Para ellos, es como si estuvieran procesos en la misma máquina física.


### B. Comunicación entre Pods (Inter-Pod)
¿Cómo habla un Pod con otro Pod en un nodo diferente?
1. El tráfico sale del Pod hacia el **Root Network Namespace** del nodo (el espacio de red principal de la VM).
2. Pasa por la tarjeta de red (NIC) del nodo.
3. Sale a la red de Google Cloud (VPC).

---

## 2. Integración con VPC (Virtual Private Cloud)
En GKE, los nodos son máquinas virtuales (Compute Engine) dentro de una VPC. GKE utiliza un modo llamado **VPC-Native** que usa **Alias IPs** para gestionar las direcciones de forma eficiente.
Image10.png

### Asignación de IPs
Image11.png
GKE crea rangos secundarios dentro de la subred para separar el tráfico:

| Tipo de Recurso | Fuente de la IP | Tamaño Típico (Default) |
| :--- | :--- | :--- |
| **Nodos (VMs)** | Subred Primaria de la VPC | Depende de la subred de la región. |
| **Servicios** | Rango Alias IP (Secundario) | Reservado (~4,000 IPs). |
| **Pods** | Rango Alias IP (Secundario) | **Bloque /14** (~250,000 IPs). |

### Distribución de IPs por Nodo
Aunque el rango global de Pods es enorme (/14), GKE lo divide para asignarlo a los nodos:
* GKE asigna un **bloque /24 a cada nodo** individual.
* Esto significa que cada nodo tiene reservadas unas **250 IPs** para sus Pods.
* Permite clústeres de hasta 1,000 nodos con ~100 Pods cada uno por defecto.

---

## 3. Enrutamiento y NAT (Importante)

Gracias al uso de **Alias IPs**, la red VPC de Google "conoce" las IPs de los Pods automáticamente.

1. **Sin NAT Interno:** Los Pods pueden hablar directamente entre sí (incluso entre diferentes nodos) usando sus IPs nativas **sin** necesidad de traducción de direcciones (NAT).
2. **VPC Peering:** Las IPs de los Pods son enrutables incluso hacia otras redes VPC conectadas por Peering.
3. **Salida a Internet:** Si el tráfico debe salir de la infraestructura de Google (hacia internet público), entonces sí se aplica **NAT** (la IP del Pod se enmascara detrás de la IP del Nodo).

# 🛡️ Kubernetes Services (Servicios)

## 1. ¿Qué es un Service?
Es una abstracción lógica que define un grupo de Pods y una política de acceso (una sola IP) para llegar a ellos.

* **Función Principal:** Proporcionar una dirección IP estable y un nombre DNS único para un conjunto de Pods.
* **El "Portero" (Doorman):** Piensa en un Servicio como el portero de un edificio. El mundo exterior (u otros clientes internos) le piden acceso al portero, y él decide a qué Pod específico dirigir el tráfico, bloqueando visitantes no deseados.



## 2. El Problema: IPs Efímeras
Para entender por qué necesitamos servicios, primero debemos entender el ciclo de vida de los Pods:

* **Inestabilidad:** A diferencia de las Máquinas Virtuales (VMs) que son duraderas, los Pods son **efímeros**. Se crean y se destruyen frecuentemente (escalado, actualizaciones, fallos).
* **Cambio de IP:** Cada vez que un Pod se recrea, obtiene una **nueva dirección IP**.
* **La Consecuencia:** Si intentas conectar aplicaciones usando las IPs directas de los Pods, la conexión se romperá en cuanto haya una actualización. Rastrear estas IPs manualmente es imposible.

## 3. La Solución: Estabilidad del Servicio
El Service resuelve el problema anterior actuando como un ancla fija.
Image12.png

### Componentes Clave
1.  **Endpoints:** Es la lista dinámica de direcciones IP de todos los Pods que coinciden con el **Label Selector** (selector de etiquetas) del Servicio. Si los Pods cambian, esta lista se actualiza sola.
2.  **Virtual IP (ClusterIP):** Al crear un Servicio, se le asigna una IP Virtual estática de un rango reservado (aprox. 4,000 IPs por defecto en GKE).
    * **Durabilidad:** Esta IP **nunca cambia** mientras exista el Servicio, sin importar qué pase con los Pods detrás de ella.

## 4. Service Discovery (Descubrimiento de Servicios)
GKE ofrece dos formas para que los Pods encuentren a los Servicios:

### A. Variables de Entorno (Environment Variables)
Cuando un Pod arranca, el `kubelet` inyecta variables con las IPs de los servicios activos *en ese momento*.
* **⚠️ Desventaja:** Es frágil. Si creas un Servicio *después* de que tus Pods ya han arrancado, los Pods no verán las nuevas variables (requieren reinicio).
* *Uso:* No recomendado para arquitecturas dinámicas.

### B. DNS (La Práctica Recomendada) 🌟
GKE incluye un servidor DNS (`kube-dns`) que vigila la API de Kubernetes.

1.  Creas un Servicio nuevo.
2.  El servidor DNS crea automáticamente un registro (ej. `mi-servicio.mi-namespace`).
3.  Cualquier Pod puede resolver ese nombre a la IP Virtual del Servicio automáticamente.
4.  **Ventaja:** Es robusto, dinámico y no requiere reiniciar los Pods para ver nuevos servicios.

# 🎛️ Tipos de Servicios en GKE y balanceadores de carga

Además de usar DNS o variables de entorno, la forma principal de controlar cómo se accede a un Servicio es definiendo su `type` (tipo).

Existen tres tipos principales que funcionan como capas, uno construido sobre el otro.

## 1. ClusterIP (El Estándar Interno)
Es el tipo de servicio por defecto si no especificas ninguno en el YAML.

* **Visibilidad:** **Solo Interna.** No es accesible desde fuera del clúster.
* **Función:** Actúa como un distribuidor de tráfico interno.
* **IP Virtual:** El plano de control asigna una **IP estática** (desde el pool de Alias IP de la VPC) que no cambia durante la vida del servicio.
* **Funcionamiento:**
    1.  Usa un `Label Selector` (ej. `app: Backend`) para agrupar los Pods.
    2.  Recibe tráfico en un puerto del Servicio (ej. `3306`).
    3.  Lo redirige al `targetPort` del contenedor (ej. `6000`).
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mi-backend-interno
spec:
  type: ClusterIP      # Opcional (es el valor por defecto)
  selector:
    app: Backend       # Busca Pods con esta etiqueta
  ports:
  - protocol: TCP
    port: 80           # El puerto del "Portero" (Service)
    targetPort: 9376   # El puerto donde escucha la aplicación (Pod)
```

> **Resumen:** Úsalo para comunicación entre aplicaciones dentro del mismo clúster (ej. Frontend hablando con Backend).

---

## 2. NodePort (Abriendo Puertos)
Este servicio se construye **encima** del ClusterIP service. Cuando se crea un NodePOrt Service, de forma automática se crea un ClusterIp Service.

* **Visibilidad:** **Externa (Nivel Básico).**
* **Mecanismo:** Abre un puerto específico (el NodePort) en la IP de **cada nodo** del clúster.
* **Flujo de Tráfico:**
    `Cliente Externo` → `IP del Nodo:NodePort` → `Servicio (ClusterIP)` → `Pod`
* **Caso de Uso:**
    * Generalmente se usa cuando quieres configurar tu propio Load Balancer externo manual.
* **Desventajas:** Tienes que gestionar tú mismo las IPs de los nodos y evitar colisiones de puertos.

---

## 3. LoadBalancer (La Opción de Nube) ☁️
Este es el método estándar en GKE para exponer servicios a internet. Se construye **encima** del ClusterIP (y utiliza la lógica de NodePort internamente).

* **Visibilidad:** **Externa (Nivel Producción).**
* **Implementación en GKE:** Aprovisiona automáticamente un **Google Cloud Network Load Balancer (Passthrough)**.
* **Flujo de Tráfico:**
    `Cliente` → `IP del Load Balancer de Google` → `Nodos` → `Servicio Interno` → `Pod`
* **Configuración:**
    * Se define en el YAML con `type: LoadBalancer`.
    * Google asigna una IP estática externa accesible fuera de tu proyecto.

### Tipos de Load Balancer en GKE
Por defecto, GKE crea un balanceador externo, pero puedes cambiarlo usando **anotaciones** en el YAML:

| Tipo de LB | Configuración | Descripción |
| :--- | :--- | :--- |
| **Externo (Default)** | `type: LoadBalancer` | Crea un Network Load Balancer público para acceso desde internet. |
| **Interno** | `networking.gke.io/load-balancer-type: "Internal"` | Crea un Internal Passthrough Network Load Balancer (solo accesible dentro de la VPC). |

**Externo**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mi-frontend-publico
spec:
  type: LoadBalancer   # Solicita un LB externo a Google Cloud
  selector:
    app: Frontend
  ports:
  - port: 80
    targetPort: 8080
```
**Interno**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mi-servicio-privado
  annotations:
    # Esta línea es CLAVE para GKE:
    networking.gke.io/load-balancer-type: "Internal"
spec:
  type: LoadBalancer
  selector:
    app: Herramienta-Interna
  ports:
  - port: 80
    targetPort: 80
```

# 🚦 Ingress Resource (Gestión de Tráfico HTTP/S)

## 1. ¿Qué es Ingress?
Ingress es una de las herramientas más potentes para dirigir tráfico hacia tu clúster.

* **Definición:** Es una colección de reglas que gestionan el acceso externo a los servicios del clúster (generalmente HTTP y HTTPS).
* **Jerarquía:** Opera una capa por encima de los *Services*. Piensa en él como un "Servicio para Servicios" o un router inteligente.
* **Aclaración:** Ingress **NO** es un tipo de *Service* (como NodePort o LoadBalancer); es un objeto distinto.

## 2. Implementación en GKE
Image13.png
En GKE, Ingress no es solo software dentro del clúster; desencadena infraestructura real de Google Cloud.

* **Cloud Load Balancing:** Cuando creas un Ingress, GKE provisiona automáticamente un **Application Load Balancer (ALB)** externo (Capa 7).
* **Funcionamiento:**
    1.  El Ingress Controller lee tu manifiesto.
    2.  Configura el ALB de Google.
    3.  El ALB enruta el tráfico hacia los *Services* (que pueden ser NodePort o LoadBalancer) y estos a los Pods.

---

## 3. Reglas de Enrutamiento (Routing Rules)
Ingress permite dirigir el tráfico basándose en dos factores principales: el **Host** (dominio) y el **Path** (ruta URL).

### A. Host-based Routing
Soporta múltiples dominios en la misma IP.
* `demo.example.com` → Va al Servicio A.
* `lab.user.com` → Va al Servicio B.

### B. Path-based Routing
Filtra según la ruta de la URL.
* `example.com/video` → Servicio de Video.
* `example.com/chat` → Servicio de Chat.

### C. Default Backend (El "Cajón de Sastre")
Es el destino para cualquier tráfico que **no coincida** con ninguna regla.
* Si no especificas uno en el YAML, GKE proporciona uno por defecto que devuelve un error **404**.

---

## 📝 Ejemplo Práctico: Ingress YAML Completo

Este manifiesto combina reglas por Host y por Path. Fíjate en cómo definimos reglas distintas para `midominio.com` y `otrodominio.com`.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mi-ingress-multisitio
spec:
  # Regla 1: Basada en Host (midominio.com) con rutas (paths)
  rules:
  - host: midominio.com
    http:
      paths:
      # Si el usuario va a [midominio.com/demo](https://midominio.com/demo) -> Servicio demo1
      - path: /demopath
        pathType: Prefix
        backend:
          service:
            name: demo1
            port:
              number: 80
      # Si el usuario va a [midominio.com/lab](https://midominio.com/lab) -> Servicio demo2
      - path: /labpath
        pathType: Prefix
        backend:
          service:
            name: demo2
            port:
              number: 80
              
  # Regla 2: Otro Host diferente
  - host: tienda.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: servicio-tienda
            port:
              number: 8080

  # Default Backend (Opcional, explicito)
  defaultBackend:
    service:
      name: mi-servicio-error-custom
      port:
        number: 80
```
## 4. Integraciones Avanzadas de Google Cloud
Al usar el Application Load Balancer de Google, Ingress gana superpoderes nativos de la nube. Estas configuraciones no suelen ir directamente en el YAML del Ingress, sino en un recurso personalizado llamado **BackendConfig** que se vincula al Servicio.

| Característica | Descripción |
| :--- | :--- |
| **Cloud CDN** | Acerca el contenido a los usuarios usando más de 100 puntos de presencia (Edge locations) para caché global. |
| **Cloud Armor** | Seguridad perimetral. Protege contra **DDoS**, inyección SQL, XSS y permite listas blancas/negras de IPs o filtrado por geolocalización. |
| **Identity-Aware Proxy (IAP)** | Permite acceso HTTPS a aplicaciones internas sin VPN, autenticando usuarios corporativos con Google (modelo Zero Trust). |

## 5. Protocolos y Seguridad
* **TLS Termination:** El Load Balancer maneja el descifrado SSL en el borde (edge), liberando a los Pods de esa carga computacional.
* **Certificados SSL:** Se pueden gestionar de forma centralizada en Google Cloud y el Ingress puede servir múltiples certificados.
* **HTTP/2 y gRPC:** Ingress soporta HTTP/2 nativamente. Esto es crucial para microservicios modernos que usan **gRPC** (comunicación de alto rendimiento y baja latencia entre servicios).

## 6. Multi-Cluster Ingress (MCI)
Permite usar un solo recurso Ingress para balancear tráfico globalmente hacia **múltiples clústeres** situados en **múltiples regiones**.
* **Beneficio:** Geo-balancing (dirige al usuario al clúster más cercano) y Alta Disponibilidad (si una región cae, el tráfico va a otra).

---
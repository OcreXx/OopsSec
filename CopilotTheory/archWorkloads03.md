# 🔀 El Dilema del Doble Salto (Double-Hop Dilemma)

## 1. El Problema: ¿Qué es el Doble Salto?
En la configuración de red tradicional de Kubernetes (sin optimizar), el tráfico externo sufre una ineficiencia llamada "Double-Hop".

1. **Ingreso:** El Load Balancer recibe tráfico y elige un **Nodo** al azar (ej. Nodo 1).
2. **Primer Salto:** El paquete llega al Nodo 1.
3. **Kube-proxy:** Evalúa a dónde debe ir el tráfico. Para mantener el balanceo equitativo, puede decidir enviarlo a un Pod que está en *otro* nodo (ej. Pod 5 en el Nodo 3).
4. **Segundo Salto (Innecesario):** El Nodo 1 tiene que reenvíar el tráfico al Nodo 3.
5. **Retorno:** La respuesta debe volver por el mismo camino inverso.

* **Consecuencias:** Mayor latencia, consumo innecesario de ancho de banda interno y complicación en la preservación de la IP origen (Source IP).

Image14.png & Image15.png

---

## 2. Solución A: `externalTrafficPolicy: Local`
Es una configuración en el objeto `Service` que prioriza la latencia sobre el balanceo perfecto.

* **Cómo funciona:** Obliga al `kube-proxy` a enviar el tráfico **solo** a los Pods que están en el mismo nodo que recibió el paquete. Si el nodo no tiene pods de ese servicio, rechaza la conexión.
* **Ventaja:** Elimina el segundo salto y preserva la IP del cliente (Source IP).
* **Desventaja:** Riesgo de **desbalanceo**. Si el Load Balancer envía mucho tráfico a un nodo que tiene solo 1 Pod, ese Pod se saturará mientras otros Pods en otros nodos están libres.

### 📝 Ejemplo YAML: Política Local
```yaml
apiVersion: v1
kind: Service
metadata:
  name: servicio-baja-latencia
spec:
  type: LoadBalancer
  # ESTA es la línea clave:
  externalTrafficPolicy: Local
  selector:
    app: mi-app-rapida
  ports:
  - port: 80
    targetPort: 8080
```

---

## 3. Solución B: Container-Native Load Balancing (La Recomendada) 🌟
Esta es la solución moderna y óptima en GKE. En lugar de enviar tráfico a los "Nodos", el balanceador envía el tráfico **directamente a los Pods**.

### Requisitos y Tecnología
* Requiere que el clúster sea **VPC-Native** (uso de Alias IPs).
* Utiliza **NEGs (Network Endpoint Groups)**. Un NEG es un objeto que mapea pares de IP:Puerto de los Pods.

### Beneficios
1. **Sin Doble Salto:** El Load Balancer de Google conoce las IPs de los Pods individuales. La conexión es directa (LB → Pod).
2. **Visibilidad Real:** Preserva la IP origen y permite *Health Checks* (comprobaciones de salud) directos contra el Pod, no contra el nodo.
3. **Soporte Avanzado:** Habilita el uso de Google Cloud Armor, Cloud CDN e Identity-Aware Proxy.
4. **Mejor Latencia y Throughput:** Menos saltos en la red.

### 📝 Ejemplo YAML: Container-Native (NEG)
En GKE moderno (especialmente Autopilot o clústeres VPC-native recientes), esto suele ser automático para Ingress. Sin embargo, para forzarlo en un Servicio `LoadBalancer` independiente, se usa una **anotación**.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: servicio-neg-nativo
  annotations:
    # Esta anotación crea un NEG para exponer los Pods directamente
    [cloud.google.com/neg](https://cloud.google.com/neg): '{"ingress": true}'
spec:
  type: LoadBalancer 
  selector:
    app: mi-app-moderna
  ports:
  - port: 80
    targetPort: 8080
```

---

## 🆚 Resumen Comparativo

| Estrategia | Saltos de Red | Balanceo de Carga | Visibilidad IP |
| :--- | :---: | :--- | :--- |
| **Tradicional (Default)** | 2 (A veces) | Bueno (pero ineficiente) | Se pierde (SNAT) |
| **TrafficPolicy: Local** | 1 (Directo) | Riesgoso (Posible desbalance) | Se preserva ✅ |
| **Container-Native (NEG)** | 1 (Directo) | **Excelente** (El LB ve los Pods) | Se preserva ✅ |

# 🛡️ Network Policies (Políticas de Red)

## 1. El Concepto: "Defense in Depth"
Por defecto, en Kubernetes **todos los Pods pueden hablar con todos**. Es una red plana y abierta.

* **El Riesgo:** Si un atacante compromete un solo Pod (ej. tu Frontend), puede usarlo como base para explorar y atacar tu Base de Datos o servicios internos ("movimiento lateral").
* **La Solución:** Las Network Policies actúan como un **Firewall a nivel de Pod**. Restringen quién puede hablar con quién.

## 2. GKE Dataplane V2
En GKE, la implementación moderna de estas políticas se hace a través de **Dataplane V2**.

* **Tecnología:** Se basa en **eBPF** (una tecnología potente dentro del kernel de Linux) en lugar de *iptables*.
* **Ventajas:**
    * Procesa paquetes de forma eficiente.
    * Proporciona logs detallados y visibilidad de red en tiempo real.
* **Disponibilidad:**
    * **Autopilot:** Activado por defecto (simplificado).
    * **Standard:** Debes activarlo manualmente (consume recursos adicionales en los nodos).

## 3. Estructura de la Política (YAML)
Una política se define en un archivo YAML bajo el `kind: NetworkPolicy`.

### Componentes Clave:
1. **podSelector:** Define **A QUIÉN** se aplica la regla (los Pods protegidos). Si se deja vacío `{}`, aplica a *todos* los pods del namespace.
2. **policyTypes:** Indica qué tráfico se controla.
    * `Ingress`: Tráfico entrante (hacia el pod).
    * `Egress`: Tráfico saliente (desde el pod).
3. **Reglas (Ingress/Egress):**
    * **from / to:** ¿Desde dónde o hacia dónde se permite?
        * `ipBlock`: Rango de IPs (CIDR).
        * `namespaceSelector`: Pods en un namespace específico.
        * `podSelector`: Pods con etiquetas específicas.
    * **ports:** ¿En qué puerto específico?

---

## 4. Estrategias y Ejemplos YAML

### A. Estrategia "Default Deny" (Bloquear Todo) ⛔
Esta es la **mejor práctica de seguridad**: cerrar todo primero y luego abrir solo lo necesario.
* Si existe una política que selecciona un Pod pero no especifica reglas de "Allow", se **bloquea todo** el tráfico.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: denegar-todo-por-defecto
  namespace: default
spec:
  podSelector: {}          # {} Significa "Todos los Pods en este namespace"
  policyTypes:
  - Ingress                # Activa control de entrada (y bloquea al no haber reglas)
  - Egress                 # Activa control de salida (y bloquea al no haber reglas)
          
```
### B. Estrategia "Allow Specific" (Permitir Específico) ✅
Imagina una arquitectura de capas: El **Frontend** necesita hablar con el **Backend** en el puerto 5000.
Esta política se aplica al **Backend** para permitir acceso *solo* desde el Frontend.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: permitir-frontend-a-backend
spec:
  # 1. ¿A quién protejo? A los Pods con etiqueta 'app: backend'
  podSelector:
    matchLabels:
      app: backend
  
  # 2. ¿Qué tipo de tráfico controlo? Entrada
  policyTypes:
  - Ingress

  # 3. Las reglas de admisión
  ingress:
  - from:
    # Solo permitir tráfico que venga de Pods con etiqueta 'app: frontend'
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 5000
```
### C. Estrategia "Allow All" (Permitir Todo) ⚠️
Útil para debugging o para desactivar restricciones temporalmente en un namespace, permitiendo todo el tráfico de entrada y salida.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: permitir-todo
spec:
  podSelector: {}  # Selecciona todos los pods
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - {}             # Regla vacía = Permitir todo
  egress:
  - {}             # Regla vacía = Permitir todo
```

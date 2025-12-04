# 🛠️ Cheat Sheet: Comandos de Kubernetes, GKE y Anthos

Este resumen agrupa los comandos esenciales para el examen y la práctica diaria, divididos por herramienta y función.

## 1. Kubernetes Core (`kubectl`)

### Gestión de Recursos Básicos
| Comando | Explicación |
| :--- | :--- |
| `kubectl apply -f [ARCHIVO]` | **Declarativo.** Crea o actualiza recursos basándose en un archivo YAML. Es el método recomendado para producción. |
| `kubectl get [RECURSO]` | Lista recursos (Pods, Deployments, Services) mostrando su estado básico (Ready, Status, Age). |
| `kubectl get ... -o yaml` | Exporta la configuración actual de un recurso en formato YAML (útil para guardar copias de seguridad o debug). |
| `kubectl describe [RECURSO]` | Muestra la **hoja clínica** del recurso: eventos recientes, errores, configuración deseada vs. actual. |
| `kubectl edit [RECURSO]` | Abre el editor de texto por defecto para modificar la configuración en vivo. Al guardar, se aplican los cambios. |
| `kubectl replace [ARCHIVO]` | Reemplaza destructivamente un recurso con uno nuevo definido en el archivo (ej. cambios en Ingress). |
| `kubectl delete [RECURSO]` | Elimina un recurso y sus dependencias (ej. borrar un Deployment borra sus Pods). |
| `kubectl taint nodes [NODO]` | "Mancha" un nodo para repeler Pods que no tengan la tolerancia específica (evita que se programen cargas de trabajo allí). |

### Gestión de Workloads (Deployments, Jobs, Config)
| Comando | Explicación |
| :--- | :--- |
| `kubectl create deployment` | **Imperativo.** Crea un Deployment rápidamente desde la línea de comandos. |
| `kubectl set image deployment` | Actualiza la imagen del contenedor en un Deployment (dispara un nuevo rollout). |
| `kubectl rollout status` | Muestra el progreso en tiempo real de una actualización. |
| `kubectl rollout history` | Muestra el historial de revisiones del Deployment. |
| `kubectl rollout undo` | **Rollback.** Revierte el Deployment a la revisión anterior inmediata. |
| `kubectl rollout pause` | Congela el despliegue. Útil para hacer cambios múltiples y aplicarlos juntos, o para investigar problemas. |
| `kubectl rollout resume` | Descongela el despliegue y aplica los cambios pendientes. |
| `kubectl run` | Crea un Pod individual (generalmente para pruebas rápidas o debug). |
| `kubectl delete job ... --cascade false` | Elimina el objeto Job pero **deja vivos** a los Pods que creó (útil para inspeccionar logs tras fallo). |
| `kubectl create configmap` | Crea un objeto de configuración (clave-valor) desde literales o archivos. |
| `kubectl create secret generic` | Similar a ConfigMap, pero para datos sensibles (codificados en base64). |

---

## 2. Google Kubernetes Engine (`gcloud`)

Comandos específicos para administrar la infraestructura del clúster en Google Cloud.

### Creación y Configuración
| Comando | Explicación |
| :--- | :--- |
| `gcloud container clusters create` | Crea un clúster nuevo con la configuración por defecto. |
| `gcloud container clusters create ... --enable-autoscaling` | Crea un clúster con el **Cluster Autoscaler** activado desde el inicio. |
| `gcloud container clusters update ... --no-enable-network-policy` | Desactiva las políticas de red (firewall interno de K8s) en un clúster existente. |

### Escalado (Scaling)
| Comando | Explicación |
| :--- | :--- |
| `gcloud container clusters resize` | **Manual.** Cambia el tamaño del clúster a un número fijo de nodos (solo Standard Mode). |
| `gcloud container clusters update ... --enable-autoscaling` | Activa el escalado automático en un *node-pool* existente. |
| `gcloud container clusters update ... --no-enable-autoscaling` | Desactiva el escalado automático, volviendo al control manual. |
| `gcloud container node-pools create ... --enable-autoscaling` | Agrega un nuevo grupo de nodos (node-pool) con el autoscaler ya activado. |

---

## 3. Migrate for Anthos (`migctl`)

Herramienta para migrar máquinas virtuales (VMs) tradicionales a contenedores en GKE.

| Comando | Orden del Proceso | Explicación |
| :--- | :---: | :--- |
| `migctl setup install` | **1** | Instala el software de migración dentro del clúster de destino. |
| `migctl source create` | **2** | Define de dónde viene la app (VMware, AWS, Compute Engine). |
| `migctl migration create` | **3** | Crea el objeto "plan de migración" para orquestar el movimiento. |
| `migctl migration generate-artifacts` | **4** | Genera los Dockerfiles, YAMLs y datos necesarios para el contenedor. |
| `migctl migration get-artifacts` | **5** | Descarga esos archivos generados para que puedas usarlos o editarlos. |
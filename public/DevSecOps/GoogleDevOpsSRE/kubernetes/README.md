# Imágenes de Kubernetes

Esta carpeta debe contener las siguientes imágenes referenciadas en el módulo Kubernetes Engine Fundamentals:

1. **arch01.png** - Evolución de la virtualización (servidores físicos → VMs → contenedores)
2. **arch02.png** - Contenedores e Imágenes (namespaces, cgroups, capas)
3. **arch03.png** - Capas en un Dockerfile
4. **arch04.png** - Cloud Build y flujo de construcción
5. **arch05.png** - Opciones de Cómputo en GCP (Compute Engine, App Engine, GKE, Cloud Run, Cloud Functions)
6. **arch06.png** - Pods en Kubernetes (arquitectura)
7. **arch07.png** - Componentes de Kubernetes (Control Plane y Nodos)
8. **arch08.png** - Node Pools en GKE
9. **arch09.png** - Clústeres Regionales
10. **arch10.png** - Manifiestos Kubernetes (ejemplo YAML)
11. **arch11.png** - Namespaces en Kubernetes
12. **arch12.png** - Migrate for Anthos (flujo general)
13. **arch13.png** - Configuración del processing cluster
14. **arch14.png** - Instalación de migctl
15. **arch15.png** - Verificación de instalación
16. **arch16.png** - Crear plan de migración
17. **arch17.png** - Generar artefactos
18. **arch18.png** - Desplegar en cluster destino

## Cómo añadir las imágenes

1. Copia las imágenes `arch01.png` a `arch18.png` en esta carpeta
2. Las referencias en el código apuntan a `/DevSecOps/GoogleDevOpsSRE/kubernetes/archXX.png`
3. Una vez añadidas, haz rebuild del proyecto con `npm run build`

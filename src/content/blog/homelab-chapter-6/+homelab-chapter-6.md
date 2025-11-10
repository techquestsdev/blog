---
published: true
name: 'Home Lab: Chapter 6'
icon: 'ph:computer-tower'
description: 'Kubernetes Ingress Controller'
date: 2025-07-29
---

<script>
    import CaptionMermaid from '$lib/components/CaptionMermaid.svelte'
</script>

Howdy,

In this chapter, we're going to look at how to expose services running inside our Kubernetes cluster to the outside world using an Ingress Controller. We'll be using the NGINX Ingress Controller and taking full advantage of our GitOps setup with ArgoCD.

Let's get into it.

## What Is an Ingress Controller?

An Ingress Controller is a Kubernetes resource that handles external access to services running inside your cluster - usually over HTTP or HTTPS. You can think of it as a smart traffic router sitting at the edge of your cluster.

It watches for `Ingress` resources and knows how to route traffic accordingly. It also supports other nice things like:

- Load balancing
- SSL termination
- Name-based virtual hosting

In other words, it gives you centralized control over how incoming traffic is handled.

## Preparing the Cluster

Before installing the Ingress Controller, we need to make sure it can actually receive external traffic. For that, we'll expose it using a Kubernetes `Service` of type `LoadBalancer`.

The LoadBalancer service will act as the public entry point, and from there, the Ingress Controller will decide how to route the traffic internally.

Now, since we're using Cilium as our CNI (as mentioned in [Chapter 3](homelab-chapter-3)), we've got a cool feature available to us: Cilium LB IPAM (Load Balancer IP Address Management). This lets us assign specific IPs to LoadBalancer services - perfect for when we want to reserve a static IP for our Ingress Controller.

This is especially useful if we plan to point a DNS record to the controller later, which is exactly what we'll do in future chapters.

## Assigning a Static IP with Cilium

To assign a static IP using Cilium, we need to define a `CiliumLoadBalancerIPPool` object. This object tells Cilium which IPs it can use for LoadBalancer services, and under what conditions.

Here's the configuration:

```bash
# ippool.yaml
---
apiVersion: cilium.io/v2alpha1
kind: CiliumLoadBalancerIPPool
metadata:
  name: default-pool
spec:
  blocks:
    - cidr: "x.x.x.105/32"
  serviceSelector:
    matchLabels:
      "io.kubernetes.service.namespace": "ingress-nginx"
```

This will assign the IP x.x.x.105 to any LoadBalancer service in the ingress-nginx namespace.

To apply it, we can run the following command:

```bash
# Apply the configuration
kubectl apply -f ippool.yaml
```

With this in place, the Ingress Controller will get that static IP when we install it.

## Installing NGINX Ingress Controller

Now that the IP pool is in place, we can move on to installing the NGINX Ingress Controller. Installing the NGINX Ingress Controller is straightforward. Like ArgoCD and Cilium, we'll use its official Helm chart. But since we already have a fully working GitOps setup (thanks to our ArgoCD configuration in the previous chapter), we can add the NGINX Ingress Controller to the Git repository and have it installed by ArgoCD. We can do this by creating an `Application` object that will define the NGINX Ingress Controller. We'll define it in a `ingress-nginx.yaml` file with the following content:

```yaml
# ingress-nginx.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ingress-nginx
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    chart: ingress-nginx
    repoURL: https://kubernetes.github.io/ingress-nginx
    targetRevision: 4.12.1
    helm:
      valuesObject:
        controller:
          service:
            type: LoadBalancer
            externalTrafficPolicy: Cluster
            annotations:
              io.cilium/lb-ipam-ips: 'x.x.x.105'
          metrics:
            enabled: true
  destination:
    name: in-cluster
    namespace: ingress-nginx
  syncPolicy:
    automated:
      prune: false
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    managedNamespaceMetadata:
      labels:
        pod-security.kubernetes.io/enforce: privileged
        pod-security.kubernetes.io/enforce-version: latest
  info:
    - name: 'Description:'
      value: Ingress controller
```

This file defines an ArgoCD `Application` that will install the NGINX Ingress Controller using the Helm chart from the official repository. Here's a quick breakdown of what each part does:

- `service.type: LoadBalancer`: creates a service of type `LoadBalancer` that will expose the Ingress Controller to the outside world.

- `service.externalTrafficPolicy: Cluster`: allows the traffic to be routed to all the nodes in the cluster instead of just the node where the pod is running.

- `io.cilium/lb-ipam-ips`: assigns the previous allocated IP address to the Load Balancer service.

- `metrics.enabled: true`: enables the metrics server for the Ingress Controller, exposing metrics like the number of requests, response time, etc.

- `pod-security.kubernetes.io/enforce`: sets the Pod Security Standards to `privileged`, allowing the Ingress Controller to run with elevated privileges. This is necessary for the Ingress Controller to function correctly.

Once this file is added to your Git repo, ArgoCD will pick it up and deploy everything.

> We can follow the progress of the installation by checking the ArgoCD UI by running `kubectl port-forward svc/argocd-server -n argocd 8080:80` and navigating to `http://localhost:8080`. You can log in with the default credentials (`admin`/`admin`) or the credentials you set up in the previous chapter.

## Testing the Ingress Controller

Once ArgoCD has deployed the controller, we can check if it's working by making a simple curl request to the IP we assigned:

```bash
# Make a request to the Ingress Controller
curl http://x.x.x.105
```

We now should see something like this:

```html
## Response from the Ingress Controller
<html>
  <head>
    <title>404 Not Found</title>
  </head>
  <body>
    <center><h1>404 Not Found</h1></center>
    <hr />
    <center>nginx</center>
  </body>
</html>
```

That 404 is actually a good sign - it means the Ingress Controller is up, responding to requests, and just doesn't have any routes defined yet (because we haven't created any Ingress resources).

## Visual Recap

Here's what we just set up, in diagram form:

<CaptionMermaid alt="Kubernetes Ingress Controller Setup">
flowchart TB
    Client[Client] --> StaticIP[Static IP x.x.x.105]
    StaticIP --> LB[LoadBalancer Service]
    LB --> Ingress[NGINX Ingress Controller]
    Ingress --> Services[Your Internal Services]
</CaptionMermaid>

## Conclusion

In this chapter, we set up the foundation for managing external traffic in our Kubernetes cluster. Here's what we accomplished:

- We used Cilium's LB IPAM feature to assign a static IP to a LoadBalancer service.
- We installed the NGINX Ingress Controller using ArgoCD and Helm.
- We validated that the controller is working by sending it a direct request.

Now that we've got an Ingress Controller up and reachable from the outside, we can move on to the next step: making it actually useful by adding routing rules, setting up DNS, and handling SSL/TLS termination.

In the next chapter, we'll look at how to:

- Configure DNS records pointing to your static IP
- Automatically issue and renew SSL certificates using cert-manager
- Route traffic to real services using Ingress resources

We're just getting started with Ingress - but the foundation is solid. Catch you in the next one.

---

_This is part of the **Home Lab** series. All the chapters can be found bellow:_

- [Chapter 1: Requirements, Hardware, Software and Architecture](homelab-chapter-1)
- [Chapter 2: Base Foundations](homelab-chapter-2)
- [Chapter 3: Kubernetes Setup](homelab-chapter-3)
- [Chapter 4: Kubernetes GitOps with ArgoCD](homelab-chapter-4)
- [Chapter 5: Kubernetes Managing Secrets](homelab-chapter-5)
- [Chapter 6: Kubernetes Ingress Controller](homelab-chapter-6)
- [Chapter 7: Kubernetes DNS and SSL](homelab-chapter-7)
- [Chapter 8: Kubernetes Storage with Rook-Ceph](homelab-chapter-8)

> More to come...

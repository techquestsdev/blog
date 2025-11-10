---
published: true
name: 'Home Lab: Chapter 4'
icon: 'ph:computer-tower'
description: 'Kubernetes GitOps with ArgoCD'
date: 2025-05-31
---

Howdy!

Ever since I discovered GitOps, I've been in love with the concept. The idea of managing all your infrastructure configuration from a centralized Git repository - and having a tool automatically apply those changes - is incredibly powerful.

GitOps brings together Infrastructure as Code (IaC) and Continuous Integration/Continuous Deployment (CI/CD) in a seamless, declarative workflow. It's the ideal way to manage a Kubernetes cluster.

In the past, I've used [Flux](https://fluxcd.io/) to implement GitOps, but I've always been curious about [ArgoCD](https://argo-cd.readthedocs.io/en/stable/). After hearing so many good things about it, I decided it was finally time to give it a try - and this project was the perfect opportunity.

## What is ArgoCD?

ArgoCD is a declarative GitOps continuous delivery tool for Kubernetes. It follows the GitOps pattern of using Git repositories as the source of truth for defining the desired application state.

It is implemented as a Kubernetes controller that continuously monitors running applications and compares their current live state against the desired target state (as defined in Git). A deployment is considered in sync when the live state matches the target state. If they differ, ArgoCD performs a `kubectl apply` to reconcile the live state with the target state.

## Installation

Installing ArgoCD is straightforward. We can use the official Helm chart. First, add the ArgoCD Helm repository:

```bash
# Create the namespace
kubectl create namespace argocd

# Add the repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

Since we're using Cilium as the CNI, we need to exclude Cilium resources from ArgoCD's control. Create a `values.yaml` file with the following:

```yaml
# values.yaml
configs:
  cm:
    resource.exclusions: |
      - apiGroups:
          - cilium.io
        kinds:
          - CiliumIdentity
        clusters:
          - "*"
```

This prevents ArgoCD from managing Cilium resources, which could interfere with Cilium's operation. For more details, see [Troubleshooting Cilium deployed with Argo CD](https://docs.cilium.io/en/latest/configuration/argocd-issues/).

We can also provide a custom admin password for the ArgoCD UI. The password must be hashed. You can generate a hash using `htpasswd`:

```bash
# Generate the password hash
htpasswd -nbBC 10 "" '<PASSWORD>' | tr -d ':\n'
```

Then add it to the `values.yaml` file:

```yaml
# values.yaml
configs:
  secret:
    argocdServerAdminPassword: <PASSWORD_HASH>
```

Now install the chart:

```bash
helm upgrade --install argocd argo/argo-cd \
    --namespace argocd \
    --values values.yaml
```

This installs ArgoCD into the `argocd` namespace. You can access the UI via port forwarding:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:80
```

## Add Repository

With ArgoCD installed, the next step is to connect a Git repository containing your Kubernetes manifests. ArgoCD includes an operator and several CRDs (Custom Resource Definitions). We use the `Application` CRD to define which repository and path to sync.

Here's an example `init.yaml`:

```yaml
# init.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: init
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: <REPO_URL>
    targetRevision: HEAD
    path: <PATH>
  destination:
    name: in-cluster
    namespace: argocd
  syncPolicy:
    automated:
      selfHeal: true
  info:
    - name: 'Description:'
      value: 'Entrypoint to all homelab apps'
```

> For more details, see the [ArgoCD Application Spec](https://argo-cd.readthedocs.io/en/latest/user-guide/application-specification).

If your repository is private, create a secret with credentials and label it for ArgoCD:

```yaml
# github.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: github
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: <REPO_URL>
  sshPrivateKey: <SSH_PRIVATE_KEY>
```

Apply the secret and application:

```bash
kubectl apply -f github.yaml
kubectl apply -f init.yaml
```

Once applied, you should see the application appear in the ArgoCD UI.

You can access the UI at by port forwarding the service:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then navigate to `http://localhost:8080` in your browser. The default username is `admin`, and the password is the one you set earlier.

## Adding Applications

With the repository connected, you can start adding applications. Here's an example `app.yaml` to deploy a Helm chart:

```yaml
# app.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: <APP_NAME>
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    chart: <CHART_NAME>
    repoURL: <CHART_REPO>
    targetRevision: <CHART_VERSION>
    helm: {}
  destination:
    name: in-cluster
    namespace: <NAMESPACE>
  syncPolicy:
    automated:
      prune: false
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
  info:
    - name: 'Description:'
      value: My first Application with ArgoCD
```

> Ensure this file is in the `<PATH>` specified in your init.yaml.

Push the file to your repository, and ArgoCD will detect it. You can then sync it through the UI and watch your application get deployed - this is the magic of GitOps.

## Conclusion

ArgoCD is a powerful tool that enables managing Kubernetes clusters declaratively through Git. By treating your Git repository as the source of truth, you gain version control, automation, and a clear audit trail of infrastructure changes.

It's an excellent way to combine IaC and CI/CD - and I'm excited to explore what more I can do with it!

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

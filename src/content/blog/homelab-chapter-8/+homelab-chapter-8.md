---
published: true
name: 'Home Lab: Chapter 8'
icon: 'ph:computer-tower'
description: 'Kubernetes Storage with Rook-Ceph'
date: 2025-11-05
---

Howdy!

We've come a long way! We've set up our Kubernetes cluster, configured GitOps with
ArgoCD, managed secrets securely, exposed applications through Ingress, and set
up DNS with SSL certificates. But there's one critical piece we haven't addressed
yet: **storage**.

In this chapter, we'll tackle one of the most challenging aspects of running
Kubernetes in a homelab environment - persistent storage. Specifically, we'll
explore how I implemented a distributed storage solution using **Rook-Ceph** to
provide reliable, scalable block storage across my cluster.

## The Storage Challenge

When you run applications on Kubernetes, especially stateful ones like databases,
message queues, or monitoring systems, you need persistent storage that survives
pod restarts and node failures. Without it, losing a pod means losing all your
data.

In a cloud environment, this is straightforward - you just request a volume from
your cloud provider. But in a homelab, you need to build this yourself.

### Why Not Just Use Local Storage?

You might think, "Can't I just mount a local directory on each node?" Technically
yes, but there are serious drawbacks:

- **No redundancy** - If a node fails, your data is gone
- **Poor availability** - Pods can't migrate between nodes
- **Limited capacity** - Bound by individual node storage
- **Manual management** - You have to handle backups yourself

For a homelab that aims to mimic production environments, this isn't acceptable.

## Introducing Rook-Ceph

**Rook** is a cloud-native storage orchestrator that automates the deployment and
management of storage systems in Kubernetes. **Ceph** is a distributed storage
platform that provides block storage, object storage, and file system storage.

Together, Rook-Ceph gives you:

- **Distributed storage** - Data replicated across multiple nodes
- **Self-healing** - Automatic recovery from node failures
- **High availability** - Pods can migrate freely
- **Scalability** - Add nodes to expand storage
- **Production-ready** - Used by enterprises worldwide

### The Perfect Fit for Homelabs

Rook-Ceph is particularly well-suited for homelab environments because:

- It uses node local disks, so no external storage appliances needed
- It's open-source and free
- It's battle-tested in production
- It manages itself using Kubernetes native resources
- It provides excellent observability and dashboards

## Implementation

Now that we understand why Rook-Ceph is a great fit, let's dive into how I
implemented it in my homelab. I'll walk through the deployment strategy, cluster
configuration, storage classes, and some key design decisions that make this
setup reliable and scalable.

### Deployment Strategy

In my setup, I deployed Rook-Ceph using Kustomize through ArgoCD (as we
configured in Chapter 4). This ensures:

- Infrastructure-as-code approach
- Automated deployments
- Easy reproducibility
- Version control of all configurations

### Cluster Configuration

Here's the core Rook-Ceph cluster setup:

```yaml
apiVersion: ceph.rook.io/v1
kind: CephCluster
metadata:
  name: rook-ceph
  namespace: rook-ceph
spec:
  cephVersion:
    image: quay.io/ceph/ceph:v18.2.2
  dataDirHostPath: /var/lib/rook
  mon:
    count: 3 # 3 monitors for quorum
    allowMultiplePerNode: false
  dashboard:
    enabled: true # Web dashboard for monitoring
  storage:
    useAllNodes: true # Use all nodes in cluster
    useAllDevices: true # Use all available disks
```

### Storage Classes

I configured a **StorageClass** to define how storage should be provisioned:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rook-ceph-block
  annotations:
    storageclass.kubernetes.io/is-default-class: 'true'
provisioner: rook-ceph.rbd.csi.ceph.com
parameters:
  clusterID: rook-ceph
  pool: replicapool
  imageFormat: '2'
  imageFeatures: layering,fast-diff,object-map,deep-flatten,exclusive-lock
  csi.storage.k8s.io/fstype: xfs
reclaimPolicy: Retain # Keep volumes after deletion
allowVolumeExpansion: true # Scale volumes on demand
```

### Key Design Decisions

**Monitor Count (3)**: Ceph requires a quorum. With 3 monitors, the cluster
tolerates 1 failure. Given my 3-node setup, one monitor per node is ideal.

**Use All Nodes**: This ensures distributed storage across the entire cluster,
maximizing redundancy.

**Use All Devices**: Any available disk on any node becomes part of the Ceph
cluster.

**Retain Reclaim Policy**: When a PVC is deleted, the underlying volume is
retained (not deleted), providing data safety.

**XFS Filesystem**: More performant and reliable than ext4 for this use case.

## Object Storage

Beyond block storage, Rook-Ceph also provides **Object Storage** (S3-compatible)
through its Radosgw component:

```yaml
apiVersion: ceph.rook.io/v1
kind: CephObjectStore
metadata:
  name: ceph-objectstore
  namespace: rook-ceph
spec:
  metadataPool:
    failureDomain: host
    replicated:
      size: 3
  dataPool:
    failureDomain: host
    erasureCoded:
      dataChunks: 2
      codingChunks: 1
  gateway:
    port: 80
    instances: 2
```

This enables me to:

- Back up applications to S3-compatible storage
- Host private registries
- Create self-hosted object storage alternatives to AWS S3

## Monitoring and Operations

The Rook-Ceph dashboard provides visibility into:

- Cluster health and status
- Capacity and usage metrics
- OSD (storage) performance
- Pool configurations
- Real-time alerts

Accessing it is straightforward through port-forwarding:

```bash
kubectl port-forward -n rook-ceph svc/rook-ceph-mgr-dashboard 7000:7000
```

## Real-World Usage

With Rook-Ceph in place, provisioning storage for applications is trivial:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-database-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: rook-ceph-block
  resources:
    requests:
      storage: 10Gi
```

Applications request storage, Rook automatically provisions it across the cluster,
and data is protected through replication. The complexity is hidden, the benefits
are clear.

## Conclusion

With Rook-Ceph in place, my homelab now has a **production-grade distributed
storage system**. Applications no longer need to worry about node failures -
storage is replicated, self-healing, and highly available.

### The Complete Foundation

This chapter marks the **completion of the foundational Kubernetes setup**. Over
these 8 chapters, we've built all the bare bones infrastructure needed to run
applications reliably:

- **Hardware & Network** (Ch. 1) - The physical foundation
- **Base Infrastructure** (Ch. 2) - OS, networking, security
- **Kubernetes Cluster** (Ch. 3) - Orchestration platform
- **GitOps (ArgoCD)** (Ch. 4) - Automated deployments
- **Secrets Management** (Ch. 5) - Secure configurations
- **Ingress & Load Balancing** (Ch. 6) - External access
- **DNS & SSL** (Ch. 7) - Domain names and encryption
- **Distributed Storage** (Ch. 8) - Persistent data

### What This Enables

With this foundation in place, you can now:

- Deploy stateful applications with confidence
- Know they'll survive node failures
- Scale storage by adding nodes
- Update applications safely with zero downtime
- Manage secrets securely
- Access services via stable domain names with valid certificates
- Automate everything through version control

This is genuinely **production-grade infrastructure** - the kind you'd see in
enterprise environments, but tailored for a homelab.

### What's Next?

From here, the real fun begins. In future quests, we'll explore:

- Running actual applications (databases, message queues, cache layers)
- Monitoring and observability (metrics, logs, alerts)
- CI/CD pipelines (automated testing and deployments)
- Backup strategies and disaster recovery
- Advanced networking and service mesh concepts

But for now, we have a **solid, resilient, production-ready platform**. Every
component we've built is battle-tested, scalable, and self-healing. That's
something to be proud of. 🎉

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

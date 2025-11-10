---
published: true
name: 'Home Lab: Chapter 3'
icon: 'ph:computer-tower'
description: 'Kubernetes Setup'
date: 2025-05-15
---

<script>
    import CaptionImage from '$lib/components/CaptionImage.svelte';
</script>

Howdy!

In this chapter, I'll walk through the setup of the Kubernetes cluster. For the
Operating System (OS) of the nodes, I'll be using [Talos](https://talos.dev/).
As mentioned earlier, the cluster will consist of three physical machines.
Since Kubernetes uses a control-plane/worker model and we only have three
nodes, each one will serve as both a control-plane and a worker. This setup
allows workloads to be scheduled on all nodes while maintaining control-plane
functionality.

## What is Talos?

Talos is a modern, minimalistic operating system designed specifically to run
Kubernetes-and nothing else. It is immutable, meaning the OS is read-only and
cannot be modified. This immutability improves security, making it more
difficult for attackers to alter the system.

Talos is also built to be managed entirely via Kubernetes, simplifying cluster
operations. On a personal note, it's a project I've been following for some
time, and I'm excited to finally try it out.

## Setting up Talos

Talos provides a command-line tool called `talosctl`, which is used to manage
and interact with the cluster. Similar to how `kubectl` is used for managing
Kubernetes resources, `talosctl` is used to create, configure, and operate the
Talos-based infrastructure itself.

To setup the cluster, you first need to download the `talosctl` binary. You can
download it from the [Talos releases page](https://github.com/siderolabs/talos/releases) or you can use the following command to download it:

```bash
# Linux
curl -sL https://talos.dev/install | sh

# MacOS
brew install siderolabs/tap/talosctl
```

I'll go through each step I took to bootstrap my cluster, but in short, the
process to install Talos OS involves the following steps:

1. Download the Talos image
2. Flash the image to a USB drive
3. Boot the node from the USB drive
4. Install Talos on the nodes
5. Reboot the nodes

### Preparing Nodes

Before we begin the configuration, there's some initial setup we need to
complete-specifically, assigning IP addresses to the nodes. Each node will be
given a dedicated IP address to make identification and management easier. All
nodes will be connected to the DMZ network, and for simplicity, we'll assign
their IPs using DHCP.

While DHCP typically assigns IP addresses dynamically, we can configure static
leases to ensure each node always receives the same IP. This is done by mapping
each node's MAC address to a specific IP address in the DHCP settings.

To do this, we'll go into the DHCP configuration on the OPNSense interface and
set up static mappings for each node.

- Node 1: `x.x.x.101`
- Node 2: `x.x.x.102`
- Node 3: `x.x.x.103`

In addition, we can restrict the range of IPs in the DHCP pool - for example,
from `x.x.x.101` to `x.x.x.104` - since we also want to reserve an IP for the
NAS. This limited range ensures that only a small, predefined set of IP
addresses is available for assignment. It adds an extra layer of control by
preventing the DHCP server from assigning addresses to unexpected devices that
might join the network.

### Setting up the Nodes

To set up the nodes, we'll first need to download the Talos image and flash it
to a USB drive. The image can be obtained from the
[Talos releases page](https://github.com/siderolabs/talos/releases).

Once downloaded, you can flash the image to a USB drive using a tool like dd.
Here's an example command:

```bash
sudo dd if=talos.iso of=/dev/sdX bs=4M status=progress && sync
```

> Replace `/dev/sdX` with the path to the USB drive. Be careful with this
> command as it will overwrite the data on the USB drive.

Once the image has been successfully flashed to the USB drive, you can proceed
to boot the node from it. To do this, you may need to enter the BIOS or UEFI
settings and configure the boot order to prioritize the USB drive.

After the node boots into the Talos installer, you can install Talos onto the
system using the following command:

```bash
talosctl install --node x.x.x.x
```

This command installs Talos on the node. Once the installation is complete,
simply reboot the machine-it will now boot directly into Talos. Repeat this process for each node in the cluster to complete the installation.

### Prepare Nodes Config

Once We've downloaded the `talosctl` binary, we can use it to generate the
initial cluster configuration with the following command:

```bash
talosctl gen config
```

This command generates a default configuration, which won't fully meet our
needs. In the next section, we'll customize it accordingly.

Running this command produces three files:

- `talosconfig`: Used by `talosctl` to connect to and manage the cluster.
- `controlplane.yaml`: Configuration used to bootstrap control plane nodes.
- `worker.yaml`: Configuration used to bootstrap worker nodes. We won't be
  using this file, since all of our nodes will act as control plane nodes
  (while still being able to run workloads).

#### Patching Nodes Config

To modify the configuration of the control plane nodes (or workers), we could
manually edit the generated files. However, a more structured and maintainable
approach is to use patches. talosctl supports adding patches to the
configuration, which allows us to organize our changes cleanly and
consistently-especially useful when managing multiple nodes or environments.

We'll be applying the following modifications using patches:

- **Allow Control Plane Workloads**: This will enable workloads to be scheduled
  on the control plane nodes. Since I want the control plane nodes to also act
  as worker nodes, this configuration is essential to allow scheduling of
  workloads on them.

  ```yaml
  # patches/allow-controlplane-workloads.yaml
  cluster:
    allowSchedulingOnControlPlanes: true
  ```

- **Control Plane Node 1**: This configuration is specific to the Node 1. It
  will essentially add a specific hostname, which should make it easily
  identifiable.

  ```yaml
  # patches/control-plane-node-1.yaml
  - op: replace
    path: /machine/network/hostname
    value: clustarino-k8s-1
  ```

- **Control Plane Node 2**: Same configuration, but with a different hostname.

  ```yaml
  # patches/control-plane-node-2.yaml
  - op: replace
    path: /machine/network/hostname
    value: clustarino-k8s-2
  ```

- **Control Plane Node 3**: Same configuration, but with a different hostname.

  ```yaml
  # patches/control-plane-node-3.yaml
  - op: replace
    path: /machine/network/hostname
    value: clustarino-k8s-3
  ```

- **Interface Names**: Allow the interface IDs to be more easily identifiable:

  ```yaml
  # patches/interface-names.yaml
  machine:
    install:
      extraKernelArgs:
        - net.ifnames=0
  ```

- **DHCP**: This will enable DHCP on the Ethernet interface - because of the
  previous config, it will allow the interface to be identified by this name.

  ```yaml
  # patches/dhcp.yaml
  machine:
    network:
      interfaces:
        - interface: eth0
          dhcp: true
  ```

- **Disable Kubeproxy and CNI**: This will disable the Kubeproxy and the
  default CNI that comes with Talos. It will allow us to install our own.

  ```yaml
  # patches/disable-kube-proxy-and-cni.yaml
  cluster:
    network:
      cni:
        name: none
    proxy:
      disabled: true
  ```

- **DNS**: In the previous chapter, I enabled DNS on the Custom Router, which
  is the DNS server we'll be using here.

  > Although the DNS address should be automatically assigned via DHCP, I'll
  > hardcode it in the configuration to allow for easy changes in the future.

  ```yaml
  # patches/dns.yaml
  machine:
    network:
      nameservers:
        - x.x.x.x
  ```

- **NTP**: The NTP we'll also be hardcoding it. For this one. I'll be using
  also the one in our Custom Router.

  > The NTP server should also be automatically assigned via DHCP, but I'll
  > also hardcode it in the configuration to allow for easy changes in the
  > future.

  ```yaml
  # patches/ntp.yaml
  machine:
    time:
      disabled: false
      servers:
        - x.x.x.x
  ```

- **Disk**: I'll be adding an additional disk - a USB stick - which will be
  used as the main OS disk for Talos.

  > If you have questions about this decision, please refer to
  > [Chapter 1](homelab-chapter-1) of this series.

  ```yaml
  # patches/install-disk.yaml
  machine:
    install:
      disk: /dev/nvme0n1
  ```

- **Metrics Server**: The Metrics Server is a cluster-wide aggregator of
  resource usage data, such as CPU and memory consumption. It collects metrics
  from each node and pod, enabling features like autoscaling and resource
  monitoring through tools like kubectl top. To enable it, we need to add the
  following configuration:

  ```yaml
  # patches/metrics-server.yaml
  machine:
    kubelet:
      extraArgs:
        rotate-server-certificates: true

    files:
      - content: |
          [metrics]
            address = "0.0.0.0:11234"
        path: /var/cri/conf.d/metrics.toml
        op: create

  cluster:
    extraManifests:
      - https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/main/deploy/standalone-install.yaml
      - https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  ```

  By default, the certificates used by the Kubelet aren't recognized by the
  Metrics Server. To fix this, we need to enable certificate rotation and
  ensure the Kubelet uses certificates trusted by the Metrics Server. This is
  important because the Kubelet is the agent running on each node that
  manages pods and reports resource usage to the control plane. Secure
  communication between the Kubelet and the Metrics Server relies on trusted
  certificates, so enabling certificate rotation helps keep these credentials
  up-to-date and accepted, ensuring reliable metrics collection and cluster
  security.

- **VIP (Virtual IP)**: Since I'll be using multiple nodes, I need a simple way
  to connect to both the services we're hosting and the cluster itself. To
  achieve this, we can configure a VIP (Virtual IP) - an IP address shared
  across the nodes. This allows clients to reach the cluster through a single,
  stable address regardless of which node is handling the request.

  ```yaml
  # patches/vip.yaml
  machine:
    network:
      interfaces:
        - interface: eth0
          vip:
            ip: x.x.x.105
  ```

#### Generating secrets

With all these patches defined, the only remaining step is to generate the
secrets needed for the control planes to communicate securely with each other,
for new nodes to join the cluster, and for clients - like `kubectl` - to
connect.

`talosctl` includes a utility to generate these secrets. You can create them by
running:

```bash
talosctl gen secrets --output-file outputs/secrets.yaml
```

#### Generating final Nodes Config

Now that we have all the patches and secrets defined, we can generate the final
configuration for the nodes. This is done by running the following command:

```bash
talosctl gen config clustarino https://x.x.x.105:6443 \
    --with-secrets outputs/secrets.yaml \
    --config-patch @patches/allow-controlplane-workloads.yaml \
    --config-patch @patches/dhcp.yaml \
    --config-patch @patches/disable-kube-proxy-and-cni.yaml \
    --config-patch @patches/install-disk.yaml \
    --config-patch @patches/interface-names.yaml \
    --config-patch @patches/metrics-server.yaml \
    --config-patch @patches/ntp.yaml \
    --config-patch-control-plane @patches/vip.yaml \
    --output rendered/
```

This command will output the same three files mentioned earlier, but now they
will include all of our additional configurations.

Since we need to provide some node-specific configuration as well, we also have
to run:

```bash
talosctl machineconfig patch \
    --patch @patches/control-plane-node-1.yaml \
    rendered/controlplane.yaml | yq - > nodes/control-plane-node-1.yaml

talosctl machineconfig patch \
    --patch @patches/control-plane-node-2.yaml \
    rendered/controlplane.yaml | yq - > nodes/control-plane-node-2.yaml

talosctl machineconfig patch \
    --patch @patches/control-plane-node-3.yaml \
    rendered/controlplane.yaml | yq - > nodes/control-plane-node-3.yaml
```

#### Applying config to the Nodes

With all the configuration generated, we can now apply it to each node in the
cluster. But first, we need to identify the IP address of each node. Although
we're using DHCP, we can still assign static IP addresses by configuring DHCP
leases.

To do this, navigate to the leases configuration section in OPNSense and set up
the following static mappings:

<CaptionImage
    image="leases.png"
    alt="DMZ Leases"
    sizes="50rem"
    loading="lazy"
/>

This will make it easy to identify each machine. So now we can apply the
configuration by simply typing:

```bash
talosctl apply -f nodes/control-plane-node-1.yaml --node x.x.x.101 --insecure
talosctl apply -f nodes/control-plane-node-2.yaml --node x.x.x.102 --insecure
talosctl apply -f nodes/control-plane-node-3.yaml --node x.x.x.103 --insecure
```

#### Bootstrapping the Cluster

With all the configuration in place, it's finally time to bootstrap the
cluster. First, we need to specify the cluster endpoints by running:

```bash
talosctl config endpoint x.x.x.101 x.x.x.102 x.x.x.103
```

And now, the moment we've been waiting for - to start the bootstrapping
process, run the following command for each node:

```bash
talosctl bootstrap --node x.x.x.x
```

> This command needs to be run against one of the control plane nodes. Since
> all our nodes serve as control plane nodes, you can run it on any of them.

We can monitor the bootstrap progress by running:

```bash
talosctl dashboard --node x.x.x.x
```

This will open a dashboard where you can view real-time logs and track the
status of the cluster.

## Connecting to the Cluster

Now that our configuration is ready, we can finally apply it. As mentioned
earlier, when generating the config, we obtained a file named `talosconfig`,
which provides `talosctl` with the necessary context to interact with our newly
created cluster.

You can place this file in the default Talos config location
(`~/.talos/config`), or alternatively, set the `TALOSCONFIG` environment
variable to point to its path. For example:

```bash
# In our case, it will be in the `rendered` folder
export TALOSCONFIG=./rendered/talosconfig
```

Now, to generate a kubeconfig file for accessing the Kubernetes cluster, run
the following command:

```bash
talosctl kubeconfig --node x.x.x.x
```

To validate the connection, we can run:

```bash
kubectl get nodes
```

We should see the following output:

```bash
NAME               STATUS      ROLES           AGE     VERSION
clustarino-k8s-1   Not Ready   control-plane   2m14s   v1.30.1
clustarino-k8s-2   Not Ready   control-plane   2m16s   v1.30.1
clustarino-k8s-3   Not Ready   control-plane   2m2s    v1.30.1
```

> The nodes will be in the `Not Ready` state until we install a CNI (Control
> Network Interface).

## Adding CNI

Since we disabled the default CNI that comes with Talos, we need to install our
own. For this, we'll be using Cilium. Cilium is an open-source software that
provides transparent, secure networking between application services deployed
on container platforms like Docker and Kubernetes.

The main reason I chose Cilium is simply that I wanted to try it out. I've been
using GKE in my day-to-day work and wanted to explore Cilium's capabilities in
a more controlled environment.

To install Cilium, we can run the following command:

```bash
# Add the repository
helm repo add cilium https://helm.cilium.io/
helm repo update

# Install the chart
helm upgrade --install cilium cilium/cilium \
    --namespace kube-system \
    --set ipam.mode=kubernetes \
    --set hostFirewall.enabled=true \
    --set hubble.relay.enabled=true \
    --set hubble.ui.enabled=true \
    --set kubeProxyReplacement=true \
    --set securityContext.capabilities.ciliumAgent="{CHOWN,KILL,NET_ADMIN,NET_RAW,IPC_LOCK,SYS_ADMIN,SYS_RESOURCE,DAC_OVERRIDE,FOWNER,SETGID,SETUID}" \
    --set securityContext.capabilities.cleanCiliumState="{NET_ADMIN,SYS_ADMIN,SYS_RESOURCE}" \
    --set cgroup.autoMount.enabled=false \
    --set cgroup.hostRoot=/sys/fs/cgroup \
    --set k8sServiceHost=localhost \
    --set k8sServicePort=7445
```

I chose to use Helm to install Cilium because, in my opinion, it's the easiest
method and is officially maintained by the Cilium team. Helm also allows us to
deploy Hubble, a powerful network observability tool built into Cilium.

The command above installs Cilium with the following configuration options:

- `ipam.mode=kubernetes`: Enables Cilium to use Kubernetes' IP Address
  Management (IPAM) for assigning pod IPs.

- `hostFirewall.enabled=true`: Activates the host firewall within Cilium for
  enhanced security.

- `hubble.relay.enabled=true`: Enables the Hubble relay component.

- `hubble.ui.enabled=true`: Enables the Hubble UI for network observability.

- `kubeProxyReplacement=true`: Replaces the default kube-proxy with Cilium's
  implementation.

- `securityContext.capabilities.ciliumAgent`: Sets specific capabilities for
  the Cilium agent.

- `securityContext.capabilities.cleanCiliumState`: Sets capabilities to clean
  up Cilium state when needed.

- `cgroup.autoMount.enabled=false`: Disables automatic mounting of cgroups.

- `cgroup.hostRoot=/sys/fs/cgroup`: Specifies the host root directory for
  cgroups.

- `k8sServiceHost=localhost`: Sets the Kubernetes API server host to localhost.

- `k8sServicePort=7445`: Sets the Kubernetes API server port.

Once the installation completes, you can verify the status of the Cilium pods
by running:

```bash
kubectl get pods -n kube-system
```

## Network Policies

Now that Cilium is installed, we can add some network policies to control and
allow traffic between the nodes. To do this, create a `network-policies.yaml`
file with the following content:

```yaml
---
apiVersion: cilium.io/v2
kind: CiliumClusterwideNetworkPolicy
metadata:
  name: host-fw-control-plane
spec:
  description: 'control-plane specific access rules.'
  nodeSelector:
    matchLabels:
      node-role.kubernetes.io/control-plane: ''
  ingress:
    # Allow access to kube api from anywhere.
    - fromEntities:
        - world
        - cluster
      toPorts:
        - ports:
            - port: '6443'
              protocol: 'TCP'

    # Allow access to talos from anywhere.
    # https://www.talos.dev/v1.10/learn-more/talos-network-connectivity/
    - fromEntities:
        - world
        - cluster
      toPorts:
        - ports:
            - port: '50000'
              protocol: 'TCP'
            - port: '50001'
              protocol: 'TCP'

    # Allow kube-proxy-replacement from kube-apiserver.
    - fromEntities:
        - kube-apiserver
      toPorts:
        - ports:
            - port: '10250'
              protocol: 'TCP'
            - port: '4244'
              protocol: 'TCP'

    # Allow access from hubble-relay to hubble-peer (running on the node).
    - fromEndpoints:
        - matchLabels:
            k8s-app: hubble-relay
      toPorts:
        - ports:
            - port: '4244'
              protocol: 'TCP'

      # Allow metrics-server to scrape.
    - fromEndpoints:
        - matchLabels:
            k8s-app: metrics-server
      toPorts:
        - ports:
            - port: '10250'
              protocol: 'TCP'

    # Allow ICMP Ping from/to anywhere.
    - icmps:
        - fields:
            - type: 8
              family: IPv4
            - type: 128
              family: IPv6

    # Allow cilium tunnel/health checks from other nodes.
    - fromEntities:
        - remote-node
      toPorts:
        - ports:
            - port: '8472'
              protocol: 'UDP'
            - port: '4240'
              protocol: 'TCP'

    # Allow access to etcd and api from other nodes.
    - fromEntities:
        - remote-node
      toPorts:
        - ports:
            - port: '2379'
              protocol: 'TCP'
            - port: '2380'
              protocol: 'TCP'
            - port: '51871'
              protocol: 'UDP'

    # Allow access to etcd and api from unconfigured nodes.
    - fromCIDR:
        - x.x.x.101/32
        - x.x.x.102/32
        - x.x.x.103/32
      toPorts:
        - ports:
            - port: '2379'
              protocol: 'TCP'
            - port: '2380'
              protocol: 'TCP'
            - port: '51871'
              protocol: 'UDP'

    # Allow HTTP and HTTPS access from anywhere.
    - fromEntities:
        - world
        - cluster
      toPorts:
        - ports:
            - port: '80'
              protocol: 'TCP'
            - port: '443'
              protocol: 'TCP'

    # Allow access from inside the cluster to the admission controller.
    - fromEntities:
        - cluster
      toPorts:
        - ports:
            - port: '8443'
              protocol: 'TCP'
```

This configuration will:

- Allow access to the Kubernetes API server from anywhere.

- Allow access to Talos OS management ports from anywhere.

- Allow kube-apiserver to communicate with kubelet and Cilium agent (kube-proxy
  replacement).

- Allow Hubble relay pods to communicate with Hubble peers running on the nodes.

- Allow metrics-server to scrape kubelet metrics for monitoring.

- Allow ICMP Echo Request (ping) from/to anywhere for network diagnostics.

- Allow Cilium overlay networking (VXLAN/UDP tunnels) and health checks between
  cluster nodes.

- Allow etcd communication and API access between cluster nodes.

- Allow etcd and API access from specific unconfigured node IP addresses.

- Allow public HTTP (port 80) and HTTPS (port 443) access to services on the
  nodes.

- Allow intra-cluster traffic to access the Kubernetes admission controller on
  port 8443.

We can apply this configuration by running the following command:

```bash
kubectl apply -f network-policies.yaml
```

This will apply the network policies to the cluster. After applying them, we
can check the status of the nodes with:

```bash
kubectl get nodes
```

If everything is set up correctly, you should see the nodes in the `Ready`
state, indicating they are healthy and fully functional within the cluster.

## Conclusion

This concludes the setup of the Kubernetes cluster. We have successfully
bootstrapped the cluster and installed Cilium as the CNI. With this, the base
setup of the Kubernetes cluster is complete.

While the cluster is now up and running, there are still a few components
missing that will allow us to expose services outside the cluster. In the next
chapter, we will walk through the setup of the Ingress Controller, which will
enable external access to the services hosted within the cluster.

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

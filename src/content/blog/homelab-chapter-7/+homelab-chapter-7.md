---
published: true
name: 'Home Lab: Chapter 7'
icon: 'ph:computer-tower'
description: 'Kubernetes DNS and SSL'
date: 2025-08-15
---

<script>
    import CaptionMermaid from '$lib/components/CaptionMermaid.svelte'
    import CaptionImage from '$lib/components/CaptionImage.svelte';
</script>

Howdy,

Our environment is starting to take shape. We have a Kubernetes cluster up and running, an Ingress Controller managing external access to our services, and a way to handle secrets. The next step is making sure our services are accessible from the outside world. To do this, we need to configure DNS and SSL.

## Getting a Domain

Before configuring DNS, you need a domain name to access your services. If you don't have one yet, you can register a domain with any registrar you prefer. Popular options include [Namecheap](https://www.namecheap.com/), [GoDaddy](https://www.godaddy.com/), or [Google Domains](https://domains.squarespace.com/) - previously known as [Google Domains](https://domains.google/). What's important is that you have full access to manage the DNS records for that domain.

> Choose a domain that's easy to remember and type. Trust me - you'll thank yourself later when testing and sharing URLs.

While it's not strictly required, I recommend using a domain you own rather than an internal-only domain. Why? Because issuing valid SSL certificates for your own domain is straightforward, allowing you to access your services over HTTPS without headaches.

If you decide to stick with an internal domain, you'll need to use a self-signed certificate or one issued by a private certificate authority (CA). This works fine for internal use, but accessing the services externally can be tricky. Browsers won't trust your private CA by default, so you'll see warnings unless you install your root CA certificate on your system or browser. Using a domain you own avoids this hassle entirely.

## DNS and SSL

DNS (Domain Name System) is what translates human-readable domain names into IP addresses, allowing us to access websites and services without memorizing numbers. We've touched on DNS before, but it's worth revisiting since it plays a crucial role in exposing our services. In a previous chapter, we set up a DNS server to resolve some of our internal services - mostly infrastructure-related. Now, we want to extend DNS to resolve the domain names for services that will be accessible both externally and internally.

Because we have two different scenarios, we'll need two DNS setups:

- **Internal-facing applications** - accessible only within our network.
- **Public-facing applications** - accessible from the internet.

To keep things simple, I'll use two separate DNS servers for these scenarios. One server will manage public records, and the other will manage internal records. This isn't strictly required - we could use a single DNS server for both - but separating them helps avoid conflicts and keeps things organized.

> Some configuration details will vary depending on the DNS solution you choose. In this _guide_, I'll be using Bind9 for internal-facing applications and Cloudflare for public-facing applications. You can pick whichever DNS servers you prefer, as long as you can manage both internal and external records without conflicts.

Below is a high-level overview of the DNS and SSL setup for our Homelab:

<CaptionMermaid alt="Kubernetes DNS and SSL">
flowchart TD
    subgraph Firewall["Firewall"]
        Unbound["Unbound"]
    end
    subgraph Internal_Facing["Kubernetes"]
        Bind9["Bind9 Authoritative DNS"]
        Internal_Services["Internal Services"]
        Internal_Ingresses["Internal Ingresses"]
        ExternalDNS["ExternalDNS"]
        CertManager["Cert-Manager"]
    end
    subgraph Internal["Homelab"]
        Internal_Facing
        Firewall
    end
    subgraph Public["Public"]
        CF["Cloudflare DNS"]
        CFIP["Cloudflare Anycast IP"]
        CF_Tunnel["Cloudflare Tunnel"]
        PublicResolvers
    end
    Unbound -- Forwards internal --> Bind9
    Unbound -- Forwards public --> PublicResolvers[(Public DNS)]
    Bind9 --> Internal_Ingresses
    Internal_Ingresses --> Internal_Services
    ExternalDNS -- RFC2136 Updates --> Bind9
    CertManager --> Internal_Services
    CF -- A/CNAME Record --> CFIP
    CFIP --> CF_Tunnel
    CF_Tunnel --> Internal_Services
    ExternalDNS -. Sync Records .-> Bind9
    CertManager -. "DNS-01 Challenge" .-> CF
</CaptionMermaid>

## Internal facing DNS records

For internal-facing applications, we'll be using Bind9, an open-source authoritative DNS server. This setup allows us to:

- Host internal DNS records for services accessible only within our network (e.g., `nginx.<INTERNAL_DOMAIN>`).
- Resolve public domains by forwarding requests to external resolvers such as `1.1.1.1` (Cloudflare) or `8.8.8.8` (Google).

By combining Bind9 with Unbound as a forwarder, Bind9 becomes our primary internal DNS server capable of resolving both internal and external domains.

### Bind9 Setup

We can install Bind9 using the official Helm chart and manage it via GitOps with ArgoCD. Here's an example `bind9.yaml`:

```yaml
# bind9.yaml
# ...
repoURL: https://github.com/johanneskastl/helm-charts.git
targetRevision: bind9-0.5.1
path: charts/bind9
helm:
  valuesObject:
    image:
      repository: internetsystemsconsortium/bind9
      tag: '9.21' # 9.19 is not available
    service:
      dns-udp:
        type: NodePort
        ports:
          dns-udp:
            nodePort: 30053
    chartMode: authoritative
    persistence:
      config:
        enabled: true
      bind9namedconf:
        enabled: true
        name: bind9-named-config
      bind9userconfiguration:
        enabled: true
        name: bind9-config
# ...
```

This configuration:

- Uses the official `internetsystemsconsortium/bind9` image.
- Exposes DNS on port `30053` via a `NodePort` service - this allows external access to the DNS server.
- Persists configuration files so that data is not lost when the pod restarts.
- Sets up Bind9 in `authoritative` mode, meaning it will manage DNS records for our internal domain.

### Bind9 Configuration

We define the zones and DNS records using a **named configuration**. A named configuration specifies the zones for which the Bind9 server is authoritative and the associated records.

```yaml
# bind9-config.yaml
named.conf.local: |
    key "tsig-key" {
        algorithm hmac-sha512;
        secret "<SECRET>";
    };
    zone "<INTERNAL_DOMAIN>" in {
        type master;
        file "/named_config/<INTERNAL_DOMAIN>.zone";
        journal "/config/<INTERNAL_DOMAIN>.zone.jnl";
        notify no;
        allow-transfer {
            key "tsig-key";
        };
        update-policy {
            grant tsig-key zonesub ANY;
        };
    };
  <INTERNAL_DOMAIN>.zone: |
    $TTL 3600 ; 1 hour
    @   IN SOA  <INTERNAL_DOMAIN>. <EMAIL>. (
                  2025040601 ; serial
                  43200      ; refresh (12 hours)
                  3600       ; retry (1 hour)
                  604800     ; expire (1 week)
                  3600       ; minimum (1 hour)
                )
        IN NS     ns.<INTERNAL_DOMAIN>.
    ns  IN A      x.x.x.105
```

Explanation:

- **TSIG key**: Stands for **Transaction Signature** - it is used to authenticate and secure dynamic updates to the zone without exposing the server publicly.
- **SOA record**: Defines the authoritative server and key timing parameters for DNS propagation.
- **NS record**: Defines the name server for the zone.
- **A record**: Points the name server to the Bind9 server's IP (`x.x.x.105` - cluster **VIP** address).
- Replace `<INTERNAL_DOMAIN>` with your internal domain and `<EMAIL>` with the administrator email. Increment the serial number (`2025040601`) on every update.

We define global options for Bind9 in a separate configuration:

```yaml
# bind9-named-config.yaml
named.conf: |
  options {
    directory "/var/cache/bind";

    dnssec-validation auto;
    listen-on port 5053 { any; };
    listen-on-v6 port 5053 { any; };
    recursion no;
    allow-query { any; };

    querylog no;

  };
  include "/named_config/named.conf.local";

  // No default zones configured.
  // This server is authoritative-only.
```

Explanation:

- **directory**: Location for cache files.
- **dnssec-validation auto**: Verifies authenticity of external DNS records.
- **recursion no**: Server does not perform recursive lookups - it only serves authoritative zones.
- **allow-query - any**: Accept queries from any IP.
- Includes the `named.conf.local` for zone definitions.

After creating `bind9.yaml`, `bind9-named-config.yaml`, and `<INTERNAL_DOMAIN>.zone`:

1. Push the files to your Git repository.
2. ArgoCD will detect changes and deploy Bind9 with the defined configuration.

This setup ensures your internal DNS is authoritative, secure, and persistent, and supports dynamic updates for internal-facing applications.

### Record Creation

With the DNS server up and running, we can now start adding records using ExternalDNS.

ExternalDNS is a Kubernetes controller that automatically manages DNS records for cluster resources such as Services, Ingresses, and more. By adding the `external-dns.alpha.kubernetes.io/hostname` annotation to a Kubernetes resource, ExternalDNS can dynamically create or update the corresponding DNS record. It supports multiple DNS providers, including **Cloudflare**, **AWS Route 53**, **Google Cloud DNS**, and - most relevant to us - [rfc2136](https://datatracker.ietf.org/doc/html/rfc2136).

**RFC2136** is a DNS update protocol supported by Bind9, which allows us to update DNS records dynamically. With this, ExternalDNS can manage Bind9 records automatically.

To install ExternalDNS, we can use the official Helm chart. For GitOps-based installation via ArgoCD, create an `Application` object in an `external-dns.yaml` file:

```yaml
# external-dns.yaml
# ...
chart: external-dns
repoURL: https://charts.bitnami.com/bitnami
targetRevision: 6.7.2
helm:
  valuesObject:
    provider: rfc2136
    regexDomainFilter:
      - <INTERNAL_DOMAIN>
    rfc2136:
      host: dns-bind9-dns-tcp.dns.svc.cluster.local
      port: 53
      zone: <INTERNAL_DOMAIN>
      secretName: external-dns-tsig-key
      tsigKeyname: tsig-key
      tsigSecretAlg: hmac-sha512
      tsigAxfr: true
# ...
```

Here, the provider is set to `rfc2136`, pointing to our Bind9 service. The `zone` is the domain we want to manage, and **TSIG** keys are used for secure updates.

The keys can be generated using the `tsig-keygen`:

```bash
tsig-keygen -a hmac-sha512 tsig-key
```

The output will be a key in the format:

```python
key "tsig-key" {
    algorithm hmac-sha512;
    secret "C4cYZr0v8IL2l58k0QZtyHd1hMqAbbUOTrZ9I/4WwjIJhkFX3x06BPiRZPXx/Iu76FEy/GzOnMYzPi40CfZ+PQ==";
};
```

We can then grab the secret and store it in a Kubernetes secret, `external-dns-tsig-key`.

```yaml
# external-dns-tsig-key.yaml
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: external-dns-tsig-key
  namespace: dns
stringData:
  rfc2136_tsig_secret: C4cYZr0v8IL2l58k0QZtyHd1hMqAbbUOTrZ9I/4WwjIJhkFX3x06BPiRZPXx/Iu76FEy/GzOnMYzPi40CfZ+PQ==
```

### TLS Certificates

With DNS in place, we also need secure HTTPS access for our applications. Enter **Cert Manager** - a Kubernetes controller that automates TLS certificate issuance and renewal. Cert Manager supports multiple issuers, including Let's Encrypt, which we'll use.

Install Cert Manager via Helm and GitOps with an `Application` object in `cert-manager.yaml`:

```yaml
# cert-manager.yaml
# ...
chart: cert-manager
repoURL: https://charts.jetstack.io
targetRevision: 1.15.1
helm:
  valuesObject:
    installCRDs: true
    extraArgs:
      - --dns01-recursive-nameservers-only
      - --dns01-recursive-nameservers=1.1.1.1:53
# ...
```

This installs the necessary CRDs for certificate management and configures DNS01 challenges to work with recursive nameservers.

Next, create a `ClusterIssuer` for Let's Encrypt:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: '<EMAIL>'
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cert-manager-cf-api-token
              key: token
```

This config allows Cert Manager to issue certificates for our internal apps using DNS01 challenges via Cloudflare.

Certificates can then be requested by annotating an Ingress resource:

```yaml
cert-manager.io/cluster-issuer: letsencrypt
```

### Testing the Internal Setup

To test, deploy a simple `nginx` application with an Ingress:

<details>

```yaml
# nginx-internal-test.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-internal
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-internal
  template:
    metadata:
      labels:
        app: nginx-internal
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-internal
  namespace: default
spec:
  selector:
    app: nginx-internal
  ports:
    - name: http
      port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-internal
  namespace: default
  annotations:
    external-dns.alpha.kubernetes.io/hostname: nginx.<INTERNAL_DOMAIN>
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  rules:
    - host: nginx.<INTERNAL_DOMAIN>
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-internal
                port:
                  name: http
    tls:
      - hosts:
          - nginx.<INTERNAL_DOMAIN>
        secretName: nginx-tls
```

Apply the configuration:

```bash
# Apply the configuration
kubectl apply -f nginx-internal-test.yaml
```

</details>

Once applied, the following should happen:

1. The `nginx-internal` **Deployment** will be created and the pod will start running.
2. The `nginx-internal` **Service** will be created, exposing the pod on port `80`.
3. The `nginx-internal` **Ingress** resource will be created, and the hostname `nginx.<INTERNAL_DOMAIN>` will be managed by ExternalDNS.
4. The `letsencrypt` **ClusterIssuer** will be used to issue a TLS certificate for the hostname `nginx.<INTERNAL_DOMAIN>`.

   We can check the status of the Ingress resource with:

   ```bash
   ## Check the status of the Ingress resource
   kubectl get ingress nginx -n default
   ```

   This should show the hostname and the TLS certificate that was issued. If everything is working correctly, we should be able to access the `nginx` application using `https://nginx.<INTERNAL_DOMAIN>`.

5. The **ExternalDNS** controller will automatically create a DNS record for `nginx.<INTERNAL_DOMAIN>` in Bind9, pointing to the IP of the Ingress Controller.
6. The **Bind9 server** will be able to resolve the hostname `nginx.<INTERNAL_DOMAIN>` to the IP of the Ingress Controller, allowing access from the internal network.
7. The **TLS certificate** will be issued by Let's Encrypt and will be valid for `nginx.<INTERNAL_DOMAIN>`. This allows HTTPS access without browser warnings.

   Check the status of the TLS certificate:

   ```bash
   ## Check the status of the TLS certificate
   kubectl get certificate nginx-tls -n default
   ```

   This should display the certificate's status and expiration date. If everything is working correctly, the certificate should be valid for the next few months.

8. After issuance, a new secret named `nginx-tls` will be created, containing the TLS certificate and private key. The Ingress Controller will use this secret to terminate TLS connections.
9. The **Ingress** resource will automatically use the `nginx-tls` secret for TLS termination.

After completing these steps, the `nginx` application should be accessible over HTTPS at `<https://nginx>.<INTERNAL_DOMAIN>` without warnings.

Test the application:

```bash
# Test the application
curl "https://nginx.<INTERNAL_DOMAIN>" @x.x.x.101:30053
```

> Since the Bind9 service is exposed on port `30053` across three nodes, you can use any node for testing.

### Unbound Forwarder

As a final step, we can configure Unbound to forward DNS queries to our Bind9 server. This allows Unbound to act as a DNS resolver for the internal network while still resolving public domain names normally.

To configure this:

1. Open the **OpnSense Interface**.
2. Navigate to `Services -> Unbound DNS -> Query Forwarding`.
3. Add a new forwarding entry with the following settings:
   - Domain: `<INTERNAL_DOMAIN>`
   - Forward IP: `x.x.x.101` (select the node you want to forward queries to)
   - Port: `30053`
4. Save and apply the changes.

Once applied:

1. Any DNS query for `<SERVICE>.<INTERNAL_DOMAIN>` will be forwarded by Unbound to the Bind9 server.
2. Bind9 will respond with the internal record from its authoritative zone if it exists.
3. Public domains will continue to be resolved via Unbound's configured upstream resolvers (e.g., `1.1.1.1`, `8.8.8.8`).
4. This setup ensures that internal-facing applications are accessible from anywhere inside the network using their internal hostnames.

You can verify this by running:

```bash
# Resolve an internal application using Unbound
dig nginx.<INTERNAL_DOMAIN> @<FIREWALL_IP>
```

<details>

```txt
; <<>> DiG 9.10.6 <<>> nginx.<INTERNAL_DOMAIN> @<FIREWALL_IP>
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23690
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;nginx.<INTERNAL_DOMAIN>. IN   A

;; ANSWER SECTION:
nginx.<INTERNAL_DOMAIN>. 0 IN  A       x.x.x.105

;; Query time: 15 msec
;; SERVER: <FIREWALL_IP>#53(<FIREWALL_IP>)
```

</details>

The result should return the **internal IP address** of the Ingress Controller as provided by Bind9.

We now should be able to access our internal services using their hostname without needing to specify the DNS server.

```bash
# Test the internal service
curl "http://nginx-internal.<INTERNAL_DOMAIN>"
```

<details>

<CaptionImage
    image="nginx-landing-page.png"
    alt="Nginx Internal Landing Page"
    sizes="50rem"
    loading="lazy"
/>

</details>

## Public facing DNS records

For public-facing applications, we'll be using Cloudflare as our DNS provider. Cloudflare is a content delivery network (CDN) that offers a fast, secure, and reliable network for websites and applications. On top of that, it provides DNS services, allowing us to manage domain names and resolve them to IP addresses easily.

> I chose Cloudflare because their free tier lets us manage DNS records and resolve them to IP addresses without cost.

Both DNS records and TLS certificates will be managed through Cloudflare. We'll also take advantage of other features offered in their free plan, like Cloudflare Tunnels, which will simplify securely exposing our services to the public internet.

### Cloudflare Tunnels

Cloudflare Tunnels (CF Tunnels) let us expose internal services to the public internet without revealing our own IP address. As the name suggests, they act as a tunnel between the server running your service and Cloudflare itself. When a client accesses your public domain, the IP it sees will be one of Cloudflare's public IP addresses. CF then routes the traffic through the tunnel, letting it reach your infrastructure safely.

This approach minimizes our attack surface. If we exposed our own IP, we'd be more vulnerable to attacks like DoS or DDoS. By letting Cloudflare handle the initial traffic, we automatically gain features like IP allowlists, attack protection, and traffic control - features we'd otherwise have to implement ourselves. Most importantly for us, it hides our IP, manages SSL certificates, and handles DNS records automatically.

Luckily, there's a Kubernetes-friendly project called [cloudflare-operator](https://github.com/adyanth/cloudflare-operator) that simplifies setting up CF Tunnels. It provides custom Kubernetes resources to manage tunnels directly from your cluster.

### Installing the Cloudflare Operator

We can install the operator in our Kubernetes cluster via ArgoCD, just like we've done in previous chapters:

```yaml
# cf-operator.yaml
# ...
project: default
source:
  repoURL: https://github.com/adyanth/cloudflare-operator.git
  targetRevision: main
  path: config/default
destination:
  name: in-cluster
  namespace: cf-operator
# ...
```

Next, we need a Cloudflare API token with the following permissions:

- Cloudflare Tunnel: Edit
- Account Settings: Read
- `<PUBLIC_DOMAIN>` DNS: Edit

We store this token as a Kubernetes secret:

```yaml
# cf-api-token.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cf-api-token
  namespace: cf-operator
type: Opaque
data:
  CLOUDFLARE_API_TOKEN: "<BASE64_ENCODED_TOKEN>""
```

### Creating a Tunnel

We then define a ClusterTunnel resource to manage the Cloudflare tunnel:

```yaml
# cf-tunnel.yaml
apiVersion: networking.cfargotunnel.com/v1alpha1
kind: ClusterTunnel
metadata:
  name: cf-tunnel
spec:
  newTunnel:
    name: cf-tunnel
  size: 2
  cloudflare:
    email: '<EMAIL>'
    domain: '<PUBLIC_DOMAIN>'
    secret: cf-api-token
    accountName: '<ACCOUNT_NAME>'
```

### Expose application

With the tunnel in place, we expose our apps using a `TunnelBinding` resource:

```yaml
# cf-expose-nginx.yaml
apiVersion: networking.cfargotunnel.com/v1alpha1
kind: TunnelBinding
metadata:
  name: expose-nginx
  namespace: default
subjects:
  - name: nginx-default
    spec:
      fqdn: nginx.<PUBLIC_DOMAIN>
      target: http://nginx.default.svc.cluster.local:8080
      noTlsVerify: false
tunnelRef:
  kind: ClusterTunnel
  name: cf-tunnel
```

Cloudflare automatically creates the DNS records and generates TLS certificates for the application.

### Testing the Public Setup

To demonstrate how Cloudflare Tunnels works, let's deploy a simple nginx application and expose it via the tunnel previously created.

<details>

```yaml
# nginx-external-test.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-external
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-external
  template:
    metadata:
      labels:
        app: nginx-external
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-external
  namespace: default
spec:
  selector:
    app: nginx-external
  ports:
    - name: http
      port: 80
      targetPort: 80
```

Apply the configuration:

```bash
# Apply the configuration
kubectl apply -f nginx-external-test.yaml
```

</details>

Once applied, the following should happen:

1. The `nginx` **Deployment** will be created and the pod will start running.
2. The `nginx` **Service** will be created, exposing the pod on port `80`.
3. The `cf-nginx` **TunnelBinding** will be created, linking the Cloudflare Tunnel to the nginx service.
4. The **Cloudflare Tunnel** will be established, allowing external traffic to reach the nginx service.
5. The **Cloudflare DNS** records will be created, pointing to the tunnel.
6. The **Cloudflare SSL** certificates will be issued for the nginx service.
7. The `nginx` service will be accessible via the public domain.

We can check the status of the tunnel using the following command:

```bash
kubectl describe tunnelbinding cf-nginx -n default
```

<details>

Where we'll see all of this happening directly from the resource events. It should look like this:

```txt
  Type    Reason          Age   From                 Message
  ----    ------          ----  ----                 -------
  Normal  Configuring     15m   cloudflare-operator  Configuring ConfigMap
  Normal  ApplyingConfig  15m   cloudflare-operator  Applying ConfigMap to Deployment
  Normal  AppliedConfig   15m   cloudflare-operator  ConfigMap applied to Deployment
  Normal  Configured      15m   cloudflare-operator  Configured Cloudflare Tunnel
  Normal  MetaSet         15m   cloudflare-operator  TunnelBinding Finalizer and Labels added
  Normal  CreatedDns      15m   cloudflare-operator  Inserted/Updated DNS/TXT entry
```

</details>

With these resources in place, the Cloudflare Tunnel can forward external traffic to the nginx service using the `TunnelBinding` we created earlier. Users can now access the application via:

```bash
# Test the application
curl "https://nginx.<PUBLIC_DOMAIN>"
```

<details>

<CaptionImage
    image="nginx-landing-page.png"
    alt="Nginx Public Landing Page"
    sizes="50rem"
    loading="lazy"
/>

</details>

This setup demonstrates the full flow: Cloudflare handles DNS & TLS, tunnels the traffic to our cluster, and the Service routes it to the Deployment pod.

## Conclusion

In this chapter, we tackled one of the most important steps in making our cluster truly usable from anywhere: DNS and SSL. We mapped out the architecture, set up Bind9 for rock-solid internal DNS, and leaned on Cloudflare for public-facing names - all with automation in mind. Thanks to ExternalDNS and Cert-Manager, record creation and TLS issuance now happen without manual intervention, keeping everything secure and up to date.

With this in place, our homelab services have:

- A clean separation between internal and public DNS management.
- Automated DNS updates directly from Kubernetes resources.
- Seamless HTTPS access - internally and externally - without scary browser warnings.

The end result? Any service we spin up can be securely exposed, tested, and shared with almost no extra work. We're no longer manually juggling DNS zones or dealing with certificate renewal headaches - it's all declarative, reproducible, and in sync with our GitOps flow.

From here, we can focus on deploying more useful applications, knowing that they'll _just work_ whether we're inside the lab or halfway across the world. In the next chapter, we'll start putting this setup to use by deploying real workloads and integrating them into our automated homelab stack.

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

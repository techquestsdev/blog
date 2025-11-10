---
published: true
name: 'Home Lab: Chapter 5'
icon: 'ph:computer-tower'
description: 'Kubernetes Managing Secrets'
date: 2025-07-02
---

<script>
    import CaptionMermaid from '$lib/components/CaptionMermaid.svelte'
</script>

Howdy,

Secrets are a fundamental part of any application - it's how we securely store sensitive information. In Kubernetes, there are several approaches to handling secrets. In this chapter, we'll explore different ways to manage secrets in Kubernetes.

## What is a Secret?

First off, what exactly is a Secret? A Secret is a Kubernetes object that holds a small amount of sensitive data - like a password, token, or key. Without Secrets, you might have to hard-code these values into Pod specs or container images. Users can create Secrets manually, and Kubernetes also generates some automatically.

## Our Scenario

In the previous chapter, we already needed to work with some sensitive data:

- We generated Talos Secrets, which include a bundle of crucial credentials.
- We created ArgoCD Secrets, which hold a GitHub private key for repository access.

So the question is: _How can we securely manage these secrets while still getting the automation benefits from Kubernetes and ArgoCD?_

## Secrets Management Options

You've got a few choices for managing secrets in Kubernetes:

- Built-in Kubernetes Secrets
- Third-party secret managers (Vault, AWS/Azure/GCP Key Management, etc.)
- Kubernetes operators (e.g. Sealed Secrets by Bitnami)

For simplicity in this chapter, we'll stick with built-in Kubernetes Secrets - though we may revisit other options later.

## Kubernetes Secrets

Kubernetes Secrets let you store things like passwords, OAuth tokens, and SSH keys securely. It's much safer and more flexible than embedding secrets directly in Pod specs or container images. However, remember: Kubernetes Secrets are only **Base64** encoded by default, **not encrypted**. So if you require encryption at rest, layer in a third-party tool.

## Managing Secrets

While Kubernetes makes it easy to use Secrets, we still need an automated and secure way to manage them. That's where ArgoCD comes in. With ArgoCD, we can store our secrets in a Git repository and use a Kustomize overlay to apply them to the cluster.

Kustomize lets you customize raw, template-free YAML files without altering the originals. This means we can keep clean, reusable manifests while layering in environment-specific or sensitive configurations, like secrets, on top.

So far, so good. But you might be wondering:

> "How can we safely store secrets in Git?"

Great question! The answer is encryption - and this is where [SOPS](https://github.com/getsops/sops) comes in.

SOPS (Secrets OPerationS) is a flexible tool that encrypts files in a way that lets you decrypt them later when needed. It supports various encryption backends: PGP, GnuPG, AWS KMS, Azure Key Vault, Google Cloud KMS, Vault, and more.

For this setup, I'll be using [age](https://github.com/FiloSottile/age) - a modern, simple, and secure encryption tool that serves as a lightweight alternative to GPG.

By combining:

- Kustomize
- SOPS + age
- And the KSOPS plugin (a Kustomize plugin for SOPS)

... we get a powerful GitOps-friendly workflow:

<CaptionMermaid alt="Secrets Management Flow">
flowchart TD
    A(Git - encrypted secrets via SOPS/age) --> B(ArgoCD + Kustomize + KSOPS) --> C(Kubernetes cluster - decrypted Secrets)
</CaptionMermaid>

This setup allows us to store encrypted secrets in Git, and ArgoCD will automatically decrypt them using KSOPS when applying them to the cluster. This way, we can manage our secrets securely while still benefiting from GitOps automation.

Once the secrets are decrypted, they are applied to the cluster as standard Kubernetes Secrets, which can then be consumed by Pods and other resources.

# How to use KSOPS

1. Generate an age key pair:

   ```bash
   ## Generate the age keys
   age-keygen -o ~/.config/sops/age/keys.txt
   ```

   We should get as the output of this command:

   ```bash
   age-keygen -o key.txt
   Public key: age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l
   ```

2. Create a Kubernetes secret to store the age public key:

   ```bash
   ## Create the sops-age secret
   kubectl create secret generic sops-age \
     --namespace argocd \
     --from-file=keys.txt=~/.config/sops/age/keys.txt
   ```

3. Create a `.sops.yaml` to define which files/fields should be encrypted:

   ```yaml
   # .sops.yaml
   ---
   stores:
   yaml:
       indent: 2
   creation_rules:
   - path_regex: secrets.yaml
       encrypted_regex: '^(id|secret|bootstraptoken|secretboxencryptionsecret|token|ca|crt|key)$'
       age: age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l
   ```

   This configuration instructs SOPS to encrypt the secrets.yaml file using the `age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l` public key. It targets any field that matches the following regular expression:

   > The `age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l` key is the public key generated during the creation of the `sops-age` Kubernetes secret

4. Encrypt your file:

   ```bash
   ## Encrypt the file content
   ksops -e -i secrets.yaml
   ```

   If we now inspect the `secrets.yaml` file, we'll see that the content is now
   encrypted. To decrypt the file content back to its original state, we can run
   the following command:

   ```bash
   ## Decrypt the file content
   ksops -d -i secrets.yaml
   ```

   > Decrypting the file content requires the private key that we generated when we created the `sops-age` secret.

## Config ArgoCD to manage Secrets

To configure ArgoCD to manage secrets, we need to tweak the `values.yaml` file that we created in the previous [Chapter 4](homelab-chapter-4#installation) and add the following configuration:

```yaml
# values.yaml
---
repoServer:
  env:
    - name: XDG_CONFIG_HOME
      value: /.config
    - name: SOPS_AGE_KEY_FILE
      value: /.config/sops/age/keys.txt
  volumes:
    - name: custom-tools
      emptyDir: {}
    - name: sops-age
      secret:
        secretName: sops-age
  initContainers:
    - name: install-ksops
      image: viaductoss/ksops:v4.3.3
      command: ['/bin/sh', '-c']
      args:
        - echo "Installing KSOPS...";
          mv ksops /custom-tools/;
          mv kustomize /custom-tools/;
          echo "Done.";
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
  volumeMounts:
    - mountPath: /usr/local/bin/kustomize
      name: custom-tools
      subPath: kustomize
    - mountPath: /.config/kustomize/plugin/viaduct.ai/v1/ksops/ksops
      name: custom-tools
      subPath: ksops
    - mountPath: /.config/sops/age/keys.txt
      name: sops-age
      subPath: keys.txt
```

This configuration enables ArgoCD to manage secrets securely using KSOPS and age. It sets the `XDG_CONFIG_HOME` environment variable to `/.config`, directing SOPS to look for its configuration files there. The `SOPS_AGE_KEY_FILE` is set to `/.config/sops/age/keys.txt`, so SOPS can locate the age private key used for decryption.

Two volumes are defined: `custom-tools`, an `emptyDir` volume for storing the KSOPS and Kustomize binaries, and `sops-age`, a secret volume that holds the age key file. An `initContainer` named `install-ksops` installs the necessary binaries into the `custom-tools` volume before the main ArgoCD container starts.

The volumes are mounted inside the pod: custom-tools is mounted at `/usr/local/bin/kustomize` and `/custom-tools` to make the binaries accessible, while `sops-age` is mounted at `/.config/sops/age/keys.txt` so that the decryption key is available for SOPS during runtime.

We also need to create the `sops-age` secret that contains the age keys file:

```bash
# Generate the age keys
age-keygen -o ~/.config/sops/age/keys.txt

## Create the secret
cat ~/.config/sops/age/keys.txt | kubectl create secret generic sops-age --namespace argocd --from-file=keys.txt=/dev/stdin
```

With the secrets now created, the only thing left to do is apply the
new configuration to the cluster:

```bash
# Upgrade the ArgoCD installation
helm upgrade --install argocd argo/argo-cd \
    --namespace argocd \
    --values values.yaml
```

Voilà! ArgoCD is now KSOPS-enabled with age key support. We now have a secure and automated way to manage our secrets in a Git repository and still have them applied to the cluster in a secure way.

## Adding Secrets to the Git

1. Create your secret manifest, e.g. `example-secret.yaml`:

   ```yaml
   # example-secret.yaml
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: example-secret
   stringData:
     foo: bar
   ```

2. Add an entry in `.sops.yaml` to match and encrypt `foo`:

   ```yaml
   # .sops.yaml
   # ...
   - path_regex: example-secret.yaml
     encrypted_regex: '^foo'
     age: age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l
   ```

3. And then we can encrypt it by running:

   ```bash
   ## Encrypt the file content
   ksops -e -i example-secret.yaml
   ```

   If we now inspect the `example-secret.yaml` file, we'll see that the content is
   now encrypted:

   ```yaml
   # example-secret.yaml
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: example-secret
   stringData:
     foo: ENC[AES256_GCM,data:s7FsAPs=,iv:ywvzww/Jq342vkENSEXLxopD8aAf3jCE0TPfwILJz1Q=,tag:DYFKhAVr7pgf1cW5+cevbw==,type:str]
   sops:
     kms: []
     gcp_kms: []
     azure_kv: []
     hc_vault: []
     age:
       - recipient: age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l
         enc: |
           -----BEGIN AGE ENCRYPTED FILE-----
           YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSB0cXo4YTNaYTdGT1Y3U29N
           WFR4WlJISTRUaU1jTXVzTUFqZCsxQVBoaEZvCmRQZVAzMS9ZM3RqbTlrSEdyUmJj
           ejFZNDVlMEpZY2s3Z1VSdTdQYWk3MmMKLS0tIFQxVUhibEVHSVJtb09XNkRxcVN5
           TUVIcmdaRloyUVZzckNMbkpVVXo5WjQK70C/ZvuailOheaSXMM5Rx+CGXZ9K98tw
           ++Q6PZPafdZxkwSIRjZU6ihAk0L6TXs3MJ93yvn/n3CA9zQp9tDuXg==
           -----END AGE ENCRYPTED FILE-----
     lastmodified: '2025-04-02T21:12:33Z'
     mac: ENC[AES256_GCM,data:t3MIPtm19pt+Ov27VkQvrDM/4IN48KXiOpQQlP1czWn12sv68pMt/fALxnrSM3jgv2q0reG5j9vJlA9zFPVw8sdudZ7mmY+HoFIfp8ryZOqX1Ro2hBPR4aj9eXBZT5Gjwf8eOYgYKRdOev6pRmtTA5wJ2qRAZkhvBm3mHHp7d+E=,iv:57/nNwc25K0J632kgo7MX7J0FyUN13ED7wwww9qOAMQ=,tag:qV1/qTDyAUrIFah2AeXrmQ==,type:str]
     pgp: []
     encrypted_regex: ^foo
     version: 3.9.0
   ```

   As we can see, the `foo` field is now encrypted, and a new `sops` field has been added, which contains the encryption metadata.

   The `kms`, `gcp_kms`, `azure_kv`, `hc_vault`, and `pgp` fields are lists of encryption keys for their respective backends. Since none of these were used in this case, they are empty.

   The `age` field lists the age keys used to encrypt the file. Here, we used the `age1efe0s548vkwgvjkdtgu4exf9v4mtltjv6rn5yww33yd75ad7r5xsjq7f8l` key, so the field includes both the recipient and the corresponding encrypted payload.

   The `lastmodified` field records when the file was last updated.

   The `mac` field is a message authentication code used to verify the file's integrity and ensure it hasn't been tampered with.

   The `encrypted_regex` field specifies a regular expression used by SOPS to determine which fields in the document should be encrypted.

   The `version` field indicates the SOPS file format version used for encryption.

4. Add a Kustomize overlay by creating a `kustomization.yaml` file along with a KSOPS generator:

   ```yaml
   # kustomization.yaml
   ---
   apiVersion: kustomize.config.k8s.io/v1beta1
   kind: Kustomization
   metadata:
   name: example-secret
   generators:
     - example-secret-generator.yaml
   ```

   And the associated `generator` file:

   ```yaml
   # example-secret-generator.yaml
   ---
   apiVersion: viaduct.ai/v1
   kind: ksops
   metadata:
   name: example-secret-generator
   files:
     - example-secret.yaml
   ```

   This overlay tells Kustomize to use the KSOPS plugin to decrypt `example-secret.yaml` before applying it to the cluster, enabling secure GitOps-driven secrets management.

Now you can push the changes to your Git repository and let ArgoCD handle the deployment. When ArgoCD applies the configuration, it will automatically decrypt the secret using the provided Age keys and apply it to the cluster as a standard Kubernetes Secret.

> Ensure that ArgoCD is already configured to track the correct Git repository and that the `example-secret.yaml` file is located in the expected directory.

With that, the setup is complete. You now have a secure and automated workflow for managing secrets through Git and ArgoCD.

## Conclusion

In this chapter I've demonstrated how to securely manage Kubernetes secrets using GitOps principles. By integrating KSOPS with ArgoCD and Kustomize, we can encrypt secrets, store them in Git, and have them decrypted and applied to the cluster automatically.

While this setup offers a solid foundation, it's not the most advanced solution in terms of security. For production environments requiring features like access controls, audit logging, or automatic key rotation, consider tools such as HashiCorp Vault or a Kubernetes-native solution like Sealed Secrets.

That said, this approach strikes a good balance between simplicity, security, and GitOps compatibility - making it an excellent starting point for secret management in Kubernetes.

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

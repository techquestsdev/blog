<script>
  import { onMount } from 'svelte';

  let status = 'Send ->';
  let nameInput;
  let emailInput;
  let messageInput;

  onMount(() => {
    [nameInput, emailInput, messageInput].forEach((field) => {
      if (field?.dataset?.placeholder) {
        field.placeholder = field.dataset.placeholder;
      }
    });
  });

  const handleSubmit = async (event) => {
    status = 'Sending...';
    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: json
      });

      const result = await response.json();
      if (result.success) {
        status = 'Message Sent!';
        event.currentTarget.reset();
        return;
      }

      status = 'Send failed. Please try email.';
    } catch {
      status = 'Send failed. Please try email.';
    }
  };
</script>

<main>
  <h1>Contact</h1>
  <p>Ways to get in touch, in order from fastest to slowest.</p>
  <div class="info">
    X <span class="sub">-></span>
    <a href="https://x.com/0xaanogueira" class="external" target="_blank" rel="noopener noreferrer"
      >0xaanogueira<span class="arrow">-></span>
    </a>
  </div>
  <div class="info">
    Discord <span class="sub">-></span>
    <a
      href="https://discord.com/users/aanogueira"
      class="external"
      target="_blank"
      rel="noopener noreferrer"
      >aanogueira<span class="arrow">-></span>
    </a>
  </div>
  <div class="info">
    Email <span class="sub">-></span>
    <a href="mailto:aanogueira@protonmail.com" class="external"
      >aanogueira@protonmail.com<span class="arrow">-></span>
    </a>
  </div>
  <h3 class="section-title">Contact form</h3>
  <form
    method="POST"
    action="https://api.web3forms.com/submit"
    on:submit|preventDefault={handleSubmit}
  >
    <input type="hidden" name="access_key" value="31a49089-9b40-4bf6-89a7-fa5a56535661" />
    <input type="hidden" name="subject" value="Tech Quests contact form" />
    <div class="field">
      <label class="field-label" for="contact-name"
        >Name<span class="cli-only">: </span>
        <input
          id="contact-name"
          type="text"
          name="name"
          data-placeholder="John Doe"
          required
          bind:this={nameInput}
        />
      </label>
    </div>
    <div class="field">
      <label class="field-label" for="contact-email"
        >Email<span class="cli-only">: </span>
        <input
          id="contact-email"
          type="email"
          name="email"
          data-placeholder="john.doe@gmail.com"
          required
          bind:this={emailInput}
        />
      </label>
    </div>
    <div class="field full">
      <label class="field-label" for="contact-message"
        >Message<span class="cli-only">: </span>
        <textarea
          id="contact-message"
          name="message"
          data-placeholder="Hi there! I have a question about..."
          required
          rows="4"
          bind:this={messageInput}
        ></textarea>
      </label>
    </div>
    <div class="field full">
      <button type="submit">{status}</button>
    </div>
  </form>
</main>

<style lang="scss">
  main {
    @include page-container;
  }

  a {
    font-family: $font-family-mono;
    font-size: $font-sm;
  }

  .info {
    font-size: $font-sm;
    margin: $spacing-sm 0;
    font-family: $font-family-mono;
  }

  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm $spacing-md;
  }

  .field {
    display: grid;
    gap: $spacing-xs;
  }

  .section-title {
    margin-top: $spacing-4xl;
  }

  .cli-only {
    display: none;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  .field-label {
    font-size: $font-xs;
    font-family: $font-family-mono;
    color: var(--txt-2);
    display: grid;
    gap: $spacing-xs;
  }

  input[type='text'],
  input[type='email'],
  textarea,
  button {
    background-color: transparent;
    border: none;
    padding: $spacing-sm;
    color: inherit;
    font: inherit;
    font-size: $font-xs;
    border: 2px solid var(--bg-3);
    transition: $transition-fast;
    background-color: var(--bg-2);
    // border-radius: 0.5rem;

    &:focus {
      outline: none;
      border: 2px solid var(--txt-2);
    }
  }

  ::placeholder {
    color: var(--txt-2);
  }

  textarea,
  button {
    grid-column: 1 / -1;
  }

  button {
    font-family: 'Fira Mono', monospace;
    padding: $spacing-sm $font-sm;
    &:hover {
      border: 2px solid var(--txt-2);
    }
  }

  @media (max-width: $breakpoint-mobile) {
    form {
      grid-template-columns: auto;
    }
  }
</style>

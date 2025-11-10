<script>
  let status = 'Send ->';
  const handleSubmit = async (data) => {
    status = 'Sending...';
    const formData = new FormData(data.currentTarget);
    const object = Object.fromEntries(formData);
    object.access_key = '31a49089-9b40-4bf6-89a7-fa5a56535661';
    const json = JSON.stringify(object);

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
  <br />
  <br />
  <br />
  <h3>Contact form</h3>
  <form on:submit|preventDefault={handleSubmit}>
    <input type="text" name="name" placeholder="Name" required />
    <input type="email" name="email" placeholder="Email" required />
    <textarea name="message" placeholder="Your message..." required rows="4"></textarea>
    <button type="submit">{status}</button>
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
    grid-template-columns: auto auto;
    gap: $spacing-sm;
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

<script>
  let nameInput;
  let emailInput;
  let messageInput;

  let errors = { name: '', email: '', msg: '' };
  let posting = false;
  let sent = false;
  let failed = false;

  const rules = {
    name: (value) => (value.trim() ? '' : 'Enter your name so I know who to reply to.'),
    email: (value) =>
      !value.trim()
        ? 'Enter your email so I can reply.'
        : /^\S+@\S+\.\S+$/.test(value)
          ? ''
          : 'That email looks incomplete, e.g. you@example.com.',
    msg: (value) => (value.trim().length >= 10 ? '' : 'Write at least 10 characters.')
  };

  const validate = (id, value) => {
    const message = rules[id](value);
    errors = { ...errors, [id]: message };
    return !message;
  };

  const handleBlur = (event) => {
    const field = event.currentTarget;
    validate(field.id, field.value);
  };

  const handleSubmit = async (event) => {
    if (posting) return;

    const form = event.currentTarget;
    sent = false;
    failed = false;

    const results = [
      validate('name', nameInput.value),
      validate('email', emailInput.value),
      validate('msg', messageInput.value)
    ];
    const firstInvalid = results.indexOf(false);
    if (firstInvalid !== -1) {
      [nameInput, emailInput, messageInput][firstInvalid].focus();
      return;
    }

    posting = true;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(object)
      });

      const result = await response.json();
      if (result.success) {
        form.reset();
        errors = { name: '', email: '', msg: '' };
        sent = true;
      } else {
        failed = true;
      }
    } catch {
      failed = true;
    } finally {
      posting = false;
    }
  };
</script>

<section class="g ph">
  <div class="side">
    <span class="lab">05 · Contact</span>
    <span class="lab"><b>Send a raven</b></span>
  </div>
  <h1 class="mega c-r">Say hello</h1>
  <p class="lede">Questions about a post, a project idea, or a bug in one of the artifacts.</p>
</section>

<div class="g band heavy">
  <form
    class="form"
    method="POST"
    action="https://api.web3forms.com/submit"
    novalidate
    on:submit|preventDefault={handleSubmit}
  >
    <input type="hidden" name="access_key" value="31a49089-9b40-4bf6-89a7-fa5a56535661" />
    <input type="hidden" name="subject" value="Tech Quests contact form" />

    <div class="field" class:invalid={!!errors.name}>
      <label for="name">Name *</label>
      <input
        id="name"
        type="text"
        name="name"
        autocomplete="name"
        aria-invalid={errors.name ? 'true' : 'false'}
        bind:this={nameInput}
        on:blur={handleBlur}
      />
      <span class="err" hidden={!errors.name}>{errors.name}</span>
    </div>

    <div class="field" class:invalid={!!errors.email}>
      <label for="email">Email *</label>
      <input
        id="email"
        type="email"
        name="email"
        autocomplete="email"
        aria-invalid={errors.email ? 'true' : 'false'}
        bind:this={emailInput}
        on:blur={handleBlur}
      />
      <span class="err" hidden={!errors.email}>{errors.email}</span>
    </div>

    <div class="field" class:invalid={!!errors.msg}>
      <label for="msg">Message *</label>
      <textarea
        id="msg"
        name="message"
        rows="5"
        autocomplete="off"
        aria-invalid={errors.msg ? 'true' : 'false'}
        bind:this={messageInput}
        on:blur={handleBlur}></textarea>
      <span class="err" hidden={!errors.msg}>{errors.msg}</span>
    </div>

    <button class="btn" type="submit" disabled={posting}>
      {posting ? 'Sending…' : 'Send message'}
    </button>

    {#if sent}
      <div class="ok" role="status">
        <strong class="mono">Message logged.</strong> Thanks — I'll get back to you soon.
      </div>
    {/if}
    {#if failed}
      <p class="err" role="alert">Send failed. Please try email.</p>
    {/if}
  </form>

  <ul class="links">
    <li class="lab" style="padding-bottom:12px">Elsewhere</li>
    <li>
      <a href="https://x.com/0xaanogueira" target="_blank" rel="noopener noreferrer"
        >X <span>↗</span></a
      >
    </li>
    <li>
      <a href="https://discord.com/users/aanogueira" target="_blank" rel="noopener noreferrer"
        >Discord <span>↗</span></a
      >
    </li>
    <li><a href="mailto:aanogueira@protonmail.com">Email <span>↗</span></a></li>
    <li>
      <a href="https://github.com/aanogueira" target="_blank" rel="noopener noreferrer"
        >GitHub <span>↗</span></a
      >
    </li>
    <li><a href="/rss.xml">RSS <span>↗</span></a></li>
  </ul>
</div>

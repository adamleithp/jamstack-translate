<script>
	import Header from './components/Header.svelte'
	export let name;
	let email = 'test@test.com'
</script>

<Header/>
<main>
	<h1>{@html `<t>Bonjour mon nom est ${name}, ravi de vous rencontrer!</t>`}</h1>
	<h1><t>e-mail {email}</t></h1>
	<p>{@html `<t>Consultez le <a href="https://svelte.dev/tutorial"> didacticiel Svelte </a> pour savoir comment créer des applications Svelte.</t>`}</p>
	<input bind:value={name}>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
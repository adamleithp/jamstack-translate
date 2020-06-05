<script>
	import Header from './components/Header.svelte'
	export let name;

</script>

<header>
<main>
	<h1>{@html `<t>Hola, mi nombre es ${name}. ¡Mucho gusto!</t>`}</h1>
	<p>{@html `<t>Visite el <a href="https://svelte.dev/tutorial">tutorial de Svelte</a> para aprender a crear aplicaciones de Svelte.</t>`}</p>
	<input bind:value="{name}">
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
</style></header>
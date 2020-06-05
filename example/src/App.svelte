<script>
	import Header from './components/Header.svelte'
	export let name;

</script>

<Header/>
<main>
	<h1>{@html `<t>Hello my name is ${name}, nice to meet you!</t>`}</h1>
	<p>{@html `<t>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</t>`}</p>
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
<script>
	import Header from './components/Header.svelte'
	export let name;

</script>

<header>
<main id="html">
	<h1>{@html `<t class="v4Bk4H1ec">Bonjour mon nom est ${name}, ravi de vous rencontrer!</t>`}</h1>
	<p>{@html `<t class="WT3WkIfJKv">Consultez le <a href="https://svelte.dev/tutorial">didacticiel Svelte</a> pour savoir comment créer des applications Svelte.</t>`}</p>
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
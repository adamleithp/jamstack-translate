<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      <t>Para obtener una guía y recetas sobre cómo configurar / personalizar este proyecto,<br> check out the <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.</t>
    </p>
    <h3><t>Complementos de CLI instalados</t></h3>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

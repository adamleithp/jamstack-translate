<div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      <t>Para obtener una guía y recetas sobre cómo configurar / personalizar este proyecto, <br>
      revisar la
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">documentación vue-cli</a>.</t>
    </p>
    <h3><t>Complementos de CLI instalados</t></h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener"><t>Babel</t></a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener"><t>eslint</t></a></li>
    </ul>
    <h3><t>Enlaces Esenciales</t></h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener"><t>Documentos principales</t></a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener"><t>Foro</t></a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener"><t>Chat comunitario</t></a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener"><t>Gorjeo</t></a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener"><t>Noticias</t></a></li>
    </ul>
    <h3><t>Ecosistema</t></h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener"><t>vue-router</t></a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener"><t>vuex</t></a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener"><t>vue-devtools</t></a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"><t>vue-loader</t></a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener"><t>impresionante-vue</t></a></li>
    </ul>
  </div>


<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="">
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

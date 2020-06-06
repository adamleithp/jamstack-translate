<div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      <t>Pour un guide et des recettes sur la façon de configurer / personnaliser ce projet, <br>
      Vérifiez
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">documentation vue-cli</a>.</t>
    </p>
    <h3><t>Plugins CLI installés</t></h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener"><t>babel</t></a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener"><t>eslint</t></a></li>
    </ul>
    <h3><t>Liens essentiels</t></h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener"><t>Documents de base</t></a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener"><t>Forum</t></a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener"><t>Chat communautaire</t></a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener"><t>Twitter</t></a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener"><t>Nouvelles</t></a></li>
    </ul>
    <h3><t>Écosystème</t></h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener"><t>vue-router</t></a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener"><t>vuex</t></a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener"><t>vue-devtools</t></a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"><t>vue-loader</t></a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener"><t>awesome-vue</t></a></li>
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

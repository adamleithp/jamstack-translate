<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      <t>For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.</t>
    </p>
    <h3><t>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener"><t>babel</t></a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener"><t>eslint</t></a></li>
    </ul>
    <h3><t>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener"><t>Core Docs</t></a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener"><t>Forum</t></a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener"><t>Community Chat</t></a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener"><t>Twitter</t></a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener"><t>News</t></a></li>
    </ul>
    <h3><t>Ecosystem</t></h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener"><t>vue-router</t></a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener"><t>vuex</t></a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener"><t>vue-devtools</t></a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"><t>vue-loader</t></a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener"><t>awesome-vue</t></a></li>
    </ul>
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

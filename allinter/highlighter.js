export default {
  props: ['path'],
  template: `
    <b-button size="sm" pill class="btn-allint-highlighter" :title="path.cssPath" @click="$emit('highlight', path)">{{ path.lastTag }}</b-button>
  `
}

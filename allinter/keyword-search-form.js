export default {
  props: ['value'],
  data: function() {
    return {
      text: this.value
    };
  },
  template: `
    <b-form inline @submit.prevent="$emit('search', text)">
      <label class="sr-only" :for="'keyword' + _uid">検索文字列</label>
      <b-input-group>
        <b-input :id="'keyword-' + _uid" type="text" placeholder="検索文字列" v-model="text" />
        <b-input-group-append>
          <b-button type="submit" title="検索" variant="secondary">
            <b-icon icon="search" />
            <span class="sr-only">検索</span>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form>
  `
}

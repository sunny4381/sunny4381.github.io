export default {
  template: `
    <b-form inline @submit.prevent="$emit('download')">
      <b-button type="submit" title="ダウンロード" variant="secondary">
        <b-icon icon="download" />
        <span class="sr-only">ダウンロード</span>
      </b-button>
    </b-form>
  `
}

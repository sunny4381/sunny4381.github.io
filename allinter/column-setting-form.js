const MODAL_ID_BASE = "column-setting-modal";

const ColumnSettingModal = {
  props: ['id', 'fields'],
  template: `
    <b-modal :id="id" title="表示列設定" lazy @ok="$emit('ok');" @cancel="$emit('cancel');" @close="$emit('close');">
      <b-container fluid>
        <b-row v-for="field in fields" :key="field.key">
          <b-col>{{ field.label }}</b-col>
          <b-col>
            <b-form-checkbox v-model="field.visible" :name="field.key" switch>{{ field.visible ? "表示" : "非表示" }}</b-form-checkbox>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  `
};

export default {
  props: ['fields'],
  components: {
    "allint-column-setting-modal": ColumnSettingModal
  },
  methods: {
    modalId: function() {
      return MODAL_ID_BASE + "-" + this._uid;
    },
    openModal: function() {
      this.$bvModal.show(this.modalId());
    }
  },
  template: `
    <b-form inline @submit.prevent="openModal()">
      <b-button type="submit" title="表示列設定" variant="secondary" @click="openModal()">
        <b-icon icon="table" />
        <span class="sr-only">表示列設定</span>
      </b-button>

      <allint-column-setting-modal :id="modalId()" :fields="fields" @ok="$emit('column-setting-change');"></allint-column-setting-modal>
    </b-form>
  `
};

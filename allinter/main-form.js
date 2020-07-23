export default {
  props: ['url', 'validating'],
  data: function() {
    return {
      target: this.url
    };
  },
  template: `
    <b-form @submit.prevent="$emit('validate-page', target);">
      <fieldset v-bind:disabled="validating">
        <b-input-group :prepend="i18next.t('mainForm.url')">
          <b-form-input type="url" v-model="target" v-bind:readonly="validating"></b-form-input>
        </b-input-group>
        <small id="url-help" class="form-text text-muted">{{i18next.t('mainForm.help')}}</small>
        <div class="d-flex justify-content-around">
          <button type="submit" class="btn btn-primary btn-lg">
            <b-icon icon="play" />
            {{i18next.t('mainForm.validation')}}
          </button>
        </div>
      </fieldset>
    </b-form>
  `
};

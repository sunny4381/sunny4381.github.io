const KNOWN_SEVERITY_IDS = [ "all", "essential", "warning", "userCheck", "info" ];

function normalizeSeverity(id) {
  if (!id) {
    return "all";
  }

  if (KNOWN_SEVERITY_IDS.includes(id)) {
    return id;
  }

  return "all";
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}

const SeverityFilterItem = {
  props: ['active', 'count', 'severityId', 'severityName'],
  template: `
    <b-list-group-item button class="d-flex justify-content-between align-items-center" :active="active" :disabled="count === 0" @click="$emit('click')">
      {{severityName}}
      <b-badge variant="light" v-html="i18next.t('severityFilter.countHtml', { count: count, text: count.toLocaleString() })"></b-badge>
    </b-list-group-item>
  `
};

export default {
  components: {
    "allint-severity-filter-item": SeverityFilterItem
  },
  props: ['counts', 'severity'],
  data: function() {
    return {
      selected: normalizeSeverity(this.severity),
      totalCount: sum(this.counts)
    };
  },
  methods: {
    changeSeverity: function(severity) {
      const normalized = normalizeSeverity(severity);
      if (this.selected !== normalized) {
        this.selected = normalized;
        this.$emit('change-severity', normalized);
      }
    }
  },
  template: `
    <b-list-group>
      <allint-severity-filter-item :count="totalCount" severityId="all" :severityName="i18next.t('enum.severities.all')" :active="selected === 'all'" @click="changeSeverity('all')" />
      <hr>
      <allint-severity-filter-item :count="counts[0]" severityId="essential" :severityName="i18next.t('enum.severities.essential')" :active="selected === 'essential'" @click="changeSeverity('essential')" />
      <allint-severity-filter-item :count="counts[1]" severityId="warning" :severityName="i18next.t('enum.severities.warning')" :active="selected === 'warning'" @click="changeSeverity('warning')" />
      <allint-severity-filter-item :count="counts[2]" severityId="userCheck" :severityName="i18next.t('enum.severities.userCheck')" :active="selected === 'userCheck'" @click="changeSeverity('userCheck')" />
      <allint-severity-filter-item :count="counts[3]" severityId="info" :severityName="i18next.t('enum.severities.info')" :active="selected === 'info'" @click="changeSeverity('info')" />
    </b-list-group>
  `
}

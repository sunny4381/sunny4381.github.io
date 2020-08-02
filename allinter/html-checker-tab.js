import { lastTag, sliceMap, escapeCsv, download, convertSeverityIdToName, normalizeText, normalizeSeverity } from "./util.js";
import TableData from "./table-data.js"

export default {
  props: ['validating', 'problem'],
  data: function() {
    return {
      filter: {
        summary: "",
        severity: normalizeSeverity(),
        text: ""
      },
      fields: [],
      masterFields: [
        {
          key: "severity",
          label: i18next.t("problemTable.severity"),
          class: "allinter-severity",
          sortable: true,
          visible: true
        },
        {
          key: "highlightPaths",
          label: i18next.t("problemTable.highlightPaths"),
          class: "allinter-highlight-paths",
          sortable: false,
          visible: true
        },
        {
          key: "perceivable",
          label: i18next.t("problemTable.perceivable"),
          class: "allinter-metric0",
          sortable: true,
          visible: false
        },
        {
          key: "operable",
          label: i18next.t("problemTable.operable"),
          class: "allinter-metric1",
          sortable: true,
          visible: false
        },
        {
          key: "understandable",
          label: i18next.t("problemTable.understandable"),
          class: "allinter-metric2",
          sortable: true,
          visible: false
        },
        {
          key: "robust",
          label: i18next.t("problemTable.robust"),
          class: "allinter-metric3",
          sortable: true,
          visible: false
        },
        {
          key: "wcag2",
          label: i18next.t("problemTable.wcag2"),
          class: "allinter-guideline0",
          sortable: true,
          visible: true
        },
        {
          key: "section508",
          label: i18next.t("problemTable.section508"),
          class: "allinter-guideline1",
          sortable: true,
          visible: true
        },
        {
          key: "jis",
          label: i18next.t("problemTable.jis"),
          class: "allinter-guideline2",
          sortable: true,
          visible: true
        },
        {
          key: "techniques",
          label: i18next.t("problemTable.techniques"),
          class: "allinter-techniques",
          sortable: true,
          visible: true
        },
        {
          key: "description",
          label: i18next.t("problemTable.description"),
          class: "allinter-description",
          sortable: false,
          visible: true
        }
      ]
    };
  },
  computed: {
    tableData: function() {
      return TableData.create(this.problem);
    }
  },
  created: function() {
    this.updateFields();
  },
  methods: {
    highlightElement: function(path) {
      if (! path || !path.cssPath) {
        return;
      }

      if (typeof hostCallback !== "undefined") {
        hostCallback(JSON.stringify({
          name: "highlight", payload: { tabId: this.tableData.tabId, cssPath: path.cssPath }
        }));
      }
    },
    updateFilter: function() {
      const filters = [];
      if (this.filter.severity) {
        filters.push(this.filter.severity.trim());
      }
      if (this.filter.text) {
        filters.push(this.filter.text);
      }

      this.filter.summary = filters.join(" ");
      this.tableData.applyFilter(this.filter);
    },
    changeSeverityFilter: function(severity) {
      this.filter.severity = normalizeSeverity(severity);
      this.updateFilter();
    },
    changeTextFilter: function(text) {
      this.filter.severity = normalizeSeverity();
      this.filter.text = normalizeText(text);
      this.updateFilter();
    },
    doFilter: function(row, filter) {
      if (this.filter.text) {
        // search in description
        if (! row.description.includes(this.filter.text)) {
          return false;
        }
      }

      if (this.filter.severity && this.filter.severity !== "all") {
        // match with severity
        const severity = convertSeverityIdToName(this.filter.severity);
        if (row.severity !== severity) {
          return false;
        }
      }

      return true;
    },
    updateFields: function() {
      this.fields = this.masterFields.filter(
        field => field.visible
      ).map(
        field => sliceMap(field, [ "key", "label", "class", "sortable" ])
      );
    },
    downloadAsCsv: function() {
      const csv = [];
      const terms = [];

      csv.push(Array.from(this.masterFields, (field) => field.label).join(","));
      this.tableData.items.forEach((item) => {
        terms.length = 0;

        // 重度指数 (severity)
        terms.push(escapeCsv(item.severity));
        // ハイライト (highlightPaths)
        terms.push(escapeCsv(
          Array.from(
            item.highlightPaths,
            (highlightPath) => highlightPath.cssPath
          ).join("\n")
        ));
        // 知覚可能 ~ 堅牢 (perceivable ~ robust)
        terms.push(escapeCsv(item.perceivable));
        terms.push(escapeCsv(item.operable));
        terms.push(escapeCsv(item.understandable));
        terms.push(escapeCsv(item.robust));
        // WCAG 2.0 ~ JIS (wcag2 ~ jis)
        terms.push(escapeCsv(item.wcag2));
        terms.push(escapeCsv(item.section508));
        terms.push(escapeCsv(item.jis));
        // 達成方法 (techniques)
        terms.push(escapeCsv(item.techniques));
        // 内容 (description)
        terms.push(escapeCsv(item.description));

        csv.push(terms.join(","));
      });

      download(csv, `html-checker-${moment().format("YYYY-MM-DD")}.csv`);
    }
  },
  template: `
    <b-tab :title="i18next.t('htmlCheckerTab.title')">
      <div v-if="tableData.isPresented">
        <div class="row">
          <div class="col-3">
            <allint-severity-filter :counts="tableData.counts" :severity="filter.severity" @change-severity="changeSeverityFilter($event)"></allint-severity-filter>
          </div>
          <div class="col-9">
            <div class="row mb-1">
              <div class="col d-flex justify-content-end">
                <allint-keyword-search-form :value="filter.text" @search="changeTextFilter($event)"></allint-keyword-search-form>

                <allint-column-setting-form class="ml-2" :fields="masterFields" @column-setting-change="updateFields();"></allint-column-setting-form>

                <allint-download-form class="ml-2" @download="downloadAsCsv"></allint-download-form>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <b-table striped hover responsive sticky-header :items="tableData.items" :fields="fields" :filter="filter.summary" :filter-function="doFilter">
                  <template v-slot:cell(highlightPaths)="data">
                    <span v-if="data.value && data.value.length > 0">
                      <allint-highlighter v-for="path in data.value" :key="path.id" :path="path" @highlight="highlightElement"></allint-highlighter>
                    </span>
                  </template>
                </b-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-tab>
  `
}

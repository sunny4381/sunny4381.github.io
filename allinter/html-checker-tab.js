import { lastTag, sliceMap, escapeCsv, download, convertSeverityIdToName } from "./util.js";

function tableData(problemData) {
  const tableData = { tabId: null, items: [], counts: [ 0, 0, 0, 0 ] };
  if (!problemData || !problemData.problems || problemData.problems.length === 0) {
    return tableData;
  }

  tableData.tabId = problemData.tabId;
  tableData.items = Array.from(problemData.problems, (problem, index) => {
    return {
      id: index,
      severity: problem.severityStr,
      perceivable: problem.evaluationItem["tableDataMetrics"][0],
      operable: problem.evaluationItem["tableDataMetrics"][1],
      understandable: problem.evaluationItem["tableDataMetrics"][2],
      robust: problem.evaluationItem["tableDataMetrics"][3],
      wcag2: problem.evaluationItem["tableDataGuideline"][0],
      section508: problem.evaluationItem["tableDataGuideline"][1],
      jis: problem.evaluationItem["tableDataGuideline"][2],
      techniques: problem.evaluationItem["tableDataTechniques"],
      highlightPaths: problem.highlightTargetPaths && problem.highlightTargetPaths.length > 0 ? Array.from(problem.highlightTargetPaths, (highlightTargetPath, index) => {
        return {
          id: index,
          cssPath: highlightTargetPath.cssPath,
          lastTag: lastTag(highlightTargetPath.cssPath)
        };
      }) : [],
      description: problem.description
    };
  });

  problemData.problems.forEach((problem, index) => {
    if (problem.severity & 1) {
      tableData.counts[0] += 1;
    }
    if (problem.severity & 2) {
      tableData.counts[1] += 1;
    }
    if (problem.severity & 4) {
      tableData.counts[2] += 1;
    }
    if (problem.severity & 8) {
      tableData.counts[3] += 1;
    }
  });

  return tableData;
}

export default {
  props: ['validating', 'problem'],
  data: function() {
    return {
      filterSeverity: "",
      filterText: "",
      filter: "",
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
      return tableData(this.problem);
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
    hasProblem: function() {
      return this.tableData && this.tableData.items && this.tableData.items.length > 0;
    },
    updateFilter: function() {
      const filters = [];
      if (this.filterText && this.filterText.trim()) {
        filters.push(this.filterText.trim());
      }
      if (this.filterSeverity && this.filterSeverity.trim()) {
        filters.push(this.filterSeverity.trim());
      }

      this.filter = filters.join(" ");
    },
    changeFilterSeverity: function(severity) {
      this.filterSeverity = severity;
      this.updateFilter();
    },
    doFilter: function(row, filter) {
      if (this.filterText && this.filterText.trim()) {
        // search in description
        if (! row.description.includes(this.filterText.trim())) {
          return false;
        }
      }

      if (this.filterSeverity && this.filterSeverity.trim()) {
        if (this.filterSeverity !== "all") {
          // match with severity
          const severity = convertSeverityIdToName(this.filterSeverity)
          if (row.severity !== severity) {
            return false;
          }
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
      <div v-if="hasProblem()">
        <div class="row">
          <div class="col-3">
            <allint-severity-filter :counts="tableData.counts" :severity="filterSeverity" @change-severity="changeFilterSeverity($event)"></allint-severity-filter>
          </div>
          <div class="col-9">
            <div class="row mb-1">
              <div class="col d-flex justify-content-end">
                <allint-keyword-search-form :value="filterText" @search="filterText = $event; updateFilter();"></allint-keyword-search-form>

                <allint-column-setting-form class="ml-2" :fields="masterFields" @column-setting-change="updateFields();"></allint-column-setting-form>

                <allint-download-form class="ml-2" @download="downloadAsCsv"></allint-download-form>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <b-table striped hover responsive sticky-header :items="tableData.items" :fields="fields" :filter="filter" :filter-function="doFilter">
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

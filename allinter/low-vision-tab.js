import { lastTag, sliceMap, escapeCsv, download, convertSeverityIdToName } from "./util.js";

function tableData(problemData) {
  const tableData = { tabId: null, items: [], counts: [ 0, 0, 0, 0 ] };
  if (!problemData || !problemData.problems || problemData.problems.length === 0) {
    return tableData;
  }

  tableData.tabId = problemData.tabId;
  tableData.sourceImage = problemData.sourceImageDataUrl;
  tableData.outputImage = problemData.outputImageDataUrl;
  tableData.items = Array.from(problemData.problems, (problem, index) => {
    return {
      id: index,
      severity: problem.severityStr,
      type: problem.iconTooltip,
      wcag2: problem.evaluationItem["tableDataGuideline"][0],
      section508: problem.evaluationItem["tableDataGuideline"][1],
      jis: problem.evaluationItem["tableDataGuideline"][2],
      techniques: problem.evaluationItem["tableDataTechniques"],
      severityLV: problem.severityLV,
      foreground: problem.foreground,
      background: problem.background,
      x: problem.x,
      y: problem.y,
      area: problem.area,
      highlightPaths: problem.cssPath ? [ { id: 0, cssPath: problem.cssPath, lastTag: lastTag(problem.cssPath) } ] : [],
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
      tableData: tableData(this.problem),
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
        // {
        //   key: "type",
        //   label: i18next.t("problemTable.type"),
        //   class: "allinter-icon",
        //   sortable: true
        // },
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
          key: "severityLV",
          label: i18next.t("problemTable.severityLV"),
          class: "allinter-severity-lv",
          sortable: true,
          visible: false
        },
        {
          key: "foreground",
          label: i18next.t("problemTable.foreground"),
          class: "allinter-foreground",
          sortable: true,
          visible: false
        },
        {
          key: "background",
          label: i18next.t("problemTable.background"),
          class: "allinter-background",
          sortable: true,
          visible: false
        },
        {
          key: "x",
          label: i18next.t("problemTable.x"),
          class: "allinter-x",
          sortable: true,
          visible: false
        },
        {
          key: "y",
          label: i18next.t("problemTable.y"),
          class: "allinter-y",
          sortable: true,
          visible: false
        },
        {
          key: "area",
          label: i18next.t("problemTable.area"),
          class: "allinter-area",
          sortable: true,
          visible: false
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
  watch: {
    problem: function(newVal, _oldVal) {
      this.tableData = tableData(newVal);
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
        // WCAG 2.0 ~ JIS (wcag2 ~ jis)
        terms.push(escapeCsv(item.wcag2));
        terms.push(escapeCsv(item.section508));
        terms.push(escapeCsv(item.jis));
        // 深刻度 (severityLV)
        terms.push(escapeCsv(item.severityLV.toString()));
        // 前景色 (foreground)
        terms.push(escapeCsv(item.foreground));
        // 背景色 (background)
        terms.push(escapeCsv(item.background));
        // X座標 (x)
        terms.push(escapeCsv(item.x.toString()));
        // Y座標 (y)
        terms.push(escapeCsv(item.y.toString()));
        // 面積 (area)
        terms.push(escapeCsv(item.area.toString()));
        // 達成方法 (techniques)
        terms.push(escapeCsv(item.techniques));
        // 内容 (description)
        terms.push(escapeCsv(item.description));

        csv.push(terms.join(","));
      });

      download(csv, `low-vision-${moment().format("YYYY-MM-DD")}.csv`);
    }
  },
  template: `
    <b-tab :title="i18next.t('lowVisionTab.title')">
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

        <allint-image-viewer :source="tableData.sourceImage" :output="tableData.outputImage"></allint-image-viewer>
      </div>
    </b-tab>
  `
}

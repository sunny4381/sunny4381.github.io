export function lastTag(cssPath) {
  const lastComponent = cssPath.split(" > ").pop().trim();
  const indexes = [ "#", ".", ":" ].map(str => lastComponent.indexOf(str, 1));
  const lastIndex = Math.max(...indexes)
  if (lastIndex === -1) {
    return lastComponent;
  }

  return lastComponent.slice(0, lastIndex);
}

export function sliceMap(obj, allowedKeys) {
  const ret = {};

  allowedKeys.forEach((key) => {
    ret[key] = obj[key];
  });

  return ret;
}

export function escapeCsv(text) {
  if (!text) {
    return "";
  }

  if (text.includes("\"")) {
    return "\"" + text.replace(/"/g, "\"\"") + "\"";
  }

  if (text.includes("\r") || text.includes("\n") || text.includes(",")) {
    return "\"" + text + "\"";
  }

  return text;
}

export function download(csvArray, filename) {
  const blob = new Blob([ "\uFEFF" + csvArray.join("\r\n") ], { "type" : "text/csv; charset=UTF-8" });

  const element = document.createElement("a");
  element.href = window.URL.createObjectURL(blob);
  element.download = filename

  element.click();
}

export function convertSeverityIdToName(severityId) {
  if (!severityId) {
    return i18next.t("enum.severities.all");
  }

  return i18next.t(`enum.severities.${severityId}`, i18next.t("enum.severities.all"));
}

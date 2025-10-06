type RecordType = { [key: string]: any };

// Recursively flattens nested objects (e.g. user.email → "user.email")
function flattenObject(
  obj: RecordType,
  parentKey = "",
  res: RecordType = {}
): RecordType {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], newKey, res);
    } else {
      res[newKey] = obj[key];
    }
  }
  return res;
}

// Escape values to be CSV-compliant
function escapeCsvValue(value: any): string {
  if (value == null) return "";

  let str = String(value);

  // Escape quotes by doubling them
  if (str.includes('"')) {
    str = str.replace(/"/g, '""');
  }

  // If contains comma, quote, or newline → wrap in quotes
  if (/[",\n]/.test(str)) {
    str = `"${str}"`;
  }

  return str;
}

function jsonToCsv(jsonArray: RecordType[]): string {
  if (jsonArray.length === 0) return "";

  // Flatten objects
  const flatData = jsonArray.map((obj) => flattenObject(obj));

  // Collect headers
  const headers = Array.from(
    new Set(flatData.flatMap((obj) => Object.keys(obj)))
  );

  // Build rows
  const rows = flatData.map((obj) =>
    headers.map((field) => escapeCsvValue(obj[field])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(jsonArray: RecordType[], filename: string) {
  const csvData = jsonToCsv(jsonArray);
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
}

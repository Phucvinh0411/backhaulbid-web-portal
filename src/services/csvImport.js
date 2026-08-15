export function parseSimpleCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CSV phải có dòng tiêu đề và ít nhất một bản ghi");
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  if (headers.some((header) => !header)) {
    throw new Error("CSV có tên cột trống");
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

export function downloadCsvTemplate(filename, content) {
  const blob = new window.Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

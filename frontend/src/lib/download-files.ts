export type DownloadFileEntry = {
  href: string;
  fileName?: string;
};

export function downloadFiles(files: DownloadFileEntry[]): void {
  if (!files.length) return;

  files.forEach((file, index) => {
    const delay = index * 220;
    window.setTimeout(() => {
      void downloadFile(file);
    }, delay);
  });
}

async function downloadFile(file: DownloadFileEntry): Promise<void> {
  const fileName = file.fileName ?? file.href.split("/").pop() ?? "archivo.pdf";

  try {
    const response = await fetch(file.href);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    triggerAnchorDownload(objectUrl, fileName);
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerAnchorDownload(file.href, fileName);
  }
}

function triggerAnchorDownload(href: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

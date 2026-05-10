const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;
const LOCAL_BACKEND_UPLOAD_URL = "http://localhost:3001/api/upload";

type SelectedUploadFile = {
  file: File;
  options?: {
    downloadable?: boolean;
    blur?: boolean;
  };
};

function isLocalFrontend() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function uploadTargets() {
  const targets = ["/api/upload"];
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

  if (isLocalFrontend()) {
    if (isFirefox) return [LOCAL_BACKEND_UPLOAD_URL, ...targets];
    targets.push(LOCAL_BACKEND_UPLOAD_URL);
  }

  return [...new Set(targets)];
}

function buildFormData(files: SelectedUploadFile[]) {
  const formData = new FormData();
  files.forEach(({ file }) => {
    formData.append("files", file);
  });
  formData.append(
    "options",
    JSON.stringify(files.map((f) => f.options || { downloadable: true, blur: false })),
  );
  return formData;
}

export async function uploadAttachments(files: SelectedUploadFile[], token: string | null) {
  if (files.length === 0) return [];

  let lastError: unknown = null;

  for (const target of uploadTargets()) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(target, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: buildFormData(files),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      console.warn(`Upload failed via ${target}`, err);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Upload failed");
}

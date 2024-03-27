export const EMPTY_FILE = {
  id: "",
  created_at: new Date().toISOString(),
  extension: "",
  updated_at: new Date().toISOString(),
  meta: { name: "", type: "" },
  name: "",
  hash: "",
  preview: undefined,
  mime: "",
  response: { status: 0, uploadURL: "" },
  size: 0,
  url: "",
  source: "",
  provider: "",
  type: "",
  uploadURL: "",
};

export const UPLOAD_FILE_TYPES = [
  ".jpeg",
  ".jpg",
  ".png",
  ".tiff",
  ".tif",
  ".docx",
  ".doc",
  ".xls",
  ".xlsx",
  ".pdf",
  ".msg",
];

export const MAX_FILE_SIZE = 10000000;

export const MAX_FILE_COUNT = 1;

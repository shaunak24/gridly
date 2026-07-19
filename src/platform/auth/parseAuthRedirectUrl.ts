export function parseAuthRedirectParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');

  if (queryIndex !== -1) {
    const queryEnd = hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : url.length;
    appendSearchParams(params, url.slice(queryIndex + 1, queryEnd));
  }

  if (hashIndex !== -1) {
    appendSearchParams(params, url.slice(hashIndex + 1));
  }

  return params;
}

function appendSearchParams(target: Record<string, string>, raw: string): void {
  const searchParams = new URLSearchParams(raw);
  searchParams.forEach((value, key) => {
    target[key] = value;
  });
}

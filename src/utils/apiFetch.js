const IS_DEV = import.meta.env.DEV;

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:4000${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

let data;

try {
  data = await res.json();
} catch {
  data = { error: { message: 'Invalid JSON response' } };
}

  //console.log('apiFetch response:', res.status, data); // ← debug temporar

  if (!res.ok) {
    if (IS_DEV) {
        const errPayload = {
            type: data?.error?.type || "INTERNAL",
            status: res.status,
            message: data?.error?.message || data?.message || "Request failed",
            stack: data?.error?.stack || null,
            sql: data?.error?.sql || null,
        };

        window.__devErrorQueue = window.__devErrorQueue || [];
        window.__devErrorQueue.push(errPayload);

        if (window.__devReportError) {
            window.__devReportError(errPayload);
            window.__devErrorQueue = [];
        }
    }
    const err = new Error(data.error?.message || data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
const API_BASE_URL = import.meta.env.VITE_BASE_URL_BACKEND ?? "";

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type ApiResponsePayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
};

export class HttpRequestError extends Error {
  statusCode?: number;
  payload?: ApiResponsePayload | string;

  constructor(
    message: string,
    options?: { statusCode?: number; payload?: ApiResponsePayload | string },
  ) {
    super(message);
    this.name = "HttpRequestError";
    this.statusCode = options?.statusCode;
    this.payload = options?.payload;
  }
}

async function parseResponseBody(
  response: Response,
): Promise<ApiResponsePayload | string | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      return (await response.json()) as ApiResponsePayload;
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
}

function extractMessageFromPayload(
  payload: ApiResponsePayload | string | null,
): string {
  if (!payload) {
    return "Requisi\u00e7\u00e3o falhou";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return "Requisi\u00e7\u00e3o falhou";
}

function buildUrl(url: string, params?: QueryParams): string {
  if (!params) {
    return `${API_BASE_URL}${url}`;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (!queryString) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}${url}?${queryString}`;
}

export async function getRequest<TResponse>(
  url: string,
  params?: QueryParams,
): Promise<TResponse> {
  const response = await fetch(buildUrl(url, params), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpRequestError(extractMessageFromPayload(payload), {
      statusCode: response.status,
      payload: payload ?? undefined,
    });
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

export async function createOrUpdateRequest<TResponse, TPayload>({
  url,
  method,
  payload,
}: {
  url: string;
  method: "POST" | "PUT" | "PATCH";
  payload: TPayload;
}): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const parsedPayload = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpRequestError(extractMessageFromPayload(parsedPayload), {
      statusCode: response.status,
      payload: parsedPayload ?? undefined,
    });
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (parsedPayload as TResponse) ?? ({} as TResponse);
}

export async function deleteRequest<TResponse>(
  url: string,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpRequestError(extractMessageFromPayload(payload), {
      statusCode: response.status,
      payload: payload ?? undefined,
    });
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

export async function createOrUpdateFormDataRequest<TResponse>({
  url,
  method,
  formData,
}: {
  url: string;
  method: "POST" | "PUT" | "PATCH";
  formData: FormData;
}): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    body: formData,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpRequestError(extractMessageFromPayload(payload), {
      statusCode: response.status,
      payload: payload ?? undefined,
    });
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

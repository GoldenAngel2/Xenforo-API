export async function fetchPath(env, endpoint = "", query = {}, headers = {}) {
    if (!headers) {
        headers = {};
    }
    if (!endpoint.startsWith("/")) {
        endpoint = `/${endpoint}`;
    }
    if (!env.WEBSITE_URL) {
        return status.error(`No 'WEBSITE_URL' provided in the Env`);
    }
    if (!env.API_KEY) {
        return status.error(`No 'API_KEY' provided in the Env`);
    }
    let site = env.WEBSITE_URL;
    if (site.endsWith("/")) {
        site = site.slice(0, site.length - 1);
    }
    const uri = new URL(`${site}${endpoint}`);
    if (Object.keys(query).length) {
        for (const [k, v] of Object.entries(query)) {
            if (typeof v === "undefined" || v === null) {
                continue;
            }
            uri.searchParams.append(k, v);
        }
    }
    if (!headers['XF-Api-Key']) {
        headers['XF-Api-Key'] = env.API_KEY;
    }
    if (!headers['XF-Api-User'] && env.API_USER) {
        headers['XF-Api-User'] = env.API_USER;
    }
    
    const res = await fetch(uri.toString(), {
        headers,
    }).catch(() => {});
    if (!res) {
        return status.error(`No response from the API`);
    }
    if (res.status !== 200) {
        return status.error(`Got (${res.status}) while trying to fetch the data.`)
    }
    const json = await res.json().catch(() => null);
    if (!json) {
        return status.error(`No data returned from the API response.`)
    };
    return status.data(json);
}


/** @param {URL} url */
export const query = (url) => {
    const q = url.searchParams;
    return {
        bool: (name = "", def = false) => {
            const str = q.get(name);
            return str.length ? ["true", "yes", "y"].includes(str) ? true : false : def;
        },
        int: (name = "", def = 0) => {
            const str = q.get(name);
            return (str.length && !isNaN(parseInt(str))) ? parseInt(str) : def;
        },
    }
}

export const status = {
    success: (message) => ({ status: true, message }),
    /** @returns {{status: false, message: string}} */
    error: (message) => ({ status: false, message }),
    /** @returns {{status: true, data: object}} */
    data: (data = {}) => ({ status: true, data }),
}




function headers(type = "application/json") {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": 'Content-Type',
        "content-type": type
    }
}

export function json(data) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: headers()
    });
}

export function html(str) {
    return new Response(str, {
        status: 200,
        headers: headers("text/html")
    })
}
export function error(message = "") {
    return json({ status: false, message });
}

/**
 * @param {RouteData} data 
 */
export function route(data) {
    return {
        path: data.path,
        method: data.method || "GET",
        query: data.query || [],
        body: data.body || [],
    };
}

export function qr(key = "", description = "", type = "boolean") {
    return { key, description, type };
}

/**
 * @typedef {Object} RouteData
 * @prop {string} path
 * @prop {string} [method]
 * @prop {{ key: string, type: string, description: string }[]} [query]
 * @prop {{ key: string, type: string, description: string }[]} [body]
 */

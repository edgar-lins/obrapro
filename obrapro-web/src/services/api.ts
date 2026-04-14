const API_URL = "http://localhost:8080"

async function throwIfNotOk(res: Response) {
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`${res.status}: ${body || res.statusText}`)
    }
}

export async function calculateWall(data: any, token?: string) {
    const res = await fetch(`${API_URL}/calculate/wall`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    })
    await throwIfNotOk(res)
    return res.json()
}

export async function calculateDemolition(data: any, token?: string) {
    const res = await fetch(`${API_URL}/calculate/demolition`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    })
    await throwIfNotOk(res)
    return res.json()
}

export async function calculatePaint(data: any, token?: string) {
    const res = await fetch(`${API_URL}/calculate/paint`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    })
    await throwIfNotOk(res)
    return res.json()
}

export async function calculateFloor(data: any, token?: string, nosave = false) {
    const url = nosave
        ? `${API_URL}/calculate/floor?nosave=true`
        : `${API_URL}/calculate/floor`

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    })
    await throwIfNotOk(res)
    return res.json()
}

export async function getProjects(token: string) {
    const res = await fetch(`${API_URL}/projects`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (!res.ok) {
        throw new Error("Erro ao buscar projetos")
    }

    return res.json()
}

export async function getPrices(token: string) {
    const res = await fetch(`${API_URL}/prices`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (!res.ok) {
        throw new Error("Erro ao buscar preços")
    }

    return res.json()
}

export async function updatePrices(data: any, token: string) {
    const res = await fetch(`${API_URL}/prices`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error("Erro ao atualizar preços")
    }

    return res.ok
}
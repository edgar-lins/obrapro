const API_URL = "http://localhost:8080"

export async function calculateFloor(data: any, token?: string) {
    const res = await fetch(`${API_URL}/calculate/floor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error("Erro ao calcular obra")
    }

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
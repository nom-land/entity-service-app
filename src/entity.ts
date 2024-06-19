import config from "./config";
import { entitySchema } from "entity-types";

export async function getEntity(id: string) {
    const data = await fetch(`${config.nomlandApiEndpoint}/entity/id/${id}`);
    return data.json();
}

export async function testEntity(data: string) {
    try {
        entitySchema.parse(JSON.parse(data));
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function editEntity(id: string, entity: string) {
    const token = localStorage.getItem("siwe:token");
    const res = await fetch(`${config.nomlandApiEndpoint}/entity/edit`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            entity: JSON.parse(entity),
        }),
    });
    if (res.ok) {
        return res.json();
    } else {
        throw new Error("Failed to edit entity");
    }
}

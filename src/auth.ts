import config from "./config";

interface GetChallengeBody {
    address: `0x${string}`;
    domain: string;
    uri: string;
    statement: string;
}

export async function getChallenge({
    address,
    domain,
    uri,
    statement,
}: GetChallengeBody) {
    const { message } = await fetch(
        `${config.nomlandApiEndpoint}/auth/challenge`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, domain, uri, statement }),
        }
    ).then(async (res) => {
        if (res.ok) {
            return res.json();
        } else {
            const data = await res.json();
            const error = JSON.stringify(data.error, null, "\t");
            throw new Error("failed to get challenge: " + error);
        }
    });
    console.log("got challenge message from api", message);
    return message;
}

export async function signin(message: string, signature: string) {
    const { token } = await fetch(`${config.nomlandApiEndpoint}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error("failed to get challenge");
        }
    });

    console.log("login response", { token });

    localStorage.setItem("siwe:token", token);

    return token;
}

export async function getAccount() {
    const token = localStorage.getItem("siwe:token");
    const res = await fetch(`${config.nomlandApiEndpoint}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error("failed to get challenge");
        }
    });

    return res;
}

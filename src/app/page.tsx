"use client";

import { getAccount, getChallenge, signin } from "@/auth";
import { editEntity, getEntity, testEntity } from "@/entity";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import EntityEditor from "@/components/EntityEditor";
import { Button } from "@/components/ui/button";
import { isJson } from "@/utils";

function App() {
    const account = useAccount();
    const { connectors, connect, status, error } = useConnect();

    const { signMessage } = useSignMessage();
    const [loading, setLoading] = useState<boolean>(false);
    const [entityId, setEntityId] = useState<string>("");
    const [entityInfo, setEntityInfo] = useState<string>();
    const [resEntityId, setResEntityId] = useState<string>("");
    const [updateHash, setUpdateHash] = useState<string>();
    const [signInStatus, setSignInStatus] = useState<string>();
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    const signIn = async (user: `0x${string}`) => {
        try {
            const message = await getChallenge({
                address: user,
                domain: window.location.hostname,
                uri: window.location.href,
                statement: "Sign-in with Ethereum to the app.",
            });

            signMessage(
                { message },
                {
                    onSuccess: async (signature) => {
                        const token = await signin(message, signature);
                        console.log(token);
                        const account = await getAccount();
                        console.log(account);
                        if (account.admin) {
                            setHasPermission(true);
                            setSignInStatus(
                                "✅ Welcome! Character#" + account.admin
                            );
                        } else {
                            setSignInStatus("❌ You are not an admin.");
                        }
                    },
                    onError: (error) => {
                        console.error(error);
                        setSignInStatus(
                            "❌ Failed to sign in. Click to try again."
                        );
                    },
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    const getEntityData = async (entityId: string) => {
        console.log("getEntityData", entityId);
        const info = await getEntity(entityId);
        console.log(info);
        if (info && info.hasPermission) {
            setEntityInfo(JSON.stringify(info.metadata, null, 2));
            setResEntityId(entityId);
        } else {
            setEntityInfo("You don't have permission to edit this entity.");
        }
    };

    const triggerGetEntityData = async () => {
        if (resEntityId !== entityId) {
            setLoading(true);
            setUpdateHash(undefined);
            await getEntityData(entityId);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="tw-container tw-mx-auto tw-m-10">
                <div className="tw-my-5">
                    {account.status === "connected" && account.address ? (
                        signInStatus ? (
                            <div>{signInStatus}</div>
                        ) : (
                            <div>
                                <Button onClick={() => signIn(account.address)}>
                                    Sign In
                                </Button>
                            </div>
                        )
                    ) : (
                        connectors.map((connector) => {
                            if (connector.name !== "Injected")
                                return (
                                    <Button
                                        key={connector.uid}
                                        onClick={() => connect({ connector })}
                                    >
                                        {connector.name}
                                    </Button>
                                );
                        })
                    )}
                </div>

                {hasPermission && (
                    <div>
                        <Input
                            type="email"
                            placeholder="Entity ID"
                            onChange={(e) => {
                                setEntityId(e.target.value);
                            }}
                            value={entityId}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    triggerGetEntityData();
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            onBlur={(e) => {
                                triggerGetEntityData();
                            }}
                        />
                        {/* 
                    <Button
                        onClick={() => {
                            triggerGetEntityData();
                        }}
                    >
                        Submit
                    </Button> */}
                        <div className="tw-py-1">
                            {loading && (
                                <div className="tw-fixed tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-black tw-bg-opacity-50 tw-z-50 tw-flex tw-items-center tw-justify-center">
                                    <div className="tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-t-2 tw-border-b-2 tw-border-gray-900"></div>
                                </div>
                            )}
                            {entityId &&
                                entityInfo &&
                                !loading &&
                                (isJson(entityInfo)[0] ? (
                                    <div className="tw-py-5">
                                        <EntityEditor
                                            entity={entityInfo || "{}"}
                                            onSave={async (data) => {
                                                try {
                                                    setLoading(true);
                                                    if (!testEntity(data)) {
                                                        throw new Error(
                                                            "Invalid entity data"
                                                        );
                                                    }
                                                    const { transactionHash } =
                                                        await editEntity(
                                                            resEntityId,
                                                            data
                                                        );
                                                    setUpdateHash(
                                                        transactionHash
                                                    );
                                                } catch (err) {
                                                    alert(
                                                        "Failed to edit entity"
                                                    );
                                                } finally {
                                                    await getEntityData(
                                                        resEntityId
                                                    );
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="tw-px-1">
                                        <pre>{entityInfo}</pre>
                                    </div>
                                ))}
                        </div>
                        <div>
                            {updateHash && (
                                <div>
                                    Succeed! Update Hash:{" "}
                                    <a
                                        href={`https://scan.crossbell.io/tx/${updateHash}`}
                                    >
                                        {updateHash}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default App;

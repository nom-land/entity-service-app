"use client";

import { useEffect, useState } from "react";
import { JsonViewer } from "@textea/json-viewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { isJson } from "@/utils";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";

interface EntityEditorProps {
    entity: string;
    onSave: (entity: string) => void;
}

export default function EntityEditor(props: EntityEditorProps) {
    const { entity, onSave } = props;
    const [newEntity, setNewEntity] = useState<string>(entity);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        if (!updating) setNewEntity(entity);
    }, [entity, updating]);

    return (
        <div>
            <Tabs defaultValue="json-editor" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="json-editor">Json Editor</TabsTrigger>
                    <TabsTrigger value="text-editor">Text Editor</TabsTrigger>
                </TabsList>
                <TabsContent value="json-editor">
                    <Card>
                        {isJson(newEntity)[0] ? (
                            <JsonViewer
                                value={JSON.parse(newEntity)}
                                editable
                                enableAdd
                                // TODO
                                // onAdd={(path) => {}}
                                enableDelete
                                onDelete={(path, value) => {
                                    console.log(path, value);
                                    const newEntityObj = JSON.parse(newEntity);
                                    let obj = newEntityObj;
                                    let i = 0;
                                    for (i = 0; i < path.length - 1; i++) {
                                        obj = obj[path[i]];
                                    }
                                    delete obj[path[i]];
                                    setNewEntity(
                                        JSON.stringify(newEntityObj, null, 2)
                                    );
                                }}
                                enableClipboard
                                onCopy={(path, value) => {
                                    console.log(path, value);
                                    navigator.clipboard.writeText(
                                        JSON.stringify(value, null, 2)
                                    );
                                }}
                                onChange={(path, oldValue, newValue) => {
                                    setUpdating(true);
                                    const newEntityObj = JSON.parse(newEntity);
                                    let obj = newEntityObj;
                                    let i = 0;
                                    for (i = 0; i < path.length - 1; i++) {
                                        obj = obj[path[i]];
                                    }
                                    obj[path[i]] = newValue;
                                    console.log("New entity", newEntityObj);
                                    setNewEntity(
                                        JSON.stringify(newEntityObj, null, 2)
                                    );
                                }}
                            />
                        ) : (
                            <div>
                                <pre>{isJson(newEntity)[1]}</pre>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="text-editor">
                    <Textarea
                        className="tw-font-mono tw-h-96 tw-max-h-96 tw-min-h-96 tw-resize-none "
                        value={newEntity}
                        onChange={(e) => {
                            setUpdating(true);
                            console.log("New entity", e.target.value);
                            setNewEntity(e.target.value);
                        }}
                    />
                </TabsContent>
            </Tabs>
            <Button
                className="tw-mt-5"
                onClick={() => {
                    setUpdating(false);
                    onSave(newEntity);
                }}
            >
                Save
            </Button>
        </div>
    );
}

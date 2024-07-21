"use client";
import Image from "next/image";
import {
  Button,
  FileInput,
  Group,
  rem,
  Stack,
  Stepper,
  Text,
  TextInput,
  Transition,
} from "@mantine/core";
import { UseFormReturnType, isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import {
  IconCursorText,
  IconPdf,
  IconPhoto,
  IconTextRecognition,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

import styles from "./page.module.css";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";

export default function Home() {
  const [isPending, setIsPending] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fakeFileLoading, setFakeFileLoading] = useState(false);
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const form = useForm({
    initialValues: {
      text: "",
      modification: "",
      file: null as File | null,
    },
    validate: {
      text: isNotEmpty("Ce champ est obligatoire"),
      // modification: isNotEmpty("Ce champ est obligatoire"),
      file: isNotEmpty("Ce champ est obligatoire"),
    },
  });

  type FormValues = typeof form.values;

  const handleFileDrop = (files: File[]) => {
    form.setFieldValue("file", files[0]);
    setFakeFileLoading(true);
    setTimeout(() => {
      setFakeFileLoading(false);
      nextStep();
    }, 1000);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!values.file) {
      return;
    }
    console.log(values);
    const data = new FormData();
    data.set("file", values.file);
    data.set("text", values.text);
    data.set("modification", values.modification);
    setIsPending(true);

    try {
      const response = await fetch("/api/edit-pdf-text", {
        method: "POST",
        body: data,
      });
      console.log(response);
      // open pdf in new tab
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      nextStep();
      // window.open(url, "_blank");
    } catch (error) {
      console.error(error);
    }

    setIsPending(false);
  };

  return (
    <main className={styles.main}>
      {/* <form onSubmit={form.onSubmit(handleSubmit)}> */}
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step
          icon={<IconPdf />}
          label="Première étape"
          description="Choisir un fichier pdf"
        >
          {/* <FileInput
              label="Fichier à modifier"
              accept="application/pdf"
              {...form.getInputProps("file")}
            /> */}
          <Dropzone
            accept={PDF_MIME_TYPE}
            multiple={false}
            onDrop={handleFileDrop}
            loading={fakeFileLoading}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-blue-6)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-red-6)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-dimmed)",
                  }}
                  stroke={1.5}
                />
              </Dropzone.Idle>
              <div>
                <Text size="xl" inline>
                  Glissez un fichier PDF ici
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Stepper.Step>
        <Stepper.Step
          icon={<IconTextRecognition />}
          completedIcon={form.errors.text ? <IconX /> : undefined}
          color={form.errors.text ? "red" : "blue"}
          label="Deuxième étape"
          description="Entrez le texte à modifier"
        >
          <Group justify="center" style={styles}>
            <Stack maw={450} flex={1}>
              <TextInput
                label="Texte à modifier !"
                placeholder="Entrez un texte ici"
                {...form.getInputProps("text")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    nextStep();
                  }
                }}
              />
              <Group>
                <Button onClick={prevStep} flex={1} variant="outline">
                  Retour
                </Button>
                <Button onClick={nextStep} flex={1}>
                  Suivant
                </Button>
              </Group>
            </Stack>
          </Group>
        </Stepper.Step>
        <Stepper.Step
          icon={<IconCursorText />}
          loading={isPending}
          label="Dernière étape"
          description="Entrez la modification à apporter"
        >
          <Group justify="center" style={styles}>
            <Stack
              maw={450}
              flex={1}
              component="form"
              onSubmit={form.onSubmit(handleSubmit) as any}
            >
              <TextInput
                label="Modification à apporter"
                placeholder="Entrez une modification ici"
                {...form.getInputProps("modification")}
              />
              <Group>
                <Button onClick={prevStep} flex={1} variant="outline">
                  Retour
                </Button>
                <Button type="submit" loading={isPending} flex={1}>
                  Modifier le fichier 🚀
                </Button>{" "}
              </Group>
            </Stack>
          </Group>
        </Stepper.Step>
        <Stepper.Completed>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600"
            style={{ border: "none" }}
          ></iframe>
        </Stepper.Completed>
      </Stepper>

      {/* <Button type="submit">Modifier le fichier 🚀</Button> */}
      {/* </form> */}
    </main>
  );
}

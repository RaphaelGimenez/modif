"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Button, FileInput, TextInput } from "@mantine/core";
import { UseFormReturnType, isNotEmpty, useForm } from "@mantine/form";

export default function Home() {
  const form = useForm({
    initialValues: {
      text: "",
      modification: "",
      file: null as File | null,
    },
    validate: {
      text: isNotEmpty("Ce champ est obligatoire"),
      modification: isNotEmpty("Ce champ est obligatoire"),
      file: isNotEmpty("Ce champ est obligatoire"),
    },
  });

  type FormValues = typeof form.values;

  const handleSubmit = async (values: FormValues) => {
    if (!values.file) {
      return;
    }
    console.log(values);
    const data = new FormData();
    data.set("file", values.file);
    data.set("text", values.text);
    data.set("modification", values.modification);

    try {
      const response = await fetch("/api/edit-pdf-text", {
        method: "POST",
        body: data,
      });
      console.log(response);
      // open pdf in new tab
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className={styles.main}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Texte à modifier"
          placeholder="Entrez un texte ici"
          {...form.getInputProps("text")}
        />
        <TextInput
          label="Modification"
          placeholder="Entrez un texte ici"
          {...form.getInputProps("modification")}
        />
        <FileInput
          label="Fichier à modifier"
          accept="application/pdf"
          {...form.getInputProps("file")}
        />

        <Button type="submit">Modifier le fichier 🚀</Button>
      </form>
    </main>
  );
}

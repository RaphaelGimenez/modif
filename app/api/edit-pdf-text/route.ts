import { readFile, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { execa } from "execa";
import shell from "shelljs";
import { execSync } from "child_process";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  console.log(data);
  const file: File | null = data.get("file") as unknown as File;
  const text: string = data.get("text") as string;
  const modification: string = data.get("modification") as string;

  if (!file || !text || !modification) {
    return NextResponse.json({
      success: false,
      error: "missing required fields",
    });
  }

  // check that pdftk is installed
  try {
    await execa("pdftk", ["--version"]);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "something went wrong, please try again later",
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const basePath = "./modif";
  const uncompressPath = `${basePath}/uncompressed.pdf`;
  const modifiedPath = `${basePath}/modified.pdf`;
  const compressedPath = `${basePath}/compressed.pdf`;

  // check that modif dir exists in tmp and create it if it doesn't
  try {
    await execa("mkdir", [basePath]);
  } catch (error) {
    console.log("Director{ sed }y already exists");
  }

  // Write file to the filesystem in tmp
  const path = `${basePath}/file.pdf`;
  await writeFile(path, buffer);

  // change file permissions
  await execa("chmod", ["777", path]);

  // check that file exists
  try {
    await readFile(path);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "something went wrong, please try again later",
    });
  }

  // uncompress pdf file
  await execa("pdftk", [path, "output", uncompressPath, "uncompress"]);

  // escape special characters in text to unix code
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}/()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  let escapedText = escapeRegExp(text);
  const escapedModification = escapeRegExp(modification);

  try {
    execSync(
      `sed -e "s/${escapedText}/${escapedModification}/g" <${uncompressPath} >${modifiedPath}`
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      error: "something went wrong, please try again later",
    });
  }

  // compress file
  await execa("pdftk", [modifiedPath, "output", compressedPath, "compress"]);

  // send modified file to the client and delete it from the filesystem
  const modifiedFile = await readFile(compressedPath);
  await execa("rm", [path, uncompressPath, compressedPath, modifiedPath]);

  return new Response(modifiedFile, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}

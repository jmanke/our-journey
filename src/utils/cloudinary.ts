export interface ImageListResource {}

const BaseUrl = `https://res.cloudinary.com/${
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
}`;

export async function getImages(tag: string) {
  const url = `${BaseUrl}/image/list/${tag}.json`;

  const response = await fetch(url);
  const json = await response.json();
  console.log(json);

  const { public_id: publicId, format } = json.resources[0];
  await getImage(publicId, format);
}

const o = {
  resources: [
    {
      asset_id: "76cf59c56e1f5f61c2ac20f75709f173",
      public_id: "IMG_6342_rpavbw",
      version: 1748290002,
      format: "jpg",
      width: 3024,
      height: 4032,
      type: "upload",
      created_at: "2025-05-26T20:06:42Z",
      asset_folder: "",
    },
  ],
  updated_at: "2025-05-27T00:34:51Z",
};

export async function getImage(publicId: string, format: "jpg" | "png") {
  const url = `${BaseUrl}/image/upload/${publicId}.${format}`;

  // url for image
}

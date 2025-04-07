"use client";

import MintButton from "@/components/MintButton";
// import MintButton from "@/components/MintButton";

import WalletDebug from "@/components/WalletDebug";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  ipName: string;
  yourName: string;
  file: FileList;
};

const IPProtectForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const [success, setSuccess] = useState<boolean | null>(false);
  const [metadataUrl, setMetaDataUrl] = useState<string>("");
  const [name, setName] = useState<string>("");

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("ipName", data.ipName);
    formData.append("yourName", data.yourName);
    formData.append("file", data.file[0]);

    try {
      const res = await fetch("/api/protect", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Result:", result); // Show NFT address / hash / IPFS
        setSuccess(true); // Set success to true if the API call succeeds
        setName(result?.ipName);
        setMetaDataUrl(result?.metadata.url);
        console.log(
          "There is a successMessage for the sake god's sake",
          name,
          "----->",
          metadataUrl,
          "----->",
          success
        );

        reset();
      } else {
        console.error("API Error:", res.statusText);
        setSuccess(false); // Set success to false if the API call fails
      }
    } catch (error) {
      console.log("Error:", error);
      setSuccess(false); // Set success to false in case of an exception
    }
  };

  return (
    <div className="container space-y-4 mx-auto my-5 flex flex-row items-center justify-center ">
      <div className="m-4 space-x-10">
        <WalletDebug />
      </div>
      {success ? (
        <MintButton metadataUrl={metadataUrl} name={name} />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-md bg-background"
          encType="multipart/form-data"
        >
          <input
            {...register("ipName", { required: true })}
            placeholder="Enter IP Name"
            className="mb-4"
          />
          {errors.ipName && (
            <span className="text-red-500">IP Name is required</span>
          )}

          <input
            {...register("yourName", { required: true })}
            placeholder="Enter Your Name"
            className="mb-4"
          />
          {errors.yourName && (
            <span className="text-red-500">Your name is required</span>
          )}

          <input
            type="file"
            {...register("file", { required: true })}
            className="mb-4"
          />
          {errors.file && (
            <span className="text-red-500">File is required</span>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Protect My IP
          </button>
        </form>
      )}
    </div>
  );
};

export default IPProtectForm;

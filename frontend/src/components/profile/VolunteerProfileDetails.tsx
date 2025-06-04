import React, { useState } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, ListChecks } from "lucide-react";

interface VolunteerFormData {
  operatingAreas: string;
  selfieImage?: File;
  nidImage?: File;
}

interface VolunteerProfileDetailsProps {
  selfieImageUrl?: string;
  nidImageUrl?: string;
  operatingAreas?: string[];
  isEditing: boolean;
  onSubmitProfile: (formData: VolunteerFormData) => void;
}

const VolunteerProfileDetails: React.FC<VolunteerProfileDetailsProps> = ({
  selfieImageUrl: initialSelfieUrl,
  nidImageUrl: initialNidUrl,
  operatingAreas: initialOperatingAreas,
  isEditing,
  onSubmitProfile,
}) => {
  const [operatingAreasInput, setOperatingAreasInput] = useState(
    initialOperatingAreas?.join(", ") || ""
  );
  const [selfieFile, setSelfieFile] = useState<File | undefined>();
  const [nidFile, setNidFile] = useState<File | undefined>();

  const handleSelfieFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0])
      setSelfieFile(event.target.files[0]);
  };
  const handleNidFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0])
      setNidFile(event.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile({
      operatingAreas: operatingAreasInput,
      selfieImage: selfieFile,
      nidImage: nidFile,
    });
  };

  if (!isEditing) {
    // Read-only display
    const renderImageLink = (url: string | undefined, altText: string) => {
      if (!url || url === "imagepath")
        return <span className="italic text-dark-text/60">Not Provided</span>;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 text-highlight hover:underline font-medium group"
        >
          <ImageIcon
            size={18}
            className="text-highlight/80 group-hover:text-highlight transition-colors"
          />
          <span>View {altText}</span>
        </a>
      );
    };
    return (
      <>
        <ProfileDetailItem
          label="Selfie Image"
          value={renderImageLink(initialSelfieUrl, "Selfie")}
        />
        <ProfileDetailItem
          label="NID Image"
          value={renderImageLink(initialNidUrl, "NID")}
        />
        <ProfileDetailItem
          label="Operating Areas"
          value={
            initialOperatingAreas && initialOperatingAreas.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {initialOperatingAreas.map((area, index) => (
                  <li key={index} className="flex items-center">
                    <ListChecks
                      size={16}
                      className="text-highlight mr-2 flex-shrink-0"
                    />{" "}
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="italic text-dark-text/60">Not Specified</span>
            )
          }
        />
      </>
    );
  }

  // Editing mode: Show Form
  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="operatingAreas"
          className="text-base font-medium text-brand-green"
        >
          Operating Areas (comma-separated)
        </Label>
        <Input
          id="operatingAreas"
          type="text"
          value={operatingAreasInput}
          onChange={(e) => setOperatingAreasInput(e.target.value)}
          placeholder="e.g., Gulshan, Banani, Mirpur"
          className="mt-1 text-base"
          required
        />
      </div>
      <div>
        <Label
          htmlFor="selfieImage"
          className="text-base font-medium text-brand-green"
        >
          Selfie Image
        </Label>
        <Input
          id="selfieImage"
          type="file"
          onChange={handleSelfieFileChange}
          className="mt-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pale-mint file:text-brand-green hover:file:bg-brand-green/20"
          accept="image/*"
        />
        {selfieFile && (
          <p className="text-xs text-dark-text/70 mt-1">
            Selected: {selfieFile.name}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="nidImage"
          className="text-base font-medium text-brand-green"
        >
          NID Image
        </Label>
        <Input
          id="nidImage"
          type="file"
          onChange={handleNidFileChange}
          className="mt-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pale-mint file:text-brand-green hover:file:bg-brand-green/20"
          accept="image/*"
        />
        {nidFile && (
          <p className="text-xs text-dark-text/70 mt-1">
            Selected: {nidFile.name}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
      >
        Save Volunteer Details
      </Button>
    </form>
  );
};
export default VolunteerProfileDetails;

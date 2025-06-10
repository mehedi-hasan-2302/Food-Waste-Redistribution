import React, { useEffect, useState, type FormEvent } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, ListChecks, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/profileStore";

interface VolunteerFormData {
  FullName: string;
  OperatingAreas: { [key: string]: string };
  SelfiePath: string;
  NIDPath: string;
}

interface VolunteerProfileDetailsProps {
  onSubmitProfile: (requestBody: VolunteerFormData) => void;
}

const VolunteerProfileDetails: React.FC<VolunteerProfileDetailsProps> = ({
  onSubmitProfile,
}) => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);

  const [operatingAreasInput, setOperatingAreasInput] = useState("");
  const [selfiePath, setSelfiePath] = useState("");
  const [nidPath, setNidPath] = useState("");

  useEffect(() => {
    setOperatingAreasInput(profile?.OperatingAreas?.join(", ") || "");
    setSelfiePath(profile?.SelfiePath || "");
    setNidPath(profile?.NIDPath || "");
  }, [profile?.OperatingAreas, profile?.SelfiePath, profile?.NIDPath]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const apiOperatingAreas: { [key: string]: string } = {};
    operatingAreasInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((area, index) => {
        apiOperatingAreas[`area${index + 1}`] = area;
      });

    const requestBody: VolunteerFormData = {
      FullName: profile?.fullName || "",
      OperatingAreas: apiOperatingAreas,
      SelfiePath: selfiePath,
      NIDPath: nidPath,
    };
    onSubmitProfile(requestBody);
  };

  if (profile?.isProfileComplete) {
    // Read-only display
    const renderImageLink = (url: string | undefined, altText: string) => {
      if (!url)
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
          value={renderImageLink(profile?.SelfiePath, "Selfie")}
        />
        <ProfileDetailItem
          label="NID Image"
          value={renderImageLink(profile?.NIDPath, "NID")}
        />
        <ProfileDetailItem
          label="Operating Areas"
          value={
            profile?.OperatingAreas && profile?.OperatingAreas.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {profile?.OperatingAreas.map((area, index) => (
                  <li key={index} className="flex items-center">
                    <ListChecks
                      size={16}
                      className="text-highlight mr-2 flex-shrink-0"
                    />
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
          htmlFor="OperatingAreas"
          className="text-base font-medium text-brand-green"
        >
          Operating Areas (comma-separated)
        </Label>
        <Input
          id="OperatingAreas"
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
          htmlFor="SelfiePath"
          className="text-base font-medium text-brand-green"
        >
          Selfie Image
        </Label>
        <Input
          id="SelfiePath"
          type="text"
          value={selfiePath}
          onChange={(e) => setSelfiePath(e.target.value)}
          className="mt-1 text-base"
          placeholder="Enter URL of your selfie image"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label
          htmlFor="NIDPath"
          className="text-base font-medium text-brand-green"
        >
          NID Image
        </Label>
        <Input
          id="nidPath"
          type="text"
          value={nidPath}
          onChange={(e) => setNidPath(e.target.value)}
          className="mt-1 text-base"
          placeholder="Enter URL of your NID image"
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Volunteer Details
      </Button>
    </form>
  );
};
export default VolunteerProfileDetails;

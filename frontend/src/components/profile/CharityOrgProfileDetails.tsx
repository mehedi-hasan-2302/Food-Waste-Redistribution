import { useState } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface CharityOrgFormData {
  organizationName?: string;
  organizationAddress?: string;
  govRegDocument?: File;
}

interface CharityOrgProfileDetailsProps {
  organizationName?: string;
  organizationAddress?: string;
  govRegDocumentUrl?: string;
  isEditing: boolean;
  onSubmitProfile: (formData: CharityOrgFormData) => void;
}

const CharityOrgProfileDetails: React.FC<CharityOrgProfileDetailsProps> = ({
  organizationName: initialOrgName,
  organizationAddress: initialOrgAddress,
  govRegDocumentUrl,
  isEditing,
  onSubmitProfile,
}) => {
  const [orgName, setOrgName] = useState(initialOrgName || "");
  const [orgAddress, setOrgAddress] = useState(initialOrgAddress || "");
  const [documentFile, setDocumentFile] = useState<File | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setDocumentFile(event.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile({
      organizationName: orgName,
      organizationAddress: orgAddress,
      govRegDocument: documentFile,
    });

  };

  if (!isEditing) {
    return (
      <>
        <ProfileDetailItem label="Organization Name" value={initialOrgName} />
        <ProfileDetailItem
          label="Organization Address"
          value={initialOrgAddress}
        />
        <ProfileDetailItem
          label="Govt. Registration Doc."
          value={
            govRegDocumentUrl && govRegDocumentUrl !== "#" ? (
              <a
                href={govRegDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-highlight hover:underline font-medium group"
              >
                <FileText
                  size={18}
                  className="text-highlight/80 group-hover:text-highlight transition-colors"
                />
                <span>View Document</span>
              </a>
            ) : (
              <span className="italic text-dark-text/60">Not Provided</span>
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
          htmlFor="orgName"
          className="text-base font-medium text-brand-green"
        >
          Organization Name
        </Label>
        <Input
          id="orgName"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="mt-1 text-base"
          required
        />
      </div>
      <div>
        <Label
          htmlFor="orgAddress"
          className="text-base font-medium text-brand-green"
        >
          Organization Address
        </Label>
        <Input
          id="orgAddress"
          type="text"
          value={orgAddress}
          onChange={(e) => setOrgAddress(e.target.value)}
          className="mt-1 text-base"
          required
        />
      </div>
      <div>
        <Label
          htmlFor="govRegDocument"
          className="text-base font-medium text-brand-green"
        >
          Government Registration Document (PDF, Image)
        </Label>
        <Input
          id="govRegDocument"
          type="file"
          onChange={handleFileChange}
          className="mt-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pale-mint file:text-brand-green hover:file:bg-brand-green/20"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {documentFile && (
          <p className="text-xs text-dark-text/70 mt-1">
            Selected: {documentFile.name}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
      >
        Save Charity Details
      </Button>
    </form>
  );
};

export default CharityOrgProfileDetails;

import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { Button } from "@/components/ui/button";

// Minimal type definitions
type CSVResults = {
  data: unknown[][];
  errors: unknown[];
  meta: Record<string, unknown>;
};

type RenderProps = {
  getRootProps: () => Record<string, unknown>;
};

type Props = {
  onUpload: (results: CSVResults) => void; // Line 6 fix
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();
  return (
    <CSVReader onUploadAccepted={onUpload}>
      {(
        { getRootProps }: RenderProps // Line 12 fix
      ) => (
        <Button size="sm" className="w-full lg:w-auto" {...getRootProps()}>
          <Upload className="size-4 mr-2" />
          Import
        </Button>
      )}
    </CSVReader>
  );
};

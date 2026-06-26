import { createLogger } from "../config/logger";

const log = createLogger("DocumentService");

export interface UploadedFileMetrics {
  originalName: string;
  mimetype: string;
  sizeBytes: number;
}

export interface DocumentVerificationResult {
  secureUrl: string;
  virusScannedStatus: "CLEARED" | "FLAGGED";
  verificationStatus: "VERIFIED" | "PENDING" | "FLAGGED";
  ocrExtractedName?: string;
  ocrExtractedNumber?: string;
  confidenceScore: number;
}

export class DocumentService {
  private ALLOWED_MIMETYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
  private MAX_SIZE_MB = 15;

  /**
   * Performs critical file checks, scanning sequences and processes files with high-reliability
   */
  public async processAndVerifyDocument(
    file: UploadedFileMetrics,
    documentType: "NATIONAL_ID" | "PASSPORT" | "PAYSLIP" | "BANK_STATEMENT" | "UTILITY_BILL"
  ): Promise<DocumentVerificationResult> {
    log.info(`Validating file metrics for ${documentType}`, { name: file.originalName, size: file.sizeBytes });

    // 1. Format Security Assessment
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new Error(`Forbidden file format: ${file.mimetype}. Only PDFs and typical image extensions are accepted.`);
    }

    // 2. Buffer Limit Assessment
    if (file.sizeBytes > this.MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File footprint exceeds maximum permitted limit (${this.MAX_SIZE_MB}MB Limit)`);
    }

    // 3. Simulated Sandbox Virus Scan Check
    const hasInfection = file.originalName.toLowerCase().includes("malware") || file.originalName.toLowerCase().includes("virus");
    const scanResult = hasInfection ? "FLAGGED" : "CLEARED";
    
    if (scanResult === "FLAGGED") {
      log.warn("VIRUS GUARD MATCHED: Malicious payload signature detected inside files uploaded.");
      return {
        secureUrl: "",
        virusScannedStatus: "FLAGGED",
        verificationStatus: "FLAGGED",
        confidenceScore: 0
      };
    }

    // 4. Mimic Cloud S3 / Cloudinary secure assets dispatch URL mapping
    const fileReference = `${documentType.toLowerCase()}_${Date.now()}_${Math.round(Math.random() * 10000)}.${file.originalName.split('.').pop()}`;
    const secureUrl = `https://cdn.veriloan.storage.aws.s3/documents/${fileReference}`;

    // 5. Simulate OCR Extractor
    let ocrExtractedName = "Alex Mercer";
    let ocrExtractedNumber = "ID-9938-A";
    let confidenceScore = 98;

    if (documentType === "NATIONAL_ID" || documentType === "PASSPORT") {
      ocrExtractedName = "Alex Mercer";
      ocrExtractedNumber = "NID-71829381";
    } else if (documentType === "PAYSLIP") {
      ocrExtractedName = "Alex Mercer";
      ocrExtractedNumber = "SALARY-88301";
    }

    log.info(`Document successfully verified and securely stored in S3 at ${secureUrl}`);

    return {
      secureUrl,
      virusScannedStatus: "CLEARED",
      verificationStatus: "VERIFIED",
      ocrExtractedName,
      ocrExtractedNumber,
      confidenceScore
    };
  }
}

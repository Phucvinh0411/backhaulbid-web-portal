"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import BusinessIcon from "@mui/icons-material/CorporateFareOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";

import { ActionButton } from "@/components/common";
import { axiosClient } from "@/configs/axiosClient";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";
import {
  BUSINESS_VERIFICATION_PATH,
  BUSINESS_VERIFICATION_STATUS_PATH,
  businessVerificationLookupPath,
  compareRepresentativeNames,
  validateAuthorizationLetter,
  validateBusinessLicense,
} from "./businessVerificationApi";
import { mediaApi } from "../../services/mediaApi";

const STATUS_PRESENTATION = {
  NOT_STARTED: { label: "Chưa bắt đầu", color: "default" },
  NOT_SUBMITTED: { label: "Chưa nộp hồ sơ", color: "default" },
  EKYC_VERIFIED: { label: "Đã eKYC", color: "info" },
  BUSINESS_INFO_FILLED: { label: "Đã điền thông tin", color: "info" },
  REQUIRES_AUTHORIZATION: { label: "Cần giấy ủy quyền", color: "warning" },
  PENDING_DOCUMENTS: { label: "Cần bổ sung giấy tờ", color: "warning" },
  PENDING_ADMIN_REVIEW: { label: "Đang chờ duyệt", color: "warning" },
  PENDING: { label: "Đang chờ duyệt", color: "warning" },
  APPROVED: { label: "Đã xác minh", color: "success" },
  VERIFIED: { label: "Đã xác minh", color: "success" },
  REJECTED: { label: "Cần bổ sung lại", color: "error" },
  EXPIRED: { label: "Hồ sơ hết hiệu lực", color: "error" },
};

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

function normalizeLookupPayload(data, fallbackTaxCode) {
  return {
    valid: Boolean(data?.valid ?? data?.taxCode ?? data?.companyName),
    taxCode: data?.taxCode || fallbackTaxCode,
    companyName: data?.companyName || data?.name || "",
    address: data?.address || data?.businessAddress || "",
    legalRepresentative:
      data?.legalRepresentative ||
      data?.representative ||
      data?.legalRepresentativeName ||
      "",
    operationStatus: data?.operationStatus || data?.statusText || "",
    businessLine: data?.businessLine || data?.industry || "",
    message: data?.message,
  };
}

function getRepresentativeName(data) {
  return (
    data?.fullName ||
    data?.representativeName ||
    data?.identityName ||
    data?.ocrFullName ||
    data?.personalInfo?.fullName ||
    ""
  );
}

function UploadBox({ label, file, onChange, required = false }) {
  return (
    <Box className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-5 text-center">
      <UploadIcon className="!text-4xl text-slate-400" />
      <Typography variant="body2" className="mt-2 !font-semibold">
        {file?.name || label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        PDF, PNG hoặc JPG; tối đa 5MB
      </Typography>
      <div className="mt-3">
        <ActionButton component="label" variant="outlined" size="sm">
          Chọn tài liệu
          <input
            hidden
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={onChange}
          />
        </ActionButton>
      </div>
    </Box>
  );
}

export default function BusinessVerificationPanel({
  onRequireEkyc,
  compact = false,
  refreshKey = 0,
}) {
  const [verification, setVerification] = useState({ status: "LOADING" });
  const [representative, setRepresentative] = useState({
    status: "LOADING",
    name: "",
  });
  const [taxCode, setTaxCode] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [lookup, setLookup] = useState(null);
  const [license, setLicense] = useState(null);
  const [authorizationLetter, setAuthorizationLetter] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    axiosClient
      .get(BUSINESS_VERIFICATION_STATUS_PATH)
      .then(({ data }) => {
        if (!active) return;
        setVerification(data);
        setTaxCode(data?.taxCode || "");
        if (data?.taxCode && data?.companyName) {
          setLookup(normalizeLookupPayload(data, data.taxCode));
        }
      })
      .catch((error) => {
        if (!active) return;
        setVerification({ status: "NOT_SUBMITTED" });
        setMessage(
          getErrorMessage(
            error,
            "Không thể tải trạng thái xác minh doanh nghiệp."
          )
        );
      });

    getRepresentativeVerificationStatus()
      .then((data) => {
        if (!active) return;
        setRepresentative({
          status: data?.status || "NOT_SUBMITTED",
          name: getRepresentativeName(data),
        });
      })
      .catch(() => {
        if (active) setRepresentative({ status: "NOT_SUBMITTED", name: "" });
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const representativeComparison = useMemo(
    () =>
      compareRepresentativeNames(
        representative.name,
        lookup?.legalRepresentative
      ),
    [lookup?.legalRepresentative, representative.name]
  );

  const requiresAuthorization = representativeComparison === "MISMATCH";
  const representativeVerified = representative.status === "VERIFIED";

  const lookupTaxCode = useCallback(
    async (value, { silent = false } = {}) => {
      const normalizedTaxCode = value.trim();
      if (!/^\d{10}(\d{3})?$/.test(normalizedTaxCode)) {
        if (!silent && normalizedTaxCode.length > 0) {
          setLookupMessage("Mã số thuế phải gồm 10 hoặc 13 chữ số.");
        }
        return;
      }

      setPhase("looking-up");
      setLookupMessage("");
      setLookup(null);
      setAuthorizationLetter(null);

      try {
        const { data } = await axiosClient.get(
          businessVerificationLookupPath(normalizedTaxCode)
        );
        const normalizedLookup = normalizeLookupPayload(data, normalizedTaxCode);
        if (!normalizedLookup.valid) {
          setLookupMessage(
            normalizedLookup.message ||
              "Không tìm thấy doanh nghiệp hợp lệ với mã số thuế này."
          );
          return;
        }
        setLookup(normalizedLookup);
        setLookupMessage("Đã tra cứu và tự điền thông tin doanh nghiệp.");
      } catch (error) {
        setLookupMessage(
          getErrorMessage(error, "Không thể tra cứu mã số thuế.")
        );
      } finally {
        setPhase("idle");
      }
    },
    []
  );

  useEffect(() => {
    const normalizedTaxCode = taxCode.trim();
    if (!/^\d{10}(\d{3})?$/.test(normalizedTaxCode)) return;

    const timer = window.setTimeout(() => {
      lookupTaxCode(normalizedTaxCode, { silent: true });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [lookupTaxCode, taxCode]);

  const handleLicenseChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    const validation = validateBusinessLicense(selectedFile);
    setLicense(validation.valid ? selectedFile : null);
    setMessage(validation.message);
    event.target.value = "";
  };

  const handleAuthorizationChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    const validation = validateAuthorizationLetter(selectedFile);
    setAuthorizationLetter(validation.valid ? selectedFile : null);
    setMessage(validation.message);
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!representativeVerified) {
      setMessage("Vui lòng eKYC người đại diện trước khi gửi hồ sơ doanh nghiệp.");
      return;
    }

    const licenseValidation = validateBusinessLicense(license);
    const authorizationValidation = requiresAuthorization
      ? validateAuthorizationLetter(authorizationLetter)
      : { valid: true, message: "" };

    if (!lookup?.valid || !licenseValidation.valid || !authorizationValidation.valid) {
      setMessage(
        !lookup?.valid
          ? "Vui lòng nhập MST hợp lệ để hệ thống tự điền thông tin doanh nghiệp."
          : !licenseValidation.valid
            ? licenseValidation.message
            : authorizationValidation.message
      );
      return;
    }

    setPhase("submitting");
    setMessage("");

    try {
      let businessLicenseUrl = "";
      if (license) {
        businessLicenseUrl = await mediaApi.uploadFile(license, "business-verifications/licenses");
      }
      let authorizationLetterUrl = "";
      if (requiresAuthorization && authorizationLetter) {
        authorizationLetterUrl = await mediaApi.uploadFile(authorizationLetter, "business-verifications/authorization");
      }

      const params = new globalThis.URLSearchParams();
      params.append("taxCode", lookup.taxCode);
      params.append("ekycRepresentativeName", representative.name);
      params.append("businessLicenseUrl", businessLicenseUrl);
      if (authorizationLetterUrl) {
        params.append("authorizationLetterUrl", authorizationLetterUrl);
      }

      const { data } = await axiosClient.post(
        BUSINESS_VERIFICATION_PATH,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setVerification(data);
      setLicense(null);
      setAuthorizationLetter(null);
      setMessage("Hồ sơ đã được gửi và đang chờ Ban quản trị xét duyệt.");
    } catch (error) {
      setMessage(
        getErrorMessage(error, "Không thể gửi hồ sơ doanh nghiệp.")
      );
    } finally {
      setPhase("idle");
    }
  };

  if (verification.status === "LOADING") {
    return (
      <Box role="status" className="flex min-h-48 items-center justify-center gap-3">
        <CircularProgress size={28} />
        <Typography variant="body2">
          Đang tải hồ sơ doanh nghiệp...
        </Typography>
      </Box>
    );
  }

  const status =
    STATUS_PRESENTATION[verification.status] ||
    STATUS_PRESENTATION.NOT_SUBMITTED;
  const canSubmit = ![
    "PENDING",
    "PENDING_ADMIN_REVIEW",
    "VERIFIED",
    "APPROVED",
  ].includes(verification.status);
  const canSendReview =
    canSubmit &&
    representativeVerified &&
    Boolean(lookup?.valid) &&
    Boolean(license) &&
    (!requiresAuthorization || Boolean(authorizationLetter)) &&
    phase === "idle";
  const taxCodeInvalid =
    taxCode.length >= 10 && !/^\d{10}(\d{3})?$/.test(taxCode);
  const submitHint = !representativeVerified
    ? "Hoàn tất eKYC người đại diện để mở khóa hồ sơ."
    : !lookup?.valid
      ? "Tra cứu MST hợp lệ để tiếp tục."
      : !license
        ? "Tải giấy phép đăng ký kinh doanh để tiếp tục."
        : requiresAuthorization && !authorizationLetter
          ? "Tải thêm giấy ủy quyền vì người đại diện chưa trùng eKYC."
          : "Kiểm tra lại thông tin trước khi gửi admin duyệt.";

  return (
    <Box className={compact ? "space-y-4" : "space-y-5"}>
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Box>
          <Typography
            variant="h6"
            className="flex items-center gap-2 !font-bold text-[#1B4965]"
          >
            <BusinessIcon />
            Xác minh doanh nghiệp
          </Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">
            Nhập MST để hệ thống tự tra cứu, điền thông tin doanh nghiệp và gửi
            hồ sơ cho admin xét duyệt.
          </Typography>
        </Box>
        <Chip label={status.label} color={status.color} className="!font-bold" />
      </Box>

      {message && (
        <Alert
          severity={
            message.includes("đã được gửi") || verification.status === "PENDING"
              ? "success"
              : "info"
          }
          variant="outlined"
        >
          {message}
        </Alert>
      )}

      {!representativeVerified && canSubmit && (
        <Alert
          severity="warning"
          variant="outlined"
          action={
            onRequireEkyc ? (
              <ActionButton size="sm" variant="warning" onClick={onRequireEkyc}>
                eKYC ngay
              </ActionButton>
            ) : null
          }
        >
          Cần eKYC người đại diện trước khi nộp hồ sơ xác minh doanh nghiệp.
        </Alert>
      )}

      {verification.status === "REJECTED" && (
        <Alert severity="error" variant="outlined">
          Hồ sơ bị từ chối
          {verification.rejectionReason
            ? `: ${verification.rejectionReason}`
            : ". Vui lòng kiểm tra và gửi lại tài liệu."}
        </Alert>
      )}

      {!canSubmit && (
        <Box className="rounded-xl border border-slate-200 bg-white p-4">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Doanh nghiệp
              </Typography>
              <Typography variant="body2" className="!font-semibold">
                {verification.companyName || "Chưa có thông tin"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Mã số thuế
              </Typography>
              <Typography variant="body2" className="!font-semibold">
                {verification.taxCode}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Người đại diện doanh nghiệp
              </Typography>
              <Typography variant="body2" className="!font-semibold">
                {verification.legalRepresentativeName ||
                  verification.legalRepresentative ||
                  "Chưa có"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Giấy tờ
              </Typography>
              <Typography variant="body2" className="!font-semibold">
                {verification.businessLicenseFilename || "Đã tiếp nhận"}
                {verification.authorizationLetterFilename
                  ? ` + ${verification.authorizationLetterFilename}`
                  : ""}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {canSubmit && (
        <>
          <Box>
            <TextField
              label="Mã số thuế"
              value={taxCode}
              onChange={(event) => {
                setTaxCode(event.target.value.replace(/\D/g, "").slice(0, 13));
                setLookup(null);
                setLookupMessage("");
                setAuthorizationLetter(null);
              }}
              helperText={
                phase === "looking-up"
                  ? "Đang tra cứu thông tin doanh nghiệp..."
                  : taxCodeInvalid
                    ? "Mã số thuế phải gồm 10 hoặc 13 chữ số."
                    : lookupMessage ||
                    "Nhập đủ 10 hoặc 13 số, hệ thống sẽ tự tra cứu và điền thông tin."
              }
              FormHelperTextProps={{
                className:
                  phase === "looking-up"
                    ? "!text-[#1B4965]"
                    : taxCodeInvalid || (lookupMessage && !lookup?.valid)
                      ? "!text-rose-600"
                      : lookup?.valid && lookupMessage
                      ? "!text-emerald-600"
                      : "!text-slate-500",
              }}
              error={taxCodeInvalid && phase !== "looking-up"}
              inputProps={{ inputMode: "numeric", maxLength: 13 }}
              fullWidth
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Tên doanh nghiệp"
                value={lookup?.companyName || ""}
                placeholder="Tự điền sau khi tra MST"
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ doanh nghiệp"
                value={lookup?.address || ""}
                placeholder="Tự điền sau khi tra MST"
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Người đại diện doanh nghiệp"
                value={lookup?.legalRepresentative || ""}
                placeholder="Tự điền sau khi tra MST"
                InputProps={{ readOnly: true }}
                helperText={
                  representativeComparison === "MATCH"
                    ? "Trùng khớp với người đã eKYC."
                    : representativeComparison === "MISMATCH"
                      ? "Không trùng eKYC, cần giấy ủy quyền."
                      : "Chờ dữ liệu MST và eKYC để so khớp."
                }
                error={representativeComparison === "MISMATCH"}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Người đại diện đã eKYC"
                value={representative.name || ""}
                placeholder={
                  representativeVerified
                    ? "Chưa nhận được tên từ eKYC"
                    : "Chưa eKYC"
                }
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            {(lookup?.operationStatus || lookup?.businessLine) && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Trạng thái hoạt động"
                    value={lookup.operationStatus || ""}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngành nghề"
                    value={lookup.businessLine || ""}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
          </Grid>

          {lookup?.valid && (
            <Box
              className={`rounded-xl border p-4 ${
                requiresAuthorization
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50/60"
              }`}
            >
              <Typography
                className={`flex items-center gap-2 !font-bold ${
                  requiresAuthorization ? "text-amber-800" : "text-emerald-800"
                }`}
              >
                {requiresAuthorization ? (
                  <WarningIcon fontSize="small" />
                ) : (
                  <CheckIcon fontSize="small" />
                )}
                {requiresAuthorization
                  ? "Người đại diện doanh nghiệp không trùng eKYC"
                  : "Đã tìm thấy và tự điền thông tin doanh nghiệp"}
              </Typography>
              <Typography variant="body2" className="mt-2 text-slate-600">
                {requiresAuthorization
                  ? "Vui lòng nộp thêm giấy ủy quyền người đại diện để admin kiểm tra cùng giấy phép kinh doanh."
                  : "Bạn kiểm tra lại thông tin, tải giấy phép kinh doanh và gửi admin duyệt."}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={requiresAuthorization ? 6 : 12}>
              <UploadBox
                label="Giấy phép đăng ký kinh doanh"
                file={license}
                onChange={handleLicenseChange}
                required
              />
            </Grid>
            {requiresAuthorization && (
              <Grid item xs={12} md={6}>
                <UploadBox
                  label="Giấy ủy quyền người đại diện"
                  file={authorizationLetter}
                  onChange={handleAuthorizationChange}
                  required
                />
              </Grid>
            )}
          </Grid>

          <Box className="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Typography variant="caption" className="max-w-xl text-slate-500">
              {canSendReview
                ? "Hồ sơ sẽ được chuyển cho admin kiểm tra sau khi gửi."
                : submitHint}
            </Typography>
            <ActionButton
              variant="primary"
              disabled={!canSendReview}
              onClick={handleSubmit}
              startIcon={
                phase === "submitting" ? <CircularProgress size={18} /> : null
              }
              className="w-full !min-w-52 !shrink-0 sm:w-auto"
            >
              Gửi hồ sơ xét duyệt
            </ActionButton>
          </Box>
        </>
      )}
    </Box>
  );
}

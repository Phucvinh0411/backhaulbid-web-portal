const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

export function mapProfileAccount(input) {
  const account = input?.data ?? input ?? {};
  return {
    id: account.accountId ?? account.id ?? null,
    name: text(account.fullName) ?? text(account.companyName) ?? text(account.phone) ?? "Tài khoản",
    phone: text(account.phone),
    email: text(account.email),
    role: text(account.role),
    avatarUrl: text(account.avatarUrl),
  };
}

export function mapBusinessProfile(input) {
  const value = input?.data ?? input ?? {};
  const status = text(value.status)?.toUpperCase() ?? "NOT_SUBMITTED";
  return {
    status,
    companyName: text(value.companyName),
    taxCode: text(value.taxCode),
    registeredAddress: text(value.address),
    legalRepresentative: text(value.legalRepresentative),
    rejectionReason: text(value.rejectionReason),
  };
}

function mapOwnerField(field) {
  if (!field || field.available !== true || field.masked === true) return null;
  return text(field.value);
}

export function mapRepresentativeProfile(verificationInput, overviewInput) {
  const verification = verificationInput?.data ?? verificationInput ?? {};
  const overview = overviewInput?.data ?? overviewInput ?? {};
  const citizenId = mapOwnerField(overview.citizenId);
  const fields = {
    fullName: mapOwnerField(overview.fullName),
    citizenId: citizenId && /^\d{12}$/.test(citizenId) ? citizenId : null,
    dateOfBirth: mapOwnerField(overview.dateOfBirth),
    gender: mapOwnerField(overview.gender),
    residenceAddress: mapOwnerField(overview.residenceAddress),
  };

  return {
    status: text(overview.status) ?? text(verification.status) ?? "NOT_SUBMITTED",
    statusReason: text(overview.statusReason),
    submittedAt: text(overview.submittedAt),
    reviewedAt: text(overview.reviewedAt),
    fields,
    unavailable: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value === null]),
    ),
  };
}
